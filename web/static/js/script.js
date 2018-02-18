$(document).ready(function() //when document loads
{
  var host = "localhost";
  var port = 8000;
  var musicFile = "music";
  var musicPath = "http://"+host+":"+port+"/"+musicFile;

  $('#nojs').hide(); //don't show 'WHY NO JS??' msg

  function wrap(elt, tag)
  {
    if((typeof(elt) === typeof(tag)) && (typeof(tag) === typeof("")))
    {
      return ("<"+tag+">"+elt+"</"+tag+">");
    }
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
        roomList += wrap(room[roomName][i], 'li') + '\n';
      }

      roomList = wrap(roomList, 'ul');
    }

    console.log("List of rooms: ")
    console.log(roomList);

    e = wrap((e + roomList), 'li')

    console.log("Returning this:")
    console.log(e)


    return e;
  }

  // attempt to GET list of music
  $.ajax({
    url: musicPath,
    type: "GET",
    success: function(data) {

      console.log("GET of "+musicPath+" succeeded!");
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

        $('#music>ul').append(roomToElt(room))

        i++;
      }

    },
  });

});