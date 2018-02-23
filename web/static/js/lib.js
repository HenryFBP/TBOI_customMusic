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


/***
  * Trigger the '.fresh' class' animation on some element.
  */
function freshen(elt)
{

  elt.removeClass("fresh");

  void elt[0].offsetWidth; //lol i have no idea what this does

  elt.addClass("fresh");


}

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

    if(elt || elt === '')
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