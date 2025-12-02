import mongoose from "mongoose";

// Define the structure (schema) of user documents
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,    // must be provided
      trim: true,        // removes extra spaces
    },
    email: {
      type: String,
      required: true,
      unique: true,      // no two users can share the same email
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@ufl\.edu$/, "Must use your ufl.edu email"],

    },
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,      // basic password length validation
    }, 
    
    gradYear: {
      type: Number,
      required: true,
    },
    gradMonth: {
      type: String,
      required: true,
      enum: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    sellerAvgRating: {
      type: Number,
      default: 0,
    },
    sellerNumReviews: {
      type: Number,
      default: 0,
    },

     verified: { type: Boolean, default: false },
     verificationToken: String,
    
  },
  { timestamps: true }   // automatically adds createdAt & updatedAt
);

// Create the model based on the schema
const User = mongoose.model("User", userSchema);
export default User;
