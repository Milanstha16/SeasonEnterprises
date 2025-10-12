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
  const [fetching, setFetching] = useState<boolean>(false); // New state for fetch loading

  const fetchOrder = async () => {
    setFetching(true); // Set fetching to true while loading
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
      setFetching(false); // Set fetching to false when done
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id, token]); // Add token as a dependency to avoid fetches with an outdated token

  const handleUpdate = async () => {
    if (status === initialStatus) {
      setError("No changes made. Please select a new status.");
      return;
    }

    setLoading(true);
    setError("");

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

      // Redirect back to order details after successful status update
      navigate(`/admin/orders/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error updating the status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Update Order Status</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {fetching ? ( // Show loading state while fetching the order details
        <p className="text-gray-500">Loading order...</p>
      ) : (
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-3 py-2 rounded w-full mb-4"
          disabled={loading || status === initialStatus} // Disable select if status hasn't changed
        >
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )}

      <Button
        onClick={handleUpdate}
        disabled={loading || status === initialStatus || fetching} // Disable button if order is still loading or no changes made
      >
        {loading ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
};

export default OrderStatusUpdate;
