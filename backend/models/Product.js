import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  
  // Stock field with default value and validation
  stock: { 
    type: Number, 
    required: true, 
    default: 0,  // Default to 0 if not provided
    min: [0, 'Stock cannot be negative'], // Ensure stock is non-negative
  },
  
  image: String,
}, {
  timestamps: true, // This adds createdAt and updatedAt fields automatically
});

export default mongoose.model('Product', productSchema);
