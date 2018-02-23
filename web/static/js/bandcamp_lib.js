var host = 'http://localhost'
var port = '8000'
var subdir = '/CORS'
var album_to_mp3s_dir = '/album_to_mp3s'

var site = host+':'+port+subdir

function album_to_mp3s(album, successFunc, failureFunc, errorFunc)
{
    var reqUrl = site+album_to_mp3s_dir+"/?url="+album

    var promise = $.ajax({
      url: reqUrl,
      type: 'GET',
      success: successFunc,
      fail: failureFunc,
      error: errorFunc,
    });

    return promise

}