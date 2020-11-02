const express = require("express");

// Initializations
const db = require("./config/database");
const UserRoutes = require("./routes/api/user");

const app = express();

// Test db
db.authenticate()
  .then(() => console.log("Connection has been established successfully"))
  .catch((err) => console.error("Unable to connect to the database", err));

// Middleware
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("API Running"));

// Define routes
app.use("/api/user", UserRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
