import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const OrdersList = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Fetch orders from the API
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Fetch failed");
      
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Could not fetch orders.");
    }
  };

  // Fetch orders when the component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <ul className="space-y-3">
        {orders.length > 0 ? (
          orders.map((order) => (
            <li key={order._id} className="border p-3 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Status:</strong> {order.paymentStatus}</p> {/* Changed to paymentStatus */}
                </div>
                <Link to={`/admin/orders/${order._id}`}>
                  <Button size="sm">Details</Button>
                </Link>
              </div>
            </li>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </ul>
    </div>
  );
};

export default OrdersList;
