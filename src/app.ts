import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import brandRoutes from "./routes/brandRoutes";
import productModelRoutes from "./routes/productModelRoutes";
import productsRoutes from "./routes/productsRoutes";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "./middlewares/authMiddleware";

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/productModels", productModelRoutes);
app.use("/api/products", productsRoutes);

app.get("/", (req, res) => {
  res.send("Drezzup backend is running");
});

export default app;
