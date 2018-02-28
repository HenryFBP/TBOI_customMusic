--- settings.lua
--- Custom Music Mod by HenryFBP.
-- https://github.com/HenryFBP/TBOI_customMusic
--
-- This is the settings file.
-- Change stuff if you like.
--


local settings = {}

settings.conf = {
    ['ModName'] = "CustomMusic",
}

settings.logging = {
    -- debug settings
    ['debug'] = true,

    -- console fonts
    ['XPos'] = 50,
    ['YPos'] = 30,
    ['LineHeight'] = 10,
    ['Length'] = 23,

    -- console print locations
    ['RoomChangePos'] = 6,
    ['FloorChangePos'] = 9,
    ['HurtLinePos'] = 13,
    ['MessageFilePos'] = 15,
}


settings.paths = {
    ['runtime'] = 'python',
    ['script_messenger'] = 'messenger.py',
    ['script_startup'] = 'startup.py',
    ['script_messenger_bat'] = 'messenger.bat',
    ['script_server'] = 'web/manage.py',
    ['messages_file'] = 'messages/msg.log',
}

function settings.test()
    return "i am settings test func."
end


return settings