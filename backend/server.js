const dns = require("dns");

// MongoDB DNS issue ke liye
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

// ================= ROUTES =================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voteRoutes");
const electionRoutes = require("./routes/electionRoutes");

// ================= APP =================

const app = express();

// ================= MIDDLEWARE =================

// ================= MIDDLEWARE =================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= TEST API =================

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VoteHub API is working 🚀",
  });
});

// ================= AUTH =================

app.use(
  "/api/auth",
  authRoutes
);

// ================= USERS =================

app.use(
  "/api/users",
  userRoutes
);

// ================= CANDIDATES =================

app.use(
  "/api/candidates",
  candidateRoutes
);

// ================= VOTES =================

app.use(
  "/api/votes",
  voteRoutes
);

// ================= ELECTION =================

app.use(
  "/api/election",
  electionRoutes
);

// ================= API 404 =================

app.use("/api", (req, res) => {
  console.log(
    "API NOT FOUND:",
    req.method,
    req.originalUrl
  );

  res.status(404).json({
    success: false,
    message: "API route not found",
    method: req.method,
    route: req.originalUrl,
  });
});

// ================= FRONTEND =================

const frontendPath = path.join(
  __dirname,
  "frontend",
  "dist"
);

app.use(
  express.static(frontendPath)
);

// React SPA fallback
app.use((req, res) => {
  res.sendFile(
    path.join(
      frontendPath,
      "index.html"
    )
  );
});

// ================= MONGODB =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log(
      "MongoDB connected ✅"
    );

    const PORT =
      process.env.PORT || 5000;

   app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Server running on port ${PORT} 🚀`
    );
  }
);
  })
  .catch((error) => {

    console.log(
      "MongoDB connection failed ❌"
    );

    console.log(
      error.message
    );
  });