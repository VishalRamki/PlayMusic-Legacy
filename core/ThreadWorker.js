module.exports = function(childProcessObj) {
  this.cprocess = childProcessObj;

  this.spawn = function(script, cb) {
    this.cprocess.exec(script, function(err, stdout, stderr) {
      var std = {};
      std.err = err;
      std.out = stdout;
      std.sErr = stderr;
      cb(std);
    });
  };
};
