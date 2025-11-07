import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Fetch order details
  const fetchOrder = async () => {
    if (!token) {
      setError("You are not logged in or the session has expired.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorDetails = await res.text();
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

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const formatPaymentMethod = (method: string) => {
    if (!method) return "N/A";
    if (method.toLowerCase() === "paypal") return "PayPal";
    if (method.toLowerCase() === "stripe") return "Stripe";
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!order) return <p className="text-red-600 p-6">Order not found.</p>;

  return (
    <div className="p-6">
      <Button onClick={() => navigate(-1)}>Back</Button>

      <h1 className="text-2xl font-semibold mt-4 mb-4">Order #{order._id}</h1>

      <p><strong>Order Status:</strong> {order.status}</p>
      <p><strong>Payment Method:</strong> {formatPaymentMethod(order.paymentMethod)}</p>
      <p><strong>Total:</strong> {formatCurrency(order.totalAmount)}</p>

      <h2 className="text-xl mt-6 mb-2">Items:</h2>
      <ul className="space-y-4">
        {order.items.map((item: any, index: number) => {
          const product = item.productId;
          const imageUrl = product?.image
            ? product.image.startsWith("http")
              ? product.image
              : `${API_BASE_URL}/uploads/${product.image}`
            : "/default-product.jpg";

          return (
            <li key={product?._id || index} className="flex items-center gap-4 border-b py-4">
              <img
                src={imageUrl}
                alt={product?.name || "Product"}
                className="w-20 h-20 object-cover rounded"
                onError={(e) => (e.currentTarget.src = "/default-product.jpg")}
              />
              <div>
                <p className="font-semibold">{product?.name || "Product not available"}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: {formatCurrency(item.priceAtPurchase)}</p>
                <p>Total: {formatCurrency(item.priceAtPurchase * item.quantity)}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <h2 className="text-xl mt-6 mb-2">Shipping Info:</h2>
      <p><strong>Full Name:</strong> {order.shipping.fullName}</p>
      <p><strong>Email:</strong> {order.shipping.email}</p>
      <p><strong>Address:</strong> {order.shipping.address}</p>
      <p><strong>City:</strong> {order.shipping.city}</p>
      <p><strong>Postal Code:</strong> {order.shipping.postalCode}</p>

      <div className="mt-6">
        <Link to={`/admin/orders/${order._id}/update`}>
          <Button 
            className="mr-2" 
            disabled={order.status === "cancelled"}
            variant={order.status === "cancelled" ? "secondary" : "default"}
            title={order.status === "cancelled" ? "Cannot update a cancelled order" : ""}
          >
            Update Status
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderDetails;
