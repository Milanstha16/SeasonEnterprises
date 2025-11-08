import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface OrderItem {
  name: string;
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shipping: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
  };
  createdAt: string;
}

// ✅ Base URL for API
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function CheckoutSuccess() {
  const query = new URLSearchParams(useLocation().search);
  const orderId = query.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      console.error("Order ID is missing in URL query parameters.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="container py-10">Loading...</div>;
  if (!order) return <div className="container py-10">Order not found or error fetching data.</div>;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-4">Payment Successful</h1>
      <p className="mb-6">
        Thank you, <strong>{order.shipping.fullName}</strong>! Your order has been placed successfully.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Order Summary</h2>
          <ul className="text-sm mb-4">
            {order.items.map((i, idx) => (
              <li key={idx}>
                {i.name} x {i.quantity} = ${(i.priceAtPurchase * i.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="font-semibold">Total: ${order.totalAmount.toFixed(2)}</p>
          <p className="text-sm mt-2">
            Payment Method: <strong>{order.paymentMethod.toUpperCase()}</strong>
          </p>
          <p className="text-sm">
            Payment Status:{" "}
            <strong className={order.paymentStatus === "paid" ? "text-green-600" : "text-red-600"}>
              {order.paymentStatus.toUpperCase()}
            </strong>
          </p>
        </div>

        {/* Shipping Info */}
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Shipping Info</h2>
          <p>{order.shipping.fullName}</p>
          <p>{order.shipping.email}</p>
          <p>
            {order.shipping.address}, {order.shipping.city}, {order.shipping.postalCode}
          </p>
          <p className="text-sm mt-2">Order ID: {order._id}</p>
          <p className="text-sm">
            Order Date: {new Date(order.createdAt).toLocaleString("en-US", { timeZoneName: "short" })}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/shop">
          <Button className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
