import { useAuth } from "@/components/context/AuthContext";

const Account = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-semibold text-gray-700">Loading profile...</p>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-8">
          {/* Profile Picture (use default if not available) */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
            <img
              src={user.profilePicture || "/default-avatar.jpg"} // Default avatar path
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Your Profile</h1>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <strong className="text-gray-700">Name:</strong>
            <span className="text-gray-900">{user.name}</span>
          </div>
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
    </main>
  );
};

export default Account;
