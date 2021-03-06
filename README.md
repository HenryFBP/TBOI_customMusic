# TBOI_customMusic

Mod for The Binding Of Isaac: Afterbirth+ that allows custom music.

TL;DR:

You make a list of songs,
turn off the game's music,
and listen to your music through a web interface.
Songs change when room types change.

## How does it work?

 TBOI AB+ does NOT (through its LUA API):
 - allow you to add NEW music.
 - allow you to add NEW sounds.
 
Most music mods you see just overwrite music.

Nothing wrong with this, but what if you want your own songs? 

**I don't actually add new music to the game files, or touch them at all.**


## Well then how tf does it work?

Rather, this mod:
- Starts a Python Django webserver on port `8000` that listens
- Communicates to a webserver whenever you change room types.
- Webserver writes down the room in a `sqlite3` database.
- This webserver talks to your browser, that will ask for appropriate music.
- You define what tracks play in an `.xml` file.


## Do I need to do anything before I install it?

Yes, yes you do.

- Install Python 3.6
- Install the following packages with pip:
    - `pip install pprint requests django django-cors-headers watchdog`


## If I make this into a twitch app will you sue me?

No license, do whatever you want with it.

Sorry if it blows up.

Don't know if it plays well on Mac or Linux. Haven't had time to test.

Let me know, make pull requests, fork it, whatever, etc.

Enjoy!
