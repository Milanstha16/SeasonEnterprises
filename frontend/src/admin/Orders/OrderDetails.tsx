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

  // Format the total as currency
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="p-6">
      <Button onClick={() => navigate(-1)}>Back</Button>
      <h1 className="text-2xl font-semibold mt-4 mb-4">Order #{order._id}</h1>
      <p><strong>Status:</strong> {order.paymentStatus}</p> {/* Corrected to paymentStatus */}
      <p><strong>Total:</strong> {formatCurrency(order.totalAmount)}</p> {/* Format total */}
      
      <h2 className="text-xl mt-4 mb-2">Items:</h2>
      <ul className="space-y-2">
        {order.items.map((item: any) => (
          <li key={item.productId} className="border-b py-2">
            <p><strong>{item.name}</strong></p>
            <p>Quantity: {item.quantity}</p>
            <p>Price: {formatCurrency(item.priceAtPurchase)}</p>
            <p>Total: {formatCurrency(item.priceAtPurchase * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <h2 className="text-xl mt-4 mb-2">Shipping Info:</h2>
      <p><strong>Full Name:</strong> {order.shipping.fullName}</p>
      <p><strong>Email:</strong> {order.shipping.email}</p>
      <p><strong>Address:</strong> {order.shipping.address}</p>
      <p><strong>City:</strong> {order.shipping.city}</p>
      <p><strong>Postal Code:</strong> {order.shipping.postalCode}</p>

      <Link to={`/admin/orders/${order._id}/update`}>
        <Button className="mt-4">Update Status</Button>
      </Link>
    </div>
  );
};

export default OrderDetails;
