import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/components/context/CartContext";
import { toast } from "@/components/hooks/use-toast";
import axios from "axios";

// ✅ Product type
interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating?: number;
  threeD?: boolean;
  stock?: number;
}

// ✅ Base URL for API calls & images
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Shop() {
  const navigate = useNavigate();
  const { add, clear } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ✅ Helper to get correct image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/default-image.jpg"; // fallback
    if (imagePath.startsWith("http")) return imagePath; // already full URL
    if (imagePath.startsWith("uploads")) return `${API_BASE}/${imagePath}`;
    return `${API_BASE}/uploads/${imagePath}`;
  };

  // ✅ Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products:", err);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again later.",
        });
      }
    };
    fetchProducts();
  }, []);

  // ✅ Add to Cart
  const handleAddToCart = (product: Product) => {
    add({
      id: product._id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product.image),
      stockAvailable: product.stock ?? 0,
    });

    toast({
      title: "Added to cart",
      description: product.name,
    });
  };

  // ✅ Buy Now
  const handleBuyNow = (product: Product) => {
    clear();
    add({
      id: product._id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product.image),
      stockAvailable: product.stock ?? 0,
    });

    toast({
      title: "Proceeding to checkout...",
      description: product.name,
    });

    navigate("/checkout");
  };

  // 🧠 Unique categories for dropdown
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  // 🔎 Filtered products
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

        {/* Search & Filter */}
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
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                className="border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
                  <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                  <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                  <p className="text-lg font-medium mb-4">${product.price.toFixed(2)}</p>

                  {/* Stock status */}
                  {product.stock && product.stock <= 0 ? (
                    <p className="text-red-600 font-semibold mt-2">Out of Stock</p>
                  ) : (
                    <div className="mt-auto flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-muted hover:bg-muted/80 text-sm font-medium text-primary border border-border rounded-md px-4 py-2 transition-colors"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.stock || product.stock <= 0}
                      >
                        Add to Cart
                      </motion.button>
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => handleBuyNow(product)}
                        disabled={!product.stock || product.stock <= 0}
                      >
                        Buy Now
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No products found.</p>
          )}
        </div>
      </div>
    </section>
  );
}
