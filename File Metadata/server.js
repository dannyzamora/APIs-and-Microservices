var express = require("express");
var cors = require("cors");
require("dotenv").config();
var multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

var app = express();

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", upload.single("upfile"), (req, res, next) => {
  try {
    return res.status(201).json({
      name: req.file.filename,
      type: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    console.log(err);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
