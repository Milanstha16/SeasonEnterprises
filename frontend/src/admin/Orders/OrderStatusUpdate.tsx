import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";

const ORDER_STATUSES = ["pending", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

const OrderStatusUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<OrderStatus>("pending");
  const [initialStatus, setInitialStatus] = useState<OrderStatus>("pending");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const isStatusFinal = initialStatus === "cancelled" || initialStatus === "delivered";

  // Fetch order details
  const fetchOrder = async () => {
    if (!token || !id) return;

    setFetching(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch order");
      }

      const data = await res.json();
      setStatus(data.status || "pending");
      setInitialStatus(data.status || "pending");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not fetch order details.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id, token]);

  // Update order status
  const handleUpdate = async () => {
    setError("");

    if (status === initialStatus) {
      setError("No changes made. Please select a different status.");
      return;
    }

    if (!token || !id) {
      setError("You are not authenticated.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update order status");
      }

      navigate(`/admin/orders/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* ✅ Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-medium transition"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-semibold mb-4 text-black">Update Order Status</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {fetching ? (
        <p className="text-gray-500">Loading order...</p>
      ) : (
        <>
          {isStatusFinal && (
            <p className="text-yellow-600 mb-4">
              This order is <strong>{initialStatus}</strong> and cannot be updated.
            </p>
          )}

          <label htmlFor="status" className="block mb-2 font-medium text-black">
            Order Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="border px-3 py-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            disabled={loading || fetching || isStatusFinal}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <Button
            onClick={handleUpdate}
            disabled={loading || fetching || status === initialStatus || isStatusFinal}
            className="bg-indigo-700 hover:bg-indigo-800 text-white w-full"
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </>
      )}
    </div>
  );
};

export default OrderStatusUpdate;
