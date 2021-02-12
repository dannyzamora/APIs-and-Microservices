const { urlValidate, removeHTTP } = require("./utils/url");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: Number,
});

let URL = mongoose.model("URL", urlSchema);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const testUrl = (url, done) => {
  if (urlValidate(url)) {
    dns.lookup(removeHTTP(url), (err, address) => {
      if (err) return done(err);
      done(null, address);
    });
  } else done(null);
};

const findUrl = (url, done) => {
  URL.findOne({ original_url: url }, (err, doc) => {
    if (doc) return done(null, doc); //url found
    done(null);
  });
};

const saveUrl = (url, done) => {
  URL.countDocuments((err, count) => {
    new URL({ original_url: url, short_url: count }).save((err, doc) => {
      if (err) return done(err);
      done(null, doc);
    });
  });
};

const destruct = ({ original_url, short_url }) => {
  return { original_url, short_url };
};

// Your first API endpoint
app.post("/api/shorturl/new", function (req, res, next) {
  let url = req.body.url;
  testUrl(url, (err, address) => {
    if (err) return res.json({ error: "DNS ERROR" });
    if (!address) return res.json({ error: "invalid URL" });

    findUrl(url, (err, doc) => {
      if (doc) return res.json(destruct(doc));
      saveUrl(url, (err, doc) => {
        if (err) {
          return res.json({ err });
        }
        res.json(destruct(doc));
      });
    });
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
