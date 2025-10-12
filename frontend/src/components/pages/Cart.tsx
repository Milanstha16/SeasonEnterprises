import { Link } from "react-router-dom";
import { useCart } from "@/components/context/CartContext";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

export default function CartPage() {
  const { items, total, update, remove, clear } = useCart();

  // Check if the cart is empty
  const isCartEmpty = items.length === 0;

  return (
    <main className="container py-10">
      <Helmet>
        <title>Cart | Season Enterprises</title>
        <meta name="description" content="Review your cart and proceed to secure checkout." />
        <link rel="canonical" href="/cart" />
      </Helmet>
      <h1 className="font-display text-3xl mb-6">Your Cart</h1>
      {isCartEmpty ? (
        <div>
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop">
            <Button className="mt-4">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 rounded-md border p-3">
                <img src={it.image} alt={it.name} className="h-16 w-16 rounded object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-muted-foreground">${(it.price * it.quantity).toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`quantity-${it.id}`} className="sr-only">
                    Quantity for {it.name}
                  </label>
                  <input
                    id={`quantity-${it.id}`}
                    aria-label={`Quantity for ${it.name}`}
                    className="w-16 rounded border bg-background px-2 py-1"
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) => update(it.id, Math.max(1, Number(e.target.value)))}
                    onBlur={(e) => update(it.id, Math.max(1, Number(e.target.value) || 1))} // Handle on blur to avoid empty values
                  />
                  <Button variant="ghost" onClick={() => remove(it.id)}>Remove</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={clear}>Clear Cart</Button>
          </div>
          <aside className="rounded-lg border p-4 h-fit">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Taxes and shipping calculated at checkout.</p>
            <Link to="/checkout">
              <Button 
                className="mt-4 w-full"
                disabled={isCartEmpty} // Disable checkout if the cart is empty
              >
                Proceed to Checkout
              </Button>
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
