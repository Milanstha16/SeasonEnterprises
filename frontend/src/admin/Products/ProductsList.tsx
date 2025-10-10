import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ProductsList = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed fetch");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Could not load products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link to="/admin/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded-lg">
            <img
              src={`http://localhost:5000/uploads/${product.image}`}
              alt={product.name}
              className="h-40 w-full object-cover mb-2 rounded"
            />
            <h2 className="font-semibold">{product.name}</h2>
            <p>Price: {product.price}</p>
            <p>Stock: {product.stock}</p>
            <Link to={`/admin/products/${product._id}`}>
              <Button size="sm">View</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
