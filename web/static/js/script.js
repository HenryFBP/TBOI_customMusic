
var _KEY_ENTER = 13;

var _debug = false;

var host = "localhost";
var port = 8000;

var musicFile = "music";
var musicPath = "http://"+host+":"+port+"/"+musicFile; //to get music.json

var pollFile = 'query';
var pollPath = "http://"+host+":"+port+"/"+pollFile; //to ask about what rooms are visited

var mediaPath = "http://"+host+":"+port+"/static/media/";

var musicJson = {}; //raw JSON file
var musicList = {}; //list of Rooms and Floors

var pollerInterval = null; //will later be setInterval(function(){...}, 1000) or something
var pollTime = 3000; //poll every THIS MANY milliseconds

var currentlyPlaying = null; //what song is currently playing?
var currentRoom = null; //what room are we in right now?
var currentFloor = null; //what floor are we in right now?


  $('#nojs').hide(); //don't show 'WHY NO JS??' msg

var Song = class Song {
    constructor(name, album, room, uri) {
        this.name = name;
        this.album = album;
        this.room = room;
        this.uri = uri;
        this.DOM = this.DOM || null;
    }

    /***
      * Turn a dictionary representation of a Song object into a Song object.
      */
    static fromJSON(dict) {
        return new this(dict.name, dict.album, dict.room, dict.uri);
    }

    /***
      * Given a song's name and a Room object, return a song.
      */
    static songByName(songName, room)
    {
        for(var i in room.songs)
        {
            var song = room.songs[i];
            if(song.name == songName)
            {
                return song;
            }
        }
    }
    /***
      * Turn a Song into a DOM elt.
      */
    generateDOM() {

        if(this.DOM) {
            return this.DOM;
        }

        var dom = $(wrap(this.name, 'li'))[0]; //make it an LI

        $(dom).data('song',this); //add some data

        $(dom).on('click', function(event) {
            var song = $(event.currentTarget).data().song;
            playSong(song);
            updateMusicViews(song);
        });

        $(dom).addClass('clickable');

        this.DOM = dom;
        return dom;
    }
};

/***
  * A collection of all Rooms and Floors.
  *
  * Responsible for creating an HTML element with all songs.
  */
var MusicList = class MusicList {

    constructor(data) {
        this.data = data;
        this.floors = data.floors;
        this.rooms = data.rooms;
    }

    /***
      * Generate a DOM with all floors and rooms.
      *
      * Includes all event listeners, etc.
      */
    generateDOM() {

        var dom = $('<ul>')[0]; //root ul

        var floors = $('<li id="floors"> <h2>Floors</h1> <ul></ul> </li>')[0]; //list of floors
        for(var i in this.floors) //go through all floors
        {
            var floor = this.floors[i];

            $(floors).find('ul')[0].appendChild(floor.generateDOM()); //add a floor to list of floors
        }
        dom.appendChild(floors); //add list of floors

        var rooms = $('<li id="rooms"> <h2>Rooms</h1> <ul></ul> </li>')[0]; //list of rooms
        for(var i in this.rooms) //go through all rooms
        {
            var room = this.rooms[i];

            $(rooms).find('ul')[0].appendChild(room.generateDOM()); //add a room as a DOM
        }
        dom.appendChild(rooms);

        return dom;
    }

}

/***
  * A single room. Can have many songs.
  */
var Room = class Room {
    constructor(name, songs) {
        this.name = name;
        this.songs = songs;
        this.DOM = this.DOM || null;
    }

    /***
      * Turn a roomType string into a Room.
      */
    static fromType(type) {
        if(!type) {
            return null;
        }

        for(var i in musicList.rooms)
        {
            var room = musicList.rooms[i];

            if(room.name == type)
            {
                return room;
            }
        }
    }

    /***
      * Turn raw data into a Room.
      */
    static fromJSON(dict) {
        var name = Object.keys(dict)[0];
        var data = dict[name];

        var songs = [];

        for(var i in data)
        {
            var song = Song.fromJSON(data[i]);
            songs.push(song);
        }

        return new this(name, songs);
    }

    /***
      * Turn a Room into a list of Song elements, as a DOM object.
      * If this function has not been called, it will store the result for later.
      * If it has, then it will return its cached DOM object.
      */
    generateDOM() {

        if(this.DOM) {
            return this.DOM;
        }

        var dom = $('<ul>')[0];

        var label = $('<h3>'+this.name+'</h3>').addClass('clickable');

        label.on('click', function(event) { //event listener for clicking on Room label
            var elt = event.currentTarget;

            var room = $(elt.parentElement).data().room

            currentRoom = room; //assume they want to change their current room

            var songs = room.songs;
            var song = randomElt(songs);

            playSong(song);
            updateMusicViews(song);

        });

        dom.append(label[0]); //add label

        for(var i in this.songs) {
            var song = this.songs[i];

            var songdom = song.generateDOM();

            dom.appendChild(songdom);
        }

        $(dom).data("room", this); //store Room in elt

//        console.log(dom);

        this.DOM = dom;
        return dom;
    }
};

