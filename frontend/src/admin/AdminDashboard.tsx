import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    if (!name.trim() || !price.trim()) {
      setError("Please enter both name and price.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price: parseFloat(price) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Error adding product");
        setLoading(false);
        return;
      }

      setProducts((prev) => [...prev, data]);
      setName("");
      setPrice("");
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    }
    setDeletingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-4xl font-bold text-center mb-10">Admin Dashboard</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-center">
          {error}
        </div>
      )}

      {/* Add Product Form */}
      <section className="mb-12 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="col-span-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
            step="1"
          />
          <Button
            onClick={handleAdd}
            disabled={loading}
            className="col-span-1 h-full"
          >
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Manage Products</h2>

        {products.length === 0 ? (
          <p className="text-gray-500 italic text-center">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-medium mb-2">{product.name}</h3>
                  <p className="text-gray-700 mb-4">
                    Price: ${parseFloat(product.price).toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product._id)}
                  disabled={deletingId === product._id}
                >
                  {deletingId === product._id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
