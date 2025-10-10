import products from "@/components/products/products";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  return (
    <section id="featured" className="container py-12">
      <header className="mb-6">
        <h2 className="font-display text-3xl">Featured Crafts</h2>
        <p className="text-muted-foreground">Authentic, artisan‑made items from Nepal</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
