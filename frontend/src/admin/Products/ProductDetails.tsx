import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  image: string;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Fetch product details
  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch product");
      }

      const data = await res.json();

      if (!data || data.error) {
        throw new Error(data.error || "Product not found");
      }

      setProduct(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not load product.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  // Delete product handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete product");

      alert("Product deleted successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Could not delete product");
    }
  };

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        <p className="font-semibold">{error}</p>
        <div className="mt-4 flex gap-2 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="outline" onClick={() => navigate("/admin/products")}>Products List</Button>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="p-6 text-center text-black">
        <p>Product not found.</p>
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          Back to Products List
        </Button>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex gap-4 mb-6">
        <Button onClick={() => navigate(-1)}>← Back</Button>
      </div>

      <h1 className="text-3xl font-semibold mb-4 text-black">{product.name}</h1>

      <img
        src={
          product.image.startsWith("http")
            ? product.image
            : `${API_BASE_URL}/uploads/${product.image}`
        }
        alt={product.name || "Product image"}
        className="w-full max-h-96 object-cover rounded-lg shadow-md mb-6"
        onError={(e) =>
          ((e.target as HTMLImageElement).src =
            "https://via.placeholder.com/400x300?text=No+Image")
        }
      />

      <div className="space-y-2 text-black text-lg">
        <p>
          <strong className="font-semibold">Category:</strong> {product.category}
        </p>
        <p>
          <strong className="font-semibold">Stock:</strong> {product.stock}
        </p>
        <p>
          <strong className="font-semibold">Price:</strong> ${product.price.toFixed(2)}
        </p>
      </div>

      {product.description && (
        <p className="mt-6 text-black leading-relaxed">{product.description}</p>
      )}

      {/* Admin Actions */}
      <div className="mt-6 flex gap-2">
        <Button onClick={() => navigate(`/admin/products/${product._id}/edit`)}>Edit</Button>
        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
      </div>
    </div>
  );
};

export default ProductDetails;
