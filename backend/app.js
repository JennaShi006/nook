import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Mount API routes
app.use('/api', routes);

export default app;
