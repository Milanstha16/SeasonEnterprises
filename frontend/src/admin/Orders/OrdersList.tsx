import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Order {
  _id: string;
  status: string;
}

const OrdersList = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Use environment variable for API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Could not fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered orders by status
  const groupedOrders: Record<string, Order[]> = filteredOrders.reduce(
    (groups, order) => {
      const status = order.status || "unknown";
      if (!groups[status]) groups[status] = [];
      groups[status].push(order);
      return groups;
    },
    {} as Record<string, Order[]>
  );

  const statusOrder = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "unknown",
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by Order ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        statusOrder.map((status) => {
          const ordersByStatus = groupedOrders[status] || [];
          if (ordersByStatus.length === 0) return null;

          return (
            <section key={status} className="mb-8">
              <h2 className="text-xl font-semibold capitalize mb-4">
                {status} Orders ({ordersByStatus.length})
              </h2>
              <ul className="space-y-3">
                {ordersByStatus.map((order) => (
                  <li
                    key={order._id}
                    className="border p-3 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p>
                          <strong>Order ID:</strong> {order._id}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span
                            className={`capitalize font-medium ${
                              order.status === "delivered"
                                ? "text-green-600"
                                : order.status === "pending"
                                ? "text-yellow-600"
                                : order.status === "shipped"
                                ? "text-blue-600"
                                : order.status === "cancelled"
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {order.status}
                          </span>
                        </p>
                      </div>
                      <Link to={`/admin/orders/${order._id}`}>
                        <Button size="sm">Details</Button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
};

export default OrdersList;
