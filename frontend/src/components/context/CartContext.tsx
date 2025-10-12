import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

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

// Replace with your actual backend URL or environment variable
const API_BASE_URL = "http://localhost:5000";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Fetch cart from backend on login
  useEffect(() => {
    if (!token) {
      setItems([]);
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();

        const mappedItems: CartItem[] = data.items
          .filter((item: any) => item.productId) // Filter out null productIds
          .map((item: any) => ({
            id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image.startsWith("http")
              ? item.productId.image
              : `${API_BASE_URL}/${item.productId.image}`, // Make path absolute
            quantity: item.quantity,
          }));

        setItems(mappedItems);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setItems([]);
      }
    };

    fetchCart();
  }, [token]);

  const syncCartWithBackend = async (updatedItems: CartItem[]) => {
    if (!token) return;

    try {
      for (const item of updatedItems) {
        await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
        });
      }
    } catch (err) {
      console.error("Failed syncing cart with backend", err);
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
    fetch("/api/cart/clear", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch((err) => console.error(err));
  };

  const count = items.reduce((a, b) => a + b.quantity, 0);
  const total = items.reduce((a, b) => a + b.quantity * b.price, 0);

  const value = useMemo(
    () => ({ items, add, remove, update, clear, count, total }),
    [items, count, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
