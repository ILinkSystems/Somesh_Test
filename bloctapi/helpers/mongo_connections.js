var express = require('express');
var mongodb = require("mongodb");

mongodb.MongoClient.connect("mongodb://localhost:27017/bloct", function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  exports.db = database;
  console.log("Database connection ready");
});