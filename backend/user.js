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

    
  },
  { timestamps: true }   // automatically adds createdAt & updatedAt
);

// Create the model based on the schema
const User = mongoose.model("User", userSchema);
export default User;
