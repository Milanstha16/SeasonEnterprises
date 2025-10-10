import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";

const AddProduct = () => {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null as File | null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

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
    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/api/products/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add product.");
        return;
      }

      setProducts((prev) => [...prev, data.product]);
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: null,
      });
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 bg-indigo-50 min-h-screen">
      <h1 className="text-4xl font-bold text-black text-center mb-10">
        Add Products
      </h1>

      {/* Error Message */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-center">
          {error}
        </div>
      )}

      {/* Add Product Form */}
      <section className="mb-12 bg-white p-6 rounded-xl shadow-md border border-indigo-100">
        <h2 className="text-2xl font-semibold text-black mb-4">
          Add New Product
        </h2>
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
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          />
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
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="col-span-1 md:col-span-2"
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={loading}
          className="bg-indigo-700 hover:bg-indigo-800 text-white"
        >
          {loading ? "Adding..." : "Add Product"}
        </Button>
      </section>

      {/* Product List */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
        <h2 className="text-2xl font-semibold text-black mb-6">
          Manage Products
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500 italic text-center">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="border border-indigo-100 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <img
                    src={`http://localhost:5000/uploads/${product.image}`}
                    alt={product.name}
                    className="h-40 w-full object-cover mb-3 rounded"
                  />
                  <h3 className="text-lg font-semibold text-black mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-black mb-1">
                    Category: {product.category}
                  </p>
                  <p className="text-sm text-black mb-1">
                    Stock: {product.stock}
                  </p>
                  <p className="text-gray-700 font-medium">
                    Price: ${parseFloat(product.price).toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product._id)}
                  disabled={deletingId === product._id}
                  className="mt-3"
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

export default AddProduct;
