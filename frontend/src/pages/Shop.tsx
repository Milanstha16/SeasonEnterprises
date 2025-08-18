import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";

// ✅ Product type
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating?: number;
  threeD?: boolean;
}

const products: Product[] = [
  {
    id: "1",
    name: "Handmade Silver Necklace",
    price: 45,
    description: "A beautiful handmade silver necklace crafted by artisans in Nepal.",
    image: "/products/silver-necklace.jpg",
    category: "Jewelry",
  },
  {
    id: "2",
    name: "Dhaka Fabric Scarf",
    price: 25,
    description: "Traditional Nepali Dhaka scarf with intricate woven patterns.",
    image: "/products/dhaka-scarf.jpg",
    category: "Clothing",
  },
  {
    id: "3",
    name: "Singing Bowl",
    price: 35,
    description: "Brass singing bowl with wooden mallet – perfect for meditation.",
    image: "/products/singing-bowl.jpg",
    category: "Spirituality",
  },
  {
    id: "4",
    name: "Carved Wooden Mask",
    price: 55,
    description: "Traditional hand-carved wooden mask from the Kathmandu Valley.",
    image: "/products/wooden-mask.jpg",
    category: "Home Decor",
  },
  {
    id: "5",
    name: "Nepali Felt Coasters (Set of 4)",
    price: 18,
    description: "Colorful, handmade felt coasters to brighten up your space.",
    image: "/products/felt-coasters.jpg",
    category: "Home Decor",
  },
  {
    id: "6",
    name: "Tibetan Prayer Flags",
    price: 12,
    description: "5-meter long set of vibrant prayer flags for peace and prosperity.",
    image: "/products/prayer-flags.jpg",
    category: "Spirituality",
  },
];

export default function Shop() {
  const navigate = useNavigate();
  const { add } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleAddToCart = (product: Product) => {
    add({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    toast({
      title: "Added to cart",
      description: `${product.name}`,
    });
  };

  const handleBuyNow = (product: Product) => {
    toast({
      title: "Proceeding to checkout..",
      description: ` ${product.name}`,
    });
    navigate("/checkout");
  };

  // 🧠 Unique categories for dropdown
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  // 🔎 Filtered product list
  const filteredProducts = products.filter((product) => {
    const matchCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchSearch = `${product.name} ${product.category}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <section className="py-16 bg-white min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="text-4xl font-display">Shop All Products</h1>
          <Link to="/cart">
            <Button variant="outline">View Cart</Button>
          </Link>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-1/4 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition"
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                className="border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    {product.category}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.description}
                  </p>
                  <p className="text-lg font-medium mb-4">
                    ${product.price.toFixed(2)}
                  </p>

                  <div className="mt-auto flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-muted hover:bg-muted/80 text-sm font-medium text-primary border border-border rounded-md px-4 py-2 transition-colors"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </motion.button>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleBuyNow(product)}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">
              No products found.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
