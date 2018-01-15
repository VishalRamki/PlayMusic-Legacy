/*

  Player.js

  The new revamped playlist and audio manager.
  @TODO THIS is a huge work in progress.

*/

module.exports = function(options) {
  // external objects;
  this.bot = options.bot;
  this.log = options.logger;

  // internal objects;
  this.playList = [];
  this.head = null;
  this.tail = null;
  this.currentSong = null;

  // bool objects;
  this.isPlaying = false;
  this.isPaused = false;
  this.isRepeat = false;


  // methods;
  this.play = function(djs, channelre) {
    // if (this.isPaused) {
    //   this.isPaused =
    // }
  };

};
