--- main.lua
--- Custom Music Mod by HenryFBP.
-- https://github.com/HenryFBP/TBOI_customMusic
--
function dofile(filename)
    local f = assert(loadfile(filename))
    return f()
end

function script_path()
    local str = debug.getinfo(2, "S").source:sub(2)
    return str:match("(.*/)")
end

function get_cwd()
    return io.popen "cd":read '*l'
end

local _moddir = string.gsub(script_path(), [[\]], [[/]])
local _cwd = string.gsub(get_cwd(), [[\]], [[/]])

local settings = dofile(_moddir .. 'settings.lua')
local lib = dofile(_moddir .. 'lib.lua')

_log = {}

Log = function(thing, place, dest, timestamp)
    dest = dest or _log
    timestamp = timestamp or true

    dest[place] = lib.time() .. thing
end

-- Disable logging if we're not in debug mode.
if not settings.logging.debug then
    Log = function()
        return nil
    end
else
    StartDebug()
    local i = settings.logging.Length
    for i = 1, settings.logging.Length do
        Log("-", i)
    end
    Log("'" .. settings.conf.ModName .. "' mod init.", i) i = i + 1
    Log(([[CWD: "]] .. _cwd .. [["]]), i) i = i + 1
    Log(([[Moddir: "]] .. _moddir .. [["]]), i) i = i + 1
end

local Mod = RegisterMod(settings.conf.ModName, 1)


local _os = "unknown"
_last_executed = "Nothing last run."

-- detect OS 'cuz we can't run .BAT on macs or linux
if (string.match(_moddir, [[C:/Users/]]) or string.match(_moddir, [[Documents/My Games/]])) then
    _os = "windows"
else
    _os = "linux or mac"
end

lastRoomID = nil

function table.val_to_str(v)
    if "string" == type(v) then
        v = string.gsub(v, "\n", "\\n")
        if string.match(string.gsub(v, "[^'\"]", ""), '^"+$') then
            return "'" .. v .. "'"
        end
        return '"' .. string.gsub(v, '"', '\\"') .. '"'
    else
        return "table" == type(v) and table.tostring(v) or
                tostring(v)
    end
end

function table.key_to_str(k)
    if "string" == type(k) and string.match(k, "^[_%a][_%a%d]*$") then
        return k
    else
        return "[" .. table.val_to_str(k) .. "]"
    end
end

function table.tostring(tbl)
    local result, done = {}, {}
    for k, v in ipairs(tbl) do
        table.insert(result, table.val_to_str(v))
        done[k] = true
    end
    for k, v in pairs(tbl) do
        if not done[k] then
            table.insert(result,
                table.key_to_str(k) .. "=" .. table.val_to_str(v))
        end
    end
    return "{" .. table.concat(result, ",") .. "}"
end

function table.invert(t)
    local s = {}
    for k, v in pairs(t) do
        s[v] = k
    end
    return s
end

function PrintText(thing, x, y)
    x = x or settings.logging.XPos
    y = y or settings.logging.YPos + 100

    Isaac.RenderText(thing, x, y, 255, 255, 255, 255)
end



--- sendCMD sends a command and opens a command-line window.
-- Interrupts game, is annoying.
-- @param message The message to be sent to the customMusic server.
-- @param stay Should we keep the terminal open?
-- @return The message that was sent.
function sendCMD(message, stay)
    stay = stay or false
    local command = 'py "' .. _moddir .. settings.paths.script_messenger .. '" ' .. message

    if stay then
        command = command .. " & PAUSE"
    end

    os.execute(command)
    return command
end

--- send sends a command silently.
-- @param message the message to be sent to the customMusic server.
-- @return
function send(message)
    local command = nil
    if _os == [[windows]] then
        --        command = 'cmd /K "'.._moddir..settings.paths.script_messenger_bat..'" '..message
        command = [[cmd /K "]] .. _moddir .. settings.paths.script_messenger_bat .. [[" ]] .. message
        if settings.logging.debug then
            --                  command = command .. " & PAUSE" --for debug
        end
    else
        command = 'py "' .. _moddir .. settings.paths.script_messenger .. '" ' .. message
    end

    _last_executed = lib.time() .. command

    local out = os.execute(command)

    return out
