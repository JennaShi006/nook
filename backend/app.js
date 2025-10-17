import express from "express";
import cors from "cors";
import routes from "./routes.js";
//import auth from "./auth.js"

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // allow frontend origin
  methods: ["GET", "POST", "PUT"],
  credentials: true
}));
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Mount API routes
app.use('/api', routes);

// email verification 
//app.use("/api/auth", auth);

export default app;