/***
  * A single floor. Can have many songs.
  */
var Floor = class Floor {
    constructor(name, songs) {
        this.name = name;
        this.songs = songs;

        this.DOM = this.DOM || null;
    }

    /***
      * Turn raw data into a Floor object.
      */
    static fromJSON(dict) {
        var name = Object.keys(dict)[0];
        var data = dict[name];

        var songs = [];

        for(var i in data) {
            var song = Song.fromJSON(data[i]);
            songs.push(song);
        }

        return new this(name, songs);
    }

    /***
      * Turn a floorType string into a Room.
      */
    static fromType(type) {
        if(!type) {
            return null;
        }

        for(var i in musicList.floors)
        {
            var floor = musicList.floors[i];

            if(floor.name == type)
            {
                return floor;
            }
        }
    }

    /***
      * Turn a Floor into a list of Song elements, as a DOM object.
      *
      * If this function has not been called, it will store the result for later.
      * If it has, then it will return its cached DOM object.
      */
    generateDOM() {

        if(this.DOM) {
            return this.DOM;
        }

        var dom = $('<ul>')[0];

        var label = $('<h3>'+this.name+'</h3>').addClass('clickable');

        label.on('click', function(event) { //event listener for clicking on Floor label
            var elt = event.currentTarget;

            var floor = $(elt.parentElement).data().floor;

            var songs = floor.songs;

            currentFloor = floor; //assume they want to play this floor instead of their current one

            var song = randomElt(songs);
            playSong(song);
            updateMusicViews(song);

        });

        dom.append(label[0]); //add label

        for(var i in this.songs) {
            var song = this.songs[i];

            var songdom = song.generateDOM();

            dom.appendChild(songdom);
        }

        $(dom).data("floor", this); //store floor in elt

//        console.log(dom);

        this.DOM = dom;
        return dom;
    }
}

/***
  * Callback for music json loading.
  */
function updateMusicJSON(data) {
    console.log("Response from server for music json file:");
    console.log(data);

    musicJson = data; //raw data
    musicList = new MusicList(parseMusicJSON(musicJson)); //parsed data

    $('#music')[0].appendChild(musicList.generateDOM()); //add our music list
}

/***
  * Turns a raw music.json file into a parsed, object version.
  */
function parseMusicJSON(data) {
    var mj = {}

    mj.floors = [];
    for(var i in data.floors) {
        var floorj = data.floors[i];

        var floor = Floor.fromJSON(floorj);

        mj.floors.push(floor);
    }

    mj.rooms = [];
    for(var i in data.rooms) {
        var roomj = data.rooms[i];

        var room = Room.fromJSON(roomj);

        mj.rooms.push(room);
    }

    return mj;
}


  /***
    * Callback for polling the server.
    */
  function pollServer(data) {
    if(data === '0') {
      console.log("No room change yet.")
    }
    else {
     console.log("O BOY ROOM CHANGE:")
     console.log(data)
    }
  }

/***
  * Updates the music based on a floor and/or room.
  */
