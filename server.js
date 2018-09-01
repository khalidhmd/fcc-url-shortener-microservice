"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var dns = require("dns");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(
  "mongodb://khalidhmd:mongodb123@ds141872.mlab.com:41872/urlshortener"
);

const urlSchema = new mongoose.Schema({
  url: String,
  idx: Number
});

const urlModel = mongoose.model("url", urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/new", function(req, res) {
  const url = req.body.url.split(`//`)[1];
  console.log(url);
  dns.lookup(url, (err, address, family) => {
    if (address) {
      urlModel
        .create({
          url: req.body.url,
          idx: Math.floor(Math.random() * 1000)
        })
        .then(newEntry => {
          res.send({ original_url: req.body.url, short_url: newEntry.idx });
        });
    } else {
      res.send({ error: "invalid URL" });
    }
  });
});

app.get("/api/shorturl/:id", function(req, res) {
  urlModel.findOne({ idx: parseInt(req.params.id) }, (err, urlEntry) => {
    if (err) res.send({ error: "The Short url is not in the darabase" });
    res.redirect(urlEntry.url);   
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
