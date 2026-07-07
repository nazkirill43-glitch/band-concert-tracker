require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./db");

const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const bandRoutes = require("./routes/bands");
const concertRoutes = require("./routes/concerts");
const entryRoutes = require("./routes/entries");

const app = express();

connection();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bands", bandRoutes);
app.use("/api/concerts", concertRoutes);
app.use("/api/entries", entryRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}`));
