import React, { useEffect, useState } from "react";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const AdminContact = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  /* -------------------------------------------------------------------------- */
  /*                               Fetch Messages                                */
  /* -------------------------------------------------------------------------- */
  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`);
      if (!res.ok) throw new Error(`Failed to fetch messages (status: ${res.status})`);
      const data: Message[] = await res.json();
      setMessages(data);
      setFilteredMessages(data);
    } catch (err: any) {
      console.error("Failed to load messages", err);
      setError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                               Search Filter                                 */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const q = searchQuery.toLowerCase();
    setFilteredMessages(
      messages.filter(
        (msg) =>
          msg.name.toLowerCase().includes(q) ||
          msg.email.toLowerCase().includes(q) ||
          msg.subject.toLowerCase().includes(q) ||
          msg.message.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, messages]);

  /* -------------------------------------------------------------------------- */
  /*                               Delete Message                                */
  /* -------------------------------------------------------------------------- */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete message");

      // Update state
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      setFilteredMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete message. Please try again.");
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Component                              */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      <input
        type="text"
        placeholder="Search by name, email, subject, or message..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border rounded px-3 py-2 mb-6 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      />

      {loading ? (
        <p>Loading messages...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filteredMessages.length === 0 ? (
        <p className="text-gray-600">No messages found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredMessages.map((msg) => (
            <li
              key={msg._id}
              className="border p-4 rounded-md flex flex-col md:flex-row md:justify-between md:items-start hover:shadow-md transition"
            >
              <div className="flex-1">
                <p>
                  <strong>Name:</strong> {msg.name}
                </p>
                <p>
                  <strong>Email:</strong> {msg.email}
                </p>
                <p>
                  <strong>Subject:</strong> {msg.subject}
                </p>
                <p>
                  <strong>Message:</strong> {msg.message}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(msg._id)}
                className="mt-4 md:mt-0 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminContact;
