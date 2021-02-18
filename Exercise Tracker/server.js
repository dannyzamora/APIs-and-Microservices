const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
var moment = require("moment");
require("dotenv").config();

const mongoose = require("mongoose");
const { json } = require("body-parser");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  log: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }],
  count: Number,
});
const exerciseSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
});

let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const addExercise = ({ userId, description, duration, date }, done) => {
  User.findById(userId, async (err, doc) => {
    if (err) return done({ Error: "Invalid ID" });
    if (!doc) return done({ Error: "User not found" });
    date = date ? new Date(date) : new Date();
    duration = parseInt(duration);
    const excercise = await new Exercise({
      user: userId,
      description,
      duration,
      date,
    }).save();

    doc.log.push(excercise._id);
    doc.save((err, doc) => {
      if (err) return done(err);
      const newDoc = {
        _id: doc._id,
        username: doc.username,
        description,
        duration,
        date: moment(date).format("ddd MMM DD YYYY"),
      };

      done(null, newDoc);
    });
  });
};

const addUser = (username, done) => {
  new User({ username }).save((err, doc) => {
    if (err) return done(err);
    done(null, doc);
  });
};

const getAllUsers = (done) => {
  User.find({}, (err, doc) => {
    if (err) return done(err);
    done(null, doc);
  });
};

const getLog = ({ userId, limit, from, to }, done) => {
  User.findById(userId, (err, doc) => {
    if (err) return done(err);
    if (!doc) {
      return done({ error: "No User found" });
    }
    let match = {};
    if (from || to) match.date = {};
    if (from) match.date.$gte = from;
    if (to) match.date.$lte = to;

    console.log(match);

    doc.populate(
      {
        path: "log",
        select: "description duration date",
        limit: limit,
        match,
      },

      (err, res) => {
        if (err) return done(err);
        done(null, res);
      }
    );
  });
};
//doc.populate({path:""log", "description duration date""}, (err, res) => {

app.post("/api/exercise/new-user", (req, res) => {
  addUser(req.body.username, (err, doc) => {
    if (err) {
      if (err.code) return res.send("Username already taken");
      res.send("somthing went wrong ");
    }
    res.json({ _id: doc._id, username: doc.username });
  });
});

app.get("/api/exercise/users", (req, res) => {
  getAllUsers((err, doc) => {
    if (err) return res.json({ error: err });
    const users = doc.map((doc) => ({ _id: doc._id, username: doc.username }));
    res.json(users);
  });
});

app.post("/api/exercise/add", (req, res) => {
  addExercise(req.body, (err, doc) => {
    if (err) return res.json(err);
    res.json(doc);
  });
});

app.get("/api/exercise/log", (req, res) => {
  getLog(req.query, (err, doc) => {
    if (err) {
      return res.json(err);
    }
    doc.log.forEach((log) => {
      log._doc = {
        ...log._doc,
        date: moment(log._doc.date).format("ddd MMM DD YYYY"),
      };
      delete log._doc._id;
    });
    doc.count = doc.log.length;
    res.json(doc);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
