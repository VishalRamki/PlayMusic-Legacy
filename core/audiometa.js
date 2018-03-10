module.exports = function(options) {

  //
  this.db = options.db;
  this.log = options.log;

  /*
    Accepts a document with the audio data, finds the audio meta data, then
    updates it accordingly.
  */
  this.incrementPlay = function(doc) {
    this.log.log("Incrementing Play Value for Audio Id: " + doc.video_id);
    var out = this;
    // Find the Audio Meta data;
    this.db.findOne({audio_id: doc.video_id}, (err, doc) => {
      if (err) out.log.log(err);
      // Increment the Number Of Plays
      out.db.update({audio_id: doc.audio_id}, {$inc: {plays: 1}}, {}, (err, numReplaced) => {
      });
      // Make the update permenant.
      out.compactDb();
    });
  };
  /*
    Accepts a document with the audio data, finds the audio meta data, then
    updates it accordingly.
  */
  this.incrementRequest = function(doc) {
    this.log.log("Incrementing Request Value for Audio Id: " + doc.video_id);
    var out = this;
    // Find the Audio Meta data;
    this.db.findOne({audio_id: doc.video_id}, (err, doc) => {
      if (err) out.log.log(err);
      // Increment the Number Of Plays
      out.db.update({audio_id: doc.audio_id}, {$inc: {requests: 1}}, {}, (err, numReplaced) => {
      });
      // Make the update permenant.
      out.compactDb();
    });
  };

  this.compactDb = function() {
    this.db.persistence.compactDatafile();
  };

  /*
    Tests 'audio_id' to determine if its meta information exists in the meta db.
  */
  this.audioIdExists = function(audio_id) {
    var outside = this;
    this.db.findOne({audio_id: audio_id}, function(err, doc) {
      if (!err) {
        console.log(doc);
        if (doc === null) return false;
        else return true;
      } else {
        outside.log.log("Error while searching for " + audio_id);
        outside.log.log(err);
      }
    });
    return false;
  };

  /*
    Creates an entry in the meta db with the given audio_id
  */
  this.createAudioMetaInfoDocument = function(audio_id) {
    this.db.insert({
      audio_id: audio_id,
      plays: 0,
      requests: 0
    });
    this.compactDb();
  };

  /*
    Gets The Previous number of Plays for given audio_id
  */
  this.getPlays = function(audio_id) {
    var out = this;
    this.db.findOne({audio_id: audio_id}, (err, doc) => {
      if (!err) {
        if (doc) {
          out.log.log("Getting Play Value for " + audio_id);
          return doc.plays;
        }
      } else {
        out.log.log("Error when getting Play Value for " +audio_id);
        out.log.log("");
      }
    });
  };

  /*
    Gets The Previous number of Requests for given audio_id
  */
  this.getRequests = function(audio_id) {
    var out = this;
    this.db.findOne({audio_id: audio_id}, (err, doc) => {
      if (!err) {
        if (doc) {
          out.log.log("Getting Request Value for " + audio_id);
          return doc.requests;
        }
      } else {
        out.log.log("Error when getting Request Value for " +audio_id);
        out.log.log("");
      }
    });
  };

};
