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

  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed fetch");
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error(err);
      setError("Could not load product.");
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <Button onClick={() => navigate(-1)}>Back</Button>
      <h1 className="text-2xl font-semibold mt-4 mb-4">{product.name}</h1>
      <img
        src={`http://localhost:5000/uploads/${product.image}`}
        alt={product.name}
        className="w-full max-h-96 object-cover rounded mb-4"
      />
      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      <p><strong>Price:</strong> {product.price}</p>
      <p className="mt-4">{product.description}</p>
    </div>
  );
};

export default ProductDetails;
