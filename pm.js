// Core Functionality
const Discord = require("discord.js");
var client = new Discord.Client();
require("es6-shim");
var fs = require('fs');
var Datastore = require('nedb');
var db = new Datastore({ filename: 'database/audiodata.db', autoload: true });
var userDb = new Datastore({filename: 'database/users.db', autoload: true});
var audioMeta = new Datastore({filename: 'database/audioMeta.db', autoload: true});
var ytdl = require("ytdl-core");
var worker = require("child_process");
// Extra Functionality
var ThreadWorker = require("./core/ThreadWorker.js");
var Bot = require("./core/Bot.js");
var Log = require("./core/Logger.js");
var Playlist = require("./core/PlayList.js");
var ThreadWork = require("./core/ThreadWork.js");
var MomentJS = require("moment");
var Perm = require("./core/Permissions.js");
var artistTitle = require("get-artist-title");
var ams = require("./core/audiometa.js");
// options;
var UserOptions = require("./settings.json");
// console.log(UserOptions);
//
UserOptions.users.admin.forEach(function(id) {
  // console.log(PermissionsSystem);
  Perm.addUserToPool(id);
  Perm.addUserToRole(id, "admin");
});


// inits
var logger = new Log(fs, MomentJS);
var bot = new Bot({
  cmdPrefix: UserOptions.discord.cmd_prefix,
  log: logger,
  client: client,
  fs: fs,
  db: db,
  permissionsSystem: Perm
});
var threadwork = new ThreadWork({
  process: new ThreadWorker(worker),
  db: db,
  adb: audioMeta,
  ytdl: ytdl,
  bot: bot,
  log: logger,
  maxSongLength: UserOptions.song.maxLength,
  artistTitle: artistTitle
});
var audioMetaSystem = new ams({
  db: audioMeta,
  log: logger
});
var playlist = new Playlist({
  bot: bot,
  logger: logger,
  adb: audioMetaSystem
});




// addedtional inserts;
bot.setThread(threadwork);
bot.setPlayList(playlist);
bot.setAdmin(UserOptions.users.admin[0]);
db.count({}, function (err, count) {
  bot.currentTotal = count;
});



// Client Data beyond here;

client.on('ready', () => {
  console.log('I am ready!');
  // client.channels.get("237377316970430476").join();
  // bot.GetChannelByName("General").join();
  if (UserOptions.discord.vChannel.connectBy === "name") {
    bot.GetChannelByName(UserOptions.discord.vChannel.name).join();
  } else if (UserOptions.discord.vChannel.connectBy === "id") {
    bot.GetChannelByID(UserOptions.discord.vChannel.id).join();
  }
});

function allowedHere(id, name) {
  if (UserOptions.discord.tChannel.connectBy === "name") {
    if (UserOptions.discord.tChannel.name === name) return true;
  } else if (UserOptions.discord.tChannel.connectBy === "id") {
    if (UserOptions.discord.tChannel.id === id) return true;
  }
  return false;
}

client.on("message", message => {
  if (bot.isBotCommand(message.content)) {
    // it is a bot command;
    // check if the bot listen globally on the server it was added to
    if (!UserOptions.discord.listenOnOneTextChannel) {
      bot.carryOutCommand(message, logger);
      return;
    }
    // the bot was told to listen to a particular channel.
    if (allowedHere(message.channel.id, message.channel.name)) {
      // it is allowed to be called here;
      bot.carryOutCommand(message, logger);
    } else {
      message.author.send("Please Use the Channel that has been put aside for the bot: <#"+UserOptions.discord.tChannel.id+">");
    }
  }
});

client.login(UserOptions.discord.bot_token);

/*******************************
**  Adds "/send_logs" command
**  COMMAND: /send_logs
**  ARGS: STRING (MAX LENGTH)
*******************************/

bot.addCmdExec("logs", function(cmd, djs) {
  // logs the the message text to the end of bugs.txt
  // this.log.bug("bugs.txt", message.content);
  // console.log();
  var now = MomentJS(new Date()).format("YYYY-MM-DD");
  djs.author.send("The log data for "+now);
  djs.author.send("Comprehensive log data will only be allowed via direct file system.");
  // replys
  djs.author.sendFile("logs/"+now+".log");
  djs.author.sendFile("bugs.txt");
}, "admin");

