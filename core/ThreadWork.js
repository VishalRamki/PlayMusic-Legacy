module.exports = function(options) {
  this.process = options.process;
  this.db = options.db;
  this.ytdl = options.ytdl;
  this.bot = options.bot;
  this.log = options.log;
  this.maxSongLength = options.maxSongLength;

  this.getYTId = function(url) {
    url = url.replace("http://www.youtube.com/watch?v=", "");
    url = url.replace("https://www.youtube.com/watch?v=", "");
    if (url.indexOf("&") > 0) {
      var pos = url.indexOf("&");
      url = url.substr(0, pos-1);
    }
    return url;
  }

  this.removeOffical = function(str) {
    str = str.replace("[Offical Lyric Video]", "");
    str = str.replace("[OFFICAL VIDEO]", "");
    str = str.replace("[Offical Video]", "");
    str = str.replace("(Offical Video)", "");
    str = str.replace("(Offical Music Video)", "");
    str = str.replace("(Offical)", "");
    str = str.replace("(offical)", "");
    str = str.replace("(Lyric)", "");
    str = str.replace("(lyric)", "");
    str = str.replace("(Lyric Video)", "");
    str = str.replace("(Audio)", "");
    str = str.replace("(audio)", "");
    str = str.replace("(Explicit)", "");
    str = str.replace("(explicit)", "");
    str = str.replace("(free download)", "");
    str = str.replace("(Free download)", "");
    str = str.replace("(Free Download)", "");
    str = str.replace("[MV]", "");
    str = str.replace("[mv]", "");
    return str;
  }

  this.shatterX = function(str) {
    if (str.indexOf("-") <= 0 && str.indexOf("_") <= 0 && str.indexOf("|") > 0) {
      var args = str.split("|");
      return {
        artist: this.removeOffical(args[0].trim()),
        title: this.removeOffical(args[1].trim())
      }
    }
    if (str.indexOf("-") <= 0 && str.indexOf("_") > 0) {
      var args = str.split("_");
      return {
        artist: this.removeOffical(args[0].trim()),
        title: this.removeOffical(args[1].trim())
      }
    }
    if (str.indexOf("-") < 0) {
      return {
        artist: this.removeOffical(str.trim()),
        title: this.removeOffical(str.trim())
      };
    }
    var args = str.split("-");
    return {
      artist: this.removeOffical(args[0].trim()),
      title: this.removeOffical(args[1].trim())
    };
  }

  this.tearANDS = function(url) {
    var i = url.indexOf("&");
    if (i < 0) return url;
    return url.substr(0, i);
  }

  this.getYT = function(url, djs) {
    // ytdl http://www.youtube.com/watch?v=_HSylqgVYQI > myvideo.webm
    var id = this.getYTId(url);
    console.log("URL: " + url);
    console.log(url);
    var pro = this.process;
    var inside = this;
    this.ytdl.getInfo(url.trim(), null, function(err, info) {
      // if (err) throw err;
      console.log("Error: " + err);
      inside.log.log("Any Errors? :: " + err);
      inside.log.log("Attempting to Collect Data from "+ inside.tearANDS(url)+"");
      // console.log(info);
      if (info.length_seconds > inside.maxSongLength.int) {
        inside.log.log("Requested Youtube File was too long.");
        djs.reply("Your requested audio was too long, please select a video that is less than "+inside.maxSongLength.str+" long.");
        return;
      }
      inside.process.spawn("node pm_ytdl.js --url "+inside.tearANDS(url)+ " --vid "+info.video_id, function(std) {
        console.log(info.length);
        console.log(std.sErr);
        inside.log.log("Thread Errors? :: " + std.sErr);
        var artistdata = inside.shatterX(info.title);
        inside.db.insert({
          artist: artistdata.artist,
          title: artistdata.title,
          path: "audio/"+info.video_id+".mp3",
          uploader: info.author,
          keywords: info.keywords,
          video_id: info.video_id,
          video_title: info.title
        });
        console.log("Attempting to store video id: " + info.video_id);
        inside.log.log("Attempting to store video audio information into audio/"+info.video_id+".ogg");
        inside.db.persistence.compactDatafile();
          inside.db.findOne({video_id: info.video_id}, function(err, doc) {
            inside.log.log("Video/Audio Data and information has been stored in the database: "+ doc.video_id + " Successfully.");
            djs.reply("Audio is ready to be played.");
            inside.bot.playFile(doc, djs);
          });
          inside.db.count({}, function (err, count) {
            inside.bot.currentTotal = count;
          });
      });


    });
  };
};
