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
          min: 0,  // price can’t be negative
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,  // must order at least one
        },
        stockAvailable: {
          type: Number,
          required: true,
          min: 0,  // stock can't be negative either
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["paypal", "stripe", "credit_card", "bank_transfer"], 
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
        return this.paymentStatus === "paid";  // only required if payment is successful
      },
    },

    shipping: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      postalCode: {
        type: String,
        required: true,
        // Simple postal code regex for US ZIP or generic 5-digit codes (adjust for your locale)
        match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid postal code'],
        trim: true,
      },
    },

    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
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

// Indexes for performance
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ paymentDate: 1 });
OrderSchema.index({ userId: 1, paymentStatus: 1 });

export default mongoose.model("Order", OrderSchema);
