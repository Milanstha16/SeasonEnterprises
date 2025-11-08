import { useAuth } from "@/components/context/AuthContext";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

type OrderItem = {
  _id: string;
  items: {
    productId: {
      _id: string;
      name: string;
      price: number;
      image: string;
    } | null;
    quantity: number;
    priceAtPurchase: number;
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
};

const Account = () => {
  const { user, token, updateUser } = useAuth();
  const [orders, setOrders] = useState<OrderItem[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  // -------------------- Fetch Orders --------------------
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data: OrderItem[] = await res.json();
        setOrders(data);
      } catch (err: any) {
        console.error("Order fetch error:", err);
        setError(err.message || "Something went wrong while fetching orders");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [token, API_BASE_URL]);

  // -------------------- Upload Profile Picture --------------------
  const uploadProfilePicture = async (file: File) => {
    if (!token) return alert("You must be logged in to upload a profile picture.");

    setUploading(true);
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile-picture`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload profile picture");

      const data = await res.json();
      if (data.user) {
        updateUser({
          profilePicture: data.profilePicture,
          ...data.user,
        });
      } else if (data.profilePicture) {
        updateUser({ profilePicture: data.profilePicture });
      }
    } catch (err: any) {
      console.error("Profile upload error:", err.message);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // -------------------- Loading State --------------------
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Spinner />
        <p className="ml-3 text-xl font-semibold text-gray-700">Loading profile...</p>
      </div>
    );
  }

  // -------------------- Main Profile & Orders --------------------
  return (
    <main className="max-w-4xl mx-auto py-12 px-6 space-y-10 bg-gray-50">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 relative group">
            <img
              src={user.profilePicture ?? "/default-avatar.jpg"}
              alt="Profile"
              className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-80"
              onError={(e) => (e.currentTarget.src = "/default-avatar.jpg")}
            />
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadProfilePicture(file);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="absolute bottom-0 w-full text-center bg-black bg-opacity-50 text-white text-sm py-1 hidden group-hover:block">
              {uploading ? "Uploading..." : "Change"}
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">{user.name}</h1>

        <div className="space-y-4 text-center sm:text-left">
          <div className="flex justify-between items-center">
            <strong className="text-gray-700">Email:</strong>
            <span className="text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <strong className="text-gray-700">User ID:</strong>
            <span className="text-gray-900">{user.id}</span>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Your Orders</h2>

        {loadingOrders && <Spinner />}
        {error && <p className="text-red-500">{error}</p>}
        {!loadingOrders && !error && orders?.length === 0 && (
          <p className="text-gray-600">You haven't placed any orders yet.</p>
        )}

        <div className="space-y-8">
          {orders?.map((order) => (
            <div
              key={order._id}
              className="bg-white border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between mb-4">
                <p>
                  <strong className="text-gray-600">Order ID:</strong> {order._id}
                </p>
                <p>
                  <strong className="text-gray-600">Status:</strong>
                  <span
                    className={`ml-2 font-semibold ${
                      order.status === "delivered"
                        ? "text-green-600"
                        : order.status === "pending"
                        ? "text-yellow-600"
                        : order.status === "shipped"
                        ? "text-blue-600"
                        : order.status === "cancelled"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                {order.items.map(({ productId, quantity, priceAtPurchase }, idx) =>
                  productId ? (
                    <div key={productId._id} className="flex items-center space-x-4">
                      <img
                        src={
                          productId.image.startsWith("http")
                            ? productId.image
                            : `${API_BASE_URL}/uploads/${productId.image}`
                        }
                        alt={productId.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => (e.currentTarget.src = "/default-product.jpg")}
                      />
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-800">{productId.name}</p>
                        <p className="text-gray-600">
                          Qty: {quantity} × ${priceAtPurchase.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div key={`unavailable-${idx}`} className="text-red-500">
                      Product no longer available
                    </div>
                  )
                )}
              </div>

              <p className="mt-4 text-right font-bold text-gray-900">
                Total Paid: ${order.totalAmount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Account;
