import { useParams } from "react-router-dom";
import products from "@/data/products";
import { Button } from "@/components/ui/button";
import ProductViewer3D from "@/components/three/ProductViewer3D";
import { useCart } from "@/context/CartContext";
import { Helmet } from "react-helmet-async";
import { toast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { add } = useCart();

  if (!product) return <div className="container py-16">Product not found.</div>;

  const onAdd = () => {
    add({ id: product.id, name: product.name, price: product.price, image: product.image });
    toast({ title: "Added to cart", description: `${product.name} added to your cart.` });
  };

  return (
    <main className="container py-10">
      <Helmet>
        <title>{product.name} | Himalayan Emporium</title>
        <meta name="description" content={`Buy ${product.name} — authentic handmade craft from Nepal.`} />
        <link rel="canonical" href={`/product/${product.id}`} />
      </Helmet>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.threeD ? (
            <ProductViewer3D />
          ) : (
            <img src={product.image} alt={`${product.name} product image`} className="rounded-lg border" />
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">Category: {product.category}</p>
          <div className="mt-4 text-2xl font-semibold">${product.price.toFixed(2)}</div>
          <p className="mt-4 text-muted-foreground">
            Handmade by artisans in Nepal using traditional methods and materials.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={onAdd}>Add to Cart</Button>
            <Button variant="outline">Save to Wishlist</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
