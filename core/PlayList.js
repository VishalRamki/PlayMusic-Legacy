module.exports = function(options) {
  this.list = [];
  this.first = null;
  this.isPlaying = false;
  this.isPaused = false;
  this.isRepeat = false;
  this.repeatDoc = null;
  this.bot = options.bot; // copy of bot;
  this.log = options.logger;
  this.adb = options.adb;
  this.events = {
    EVT_STOP: -1
  };

  this.queue = function(doc, djs) {
    this.list.push(doc);
    // console.log(this.list);
    this.log.log(doc.title + " has been queued.");
    djs.channel.send(doc.title + " has been queued.");
    this.adb.incrementRequest(doc);
  };

  this.showQueue = function() {
    var i = j = "", val = 0;
    j += this.whatIsPlaying() + "\n";
    this.list.forEach(function(it) {
      val++;
      i += val + ". " + it.artist + " - " + it.title + "\n";
    });
    var returnStr = "" + j;

    if (val > 0) return returnStr + "```" + i + "```";
    if (j.indexOf("CURRENTLY") >= 0 && val <= 0) return returnStr + "``` Playlist Currently Empty ```";
    return "***"+returnStr +"***\n``` Playlist Currently Empty ```";
  };

  this.whatIsPlaying = function() {
    if (this.first != null) {
      return "__**CURRENTLY PLAYING**__ :: " + this.first.artist + " - " + this.first.title + "\n";
    } else {
      return "Nothing is currently playing.";
    }
  };

  this.next = function(djs) {
    if (this.list.length > 0) {
      var dispatcher = this.bot.getDispatcher(this.bot.getVoiceConnection());
      dispatcher.end();
    } else {
      djs.reply("Nothing to skip to.");
    }
  };

  this.stop = function(djs) {
    if (this.isPlaying) {
      var dispatcher = this.bot.getDispatcher(djs);
      dispatcher.end(this.events.EVT_STOP);
      // this.isPlaying = false;
      // this.isRepeat = false;
      // if (this.isRepeat) {
      //   this.first = null;
      // }
    }
  }

  this.volume = function(vol, djs) {
    if (this.isPlaying) {
      // console.log("Current VOlume: " + djs.channel.connection.getVolume());
      var dispatcher = this.bot.getDispatcher(djs);
      dispatcher.setVolume(vol);
    }
  };

  /*

    Accepts an integer position, and removes the item that was there in the
    playlist.

  */
  this.dequeue = function(pos, djs){
    if (pos > this.list.length) {
      djs.reply("The Index to remove is out of bounds.");
      return;
    }
    // console.log(this.list);
    this.list.splice(pos, 1);
    // console.log(this.list);

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
      channelre.channel.send("Song '"+this.first.title+"' is now playing.");
      djs.channel.connection.playFile(this.first.path);
      this.adb.incrementPlay(this.first);
      var outter = this;
      // console.log(this.adb);
      this.adb.db.findOne({audio_id: this.first.video_id}, (err, doc) => {
        if (err) return;
        channelre.channel.send({embed: {
            color: 3447003,
            author: {
              name: djs.client.user.username,
              icon_url: djs.client.user.avatarURL
            },
            description: "Play Statistics for " + outter.first.title +" By " + outter.first.artist,
            fields: [{
              name: "# of Plays",
              value: doc.plays
            },{
              name: "# of Requests",
              value: doc.requests
            }]
          }
        });
      });
      var dispatcher = this.bot.getDispatcher(djs);
      // channelre.channel.send("Song ["+this.first.title+"] is now playing.");
      var tt = this;
      dispatcher.on("end", (reason) => {
        console.log("Song ["+tt.first.title+"] has now finished.");
        console.log(reason);
        if (reason === tt.events.EVT_STOP) {
          tt.isPlaying = false;
          tt.first = null;
          dispatcher = null;
          return;
        }
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
