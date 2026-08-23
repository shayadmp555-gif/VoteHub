const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voteRoutes");
const electionRoutes = require("./routes/electionRoutes");

const app = express();

// ================= MIDDLEWARE =================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());


// ================= API ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/election", electionRoutes);


// ================= FRONTEND =================

// Frontend build folder
const frontendPath = path.join(
  __dirname,
  "frontend",
  "dist"
);

// Serve React frontend
app.use(express.static(frontendPath));


// ================= API 404 =================

app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});


// ================= FRONTEND FALLBACK =================

// Any non-API route will open React app
app.use((req, res) => {
  res.sendFile(
    path.join(frontendPath, "index.html")
  );
});


// ================= DATABASE =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} 🚀`
      );
    });
  })
  .catch((error) => {
    console.log(
      "MongoDB connection failed ❌",
      error.message
    );
  });