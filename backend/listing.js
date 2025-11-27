import mongoose from "mongoose";

// Define the structure (schema) of listing documents
const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        picture: {
            type: String, // URL or path to the image
            required: false,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to User model
            required: true,
        },
        datePosted: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true } // automatically adds createdAt & updatedAt
);

// Create the model based on the schema
const Listing = mongoose.model("Listing", listingSchema);
export default Listing;

