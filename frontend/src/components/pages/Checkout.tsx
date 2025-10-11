import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/components/hooks/use-toast";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { fullName, email, address, city, postalCode } = formData;

    setSubmitting(true);

    try {
      // Send order details to the backend
      const response = await fetch("http://localhost:5000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          address,
          city,
          postalCode,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process payment");
      }

      // Reset the form and show success message
      setFormData({
        fullName: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
      });

      toast({
        title: "Order Placed",
        description: `Thanks for your purchase, ${fullName}. We'll process your order shortly.`,
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
      });
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
        {/* Billing Information */}
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
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="paypal">PayPal</option>
              <option value="visa">Visa / Debit or Credit Card</option>
            </select>
          </div>
        </div>

        {/* Order Summary & Submit */}
        <aside className="rounded-lg border p-4 h-fit">
          <h2 className="font-medium mb-2">Payment Summary</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You selected: <strong>{paymentMethod.toUpperCase()}</strong>
          </p>

          <ul className="text-sm mb-4">
            <li>Subtotal: $100.00</li>
            <li>Shipping: $10.00</li>
            <li className="font-semibold">Total: $110.00</li>
          </ul>

          <Button className="mt-2 w-full" type="submit" disabled={submitting}>
            {submitting ? "Processing..." : "Pay Now"}
          </Button>
        </aside>
      </form>
    </main>
  );
}
