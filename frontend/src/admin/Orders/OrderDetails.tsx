import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error(err);
      setError("Could not fetch order.");
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!order) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <Button onClick={() => navigate(-1)}>Back</Button>
      <h1 className="text-2xl font-semibold mt-4 mb-4">Order #{order._id}</h1>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Total:</strong> {order.total}</p>
      {/* Show items, user info, etc. */}
      <Link to={`/admin/orders/${order._id}/update`}>
        <Button>Update Status</Button>
      </Link>
    </div>
  );
};

export default OrderDetails;
