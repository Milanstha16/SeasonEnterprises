import { useAuth } from "@/context/AuthContext";

const Account = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading profile...</p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="space-y-4">
        <div>
          <strong>Name:</strong> {user.name}
        </div>
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>User ID:</strong> {user.id}
        </div>
      </div>
    </main>
  );
};

export default Account;