bot.addCmdExec("notevenadmin", function(cmd, djs) {
  console.log("Not even the admin has access to this function");
}, "not_admin");

/*******************************
**  Adds "/bug" command
**  COMMAND: /bug
**  ARGS: STRING (MAX LENGTH)
*******************************/

bot.addCmdExec("bug", function(cmd, djs) {
  // logs the the message text to the end of bugs.txt
  this.log.bug("bugs.txt", djs.content);
  // replys
  djs.reply("Bug Has Been Noted.");
});

/*******************************
**  Adds "/random" command
**  COMMAND: /random
**  ARGS:
*******************************/

bot.addCmdExec("random", function(cmd, djs) {
  var out = this;
  this.db.count({}, function(err, count) {
    if (!err && count > 0) {
      var skipCount = Math.floor(Math.random() * count);

      db.find({}).skip(skipCount).limit(1).exec(function (err2, docs){
        if (!err2) {
          out.playFile(docs[0], djs);
          audioMetaSystem.incrementPlay(docs[0]);
        }
      });
    }
  });
});


/*******************************
**  Adds "/play" command
**  COMMAND: /play
**  ARGS: URL OR
**        [title] OR
**        [artist] > [title]
*******************************/
bot.addCmdExec("play", function(cmd, djs) {

  console.log(cmd.args);

  // This is required to access the correct object while inside another
  // function which also uses 'this' as an id.
  var threaded = this.thread;

  // checks if the requested song is a youtube video.
  if (this.isYT(cmd.args)) {
    console.log("Youtube Video Requested.");
    logger.log("Youtube Video Requested.");

    var out = this;

    // locate the cache;
    this.db.findOne({video_id: this.thread.getYTId(cmd.args)}, function(err, doc) {
      // console.log(doc);
      if (doc != null) {
        // song exist in cache
        console.log("Song Requested: " + doc.title + " By Artist: " + doc.artist + " By Youtube Video ID: " + doc.video_id);
        logger.log("Song Found In Cache: " + doc.title + " By Artist: " + doc.artist + " | Youtube Video ID: " + doc.video_id);
        out.playFile(doc, djs);
      } else {
        // song doesn't exist in cache;
        logger.log(cmd.args + " is not found in the cache. Attempting to collect data from the internet.");
        djs.reply("Your audio is being downloaded. Please wait while it is, the bot will tell you when its ready with your audio.");
        // launches a worker thread to download audio;
        threaded.getYT(cmd.args, djs);
      }
    });
    // prevents the rest of the function from attempting to excecute.
    // it actuals produces bugs otherwise.
    return;
  }

  // determines if an artist was selected;

  // determines if the song was requested by its title.
  if (this.findByTitle(cmd.args)) {
    console.log("INSIDE TITLE: " + cmd.args);
    var out = this;
    // makes sure that the title isn't empty;
    if (/\S/.test(cmd.args)) {
      // attempts to locate the song via its title;
      this.db.find({title: {"$regex": new RegExp(cmd.args, "i")}}, function(err, doc)  {
        // console.log(doc);
        if (doc && doc.length === 1) {
          // a single song has been found by title;
          console.log("Song Requested: " + doc[0].title + " By Artist: " + doc[0].artist);
          out.log.log("Song Requested: " + doc[0].title + " By Artist: " + doc[0].artist + ", found by title");
          out.playFile(doc[0], djs);
        } else if (doc && doc.length > 0) {
          // Multiple songs found with songs title, or near the title;
          console.log("Multiple Songs found for search query.");
          out.log.log("Multiple Songs found for search query: "+cmd.args);
          djs.reply("Multiple Songs that have this title, or contain these words. Please Review which Your Selection.");
          djs.channel.send({embed: {
              color: 3447003,
              description: "These are the results of your query: '" + cmd.args +"'",
              fields: out.buildQueryList(doc)
              // timestamp: new Date(),
            }
          });
        } else {
          // no songs found;
          out.log.log("No Matching Song Found for the query: "+cmd.args);
          djs.reply("No Matching Song Found.");
        }
      });
    } else {
      djs.reply("Please Enter a Search Query.");
      out.log.log("Search was attempted with an empty query. Condition was caught. Gracefully returning to rest.");
    }
    // prevents the rest of the function from attempting to excecute.
    // it actuals produces bugs otherwise.
    return;
  }

  // this is not test.
  // it is for [artist] > [title]
  if (!this.findByTitle(cmd.args)) {
    var song = this.getSongDetails(cmd.args);
    var out = this;
    // attempts to find a song from a particualr artist;
    this.db.findOne({artist: {"$regex": new RegExp(song.artist, "i")}, title: {"$regex": new RegExp(song.title, "i")}}, function(err, doc) {
      if (doc) {
        // song found;
        console.log("Song Requested: " + doc.title + " By Artist: " + doc.artist);
        out.log.log("Song Requested: " + doc.title + " By Artist: " + doc.artist + ", found by direct (artist, title) key.");
        out.playFile(doc, djs);
      } else {
        // song not found.
        console.log("Requested Song ["+song.title+"] by Artist ["+song.artist+"] has not been found in the library.");
        out.log.log("Requested Song ["+song.title+"] by Artist ["+song.artist+"] has not been found in the library.");
        djs.reply("Requested Song ["+song.title+"] by Artist ["+song.artist+"] has not been found in the library.");
      }
    });
    // prevents the rest of the function from attempting to excecute.
    // it actuals produces bugs otherwise.
    return;
  }
});

