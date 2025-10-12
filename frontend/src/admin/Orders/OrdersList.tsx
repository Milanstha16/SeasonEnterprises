import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const OrdersList = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Filter orders based on search term (search by Order ID here)
  const filteredOrders = orders.filter((order) =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered orders by status
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    const status = order.status || "unknown";
    if (!groups[status]) groups[status] = [];
    groups[status].push(order);
    return groups;
  }, {} as Record<string, any[]>);

  // Define order of status sections to display (optional)
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
        className="mb-6 w-full px-3 py-2 border rounded"
      />

      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          {statusOrder.map((status) => {
            const ordersByStatus = groupedOrders[status] || [];
            if (ordersByStatus.length === 0) return null;

            return (
              <section key={status} className="mb-8">
                <h2 className="text-xl font-semibold capitalize mb-4">
                  {status} Orders ({ordersByStatus.length})
                </h2>
                <ul className="space-y-3">
                  {ordersByStatus.map((order) => (
                    <li key={order._id} className="border p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p>
                            <strong>Order ID:</strong> {order._id}
                          </p>
                          <p>
                            <strong>Status:</strong> {order.status}
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
          })}
        </>
      )}
    </div>
  );
};

export default OrdersList;
