import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import sequelize from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Load Routes Dynamically
const loadRoutes = async () => {
  // Dynamically import the route modules
  const employeeRoutes = (await import("./routes/employeeRoutes.js")).default;
  const attendanceRoutes = (await import("./routes/attendanceRoutes.js"))
    .default;
  const leaveRoutes = (await import("./routes/leaveRoutes.js")).default;
  const reviewRoutes = (await import("./routes/reviewRoutes.js")).default;
  const registerRoutes = (await import("./routes/authRoutes.js")).default;
  const loginRoutes = (await import("./routes/authRoutes.js")).default;
  const updateRoutes = (await import("./routes/authRoutes.js")).default;

  // Assigning the route modules to the app
  app.use("/api/employees", employeeRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/leaves", leaveRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/user", registerRoutes);
  app.use("/user", loginRoutes);
  app.use("/user", updateRoutes);
};

// Call loadRoutes to set up all routes
loadRoutes();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

sequelize
  .sync({ force: true })
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing the database:", error);
  });
