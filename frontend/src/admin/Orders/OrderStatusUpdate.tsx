import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";

const OrderStatusUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [initialStatus, setInitialStatus] = useState<string>("");

  const fetchOrder = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setStatus(data.paymentStatus); // Assuming the backend returns 'paymentStatus'
      setInitialStatus(data.paymentStatus); // Save initial status for comparison
    } catch (err) {
      console.error(err);
      setError("Could not fetch order.");
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

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
        const d = await res.json();
        throw new Error(d.error || "Failed to update status");
      }

      // Redirect to the updated order details page
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
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-4"
        disabled={loading}
      >
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <Button onClick={handleUpdate} disabled={loading || status === initialStatus}>
        {loading ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
};

export default OrderStatusUpdate;
