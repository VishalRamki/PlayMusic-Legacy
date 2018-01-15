# PlayMusic Changelog

## v0.6.1 HF#1 - DenyPublic

- The code was organized in a way that prevented access to users to public functions. This hotfix addresses the issue.

## v0.6.1 - Minor Bug Fixes, Quality of Life Improvements

- The max song length can now be changed via the `settings.json` file.

```
"song": {
  "maxLength": {
    "int": 1200,
    "str": "20minutes"
  }
}
```

- The bot can now properly handle filing of bugs.
- Fixed the Page numbers displaying incorrectly. Previously would display `x.x`, now it displays a rounded up figure.
- Cleaned up the library embeds. Also prevented library pages that do not exist from being sent to the feed.
- You can tell the bot if there is a specific channel you want it to communicate on alone, this is useful for preventing clutter in your channels. Once you've put the ID of the channel you want as the bot channel, if a user attempts to communicate to the bot outside of this channel, the bot will PM the user with a link to the correct channel.

```
"listenOnOneTextChannel": true,
"tChannel": {
  "connectBy": "id",
  "name": "general",
  "id": "237377316970430475"
}
```
## v0.6 => Major Update, Permissions Changes, Code Restructuring

Date:

- Changed the way the permissions are handled in the code.
- Added the ability to add roles, set functions to roles, and allows certain users access to different roles.
- Added the function to allow the adminstrator to receive log files without logging into their server.
- Changed the response of the bot from standard markdown to formatted tables that Discord allows.

## v0.5.3 => Quick update

Date: 19/07/17

- Added `/logs` command, which is only sent to the individuals that are set by the Admin. It also sends you the text file with any reported bugs.

## v0.5.2 => Bug Fixes, Update to Library Function, Basic Permissions added.

Date: 07/06/17

This is also the first Public Release Build.

- Pagination has been added to the `/library` function. Only 10 entries is shown per page.
- Pagination can be accessed via `/library pg [#]` where `[#]` is an integer value.
- Fixed some random bugs.
- Added the UserOptions module. All of the user's data and settings are stored inside `settings.json`. See the example below.
- Added Basic Permissions. The current Permissions system is just for the admin and public. A more robust permissions system is on the roadmap.

#### Example of settings.json

```json
{
  "discord": {
    "bot_token": "YOUR_BOT_TOKEN",
    "vChannel": {
      "connectBy": "id OR name",
      "name": "CHANNEL_NAME",
      "id": "CHANNEL_ID"
    }
  },
  "user_roles": ["admin", "public"],
  "users": {
    "admin": ["ADMIN_ID"],
    "public": []
  }
}

```

- Discord.bot_token is used to connect your code to the Discord Bot Account.
- Discord.vChannel is the object which contains the information relating to the voice channel.
- Discord.vChannel.connectBy is the method to connect to the channel, either using its `name` or `id`.
- Discord.vChannel.name is the name of the channel to connect to. Only used if `connectBy` is set to `name`.
- Discord.vChannel.id is the id of the channel to connect to. Only used if `connectBy` is set to `id`.
- User_roles are the current available roles for the bot. `admin` and `public` are the only roles currently available.
- Users.admin is an array of ids which will contain all the user ids for the users you wish to grant administration permissions to.
- Users.public leave this empty.

## v0.5.1 => Nearing Public Release; Bug Fixes, Library Updates, etc.

Date: 06/06/17

- Base Libraries were updated to their latest version, updating any code that needed to be.
- Package.json now contains all the dependencies to get up and running.
- `MomentJS` has been included now for more robust logging.
- Logging has been moved to its own folder and now every day has its own log file.
- Ability to set the volume of the current song being played. `/volume [number]`, where number is an integer value between 0 and 100 inclusive.
- Only audio less than 10 minutes are saved or allowed.

## v0.5 => Bot Refactoring And General Bug Fixes

- Code was refactored and rewrote. This should make the bot easier to extend.
- A new Logger class was added to keep some sort of debug information.
- Previous bugs which caused the bot to crash, such as calling next over and over, has been fixed.
- System can now process YouTube video links with '&' in them. It however disregards everything after the '&'.
- System now tells the user that their audio is being downloaded and it will alert them when its ready.


## v0.4.5 => Generic Audio Functions Added.

- Added support for "/pause", "/resume", and "/repeat".
- "/repeat" is just a wrapper for "/play", it tells the audio player to keep playing that song. So that song can be selected just like "/play" would be selected.
- Added support for stopping songs. Stopping a song clears its entry from the playlist.

## v0.4 => Added Library and Error Checking.

- Added a '/library' function. Displays the entire library of audio files.
- Did error checking across all functions, ensures that the code doesn't quit on a wrong input.
- Added ability to select sounds via case-insensitive methods.

## v0.3 => Added Support for Playing and Downloading YouTube Videos At the Same Time.

- Added A WorkerProcess to ensure that you are able to play and download YouTube Videos at the same time.
- Added support for reloading the database upon launching the worker process.
- Added support for loading Audio files from cache if the system detects that the same YouTube Video has been requested again.

## v0.25 => Added Support for playing Youtube Videos

- Added support to download audio only from YouTube videos and stores the audio in an .ogg file.
- System stores the metadata about the youtube video in database.
- System will extract and locate the video id in the internal database. If it isn't found it will download the video. Otherwise it will queue.

Errors

- If a song is playing, and another user queues up a YouTube link, it potentially locks up the code.

## v0.2 => Basic Playlist and Play Functionailtiy

- Added support to show playlist.
- Added function to skip songs.
- Added the ability to queue.
- Ability to find and play songs by using the title or by a combination of Artist > Title.
