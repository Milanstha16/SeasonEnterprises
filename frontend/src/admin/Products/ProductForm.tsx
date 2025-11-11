import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom"; // ✅ Added
// You can change allowedCategories as needed
const allowedCategories = ['Bags', 'Meditation', 'Jewelry', 'Clothing', 'Home Decor', 'Scarves'];

const AddProduct = () => {
  const { token } = useAuth();
  const navigate = useNavigate(); // ✅ Added for navigation

  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null as File | null,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    image: null as File | null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Helper to handle Cloudinary URLs or local uploads
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "/default-image.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
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

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setForm((prev) => ({ ...prev, image: e.target.files[0] }));
      setError("");
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setEditForm((prev) => ({ ...prev, image: e.target.files[0] }));
      setError("");
    }
  };

  // Add product
  const handleAdd = async () => {
    const { name, description, price, category, stock, image } = form;

    if (!name || !price || !category || !stock || !image) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("stock", stock);
    formData.append("image", image);

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/add-product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.error || "Failed to add product");

      setProducts((prev) => [...prev, data.product]);
      setForm({ name: "", description: "", price: "", category: "", stock: "", image: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEditing = (product: any) => {
    setEditingId(product._id);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      description: product.description || "",
      image: null,
    });
    setError("");
  };

  // Save edited product
  const saveEdit = async (id: string) => {
    setSavingId(id);
    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("price", editForm.price);
    formData.append("category", editForm.category);
    formData.append("stock", editForm.stock);
    formData.append("description", editForm.description || "");
    if (editForm.image) formData.append("image", editForm.image);

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.error || "Failed to update product");

      fetchProducts();
      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update product");
    } finally {
      setSavingId(null);
    }
  };

  // Delete product
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const isAddDisabled = !form.name || !form.price || !form.category || !form.stock || !form.image || loading;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 bg-indigo-50 min-h-screen">
      {/* 🔹 Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="text-black hover:bg-gray-100 transition"
        >
          ← Back
        </Button>
      </div>

      <h1 className="text-4xl font-bold text-black text-center mb-10">Manage Products</h1>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-center">
          {error}
        </div>
      )}

      {/* Add Product Form */}
      <section className="mb-12 bg-white p-6 rounded-xl shadow-md border border-indigo-100">
        <h2 className="text-2xl font-semibold text-black mb-4">Add New Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select category</option>
            {allowedCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            className="px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="col-span-1 md:col-span-2 px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="col-span-1 md:col-span-2"
          />
          {form.image && (
            <img
              src={URL.createObjectURL(form.image)}
              alt="Preview"
              className="col-span-1 md:col-span-2 w-40 h-40 object-cover rounded mt-2"
            />
          )}
        </div>
        <Button
          onClick={handleAdd}
          disabled={isAddDisabled}
          className="bg-indigo-700 hover:bg-indigo-800 text-white"
        >
          {loading ? "Adding..." : "Add Product"}
        </Button>
      </section>

      {/* Product List */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
        <h2 className="text-2xl font-semibold text-black mb-6">Existing Products</h2>

        <input
          type="text"
          placeholder="Search products..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        />

        {products.length === 0 ? (
          <p className="text-gray-500 italic text-center">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((product) => (
                <div
                  key={product._id}
                  className="border border-indigo-100 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
                >
                  {editingId === product._id ? (
                    <div>
                      <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="mb-2 w-full px-2 py-1 border rounded"/>
                      <input type="number" name="price" value={editForm.price} onChange={handleEditChange} className="mb-2 w-full px-2 py-1 border rounded"/>
                      <select name="category" value={editForm.category} onChange={handleEditChange} className="mb-2 w-full px-2 py-1 border rounded">
                        <option value="">Select category</option>
                        {allowedCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <input type="number" name="stock" value={editForm.stock} onChange={handleEditChange} className="mb-2 w-full px-2 py-1 border rounded"/>
                      <textarea name="description" value={editForm.description} onChange={handleEditChange} className="mb-2 w-full px-2 py-1 border rounded"/>
                      <input type="file" accept="image/*" onChange={handleEditFileChange} className="mb-2 w-full"/>
                      {editForm.image ? (
                        <img src={URL.createObjectURL(editForm.image)} alt="Edit Preview" className="mb-2 w-32 h-32 object-cover rounded"/>
                      ) : (
                        <img src={getImageUrl(product.image)} alt="Current" className="mb-2 w-32 h-32 object-cover rounded"/>
                      )}
                      <div className="flex gap-2">
                        <Button onClick={() => saveEdit(product._id)} disabled={savingId === product._id} className="bg-green-600 hover:bg-green-700 text-white">
                          {savingId === product._id ? "Saving..." : "Save"}
                        </Button>
                        <Button onClick={() => setEditingId(null)} className="bg-gray-300 hover:bg-gray-400 text-black">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-48 object-cover rounded mb-2"/>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-gray-600">${product.price}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                      <p className="text-sm mt-2">{product.description}</p>
                      <div className="mt-4 flex gap-2">
                        <Button onClick={() => startEditing(product)} className="bg-yellow-500 hover:bg-yellow-600 text-white">Edit</Button>
                        <Button onClick={() => handleDelete(product._id)} disabled={deletingId === product._id} className="bg-red-600 hover:bg-red-700 text-white">
                          {deletingId === product._id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AddProduct;