end

---
-- Prints a log line-by-line on the screen.
-- _log is a simple list of strings.
function displayLog()

    local x = settings.logging.XPos
    local y = settings.logging.YPos

    for i = 1, #_log do

        local line = _log[i]

        x = settings.logging.XPos
        y = settings.logging.YPos + (i * settings.logging.LineHeight)

        PrintText(line, x, y)
    end
end

function getkeys(t)
    local klst = {}
    local i = 1

    for key, value in pairs(t) do
        klst[i] = key
        i = i + 1
    end

    return k
end

function Mod:onRender()

    local x = Isaac.GetPlayer(0).Position.X
    local y = Isaac.GetPlayer(0).Position.Y
    local i = 1

    local s = settings.conf.ModName .. " mod. Isaac x=" .. x .. ",y=" .. y

    Log(s, i) i = i + 1

    Log("I think your OS is: " .. _os, i) i = i + 1
    Log("last exec: " .. _last_executed, i) i = i + 1
    Log('settings' .. _moddir, i) i = i + 1
    Log(table.tostring(settings), i) i = i + 1
    --      Log("settings.test: "..settings.test()) i=i+1
    --      Log("settings.paths: "..table.tostring(settings.paths)) i=i+1

    displayLog()
end

function denum(tbl, id)
    return table.invert(tbl)[id]
end

function Mod:immortality()

    local p = Isaac.GetPlayer(0)
    local i = settings.logging.HurtLinePos

    p:SetFullHearts()

    Log("u got hurt :'(", i) i = i + 1
end

--- Called to tell the server we changed floors.
function Mod:floorchange()

    local i = settings.logging.FloorChangePos

    local floor = Game():GetLevel()
    local floorName = floor:GetName()

    Log("Floor name:" .. floorName, i) i = i + 1

    send(('floor=' .. floorName), true) --tell server we've changed floors
end

--- Called to tell the server we changed rooms.
function Mod:roomchange()

    local i = settings.logging.RoomChangePos

    local room = Game():GetRoom()
    local roomType = room:GetType()
    local typename = denum(RoomType, roomType)

    local floor = Game():GetLevel()
    local floorName = floor:GetName()

    if not lastRoomID then -- if this is the first room we've been to
        lastRoomID = roomType
    end

    Log("Room type we just entered: " .. roomType .. " aka " .. typename, i) i = i + 1

    Log("Comparing '" .. lastRoomID .. "' and '" .. roomType .. '".', i) i = i + 1

    if lastRoomID ~= roomType then -- we should change music if we are in a different room

        send(("room=" .. typename..",floor="..floorName), true) -- tell the server we've changed rooms, send floor to be safe.

        Log("Sending that we've changed rooms!", i) i = i + 1

    else
        Log("Changed rooms but not the room type. Not sending.", i) i = i + 1
    end

    lastRoomID = roomType -- record what we just changed to
end

-- add debug stuff if we wanna
if settings.logging.debug then
    Mod:AddCallback(ModCallbacks.MC_POST_RENDER, Mod.onRender)
    Mod:AddCallback(ModCallbacks.MC_ENTITY_TAKE_DMG, Mod.immortality, EntityType.ENTITY_PLAYER)
end

Mod:AddCallback(ModCallbacks.MC_POST_PLAYER_INIT, Mod.start, EntityType.ENTITY_PLAYER)
Mod:AddCallback(ModCallbacks.MC_POST_NEW_ROOM, Mod.roomchange, EntityType.ENTITY_PLAYER)
Mod:AddCallback(ModCallbacks.MC_POST_NEW_LEVEL, Mod.floorchange, EntityType.ENTITY_PLAYER)