import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  stock: Number,
  image: String,
}, {
  timestamps: true,
});

export default mongoose.model('Product', productSchema);
