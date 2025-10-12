import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

// Types
export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

// Ensure the environment variable exists, or fall back to a default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://seasonenterprises.onrender.com";

console.log("API_BASE_URL:", API_BASE_URL);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart from backend on login
  useEffect(() => {
    if (!token) {
      setItems([]);
      return;
    }

    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch cart");

        const data = await res.json();

        const mappedItems: CartItem[] = data.items
          .filter((item: any) => item.productId)
          .map((item: any) => ({
            id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image
              ? item.productId.image.startsWith("http")
                ? item.productId.image
                : `${API_BASE_URL}/${item.productId.image}`
              : "/default-image.jpg",
            quantity: item.quantity,
          }));

        setItems(mappedItems);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setError("Failed to fetch your cart. Please try again later.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  // ✅ FIXED: Corrected syncCartWithBackend to match backend expectations
  const syncCartWithBackend = async (updatedItems: CartItem[]) => {
    if (!token) return;

    try {
      setLoading(true);

      const payload = {
        items: updatedItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          priceAtPurchase: item.price,
        })),
      };

      console.log("Syncing cart payload:", payload);

      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed syncing cart with backend");
      }

      console.log("Cart synced successfully with backend");
    } catch (err) {
      console.error("Failed syncing cart with backend", err);
      setError("Failed to sync cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const add: CartContextValue["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      let newItems;
      if (found) {
        newItems = prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + qty } : p
        );
      } else {
        newItems = [...prev, { ...item, quantity: qty }];
      }
      syncCartWithBackend(newItems);
      return newItems;
    });
  };

  const remove: CartContextValue["remove"] = (id) => {
    setItems((prev) => {
      const newItems = prev.filter((p) => p.id !== id);
      syncCartWithBackend(newItems);
      return newItems;
    });
  };

  const update: CartContextValue["update"] = (id, qty) => {
    setItems((prev) => {
      const newItems = prev.map((p) => (p.id === id ? { ...p, quantity: qty } : p));
      syncCartWithBackend(newItems);
      return newItems;
    });
  };

  const clear = () => {
    setItems([]);
    if (!token) return;

    fetch(`${API_BASE_URL}/api/cart/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to clear cart");
        console.log("Cart cleared successfully from backend");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to clear cart. Please try again.");
      });
  };

  const count = items.reduce((a, b) => a + b.quantity, 0);
  const total = items.reduce((a, b) => a + b.quantity * b.price, 0);

  const value = useMemo(
    () => ({ items, add, remove, update, clear, count, total }),
    [items, count, total]
  );

  return (
    <CartContext.Provider value={value}>
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading-spinner">Loading...</div>}
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
