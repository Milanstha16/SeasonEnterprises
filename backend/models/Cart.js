import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 1, min: [1, "Quantity cannot be less than 1"] },
  price: { type: Number, required: true, min: [0, "Price must be positive"] },
  totalPrice: { type: Number, required: true, default: 0, min: [0, "Total price must be positive"] },
  variant: { type: String, required: false },
});

const CartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [CartItemSchema],
    totalPrice: { type: Number, default: 0, required: true, min: [0, "Total cart price must be positive"] },
  },
  { timestamps: true }
);

// Pre-save hook: calculate totalPrice for items and cart
CartSchema.pre("save", function (next) {
  this.items.forEach(item => {
    item.totalPrice = item.quantity * item.price;
  });
  this.totalPrice = this.items.reduce((total, item) => total + item.totalPrice, 0);
  next();
});

const Cart = mongoose.model("Cart", CartSchema);

export default Cart;
