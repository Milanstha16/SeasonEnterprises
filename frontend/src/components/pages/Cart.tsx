import { Link } from "react-router-dom";
import { useCart } from "@/components/context/CartContext";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

export default function CartPage() {
  const { items, total, update, remove, clear } = useCart();
  const isCartEmpty = items.length === 0;

  const handleQuantityChange = (id: string, value: number, max: number) => {
    const qty = Math.min(Math.max(1, value || 1), max);
    update(id, qty);
  };

  return (
    <main className="container py-10">
      <Helmet>
        <title>Cart | Season Enterprises</title>
        <meta
          name="description"
          content="Review your cart and proceed to secure checkout."
        />
        <link rel="canonical" href="/cart" />
      </Helmet>

      <h1 className="font-display text-3xl mb-6">Your Cart</h1>

      {isCartEmpty ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop">
            <Button className="mt-4">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-md border p-3"
              >
                <img
                  src={item.image || "/default-image.jpg"}
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
                  {item.variant && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Variant: {item.variant}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <input
                    type="number"
                    min={1}
                    max={item.stockAvailable}
                    value={item.quantity}
                    aria-label={`Quantity for ${item.name}`}
                    className="w-16 rounded border bg-background px-2 py-1 text-center"
                    onChange={(e) =>
                      handleQuantityChange(item.id, Number(e.target.value), item.stockAvailable)
                    }
                    onBlur={(e) =>
                      handleQuantityChange(item.id, Number(e.target.value), item.stockAvailable)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => remove(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={clear} className="mt-4">
              Clear Cart
            </Button>
          </div>

          {/* Cart Summary */}
          <aside className="rounded-lg border p-4 h-fit">
            <div className="flex items-center justify-between text-lg font-medium">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Taxes and shipping calculated at checkout.
            </p>
            <Link to="/checkout">
              <Button
                className="mt-4 w-full"
                disabled={isCartEmpty}
                aria-disabled={isCartEmpty}
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
