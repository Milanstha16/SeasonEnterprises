import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      setError("Could not load user.");
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <Button onClick={() => navigate(-1)}>Back</Button>
      <h1 className="text-2xl font-semibold mt-4 mb-4">{user.name}</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      {/* Other user detail fields */}
    </div>
  );
};

export default UserDetails;
