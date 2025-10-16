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
          <Link to="/shop" aria-label="Continue shopping">
            <Button className="mt-4">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-md border p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 rounded object-cover"
                  loading="lazy"
                  width={64}
                  height={64}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`quantity-${item.id}`} className="sr-only">
                    Quantity for {item.name}
                  </label>
                  <input
                    id={`quantity-${item.id}`}
                    aria-label={`Quantity for ${item.name}`}
                    className="w-16 rounded border bg-background px-2 py-1 text-center"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      update(item.id, Math.max(1, Number(e.target.value)))
                    }
                    onBlur={(e) =>
                      update(item.id, Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                  <Button
                    variant="ghost"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => remove(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={clear}
              className="mt-4"
              aria-label="Clear all items from cart"
            >
              Clear Cart
            </Button>
          </div>

          <aside className="rounded-lg border p-4 h-fit">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Taxes and shipping calculated at checkout.
            </p>
            <Link to="/checkout">
              <Button
                className="mt-4 w-full"
                disabled={isCartEmpty} // Disable checkout if the cart is empty
                aria-disabled={isCartEmpty}
                aria-label="Proceed to checkout"
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
