# PlayMusic - A Discord YouTube Music Bot

## Introduction

I am aware that there are many Discord Music bots out there. I choose to build one for both practice and the server I am part of. It was quite interesting to build the first version, and the to refactor the code for a public release. At the current time, the system can only pull music from YouTube at the moment, though this is set to change. This Bot makes a cache of the audio files, since the bot was originally meant to be hosted on a Personal Windows Machine, where we were starving for bandwidth. While this current version of the Bot isn't as robust as other offerings on the internet, its quite simple to use and setup. At least I think so.

## Installation

After cloning or downloading the current master branch, simply run `npm install` in the folder, and `npm` will take care of the rest. However, this bot makes use of Discord.Js, and as a result needs a couple other steps to get running.

1. Ensure the FFMPEG is available on your machine and can be accessed via the command line from anywhere, i.e FFMPEG is in your PATH.

### Setting up the bot

The bot is setup in such a way that you don't have to touch any of the code. All the user settings are found in the `settings.json` file. I have provided an example file called `settings.example.js` make sure to modify it and convert it to `settings.json`.

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

## Features

### Music Commands;

1. "/help" => Displays this help system.
2. "/play [song_title]" OR "/play [artist] > [song_title]" OR "/play [YOUTUBE VIDEO LINK]" => Will locate the song in the song database and add it to the playlist. It will begin playing immediately if no song is queued. Otherwise it will queue itself. It will reply with "No Matching Song/Artist Found." if the song isn't in the database. If you select a youtube video to play, the system will download the audio, and once the download is completed it will queue the song and begin playing asap.
3. "/playlist" => will return the currently playing queue. As well as a numerical listing of the songs currently in queue.
4. "/whatplaying" => will return the song title and artist title for the song that is currently playing in voice channel.
5. "/next" => skips the song.
6. "/library" OR "/library pg [#]" => shows the first 10 entries in the database, which is sorted in alphabetical order. Or goes a specific page in library.
7. "/pause" => Pauses the currently playing song.
8. "/resume" => resumes the previously paused song.
9. "/stop" => stops currently playing song and prevents the song from moving to the rest of the playlist.
10. "/volume [int]" => Sets the volume of the current track, where int is a value between 0 and 100 inclusive.

## License

Developed by Vishal Ramki. Released under the MIT License.
