const express = require("express");
const path = require("path");
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
const roleRoutes = require("./routes/role.routes");
const userRoutes = require("./routes/user.routes");

app.use("/roles", roleRoutes);
app.use("/users", userRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

module.exports = app;
