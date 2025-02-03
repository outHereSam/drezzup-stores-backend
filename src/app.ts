import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import brandRoutes from "./routes/brandRoutes";
import productModelRoutes from "./routes/productModelRoutes";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "./middlewares/authMiddleware";

const app = express();

app.use(bodyParser.json());
app.use(cors());

const posts = [
  {
    id: 1,
    title: "Post 1",
    content: "This is the first post",
    userId: 1,
  },
  {
    id: 2,
    title: "Post 2",
    content: "This is the second post",
    userId: 2,
  },
];

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/productModels", productModelRoutes);

app.get("/", (req, res) => {
  res.send("Drezzup backend is running");
});

app.get("/api/posts", authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json(posts.filter((post) => post.userId === req.user?.id));
});

export default app;
