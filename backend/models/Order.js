import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
          min: 0,  // Ensure price is non-negative
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,  // Ensure at least one item is purchased
        },
        stockAvailable: {
          type: Number,
          required: true, // Track stock availability
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,  // Ensure non-negative total amount
    },

    paymentMethod: {
      type: String,
      enum: ["paypal", "stripe", "credit_card", "bank_transfer"],  // Extensible payment methods
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "pending_confirmation"],
      default: "pending",
    },

    transactionId: {
      type: String,
      required: function () {
        return this.paymentStatus === "paid";  // Transaction ID required if payment is successful
      },
    },

    shipping: {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'], // Email validation
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
        match: [/^\d{5}$/, 'Please enter a valid postal code'], // Postal code validation (example for US)
      },
    },

    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },

    paymentDate: {
      type: Date,
    },
    shippingDate: {
      type: Date,
    },

  },
  { timestamps: true }
);

// Indexing for faster lookups
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ paymentDate: 1 });
OrderSchema.index({ userId: 1, paymentStatus: 1 });  // Compound index for payment status and user

export default mongoose.model("Order", OrderSchema);
