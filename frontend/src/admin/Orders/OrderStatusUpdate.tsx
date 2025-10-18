import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";

const OrderStatusUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<string>("");
  const [initialStatus, setInitialStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);

  // Derived boolean
  const isStatusFinal = initialStatus === "cancelled" || initialStatus === "delivered";

  // Fetch order details
  const fetchOrder = async () => {
    setFetching(true);
    setError("");

    if (!token) {
      setError("Authentication token is missing.");
      setFetching(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch order");

      const data = await res.json();
      setStatus(data.status || "pending");
      setInitialStatus(data.status || "pending");
    } catch (err) {
      console.error(err);
      setError("Could not fetch order.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchOrder();
    }
  }, [id, token]);

  // Handle status update
  const handleUpdate = async () => {
    setError("");

    if (status === initialStatus) {
      setError("No changes made. Please select a different status.");
      return;
    }

    if (!token) {
      setError("User is not authenticated.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update status");
      }

      navigate(`/admin/orders/${id}`);
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.message || "Error updating the status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Update Order Status</h1>

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

          <label htmlFor="status" className="block mb-2 font-medium">
            Order Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-4"
            disabled={loading || fetching || isStatusFinal}
          >
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button
            onClick={handleUpdate}
            disabled={loading || fetching || status === initialStatus || isStatusFinal}
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </>
      )}
    </div>
  );
};

export default OrderStatusUpdate;
