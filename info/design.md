# SUGGESTION OBJECT

{
  songID: "Uniquely identifies the song in Youtube (can be a URL, Token, etc.)."
  userID: "ID of the user whom made the suggestion"
  voteCounter: "Number of votes of this suggestion"
}

# MODEL

## User Object

{
    this.id = data == undefined ? -1 : data.id || -1;
    this.name = data == undefined ? "unnamed" : (data.name != undefined ? data.name : data.social.name || "unamed");
    this.position = data == undefined ? 0 : data.position || 0;
    this.avatar = data == undefined ? "./media/images/char1.png" : data.avatar || "./media/images/char1.png";
    this.facing = data == undefined ? FACING_FRONT : data.facing || FACING_FRONT;
    this.animation = data == undefined ? "idle" : data.animation || "idle";
    this.room = data == undefined ? 1 : data.room || 1;
    this.target = data == undefined ? [40,0] : data.target || [40,0];
    this.suggestion = "Suggestion object";
    this.votes = "List of suggestion IDs that the user has voted for"
    this.skip = "Boolean indicating whether the user has voted for skipping the current song or else"
  }

  CREATE TABLE IF NOT EXISTS selecta_users (
    id INT NOT NULL AUTO_INCREMENT,
    social JSON,
    name VARCHAR(255) UNIQUE DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL,
    position JSON, --- MATRIX
    asset INT,
    room INT,

    -- DEFINE FOREIGN KEYS FOR ASSET AND ROOM

    PRIMARY KEY (id)
);

## Room Object

{
    this.id = data == undefined ? -1 : data.id || -1;
    this.name = data == undefined ? "unnamed" : data.name || "unnamed";
    this.background = data == undefined ? "./public/media/images/background.png" : data.background || "./public/media/images/background.png";
    this.exits = data == undefined ? [] : data.exits || [];
    this.people = data == undefined ? [] : data.people || []; //ids
    this.range = data == undefined ? [] : data.range || [];
    this.defaultPosition = "Default positions assigned to new users in the room";
    this.suggestions = "Object of the suggestions of the room sorted by the suggestionID which is indeed the songID";
    this.skipCounter = "Counter of the number of votes for skipping the current song";
    this.currentSong = "songID of the current playing song"
  }

  CREATE TABLE IF NOT EXISTS selecta_rooms (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE,
    objects JSON, -- TODO: Debería de ser más una lista de identificadores de objecto que no un JSON
    exits JSON,
    people JSON

    PRIMARY KEY (id)
);

## World Object

{
    // Objects
    rooms: {},
    users: {},
    num_users: 0,
    num_rooms: 0,
}

# CONTROLLER

{
  user_assets : "User skins",
  object_assets: "Furniture and scene assets of all the rooms (they must identify the room they belong to)",
  my_suggestion: "User suggestion",
  my_votes: "User votes",
  playback_time: "Playback time of the current song",
  skipping_time: "Song time when the skip action should be performed",
  current_room: "Current room (suggestions and current song already inside)",
}


CREATE TABLE IF NOT EXISTS selecta_user_assets (
    id INT NOT NULL AUTO_INCREMENT,
    mesh VARCHAR(255) DEFAULT NULL,
    texture VARCHAR(255) DEFAULT NULL,
    skeleton VARCHAR(255) DEFAULT NULL,
    animations JSON,

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS selecta_object_assets (
    id INT NOT NULL AUTO_INCREMENT,
    type VARCHAR(255) DEFAULT NULL,
    mesh VARCHAR(255) DEFAULT NULL,
    texture VARCHAR(255) DEFAULT NULL,
    bounding_box JSON,

    PRIMARY KEY (id)
);