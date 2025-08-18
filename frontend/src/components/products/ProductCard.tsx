import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  threeD?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  const onAdd = () => {
    add({ id: product.id, name: product.name, price: product.price, image: product.image });
    toast({ title: "Added to cart", description: `${product.name} added to your cart.` });
  };

  return (
    <article className="group rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`} className="block overflow-hidden">
        <img
          src={product.image}
          alt={`${product.name} handmade Nepalese craft product photo`}
          loading="lazy"
          className="aspect-square w-full object-cover group-hover:scale-[1.03] transition-transform"
        />
      </Link>
      <div className="p-4">
        <h3 className="font-medium line-clamp-1">{product.name}</h3>
        <div className="mt-1 text-sm text-muted-foreground">{product.category}</div>
        <div className="mt-3 flex items-center justify-between">

        </div>
      </div>
    </article>
  );
}
