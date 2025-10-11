import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/components/hooks/use-toast";
import { useCart } from "@/components/context/CartContext";
import { useAuth } from "@/components/context/AuthContext";
import { useNavigate } from "react-router-dom";

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;

    if (items.length === 0) {
      toast({ title: "Cart empty", description: "Add items to cart before checkout." });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id, // Ensure this matches the correct field from your user context (typically `_id`)
          items: items.map((i) => ({
            productId: i.id, // Ensure this field matches your product data structure
            quantity: i.quantity,
            priceAtPurchase: i.price, // Include the price at the time of purchase
          })),
          shipping: formData,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create order. Status: ${response.status}`);
      }

      const data = await response.json();

      // Handle Stripe Checkout
      if (paymentMethod === "stripe" && data.url) {
        window.location.href = data.url; // Redirect to Stripe payment page
      } else if (paymentMethod === "paypal") {
        toast({ title: "PayPal", description: "Redirect to PayPal flow (not implemented)." });
      }

      // Clear cart after order creation
      clear();

    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong." });
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

          <Button className="mt-2 w-full" type="submit" disabled={submitting}>
            {submitting ? "Processing..." : "Pay Now"}
          </Button>
        </aside>
      </form>
    </main>
  );
}
