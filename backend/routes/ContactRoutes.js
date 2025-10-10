import express from "express";
import ContactMessage from "../models/ContactMessage.js";

const router = express.Router();

// POST /api/contact - Save message from contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newMessage = new ContactMessage({ name, email, subject, message });
    await newMessage.save();
    res.status(201).json({ message: "Message received" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// GET /api/contact - Admin view all messages
router.get("/", async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

// DELETE /api/contact/:id - Delete a contact message by ID
router.delete("/:id", async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    await message.deleteOne();
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;
