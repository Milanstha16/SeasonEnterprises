import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Placeholder logic
    switch (paymentMethod) {
      case "paypal":
        alert("Redirecting to PayPal... (integration coming soon)");
        break;
      case "visa":
        alert("Redirecting to Stripe (Visa)... (integration coming soon)");
        break;
      default:
        alert("Please select a payment method.");
    }

    // After integration, call backend/payment gateway here
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
          <input required placeholder="Full Name" className="w-full border rounded px-3 py-2" />
          <input required type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
          <input required placeholder="Address" className="w-full border rounded px-3 py-2" />

          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="City" className="w-full border rounded px-3 py-2" />
            <input required placeholder="Postal Code" className="w-full border rounded px-3 py-2" />
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

          <Button className="mt-2 w-full" type="submit">
            Pay Now
          </Button>
        </aside>
      </form>
    </main>
  );
}
