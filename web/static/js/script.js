
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



$(document).ready(function() //when document loads
{


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


/***
  * Trigger the '.fresh' class' animation on some element.
  */
function freshen(elt)
{

  elt.removeClass("fresh");

  void elt[0].offsetWidth; //lol i have no idea what this does

  elt.addClass("fresh");


}

// Date.prototype.format() - By Chris West - MIT Licensed
(function() {
  var D = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),
      M = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");
  Date.prototype.format = function(format) {
    var me = this;
    return format.replace(/a|A|Z|S(SS)?|ss?|mm?|HH?|hh?|D{1,4}|M{1,4}|YY(YY)?|'([^']|'')*'/g, function(str) {
      var c1 = str.charAt(0),
          ret = str.charAt(0) == "'"
          ? (c1=0) || str.slice(1, -1).replace(/''/g, "'")
          : str == "a"
            ? (me.getHours() < 12 ? "am" : "pm")
            : str == "A"
              ? (me.getHours() < 12 ? "AM" : "PM")
              : str == "Z"
                ? (("+" + -me.getTimezoneOffset() / 60).replace(/^\D?(\D)/, "$1").replace(/^(.)(.)$/, "$10$2") + "00")
                : c1 == "S"
                  ? me.getMilliseconds()
                  : c1 == "s"
                    ? me.getSeconds()
                    : c1 == "H"
                      ? me.getHours()
                      : c1 == "h"
                        ? (me.getHours() % 12) || 12
                        : (c1 == "D" && str.length > 2)
                          ? D[me.getDay()].slice(0, str.length > 3 ? 9 : 3)
                          : c1 == "D"
                            ? me.getDate()
                            : (c1 == "M" && str.length > 2)
                              ? M[me.getMonth()].slice(0, str.length > 3 ? 9 : 3)
                              : c1 == "m"
                                ? me.getMinutes()
                                : c1 == "M"
                                  ? me.getMonth() + 1
                                  : ("" + me.getFullYear()).slice(-str.length);
      return c1 && str.length < 4 && ("" + ret).length < str.length
        ? ("00" + ret).slice(-str.length)
        : ret;
    });
  };
})();



  $('#nojs').hide(); //don't show 'WHY NO JS??' msg

  /***
    * Unix timestamp in seconds.
    */
  function now()
  {
    return Math.round((new Date()).getTime() / 1000);
  }

/***
  * Turn a Unix timestamp in seconds into a string.
  */
  function unixSecondsToString(sec)
  {
    var t = new Date(sec*1000);
    var formatted = t.format("hh:mm:ss A");
    return formatted;
  }

/***
  * Turn right now's time into a string.
  */
function nowToString()
{
return unixSecondsToString(now());
}


function isDict(v)
{
    return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
}


  /***
    * Takes an `elt` and wraps it with `tag`.
    * Also works with classes and ids.
    */
  function wrap(elt, tag, clas, id)
  {
    clas = clas || null;
    id = id || null;

  var s = '';

    if(elt)
    {
      if(tag)
      {
        s += ("<"+tag);
      }

      if(clas)
      {
        s += (' class="'+clas+'"');
      }

      if(id)
      {
        s += (' id="'+id+'"');
      }

      if(tag)
      {
        s += (">");
      }

      s += elt;

      if(tag)
      {
        s += ("</"+tag+">");
      }
    }

    return s;
  }

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
     * Called to update the music being played based on a Room object.
     */
  function updateMusic(room, songs)
  {
    var songs = songs || musicJson;
    var room = room || currentRoom;

    console.log("want to get music for this room: ")
    console.log(room)

    var roomType = room["type"];

    var songList = songs["rooms"][roomType];

    //random choice...FOR NOW!!!
    var song = songList[Math.floor(Math.random() * songList.length)];

    playSong(song, room)
  }

  /***
    * Play a song by name.
    * Needs 'room' to be able to highlight both correctly.
    */
  function playSong(songName, room)
  {
    currentlyPlaying = songName;
    currentRoom = room;

    var path = mediaPath + songName;
    var songClass = songName.replace(".","_")

//    alert("PLAYIN DIS: '"+songName+"' AT DIS LOC: '"+path+"'.");

    if(songName != $('audio').attr('src')) //if we're asked to play something DIFFERENT
    {
      var audio_core = $('audio').attr('src', path)[0];
      audio_core.play();

      $($('#currently-playing h2')[0])[0].innerHTML = songName; //display song name
      $($('#currently-playing p')[0])[0].innerHTML = room.type + " caused this."; //display which room

      $('#music').find("*").removeClass('playing'); //remove 'playing' for ALL others

      var roomElt = $('.'+room.type); //get an li item
      $(roomElt[0]).addClass('playing'); //show room is playing

      var songElt = roomElt.find('.'+songClass); //get song under it


      console.log("Room elt for current song:");
      console.log(roomElt);
      console.log("Song elt for current song:");
      console.log(songElt);

      $($(roomElt[0]).find('.'+songClass)[0]).addClass('playing'); //show which song is playing
    }


  }


/***
  * Called to get the most recent room out of the list of rooms.
  * @return The most recent Room object.
  */
function mostRecentRoom(data)
{
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
      return mostRecentR;
    }

  }

  return null;
}


  /***
    * Callback for when the music.json loads.
    */
  function generateMusicList(data)
  {
      console.log("Data: ");
      console.log(data);

      var musicList = JSON.parse(data);

      console.log("JSON-ed data:");
      console.log(musicList);

      var path = musicList.path;

      console.log("path is: '"+path+"'.");

      var i = 0;

      for(var roomName in musicList.rooms)
      {
        var room = {[roomName] : musicList.rooms[roomName]};

        console.log(i+"th room:");
        console.log(room);

        $('#music>ul').append(roomToElt(room));

        i++;
      }
      return musicList;
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

  /***
    * Turn a single room into an HTML element.
    */
  function roomToElt(room)
  {
    var roomName = Object.keys(room)[0]
    var e = '';
    var roomList = '';

    e += wrap(roomName, 'a'); // ROOM_NAME

    if(room[roomName].length > 0)
    {
      console.log("room '"+roomName+"' has "+room[roomName].length+" elements!")

      for(var i = 0; i<room[roomName].length; i++)
      {
        var songClass = room[roomName][i].replace('.','_'); //can't have dots in class names

        roomList += wrap(room[roomName][i], 'li', songClass) + '\n';
      }

      roomList = wrap(roomList, 'ul');
    }

    e = wrap((e + roomList), 'li', roomName);

    return e;
  }

  // attempt to GET music.json
  $.ajax({
    url: musicPath,
    type: "GET",
    success: function(data){
      generateMusicList(data);
      musicJson = JSON.parse(data);
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
  $('audio')[0].addEventListener("ended", function(){

//    console.log("Playback ended for song "+currentlyPlaying+" in room "+currentRoom);

//    console.log("Playing another song...");

    updateMusic();

  })

});