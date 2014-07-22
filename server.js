console.log("Starting Statik Website...");
var port = process.env.PORT || 3000;
require("./app.js").listen(port, function() {
    console.log("Statik Website listening on port " + port + "!");
});

