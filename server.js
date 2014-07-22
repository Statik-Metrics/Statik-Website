var express = require("express");
var app = require("./app.js");

var port = process.env.PORT || 8080;

app.listen(port);
console.log("Statik Website started on port " + port);