/*******************************
**  Adds "/repeat" command
**  COMMAND: /play
**  ARGS: URL OR
**        [title] OR
**        [artist] > [title]
*******************************/

// BUG: forces the bot into a infinite loop;
// bot.addCmdExec("repeat", function(cmd, djs) {
//   this.pl.isRepeat = true;
//   this.commandExec(cmd, djs);
// });

/*******************************
**  Adds "/stop" command
**  COMMAND: /stop
**  ARGS:
*******************************/
bot.addCmdExec("stop", function(cmd, djs) {
  // tells the playlist object to stop the song.
  this.pl.stop(this.getVoiceConnection());
  // logs;
  console.log("Playlist Song Stopped.");
  this.log.log("Audio Stopped.");
});

/*******************************
**  Adds "/pause" command
**  COMMAND: /pause
**  ARGS:
*******************************/
bot.addCmdExec("pause", function(cmd, djs) {
  // tells playlist to pause song.
  this.pl.pause(this.getVoiceConnection());
  // logs;
  console.log("Playlist Song Paused.");
  this.log.log("Audio Paused.");
});

/*******************************
**  Adds "/resume" command
**  COMMAND: /resume
**  ARGS:
*******************************/
bot.addCmdExec("resume", function(cmd, djs) {
  // makes sure that there is a song that is paused.
  if (this.pl.isPaused) {
    // tells playlist to resume paused song;
    this.pl.play(this.getVoiceConnection());
    // logs;
    console.log("Playlist Song Resume.");
    this.log.log("Audio Resumed.");
  } else if (!this.pl.isPlaying) {
    // this determines if there is more in the playlist to be played;
    this.pl.play(this.getVoiceConnection());
  }
});

/*******************************
**  Adds "/playlist" command
**  COMMAND: /playlist
**  ARGS:
*******************************/
bot.addCmdExec("playlist", function(cmd, djs) {
  // requests the current playlist queue and sends it to the current text channel;
  djs.channel.send(this.pl.showQueue());
  // logs;
  this.log.log("Current Playlist sent to server.");
});

