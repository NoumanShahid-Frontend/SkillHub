import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDB from "./config/dbconfig.js";
import authRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import courseRoutes from "./routes/courses.js";
import assessmentRoutes from "./routes/assessments.js";
import { seedCourses } from "./seeders/courseSeeder.js";
dotenv.config();

const app = express();
ConnectDB();


app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assessments", assessmentRoutes);

// Seed courses on startup
seedCourses();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
