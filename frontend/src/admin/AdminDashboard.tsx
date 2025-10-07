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
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-semibold mb-8 text-center">Admin Dashboard</h1>

      {/* Add Product Form */}
      <div className="mb-10 p-6 bg-gray-50 rounded-lg shadow-inner">
        {error && (
          <p className="mb-4 text-red-600 font-medium text-center">{error}</p>
        )}

        <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-32 px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
            step="0.01"
          />
          <Button
            onClick={handleAdd}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-primary text-white">
              <th className="p-4 rounded-tl-lg">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="text-center p-6 text-gray-500 italic"
                >
                  No products found.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr
                key={p._id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">${parseFloat(p.price).toFixed(2)}</td>
                <td className="p-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(p._id)}
                    disabled={deletingId === p._id}
                  >
                    {deletingId === p._id ? "Deleting..." : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
