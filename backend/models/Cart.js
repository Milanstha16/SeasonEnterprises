import mongoose from "mongoose";

// Define Cart Schema
const CartSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
    },
    items: [
      {
        productId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product", 
          required: true 
        },
        quantity: { 
          type: Number, 
          required: true, 
          default: 1 
        },
        // Optional: You can store price and other details here
        price: { 
          type: Number, 
          required: true 
        },
        totalPrice: { 
          type: Number, 
          required: true, 
          default: function () {
            return this.quantity * this.price; // Calculate total price per item
          }
        },
        // If you have additional product options like size or color
        variant: {
          type: String,  // Example: 'size' or 'color'
          required: false
        },
      }
    ],
    totalPrice: { 
      type: Number, 
      default: 0, 
      required: true 
    }
  },
  { timestamps: true }
);

// Middleware to update cart's totalPrice whenever an item is added/updated
CartSchema.pre('save', function (next) {
  this.totalPrice = this.items.reduce((total, item) => total + item.totalPrice, 0);
  next();
});

// Create a model from the schema
export default mongoose.model("Cart", CartSchema);
