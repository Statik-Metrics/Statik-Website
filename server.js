console.log("Starting Statik Website...");
require("./app.js").listen(process.env.PORT || 3000, function() {
    console.log("Statik Website listening on port " + port + "!");
});

