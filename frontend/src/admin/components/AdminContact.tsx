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

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/contact");
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      setMessages(data);
      setFilteredMessages(data);
    } catch (err) {
      console.error("Failed to load messages", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/contact/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete message");

      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      setFilteredMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete message");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-full max-w-md"
      />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filteredMessages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredMessages.map((msg) => (
            <li key={msg._id} className="border p-4 rounded-md flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <p><strong>Name:</strong> {msg.name}</p>
                <p><strong>Email:</strong> {msg.email}</p>
                <p><strong>Subject:</strong> {msg.subject}</p>
                <p><strong>Message:</strong> {msg.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(msg._id)}
                className="mt-3 md:mt-0 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
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