/*******************************
**  Adds "/library" command
**  COMMAND: /library
**  ARGS: pg [#]
*******************************/
bot.addCmdExec("library", function(cmd, djs) {
  console.log("Library Requested.");

  // determines if the command arguments exists or not.
  if (cmd.args.indexOf("pg") === -1) {
    var otherthis = this;
    // extracts the first 10 entries from the db in alphabetical order.
    this.db.find({}).sort({artist: 1, title: 1}).limit(10).exec(function(err, docs) {
      // djs.channel.send("```"+otherthis.buildQueryList(docs)+"```");
      // sends an embeded message to the text channel.
      djs.channel.send({embed: {
          color: 3447003,
          description: "",
          fields: otherthis.buildQueryList(docs),
          // timestamp: new Date(),
          footer: {
            // icon_url: client.user.avatarURL,
            text: "Page 1/"+(Math.ceil(otherthis.currentTotal/10))
          }
        }
      });
    });
    // logs;
    this.log.log("DB Library Formatted and sent to server.");
  } else {
    // there were command arguments that needed to be accounted for.
    var pgz = cmd.args.split(" ");
    // build an obect;
    var pg = {
      type: pgz[0],
      pgNum: parseInt(pgz[1])
    };
    // determines the value of documents to skip over
    var skipValue = pg.pgNum * 10;

    var otherthis = this;
    // determines if the page requested is greater than the amount the library has.
    if (pg.pgNum > Math.ceil(otherthis.currentTotal/10)) {
      djs.channel.send("There is no library page that corresponds to the requested page number.");
      return;
    }
    // extracts the next 10 entries after skipValue from the db in alphabetical order.
    this.db.find({}).sort({artist: 1, title: 1}).skip(skipValue).limit(10).exec(function(err, docs) {
      // sends embeded message to channel;
      djs.channel.send({embed: {
          color: 3447003,
          title: 'Music Library',
          description: "",
          fields: otherthis.buildQueryList(docs),
          // timestamp: new Date(),
          footer: {
            // icon_url: client.user.avatarURL,
            text: "Page "+pg.pgNum+"/"+(Math.ceil(otherthis.currentTotal/10))
          }
        }
      });
    });
  }
});

/*******************************
**  Adds "/whatplaying" command
**  COMMAND: /whatplaying
**  ARGS:
*******************************/
bot.addCmdExec("whatplaying", function(cmd, djs) {
  // replies with the current song;
  djs.reply(""+this.pl.whatIsPlaying()+"");
  // log;
  this.log.log("The current Song's metadata has been sent to the server. <"+this.pl.whatIsPlaying()+">");
});

/*******************************
**  Adds "/next" command
**  COMMAND: /next
**  ARGS:
*******************************/
bot.addCmdExec("next", function(cmd, djs) {
  // reply to user;
  djs.reply("Skipping track.");
  // skips track;
  this.pl.next(djs);
  // logs;
  this.log.log("Audio has been skipped to the next one, if there is one.");
});

/*******************************
**  Adds "/volume" command
**  COMMAND: /volume
**  ARGS: [#]
*******************************/
bot.addCmdExec("volume", function(cmd, djs) {
  // console.log(cmd.args);
  // parses the integer value;
  var vol = parseInt(cmd.args);
  // ensures it is an integer value;
  if (vol > 100 || vol < 0 || isNaN(vol)) {
    djs.reply("The volume you've entered is incorrect.");
    return;
  }
  // sets volume;
  this.pl.volume(vol/100, this.getVoiceConnection());
});

/*******************************
**  Adds "/dequeue" command
**  COMMAND: /dequeue
**  ARGS: [#]
*******************************/
bot.addCmdExec("dequeue", function(cmd, djs) {
  // error checking;
  var position = parseInt(cmd.args);
  if (isNaN(position) || position < 0) {
    djs.reply("Please specific an integer value starting from 0.")
    return;
  }
  // removes from queue;
  this.pl.dequeue(position, djs);
});

/*******************************
**  Adds "/admin" command
**  COMMAND: /admin
**  ARGS:
*******************************/
bot.addCmdExec("admin", function(cmd, djs) {
  // just a test to make sure the adminstration permissions were working.
  djs.reply("You are admin");
}, "admin");

/*******************************
**  Adds "/help" command
**  COMMAND: /help
**  ARGS:
*******************************/
bot.addCmdExec("help", function(cmd, djs) {
  this.fs.readFile("help.md", "UTF-8", function(err, data) {
    if (err) {
      return console.log(err);
    }
    // console.log(data);
    var str = "```markdown\n";
    str += data +"\n";
    str += "```";
    djs.channel.send(str+"");
    // djs.channel.send("```md " + data +" ```");
  });
});
