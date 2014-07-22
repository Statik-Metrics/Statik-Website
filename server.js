var express = require("express");
var app = require("./app.js");

var port = process.env.PORT || 8080;
var log = process.env.LOG || false;

if (log) {
    var logFile = fs.createWriteStream(log, {flags: 'w'});
    app.use(express.logger({stream: logFile}));
    console.log("Using " + log + " for logging");
} else {
    console.log("Using stdout for logging");
}

app.listen(port);
console.log("Statik Website started on port " + port);

