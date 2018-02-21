--- settings.lua
--- Custom Music Mod by HenryFBP.
-- https://github.com/HenryFBP/TBOI_customMusic
--
-- This is the settings file.
-- Change stuff if you like.
--


local settings = {}

settings.conf = {
    ['ModName']="CustomMusic",
}

settings.logging = {
    ['debug']=false,

    ['XPos']=50,
    ['YPos']=30,
    ['LineHeight']=10,
    ['Length']=15,

    ['RoomChangePos']=6,
    ['HurtLinePos']=14,
}


settings.paths = {
    ['runtime'] = 'python',
    ['script_messenger'] = 'messenger.py',
    ['script_messenger_bat'] = 'messenger.bat',
    ['script_server'] = 'web/manage.py',
}

function settings.test()
    return "i am settings test func."
end


return settings