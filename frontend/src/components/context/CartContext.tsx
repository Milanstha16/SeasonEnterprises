import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stockAvailable: number;
  variant?: string;
};

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL!;
if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL not defined");

function debounce<F extends (...args: any[]) => void>(func: F, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart on login
  useEffect(() => {
    if (!token) {
      setItems([]);
      return;
    }

    const fetchCart = async () => {
      setInitialLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch cart");

        const data = await res.json();
        const mappedItems: CartItem[] = (data.items ?? []).map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image ?? "/default-image.jpg",
          quantity: item.quantity ?? 1,
          stockAvailable: item.stockAvailable ?? 0,
          variant: item.variant ?? "",
        }));
        setItems(mappedItems);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("Failed to fetch your cart.");
        setItems([]);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  // Sync cart to backend
  const syncCartWithBackend = async (updatedItems: CartItem[]) => {
    if (!token) return;

    try {
      setError(null);
      const payload = {
        items: updatedItems
          .filter((i) => i.quantity > 0)
          .map((item) => ({
            productId: item.id,
            quantity: Math.max(1, item.quantity),
            variant: item.variant || undefined,
          })),
      };

      if (payload.items.length === 0) return;

      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.msg || "Failed syncing cart");
      }
    } catch (err) {
      console.error("Sync cart error:", err);
      setError("Failed to sync cart. Try again.");
    }
  };

  const debouncedSyncCart = useMemo(() => debounce(syncCartWithBackend, 400), [token]);

  const add: CartContextValue["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      const newItems = existing
        ? prev.map((p) =>
            p.id === item.id
              ? { ...p, quantity: Math.min(p.quantity + qty, p.stockAvailable) }
              : p
          )
        : [...prev, { ...item, quantity: Math.min(qty, item.stockAvailable) }];
      debouncedSyncCart(newItems);
      return newItems;
    });
  };

  const remove: CartContextValue["remove"] = (id) => {
    setItems((prev) => {
      const newItems = prev.filter((p) => p.id !== id);
      debouncedSyncCart(newItems);
      return newItems;
    });
  };

  const update: CartContextValue["update"] = (id, qty) => {
    setItems((prev) => {
      const newItems = prev.map((p) =>
        p.id === id ? { ...p, quantity: Math.min(Math.max(1, qty), p.stockAvailable) } : p
      );
      debouncedSyncCart(newItems);
      return newItems;
    });
  };

  const increaseQuantity: CartContextValue["increaseQuantity"] = (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    update(id, Math.min(item.quantity + 1, item.stockAvailable));
  };

  const decreaseQuantity: CartContextValue["decreaseQuantity"] = (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity - 1;
    if (newQty <= 0) remove(id);
    else update(id, newQty);
  };

  const clear = () => {
    setItems([]);
    if (!token) return;
    fetch(`${API_BASE_URL}/api/cart/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch((err) => {
      console.error(err);
      setError("Failed to clear cart. Try again.");
    });
  };

  const count = items.reduce((a, b) => a + b.quantity, 0);
  const total = items.reduce((a, b) => a + b.price * b.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      add,
      remove,
      update,
      increaseQuantity,
      decreaseQuantity,
      clear,
      count,
      total,
    }),
    [items, count, total]
  );

  return (
    <CartContext.Provider value={value}>
      {/* Show errors if needed */}
      {error && <div className="text-red-600 p-2">{error}</div>}
      {/* Removed "Loading cart..." */}
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
