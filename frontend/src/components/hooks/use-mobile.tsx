import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // Avoid running on the server
    if (typeof window === "undefined") return

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Update state whenever the query result changes
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Set initial state
    setIsMobile(mql.matches)

    // Add listener (with backward compatibility)
    if (mql.addEventListener) {
      mql.addEventListener("change", handleChange)
    } else {
      // @ts-ignore - for Safari <14
      mql.addListener(handleChange)
    }

    // Cleanup
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handleChange)
      } else {
        // @ts-ignore - for Safari <14
        mql.removeListener(handleChange)
      }
    }
  }, [])

  return isMobile
}
