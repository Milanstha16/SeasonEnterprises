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
          default: 1,
          min: [1, 'Quantity cannot be less than 1']
        },
        price: { 
          type: Number, 
          required: true,
          min: [0, 'Price must be positive']
        },
        totalPrice: { 
          type: Number, 
          required: true, 
          default: function () {
            const qty = this.quantity || 1;
            const prc = this.price || 0;
            return qty * prc;
          },
          min: [0, 'Total price must be positive']
        },
        variant: {
          type: String,
          required: false
        },
      }
    ],
    totalPrice: { 
      type: Number, 
      default: 0, 
      required: true,
      min: [0, 'Total cart price must be positive']
    }
  },
  { timestamps: true }
);

// Middleware to update cart's totalPrice whenever an item is added/updated
CartSchema.pre('save', function (next) {
  this.totalPrice = this.items.reduce((total, item) => total + item.totalPrice, 0);
  next();
});

const Cart = mongoose.model("Cart", CartSchema);

export default Cart;
