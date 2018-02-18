

$(document).ready(function() //when document loads
{

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

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

  var host = "localhost";
  var port = 8000;

  var musicFile = "music";
  var musicPath = "http://"+host+":"+port+"/"+musicFile;

  var pollFile = 'query';
  var pollPath = "http://"+host+":"+port+"/"+pollFile;

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
      print("No room change yet.")
    }
    else
    {
     print("O BOY ROOM CHANGE:")
     print(data)
    }
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
      return;
  }

  /***
    * Callback for manual poll button.
    */
  function manual_poll(data)
  {
          // log it
        $('#log>ol').append(wrap(now(), 'li'));

        dataString = JSON.stringify(data).replaceAll(',',', ')

        // add it to our lil debug view.
        $('#poll>section').html(wrap(dataString,'code', 'center'));

        // explain cryptic '0' to users
        if(data === '0')
        {
            $('#poll>section').append(wrap('(This means no new rooms seen.)','p'))
        }

        lastAsked = wrap(unixSecondsToString(now()),'code');
//        console.log("lastAsked: "+lastAsked);

        ts = wrap(('as of '+lastAsked),'p');
//        console.log("ts: "+ts);

        $('#poll>section').append(ts);

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
        roomList += wrap(room[roomName][i], 'li', room[roomName][i]) + '\n';
      }

      roomList = wrap(roomList, 'ul');
    }

    console.log("List of rooms: ")
    console.log(roomList);

    e = wrap((e + roomList), 'li', roomName);

    console.log("Returning this:")
    console.log(e)


    return e;
  }

  // attempt to GET list of music
  $.ajax({
    url: musicPath,
    type: "GET",
    success: generateMusicList,
  });

  // poll the server continually for new DB entries
  $.ajax({
  //jk not done
  });

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
          ungrey(data)
      },
      done: function(data) {
        ungrey(data)
      },
      fail: function(data) {
        ungrey(data)
      },
    });
  });

});