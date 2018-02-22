var host = 'http://localhost'
var port = '8000'
var subdir = '/CORS'

var site = host+':'+port+subdir

function album_to_mp3s(album)
{
    reqUrl = site+"?url="+album

    $.ajax({
      url: reqUrl,
      type: 'GET',
      success: function(data, album) {
        console.log(data);
      },
      fail: function(data, album) {
        console.log("Failed.");
      },
      error: function(result) {
        var m = "Couldn't get data for "+reqUrl+".";
        console.log(m);
        alert(m);
      }
    });
}