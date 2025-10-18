import mongoose from 'mongoose';

// Define the product schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ["Decor", "Clothing", "Jewelry", "Books", "Toys"],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    image: {
      type: String,
      required: true,
      // ✅ Removed strict URL validation — allows local filenames
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 1, category: 1, price: 1 });

export default mongoose.model('Product', productSchema);