function updateMusic(mrps) {

    mrps = mrps || null;

    if(mrps != null) {

        if(mrps.room != null) {
            currentRoom = mrps.room;
        }

        if(mrps.floor != null) {
            currentFloor = mrps.floor;
        }

    }

    console.log("Most recent places:");
    console.log(mrps);

    if(currentRoom.name == "ROOM_DEFAULT") { //we want to play the floor's music as it's the default floor

        console.log("User is in default room. playing random song from this Floor:");
        console.log(currentFloor);

        var song = randomElt(currentFloor.songs);
        console.log("Playing this song:");
        console.log(song);

        playSong(song);
        updateMusicViews(song);
    }
    else { //they're in a treasure/curse/boss/etc room, don't care about what floor.
        var song = randomElt(currentRoom.songs);

        playSong(song);
        updateMusicViews(song);
    }

}


/***
  * Called to update the view (highlighting, 'currently playing', etc)
  * based on a Song.
  */
function updateMusicViews(song)
{
    console.log("passed this song:");
    console.log(song);

    var place = $(song.DOM.parentElement).data();
    console.log("found this place:");
    console.log(place);

    var placeType = Object.keys(place)[0]; //is it a room or a floor?


    $('.playing').removeClass('playing');

    $('#currently-playing h2')[0].innerHTML = song.name;

    $('#currently-playing p')[0].innerHTML = place[placeType].name + " caused this.";

    var relevant = $(song.DOM);

    $(relevant.get(0).parentElement).addClass('playing');

    relevant.addClass('playing');
}

/***
  * Play a random song from a Room or Floor.
  */
function playSongByPlace(place) {

    var song = randomElt(place.songs);

    playSong(song);
}

/***
  * Play a Song by a Song object.
  */
function playSong(song) {

    if(!song || !song.uri) {
        return;
    }

    var uri = song.uri;

    var v = $('video');

    v[0].pause();


    if(uri.includes('http'))
    {
        //do nothing
    }
    else
    {
        uri = (mediaPath + uri);
    }

    v.attr('src', uri);

    v[0].play();
}


/***
  * Gets most recent object out of a list of objects.
  */
function mostRecentObject(objects, name)
{
    if(!objects) {
        return null;
    }

    name = name || 'time';
    var mro = objects[0];

    for(var i in objects)
    {
        var object = objects[i];

        if(objects[name] > mro[name])
        {
            mro = object;
        }
    }

//    console.log("Most recent object:");
//    console.log(mro);

    return mro;
}

/***
  * Called to get the most recent place out of the list of rooms & floors.
  * @return The most recent Room/Floor object(s).
  */
function mostRecentPlaces(data)
{
    var ret = {};

    console.log("Someone wants the most recent place out of this list:");
    console.log(data);

    var mrroom = mostRecentObject(data.rooms);
    var mrfloor = mostRecentObject(data.floors);

    if(mrroom) {
        var room = Room.fromType(mrroom.type);
        ret["room"] = room;
    }

    if(mrfloor) {
        var floor = Floor.fromType(mrfloor.type);
        ret["floor"] = floor;
    }

    return ret;
}

/***
  * Given a name of a room, returns a room object.
  */
function roomByName(roomName)
{
    for(var i in musicList.rooms)
    {
        var room = musicList.rooms[i];

        if(room.name == roomName)
        {
            return room;
        }
    }
}

/***
  * Callback for auto-polling.
  */
function poll(data)
{
  $('#last-updated code')[0].innerHTML = nowToString();

  var lastup = $('p#last-updated');

  freshen(lastup)

  if(data != '0')
  {
    logData(data, wrap("(auto-poller)",'p'));

    var mrps = mostRecentPlaces(data);

    updateMusic(mrps)

  }
}

