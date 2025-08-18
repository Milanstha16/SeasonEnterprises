// frontend/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Error adding product");
        return;
      }

      setProducts([...products, data]);
      setName("");
      setPrice("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 mr-2"
        />
        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border px-2 py-1 mr-2"
        />
        <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-1">
          Add Product
        </button>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-b">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.price}</td>
              <td className="p-2">
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
