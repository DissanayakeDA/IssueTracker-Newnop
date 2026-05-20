import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import issueRoutes from "./routes/issueRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";

dotenv.config();

const requiredEnvVars = ["JWT_SECRET"] as const;
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`FATAL: Environment variable ${key} is not set. Exiting.`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(",") : "*",
    credentials: true,
  })
);
app.use(express.json());

// Health check route
app.get("/", (_req, res) => {
  res.json({ message: "Issue Tracker API is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
