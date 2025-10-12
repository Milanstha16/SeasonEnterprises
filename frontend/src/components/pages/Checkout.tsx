import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/components/hooks/use-toast";
import { useCart } from "@/components/context/CartContext";
import { useAuth } from "@/components/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with your public key
const stripePromise = loadStripe('pk_test_51SH7TZCnCfQ1XzuSdNaOj13gAjPfFpGS577x52P92cIIsPdUBfhQ1wWWxFQNOz9iYP7jHxAp6J26tXCAFVP03GTl00y4IT7nJ6'); // Use your actual Stripe public key

export default function CheckoutPage() {
  const { items, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const stripe = useStripe();
  const elements = useElements(); // Access elements from the hook

  // Redirect if user not logged in
  useEffect(() => {
    if (!user) {
      toast({ title: "Login required", description: "You must log in to checkout." });
      navigate("/signin");
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateOrderData = (orderData: any) => {
    if (!orderData.userId || !orderData.items || orderData.items.length === 0 || !orderData.shipping) {
      throw new Error("Missing required fields in the order data.");
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;

    if (items.length === 0) {
      toast({ title: "Cart empty", description: "Add items to cart before checkout." });
      return;
    }

    setSubmitting(true);

    try {
      // Collect order data and prepare it for the backend
      const orderData = {
        userId: user.id,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          priceAtPurchase: i.price,
        })),
        shipping: formData,
        paymentMethod,
      };

      // Validate order data
      validateOrderData(orderData);

      // Log the order data for debugging
      console.log("Order data:", orderData);

      // Send request to backend to create the order
      const response = await fetch("http://localhost:5000/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(`Failed to create order: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      // Handle Stripe Checkout
      if (paymentMethod === "stripe" && data.clientSecret) {
        if (!stripe || !elements) {
          toast({ title: "Stripe not loaded", description: "Stripe.js is not ready yet." });
          return;
        }

        // Confirm payment using the clientSecret
        const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

        if (error) {
          toast({ title: "Payment Failed", description: error.message });
        } else if (paymentIntent?.status === 'succeeded') {
          toast({ title: "Payment Successful", description: "Your order has been placed!" });
          // Clear the cart after the order is created
          clear();
          navigate("/order-confirmation");
        }
      } else if (paymentMethod === "paypal") {
        toast({ title: "PayPal", description: "Redirect to PayPal flow (not implemented)." });
      }
    } catch (err: any) {
      // Specific error handling
      if (err.message.includes("Failed to create order")) {
        toast({ title: "Backend Error", description: "Could not create order. Please try again later." });
      } else if (err.message.includes("Stripe not loaded")) {
        toast({ title: "Payment Error", description: "Stripe payment failed. Please try again later." });
      } else {
        toast({ title: "Error", description: err.message || "Something went wrong." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container py-10">
      <Helmet>
        <title>Checkout | Season Enterprises</title>
        <meta name="description" content="Secure checkout for your handmade Nepalese crafts." />
        <link rel="canonical" href="/checkout" />
      </Helmet>

      <h1 className="font-display text-3xl mb-6">Checkout</h1>

      <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-2">
        {/* Billing / Shipping Info */}
        <div className="space-y-4">
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Full Name"
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Address"
            className="w-full border rounded px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="City"
              className="w-full border rounded px-3 py-2"
            />
            <input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              placeholder="Postal Code"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "stripe" | "paypal")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="stripe">Visa / Credit Card (Stripe)</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
        </div>

        {/* Order Summary & Submit */}
        <aside className="rounded-lg border p-4 h-fit">
          <h2 className="font-medium mb-2">Order Summary</h2>
          <ul className="text-sm mb-4">
            {items.map((i) => (
              <li key={i.id}>
                {i.name} x {i.quantity} = ${(i.price * i.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="font-semibold mb-4">Total: ${total.toFixed(2)}</p>

          {/* Stripe Payment Integration */}
          {paymentMethod === "stripe" && (
            <div>
              <CardElement />
            </div>
          )}

          <Button className="mt-2 w-full" type="submit" disabled={submitting}>
            {submitting ? "Processing..." : "Pay Now"}
          </Button>
        </aside>
      </form>
    </main>
  );
}
