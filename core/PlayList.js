module.exports = function(options) {
  this.list = [];
  this.first = null;
  this.isPlaying = false;
  this.isPaused = false;
  this.isRepeat = false;
  this.repeatDoc = null;
  this.bot = options.bot; // copy of bot;
  this.log = options.logger;

  this.queue = function(doc, djs) {
    this.list.push(doc);
    console.log(this.list);
    this.log.log(doc.title + " has been queued.");
    djs.channel.send(doc.title + " has been queued.");

  };

  this.showQueue = function() {
    var i = "", val = 0;
    i += this.whatIsPlaying();
    this.list.forEach(function(it) {
      val++;
      i += val + ". " + it.artist + " - " + it.title + "\n";
    });
    console.log("CUR"+i);
    if (typeof i != 'undefined' && i) {
      return "```" + i + "```";
    }
    return "``` Playlist Currently Empty ```";
  };

  this.whatIsPlaying = function() {
    if (this.first != null) {
      return "**CURRENTLY PLAYING** :: " + this.first.artist + " - " + this.first.title + "\n";
    } else {
      return "Nothing is currently playing.";
    }
  };

  this.next = function(djs) {
    if (this.list.length > 0) {
      var dispatcher = this.bot.getDispatcher(this.bot.getVoiceConnection());
      dispatcher.end();
      this.play(this.bot.getVoiceConnection(), djs);
    } else {
      djs.reply("Nothing to skip to.");
    }
  };

  this.stop = function(djs) {
    if (this.isPlaying) {
      var dispatcher = this.bot.getDispatcher(djs);
      dispatcher.end();
      this.isPlaying = false;
      this.isRepeat = false;
      if (this.isRepeat) {
        this.first = null;
      }
    }
  }

  this.volume = function(vol, djs) {
    if (this.isPlaying) {
      // console.log("Current VOlume: " + djs.channel.connection.getVolume());
      var dispatcher = this.bot.getDispatcher(djs);
      dispatcher.setVolume(vol);
    }
  };

  this.dequeue = function(pos, djs){
    if (pos > this.list.length) {
      djs.reply("The Index to remove is out of bounds.");
      return;
    }
    this.list.splice(pos, 1);
    djs.reply("Item was dequeued.");
  };

  this.pause = function(djs) {
    if (this.isPaused != true) {
      var dispatcher = this.bot.getDispatcher(djs);
      dispatcher.pause();
      this.isPaused = true;
    }
  };

  this.play = function(djs, channelre)  {
    if (this.isPaused) {
      this.isPaused = false;
      var dispatcher = this.bot.getDispatcher(djs);
      dispatcher.resume();
    }
    if (this.list.length > 0 && this.isPaused != true) {
      this.isPlaying = true;
      // if (!this.isRepeat && this.first == null)
      //   this.first = this.list.shift();
      // if (this.isRepeat && this.first == null) {
      //   this.first = this.list.shift();
      // }
      this.first = this.list.shift();

      console.log("Song ["+this.first.title+"] is now playing.");
      this.log.log("Song ["+this.first.title+"] is now playing.");
      djs.channel.connection.playFile(this.first.path);
      var dispatcher = this.bot.getDispatcher(djs);
      // channelre.channel.send("Song ["+this.first.title+"] is now playing.");
      var tt = this;
      dispatcher.on("end", () => {
        console.log("Song ["+tt.first.title+"] has now finished.");
        if (tt.isRepeat == false) {
          tt.first = null;
        } else {
          tt.list.push(tt.first);
        }
        tt.isPlaying = false;
        dispatcher = null;
        tt.play(djs, channelre);
      });
    }
  };
};
