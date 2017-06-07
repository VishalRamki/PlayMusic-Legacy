var ytdl = require("ytdl-core");
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
// database stuff
var Datastore = require('nedb');
var db = new Datastore({ filename: 'database/testdb.db', autoload: true });


// console.dir(argv);
// console.log(argv);

ytdl(argv.url, {filter: "audioonly"}).pipe(fs.createWriteStream("audio/"+argv.vid+".mp3").on("close", function() {
  console.log("Audio Data Saved Successfully.");
}));
