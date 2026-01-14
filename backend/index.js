// shortcut nex
const express = require("express");
const { default: mongoose } = require("mongoose");
// const bossRouter = require("./src/routes/boss");
const authRouter = require("./src/routes/auth");
const app = express();
const port = 3001;
require(`dotenv`).config();

const cors = require("cors");
const corsOptions = {
  origin: true, // Allow dynamic origin for LAN access
  credentials: true,
};
app.use(cors(corsOptions));

// cookie parser, untuk baca isi cookie
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// untuk baca isi body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.get("/", (req, res) => res.send("Hello World!"));

const seminarRouter = require("./src/routes/seminar");
const historyRouter = require("./src/routes/history");
const announcementsRouter = require("./src/routes/announcements");
const usersRouter = require("./src/routes/users");

// routes yang lain
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/seminar", seminarRouter);
app.use("/api/v1/history", historyRouter);
app.use("/api/v1/announcements", announcementsRouter);
app.use("/api/v1/users", usersRouter);

const initApp = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Koneksi ke MongoDB Berhasil");
    app.listen(port, () =>
      console.log(`Example app listening on port ${port}!`)
    );
  } catch (error) {
    console.log("error bro", error);
  }
};
initApp();
