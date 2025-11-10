import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

const ProductsList = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc"); // Default sorting
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const getImageUrl = (image: string) => {
    if (!image) return "https://via.placeholder.com/300x200?text=No+Image";
    return image.startsWith("http") ? image : `${API_BASE_URL}/uploads/${image}`;
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    switch (sort) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "stock-asc":
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      case "stock-desc":
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [search, sort, products]);

  return (
    <div className="p-6 bg-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Products</h1>
        <Link to="/admin/products/new">
          <Button className="bg-indigo-700 hover:bg-indigo-800 text-white">
            Add / Manage
          </Button>
        </Link>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/3 p-2 border rounded focus:outline-none focus:ring focus:border-indigo-400"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full sm:w-1/4 p-2 border rounded focus:outline-none focus:ring focus:border-indigo-400"
        >
          <option value="name-asc">Name A → Z</option>
          <option value="name-desc">Name Z → A</option>
          <option value="price-asc">Price Low → High</option>
          <option value="price-desc">Price High → Low</option>
          <option value="stock-asc">Stock Low → High</option>
          <option value="stock-desc">Stock High → Low</option>
        </select>
        <p className="text-black font-medium">
          Total Products: {filteredProducts.length}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-600 mb-4 bg-red-100 p-3 rounded border border-red-200">
          {error}
        </p>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center items-center py-6">
          <span className="animate-spin border-4 border-t-4 border-indigo-600 rounded-full w-12 h-12" />
        </div>
      )}

      {/* No products message */}
      {!loading && filteredProducts.length === 0 && (
        <p className="text-center text-black text-lg">No products found.</p>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-indigo-100 p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 flex flex-col"
          >
            <img
              src={getImageUrl(product.image)}
              alt={product.name || "Product image"}
              className="h-48 w-full object-cover rounded-lg mb-3"
              onError={(e) =>
                ((e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300x200?text=No+Image")
              }
            />
            <h2 className="text-lg font-semibold text-black">{product.name}</h2>
            <p className="text-black text-sm mb-1">
              Price: <span className="font-medium">${product.price.toFixed(2)}</span>
            </p>
            <p className="text-black text-sm mb-3">Stock: {product.stock}</p>
            <Link to={`/admin/products/${product._id}`}>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
              >
                View
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
