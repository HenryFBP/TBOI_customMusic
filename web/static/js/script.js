
var _debug = false;

var host = "localhost";
var port = 8000;

var musicFile = "music";
var musicPath = "http://"+host+":"+port+"/"+musicFile; //to get music.json

var pollFile = 'query';
var pollPath = "http://"+host+":"+port+"/"+pollFile; //to ask about what rooms are visited

var mediaPath = "http://"+host+":"+port+"/static/media/";

var musicJson = {}; //will be updated later.

var pollerInterval = null; //will later be setInterval(function(){...}, 1000) or something
var pollTime = 3000; //poll every THIS MANY milliseconds

var currentlyPlaying = null; //what song is currently playing?
var currentRoom = null; //what song are we in right now?




  $('#nojs').hide(); //don't show 'WHY NO JS??' msg

//https://stackoverflow.com/questions/8628413/jquery-find-the-element-with-a-particular-custom-attribute
var Song = class Song {
    constructor(name, album, room, uri) {
        this.name = name;
        this.album = album;
        this.room = room;
        this.uri = uri;
    }

    /***
      * Turn a dictionary representation of a Song object into a Song object.
      */
    static fromJSON(dict) {
        //console.log("fromJSON of Song object. passed:");
        //console.log(dict);

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

    toElement(e) {
        e = e || 'li';

        var ret = '';

        ret += this.name; //add name

        ret = wrap(ret, e); //make it an LI

        ret = $(ret); //turn it into a JQuery element

        //add some data
        ret.data('name',this.name);
        ret.data('album',this.album);
        ret.data('room',this.room);
        ret.data('uri',this.uri);

        return ret;
    }
};

var MusicList = class MusicList {

    static songToElt(song) {

        //console.log("MusicList.songToElt was passed this song:");
        //console.log(song);

        var name, album, room, URI;

        if(typeof(song) == typeof('')) //if they just had a URI
        {
            URI = song;
            name = song.split('/').slice(-1)[0]; //the last thing before the slash
        }
        else //it's a dict
        {
            album = song.album;
            name = song.name;
            URI = song.uri;
        }

        var songObj = new Song(name, album, room, URI);

        return songObj.toElement();
    }

    static roomToElt(room, roomName) {

        var songs = document.createElement('ul');

        for(var songIdx in room) //go through all song names for X room
        {
            var song = room[songIdx];

            var songElt = MusicList.songToElt(song);

            songs.appendChild(songElt.get(0));
        }

        var listItem = document.createElement('li'); //list item containing our list of songs

        listItem = $(listItem).addClass(roomName); //add a class

        listItem.append($('<a>'+roomName+'</a>')) //add an 'a' tag with room name

        listItem.append(songs); //add list of songs

        return listItem;
    }

    static generateFromJSON(jd) {

        console.log('Passed this: ');
        console.log(jd);

        var roomList = $('<ul></ul>');

        for(var roomName in jd.rooms) //go through all rooms
        {
            var room = jd.rooms[roomName];

            var roomElt = MusicList.roomToElt(room, roomName);

            roomList.append(roomElt);
        }

        return roomList;
    }


    constructor(songs, jd) {

        jd = jd || musicJson;

        if(songs)
        {
            this.songs = songs; //use list of songs
        }
        else
        {
            this.generateFromJSON(jd); //else, generate list from JSON
        }
    }

}

var Room = class Room {
    constructor(name, songs) {
        this.name = name;
        this.songs = songs;
    }

    static fromJSON(name, dict) {
        var name = name;

        var songs = [];

        for(var songJ in dict)
        {
            var aSong = dict[songJ];
            songs.push(Song.fromJSON(aSong));
        }

        return new this(name, songs);
    }
};

  /***
    * Callback for polling the server.
    */
  function pollServer(data)
  {
    if(data === '0')
    {
      console.log("No room change yet.")
    }
    else
    {
     console.log("O BOY ROOM CHANGE:")
     console.log(data)
    }
  }

/***
  * Called to update the view (highlighting, 'currently playing', etc)
  * based on a Song and Room.
  */
function updateMusicViews(room, song)
{
    console.log("passed this room + song:");
    console.log(room);
    console.log(song);

    $('.playing').removeClass('playing');

    $('#currently-playing h2')[0].innerHTML = song.name;

    $('#currently-playing p')[0].innerHTML = room.name + " caused this.";

    var relevant = $(':data(name)').filter(function(index) { //get all elements that match song name

//        console.log('idx: '+index);
//        console.log($(this).data());

        if($(this).data().name == song.name)
        {
            return true;
        }
        else
        {
            return false;
        }
    });

//    console.log("Relevant song elements:");
//    console.log(relevant);

    $(relevant.get(0).parentElement.parentElement).addClass('playing');

    relevant.addClass('playing');
}

   /***
     * Called to update the music being played based on a Room object.
     */
  function updateMusic(room, song)
  {
    console.log("Passed room and song:");
    console.log(room);
    console.log(song);

    room = room || currentRoom;

    if(room != null)
    {
        currentRoom = room;
    }

    console.log("Updating music with "+room.name+":");
    console.log(room);

    var roomName = room.name;

    var songList = musicJson.rooms[roomName];
    console.log("Song list:");
    console.log(songList);

    //random choice...FOR NOW!!!
    song = song || randomElt(songList);
    var uri = song.uri;

    playSong(uri);

    updateMusicViews(room, song);
  }

/***
* Play a song by URI.
*/
function playSong(uri)
{
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
  * Called to get the most recent room out of the list of rooms.
  * @return The most recent Room object.
  */
function mostRecentRoom(data)
{
    console.log("Someone wants the most recent room out of this list:");
    console.log(data);

//if it adheres to my made-up data structure with unnecessary naming schemes
  if(isDict(data) && ("data" in data))
  {
    var list = data["data"];

    if(list.length <= 0) //if its empty
    {
      return null;
    }

    else
    {
      mostRecentR = list[0];
      mostRecentTime = mostRecentR["time"];

      //compare em all!!

      for(var i = 0; i < list.length; i++)
      {
        if(list[i]["time"] > mostRecentTime)
        {
          mostRecentR = list[i];
          mostRecentTime = mostRecentR["time"];
        }
      }

      return Room.fromJSON(mostRecentR.type, musicJson.rooms[mostRecentR.type]);
    }

  }

  return null;
}

/***
  * Given a name of a room, returns a room object.
  */
function roomByName(roomName)
{
    return Room.fromJSON(roomName, musicJson.rooms[roomName]);
}


/***
* Callback for when the music.json loads.
*/
function generateMusicList(musicList)
{
    //console.log("Passed this:");
    //console.log(musicList);

    var musicElt = MusicList.generateFromJSON(musicList); //generate elts

    // add callbacks for every one so u can click on them to play a song
    musicElt.children().each(function(index){ //go through all rooms

        var room = $(this);

        //console.log(index+"TH ROOM!!!!");
        //console.log(room);

        if(room.children) //if room has songs
        {
            room.children().each(function(index) {  //go through all elements under ul room {x}

                var songList = $(this);

                //console.log(index+"TH SUB-ROOM ELEMENT!!!");
                //console.log(songList);

                if(songList[0].localName == 'a') //then it's a title, clicking should play a random room's song.
                {
                    songList.addClass('clickable'); //show em its clickable

                    songList.on('click', function(event) {
                        var source = $(event.currentTarget);

                        //get the list of songs for this title
                        var roomElt = $($(source.parents()[0]).children().filter('ul')[0]);

                        //console.log("roomElt:");
                        //console.log(roomElt);

                        var songLi = randomElt(roomElt.children()); //random list item

                        //console.log("Random song:");
                        //console.log(songLi);

                        songLi.click();

                    });
                }
                else //it's a song list, play the song associated with this element's {data()}.
                {
                    songList.children().each(function(index) { //go though all songs in a song list

                        var song = $(this);

                        song.addClass('clickable');

                        song.on('click', function(event) {
                            var source = $(event.currentTarget);

                            var roomName = $(source[0].parentElement.parentElement).attr('class').split(' ')[0];
                            var songName = source.data().name;

                            //console.log("roomName and songName:");
                            //console.log(roomName);
                            //console.log(songName);

                            var room = roomByName(roomName);
                            var song = Song.songByName(songName, room);
                            currentRoom = room;

                            //console.log(source);
                            //console.log(source.data());

                            playSong(source.data().uri); //play our song's URI
                            updateMusicViews(room, song)
                        });

                    });
                }

            });
        }


    });

    $('#music').append(musicElt);

    return musicElt;
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

    var mrr = mostRecentRoom(data);

    console.log("Most recent room's name:"+mrr.name);

    updateMusic(mrr);

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


  // attempt to GET music.json
  $.ajax({
    url: musicPath,
    type: "GET",
    success: function(data){
      console.log("Response from server for music.json:");
      console.log(data);
      generateMusicList(data);
      musicJson = data;
      currentRoom = new Room("ROOM_DEFAULT", musicJson.rooms["ROOM_DEFAULT"]); //just to have a default one



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
  $('#poll>button').on('click', function(event){

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
            mrr = mostRecentRoom(data);
            if(mrr)
            {
              updateMusic(mrr); //play song based off of most recent room
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
  $('video')[0].addEventListener("ended", function(){

    updateMusic();

  });


//someone wants a random song from our current room
$('#random-room-song').on('click', function(e){
    updateMusic();
});

//someone wants a TOTALLY RANDOM song
$('#random-room').on('click', function(e){

    var roomNames = Object.keys(musicJson.rooms);
    console.log("All rooms:");
    console.log(roomNames);

    var randomRoomName = roomNames[Math.floor(Math.random() * roomNames.length)];

    var randomRoom = roomByName(randomRoomName);

    console.log("Random room:");
    console.log(randomRoom);

    updateMusic(randomRoom);
});