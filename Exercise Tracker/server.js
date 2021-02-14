const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
});

let User = mongoose.model("User", userSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const addUser = (username, done) => {
  new User({ username }).save((err, doc) => {
    if (err) return done(err);
    done(null, doc);
  });
};

app.post("/api/exercise/new-user", (req, res) => {
  addUser(req.body.username, (err, doc) => {
    if (err) {
      if (err.code) return res.send("Username already taken");
      res.send("somthing went wrong ");
    }
    res.json({ _id: doc._id, username: doc.username });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