/***
  * setInterval() polling function.
  * @param v Be verbose?
  */
  function pollIntervalFunction(v)
  {
    v = v || _debug;

    if(v)
    {
      console.log("Polling interval func...");
    }

    var r = new XMLHttpRequest();

    r.open("GET", pollPath, false); // false means blocking


//    if(v){console.log("pre-block");}
    r.send(); //I AM THE ONE WHO BLOCKS
//    if(v){console.log("post-block");}

    var resp = r.response;

    if(v)
    {
      console.log("Response from server: ")
      console.log(resp);
    }

    if(resp != '0') //autopoll is INTERESTING
    {
      resp = JSON.parse(resp);

      if(v)
      {
        console.log("Resp isn't boring:");
        console.log(resp);
      }

    }

    poll(resp)

    return resp;
  }


  /***
    * Callback for manual poll button.
    */
  function manual_poll(data)
  {
    var note = wrap((unixSecondsToString(now()) + " (manual poll)"),'p');

    logData(data, note, true);
  }


    /***
      * Log 'data' from the server.
      * Adds 'extra' to the end of the title.
      */
    function logData(data, extra, showempty)
    {
    extra = extra || null
    showempty = showempty || null

        var logEntry = "";
        var classMod = "boring"

        // add extra data
        logEntry += extra

        // format so it wraps
        dataString = JSON.stringify(data).replaceAll(',',', ');
        dataString = dataString.replaceAll('}, ', '}, <br/>');

        // add it to our lil debug view.
        $('#poll>section').html(wrap(dataString,'code', 'center'));

        // explain cryptic '0' to users
        if((data === '0') && showempty)
        {
            $('#poll>section').append(wrap('(This means no new rooms seen.)','p'));
            logEntry += wrap("'"+data+"', aka 'no new rooms seen'.",'p');
        }
        else
        {
            classMod = 'exciting';

            logEntry += wrap(wrap(dataString, 'code'),'p');
        }

        lastAsked = wrap(unixSecondsToString(now()),'code');
//        console.log("lastAsked: "+lastAsked);

        ts = wrap(('as of '+lastAsked),'p');
//        console.log("ts: "+ts);

        $('#poll>section').append(ts);

        // log it into server log
        $('#log>ol').append(wrap(logEntry, 'li', classMod));

        console.log("Data from manual poll:");
        console.log(data);
    }


  // attempt to GET music.json when page loads
  $.ajax({
    url: musicPath,
    type: "GET",
    success: function(data) {
        updateMusicJSON(data);

        if(!currentRoom) {
            currentRoom = roomByName("ROOM_DEFAULT");
        }
    },
  });

  // someone wants to toggle auto-polling
  $('#should-poll-box').on('click', function(event) {
    var c = event.currentTarget.checked;

    //it is checked
    if(c)
    {
      pollerInterval = setInterval(pollIntervalFunction, pollTime);
    }
    else
    {
      clearInterval(pollerInterval);
    }
  });

$('#should-poll-box').trigger('click').trigger('click'); //fire event so we set up polling


//someone wants to change the delay via slider
$('#delay-slider').change(function(){

  //update so they see da number
  $('#delay-controls label')[0].innerHTML = "Query delay: "+($(this).val())+"s";

  //update pollTime var
  pollTime = 1000*parseInt($(this).val());

  //cause var to be used
  $('#should-poll-box').trigger('click').trigger('click');

});

$('#delay-slider').trigger('change'); //to set up label

  // someone wants to poll manually
  $('#poll>button').on('click', function(event) {

    // tell em to stop clickin.
    $('#poll>button').addClass('wait');

    var ungrey = function(data) {$('#poll>button').removeClass('wait');};

    $.ajax({
      url: pollPath,
      type: "GET",
      success: function(data) {
          manual_poll(data);
          ungrey(data);

          if(data != '0')
          {
            var mrps = mostRecentPlaces(data);
            if(mrps)
            {
              updateMusic(mrps); //play song based off of most recent places
            }
          }
      },
      done: function(data) {
        ungrey(data);
      },
      fail: function(data) {
        ungrey(data);
      },
    });
  });

  // when our song ends, play another!
  $('video')[0].addEventListener("ended", function() {

    updateMusic();

  });


//someone wants a random song from our current room
$('#random-room-song').on('click', function(e) {
    updateMusic();
});

//someone wants a TOTALLY RANDOM song
$('#random-room').on('click', function(e) {

    var floor = randomElt(musicList.floors);

    while(floor.songs.length <= 0) //make sure we actually play something
    {
        var floor = randomElt(musicList.floors);
    }

    var song = randomElt(floor.songs)

    playSong(song);
    updateMusicViews(song);
});

$('#which-json')[0].addEventListener('keyup', function(event) {

    if(event.keyCode === _KEY_ENTER) //they want some different music!
    {
        var elt = event.target;

        //console.log(elt);

        //delete all previous music
        $('#music ul').remove()

        // attempt to GET json the user wants
        $.ajax({
            url: musicPath,
            data: {"name": elt.value},
            type: "GET",
            success: function(data) {
                updateMusicJSON(data);
            },
        });
    }

});