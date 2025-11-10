import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000 // 5s default

// ---- Types ----
export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type Toast = Omit<ToasterToast, "id">

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

// ---- Internal State ----
let memoryState: State = { toasts: [] }
const listeners: Array<(state: State) => void> = []
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
let count = 0
const genId = () => (++count % Number.MAX_SAFE_INTEGER).toString()

// ---- Reducer ----
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    case "DISMISS_TOAST":
      const { toastId } = action
      if (toastId) scheduleRemoval(toastId)
      else state.toasts.forEach(t => scheduleRemoval(t.id))
      return {
        ...state,
        toasts: state.toasts.map(t =>
          toastId && t.id !== toastId ? t : { ...t, open: false }
        ),
      }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: action.toastId
          ? state.toasts.filter(t => t.id !== action.toastId)
          : [],
      }
    default:
      return state
  }
}

// ---- Dispatch System ----
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach(listener => listener(memoryState))
}

function scheduleRemoval(toastId: string) {
  if (toastTimeouts.has(toastId)) return
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, TOAST_REMOVE_DELAY)
  toastTimeouts.set(toastId, timeout)
}

// ---- API ----
export function toast(props: Toast) {
  const id = genId()
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })
  const update = (newProps: Partial<ToasterToast>) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...newProps, id } })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: open => !open && dismiss(),
    },
  })

  return { id, dismiss, update }
}

// ---- Hook ----
export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const idx = listeners.indexOf(setState)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, []) // ✅ only once

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
    clearAll: () => dispatch({ type: "REMOVE_TOAST" }),
  }
}
