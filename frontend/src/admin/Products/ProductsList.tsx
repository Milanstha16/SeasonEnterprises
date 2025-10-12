import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ProductsList = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch products function
  const fetchProducts = async () => {
    setLoading(true); // Start loading
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Could not load products.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  return (
    <div className="p-6 bg-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Products</h1>
        <Link to="/admin/products/new">
          <Button className="bg-indigo-700 hover:bg-indigo-800 text-white">
            Add/Manage
          </Button>
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-600 mb-4 bg-red-100 p-3 rounded border border-red-200">
          {error}
        </p>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-6">
          <span className="animate-spin border-4 border-t-4 border-indigo-600 rounded-full w-12 h-12"></span>
        </div>
      )}

      {/* Product Grid */}
      {!loading && products.length === 0 && (
        <p className="text-center text-black text-lg">No products found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-indigo-100 p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300"
          >
            <img
              src={`http://localhost:5000/uploads/${product.image}`}
              alt={product.name}
              className="h-48 w-full object-cover rounded-lg mb-3"
            />
            <h2 className="text-lg font-semibold text-black">{product.name}</h2>
            <p className="text-black text-sm mb-1">
              Price: <span className="font-medium">${product.price}</span>
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
