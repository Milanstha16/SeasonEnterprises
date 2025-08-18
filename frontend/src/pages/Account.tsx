import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AccountPage() {
  return (
    <main className="container py-10">
      <Helmet>
        <title>Season Enterprises</title>
        <meta
          name="description"
          content="Manage your account, orders, and preferences."
        />
        <link rel="canonical" href="/account" />
      </Helmet>

      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1">
          Sign in to view your profile, orders, and saved items.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-medium">Welcome</h2>
          <p className="text-muted-foreground mt-1">
            Authentication is coming soon. In the meantime, you can browse products and
            build your cart.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/signin">Sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        </article>

        <aside className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-medium">Need help?</h2>
          <p className="text-muted-foreground mt-1">
            Visit our Contact page for support and inquiries about your orders.
          </p>
          <div className="mt-4">
            <Button variant="secondary" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </aside>
      </section>
    </main>
  );
}
