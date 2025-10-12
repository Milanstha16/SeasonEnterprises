import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // New loading state

  const fetchProduct = async () => {
    setLoading(true); // Start loading
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch product");

      const data = await res.json();

      if (!data) {
        setError("Product not found.");
        return;
      }

      setProduct(data);
    } catch (err) {
      console.error(err);
      setError("Could not load product.");
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  if (error)
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );

  if (loading)
    return (
      <div className="p-6 text-center text-black">
        <p>Loading product details...</p>
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
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      <h1 className="text-3xl font-semibold mb-4 text-black">{product.name}</h1>

      <img
        src={`http://localhost:5000/uploads/${product.image}`}
        alt={product.name}
        className="w-full max-h-96 object-cover rounded-lg shadow-md mb-6"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) =>
          (e.target as HTMLImageElement).src = "https://via.placeholder.com/400" // Fallback image
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
          <strong className="font-semibold">Price:</strong> ${product.price}
        </p>
      </div>

      <p className="mt-6 text-black leading-relaxed">{product.description}</p>
    </div>
  );
};

export default ProductDetails;
