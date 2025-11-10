import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Helper to handle Cloudinary URLs or local uploads
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "https://placehold.co/400x300?text=No+Image";
    return imagePath.startsWith("http") ? imagePath : `${API_BASE_URL}/uploads/${imagePath}`;
  };

  // Fetch product details
  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");

      const data = await res.json();
      if (!data || data.error) throw new Error(data.error || "Product not found");

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

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        <p className="font-semibold">{error}</p>
        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded hover:bg-gray-100 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="p-6 text-center text-black">
        <p>Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded hover:bg-gray-100 transition"
        >
          Back
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 border rounded hover:bg-gray-100 transition"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-semibold mb-4 text-black">{product.name}</h1>

      <img
        src={getImageUrl(product.image)}
        alt={product.name || "Product image"}
        className="w-full max-h-96 object-cover rounded-lg shadow-md mb-6"
        onError={(e) =>
          ((e.target as HTMLImageElement).src =
            "https://placehold.co/400x300?text=No+Image")
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
    </div>
  );
};

export default ProductDetails;
