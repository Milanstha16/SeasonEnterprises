import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

// Types
export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stockAvailable: number;
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("❌ VITE_API_BASE_URL is not defined in your environment.");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🛒 Fetch cart on login
  useEffect(() => {
    if (!token) {
      setItems([]);
      return;
    }

    const fetchCart = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch cart");

        const data = await res.json();

        const mappedItems: CartItem[] = (data.items ?? []).map((item: any) => {
          const product = item.productId ?? {};
          const imagePath =
            item.image || product.image || "";

          const imageUrl = imagePath.startsWith("http")
            ? imagePath
            : imagePath
            ? `${API_BASE_URL}/${imagePath}`
            : "/default-image.jpg";

          return {
            id: item.id ?? product._id ?? "",
            name: item.name ?? product.name ?? "Unknown Product",
            price: item.price ?? product.price ?? 0,
            image: imageUrl,
            quantity: item.quantity ?? 1,
            stockAvailable: product.stockAvailable ?? 0, // ✅ includes stockAvailable
          };
        });

        setItems(mappedItems);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("Failed to fetch your cart. Please try again later.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  // 🔁 Sync cart to backend
  const syncCartWithBackend = async (updatedItems: CartItem[]) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const payload = {
        items: updatedItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed syncing cart with backend");
      }
    } catch (err) {
      console.error("Sync cart error:", err);
      setError("Failed to sync cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ➕ Add item to cart
  const add: CartContextValue["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id);

      const newItems = found
        ? prev.map((p) =>
            p.id === item.id ? { ...p, quantity: p.quantity + qty } : p
          )
        : [
            ...prev,
            {
              ...item,
              quantity: qty,
              stockAvailable: item.stockAvailable ?? 0, // ✅ Ensure it's added if missing
            },
          ];

      syncCartWithBackend(newItems);
      return newItems;
    });
  };

  // ❌ Remove item from cart
  const remove: CartContextValue["remove"] = (id) => {
    setItems((prev) => {
      const newItems = prev.filter((p) => p.id !== id);
      syncCartWithBackend(newItems);
      return newItems;
    });
  };

  // 🔁 Update quantity
  const update: CartContextValue["update"] = (id, qty) => {
    if (qty <= 0) {
      remove(id);
      return;
    }

    setItems((prev) => {
      const newItems = prev.map((p) =>
        p.id === id ? { ...p, quantity: qty } : p
      );
      syncCartWithBackend(newItems);
      return newItems;
    });
  };

  // 🧹 Clear cart
  const clear = () => {
    setItems([]);
    if (!token) return;

    fetch(`${API_BASE_URL}/api/cart/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch((err) => {
      console.error(err);
      setError("Failed to clear cart. Please try again.");
    });
  };

  // 🧮 Count and total
  const count = items.reduce((a, b) => a + b.quantity, 0);
  const total = items.reduce((a, b) => a + b.price * b.quantity, 0);

  const value = useMemo(
    () => ({ items, add, remove, update, clear, count, total }),
    [items, count, total]
  );

  return (
    <CartContext.Provider value={value}>
      {error && <div className="text-red-600 p-2">{error}</div>}
      {loading && <div className="text-gray-500 p-2">Loading...</div>}
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
