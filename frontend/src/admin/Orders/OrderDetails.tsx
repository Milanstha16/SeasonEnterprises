import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader"; // Assuming you have a loader component

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch order details
  const fetchOrder = async () => {
    if (!token) {
      setError("You are not logged in or the session has expired.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorDetails = await res.text(); // Read error message from server
        throw new Error(`Failed to fetch order: ${errorDetails}`);
      }

      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error(err);
      setError("Could not fetch the order details.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch order when component is mounted or id changes
  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  // Handle loading state
  if (loading) return <Loader />;

  // Handle errors
  if (error) return <p className="text-red-600 p-6">{error}</p>;

  // Handle if order is null or undefined
  if (!order) return <p className="text-red-600 p-6">Order not found.</p>;

  // Format currency helper
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  // Format payment method helper
  const formatPaymentMethod = (method: string) => {
    if (!method) return "N/A";
    if (method.toLowerCase() === "paypal") return "PayPal";
    if (method.toLowerCase() === "stripe") return "Stripe";
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  return (
    <div className="p-6">
      <Button onClick={() => navigate(-1)}>Back</Button>

      <h1 className="text-2xl font-semibold mt-4 mb-4">Order #{order._id}</h1>

      <p><strong>Order Status:</strong> {order.status}</p>
      <p><strong>Payment Method:</strong> {formatPaymentMethod(order.paymentMethod)}</p>
      <p><strong>Total:</strong> {formatCurrency(order.totalAmount)}</p>

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

      <div className="mt-4">
        <Link to={`/admin/orders/${order._id}/update`}>
          <Button 
            className="mr-2" 
            disabled={order.status === "cancelled" || order.status === "shipped"}
          >
            Update Status
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderDetails;
