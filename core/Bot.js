module.exports = function (options) {
  this.cmdPrefix = options.cmdPrefix;
  this.log = options.log;
  this.client = options.client;
  this.fs = options.fs;
  this.db = options.db;
  this.thread = null;
  this.pl = null;
  this.admin_id = null;
  this.cmdPermissions = [];

  this.setAdmin = function(t) {
    this.admin_id = t;
  };

  this.setThread = function(t) {
    this.thread = t;
  };

  this.setPlayList = function(t) {
    this.pl = t;
  };
  this.GetChannelByName = function(name) {
      return this.client.channels.find(val => val.name === name);
  };
  this.GetChannelByID = function(id) {
      return this.client.channels.find(val => val.id === id);
  };

  this.getVoiceConnection = function() {
    return this.client.voice.connections.first();
  };

  this.getDispatcher = function(vc) {
    return vc.channel.connection.player.dispatcher;
  };

  this.isBotCommand = function(msg) {
    if (msg[0] === this.cmdPrefix) return true;
    return false;
  };

  this.getCommand = function(msg) {
    var i = 0;
    while (msg[i] != ' ' && i <= msg.length) i++;
    return {
      command: msg.substr(1, i).toLowerCase().trim(),
      args: msg.substr(i+1, msg.length).trim(),
      length: {
        cmd: i,
        full: msg.length
      }
    };
  };

  this.addCmdExec = function(cmd, fn, auths) {
    this[cmd] = fn;
    this.cmdPermissions[cmd] = auths ? auths : "public";
  };

  this.commandExec = function(cmd, djs) {
    // this[cmd.command](cmd, djs);
    // this.(cmd.command)(cmd,djs);
    var name = cmd.command;
    // this[name]();
    console.log(cmd);
    console.log(this[cmd.command]);
    if (typeof this[cmd.command] === "function") {
      this.log.log(cmd.command + " function found. Requested by ID: "+djs.author.id+" Executing.");
      // console.log(djs.author);
      if (this.cmdPermissions[cmd.command] === "public")
        this[cmd.command](cmd, djs);
      else {
        // the permissions are admin;
        if (djs.author.id === this.admin_id) {
          this[cmd.command](cmd, djs);
        } else {
          djs.reply("You require Adminstrative Permissions for that");
        }
      }
    } else {
      this.log.log(cmd.command + " function not found. Gracefully Returning to rest state.");
    }
  };

  // helpers;

  this.playFile = function(path, djs) {
    this.pl.queue(path, djs);
    if (!this.pl.isPlaying)
      this.pl.play(this.getVoiceConnection(), djs);
  }

  this.findByTitle = function(str) {
    if (str.indexOf(">") < 0 && !this.isYT(str)) return true;
    return false;
  }

  this.isYT = function(str) {
    // @TODO This is a bad way to check if its a youtube link.
    if (str.includes("http://") || str.includes("https://") || str.includes("www.") || str.includes("youtube.com")) return true;
    return false;
  }

  this.getSongDetails = function(args) {
    var n = args.split(">");
    return {
      artist: n[0].toLowerCase().trim(),
      title: n[1].toLowerCase().trim()
    };
  }

  this.buildQueryList = function(doc) {
    // var i = "";
    // doc.forEach(function (item) {
    //   i += "> " + item.artist + " - " + item.title + " \n";
    // });
    // return i;
    var fields = [];
    doc.forEach(function(item) {
      fields.push({
        name: item.artist,
        value: item.title
      });
    });
    return fields;
  }

};
