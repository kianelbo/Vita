import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

import journalRoutes from "./routes/journals";
import userRoutes from "./routes/users";

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use("/api/journals", journalRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
