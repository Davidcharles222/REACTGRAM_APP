require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const port = process.env.PORT;

// config JSON and form data response
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// solve CORS
app.use(cors());

// upload directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// DB connection
require("./config/db.js");

// routers
const router = require("./routes/Router");
const exp = require("constants");
app.use(router);

app.listen(port, () => {
  console.log(`App rodando na porta ${port}`);
});
