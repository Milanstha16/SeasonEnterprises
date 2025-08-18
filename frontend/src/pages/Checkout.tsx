import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Demo checkout — payment integration coming soon.");
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input className="w-full rounded-md border bg-background px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full rounded-md border bg-background px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Address</label>
            <input className="w-full rounded-md border bg-background px-3 py-2" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">City</label>
              <input className="w-full rounded-md border bg-background px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm mb-1">Postal Code</label>
              <input className="w-full rounded-md border bg-background px-3 py-2" required />
            </div>
          </div>
        </div>
        <aside className="rounded-lg border p-4 h-fit">
          <h2 className="font-medium">Payment</h2>
          <p className="text-sm text-muted-foreground">Payment gateway integration (Stripe) will be added here.</p>
          <Button className="mt-4 w-full" type="submit">Pay Now</Button>
        </aside>
      </form>
    </main>
  );
}
