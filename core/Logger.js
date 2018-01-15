module.exports = function(fs, mjs) {
  this.fs = fs;
  // cosntants;
  this.beginLog = "=============================================================\nLogger Has Begun @ "+mjs().format("dddd, MMMM Do YYYY, h:mm:ss a")+"\n=============================================================\n";
  // generate the log file;
  this.fs.appendFile("logs/"+mjs(new Date()).format("YYYY-MM-DD") + ".log", this.beginLog, (err) => {
    if (err) throw err;
    console.log("Logging Has Begun.");
  });

  this.log = function(msg) {
    var toLog = mjs().format("dddd, MMMM Do YYYY, h:mm:ss a") + ": ";
    this.fs.appendFile("logs/"+mjs(new Date()).format("YYYY-MM-DD") + ".log", toLog + msg + "\n", (err) => {
      if (err) throw err;
    });
  };

  this.bug = function(file, msg) {
    var toLog = mjs().format("dddd, MMMM Do YYYY, h:mm:ss a") + ": ";
    this.fs.appendFile(file, toLog + msg + "\n", (err) => {
      if (err) throw err;
    });
  };
};
