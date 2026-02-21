require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/database");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const favoriteRoutes = require("./routes/favorites");

const app = express();
const PORT = process.env.PORT || 5000;



const allowedOrigins = [
  "https://micro-marketplace-app-xi.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

/* =========================
   BODY PARSER
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FILES (Uploads)
========================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   ROUTES
========================= */

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/favorites", favoriteRoutes);

/* =========================
   HEALTH CHECK ROUTE
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Micro Marketplace API is running",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /auth/register",
        login: "POST /auth/login"
      },
      products: {
        list: "GET /products",
        single: "GET /products/:id",
        create: "POST /products",
        update: "PUT /products/:id",
        delete: "DELETE /products/:id"
      },
      favorites: {
        list: "GET /favorites",
        add: "POST /favorites/:productId",
        remove: "DELETE /favorites/:productId"
      }
    }
  });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});



app.listen(PORT, async () => {
  console.log(`🚀 Micro Marketplace API running on port ${PORT}`);


  try {
    const count = db.prepare('SELECT COUNT(*) as total FROM products').get();
    if (count.total === 0) {
      console.log('📦 Empty database detected — auto-seeding...');
      const seed = require('./seed');
      await seed();
    }
  } catch (e) {

  }
});

module.exports = app;
