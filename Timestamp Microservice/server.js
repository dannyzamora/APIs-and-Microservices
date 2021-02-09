// server.js
// where your node app starts

// init project
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// timestamp API endpoint...
app.get("/api/timestamp/:date?", function (req, res) {
  let timestamp = {};
  const regex = new RegExp("^[0-9]*$");
  const date = req.params.date;
  if (date) {
    if (!isNaN(Date.parse(date))) {
      const d = new Date(date);
      const unix = d.getTime();
      const utc = d.toUTCString();
      timestamp = { unix, utc };
    } else if (regex.test(date)) {
      const d = new Date(parseInt(date));
      const unix = d.getTime();
      const utc = d.toUTCString();
      timestamp = { unix, utc };
    } else {
      timestamp.error = "Invalid Date";
    }
  } else {
    const d = new Date();
    timestamp.unix = d.getTime();
    timestamp.utc = d.toUTCString();
  }

  res.json(timestamp);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
