--- main.lua
--- Custom Music Mod by HenryFBP.
-- https://github.com/HenryFBP/TBOI_customMusic
--

--StartDebug()

-- if you see some lines on your screen, set this to 'false'.
settings.logging.debug = true

function dofile (filename)
  local f = assert(loadfile(filename))
  return f()
end

function time()
  return "["..os.clock().."]:"
end

function table.val_to_str ( v )
  if "string" == type( v ) then
    v = string.gsub( v, "\n", "\\n" )
    if string.match( string.gsub(v,"[^'\"]",""), '^"+$' ) then
      return "'" .. v .. "'"
    end
    return '"' .. string.gsub(v,'"', '\\"' ) .. '"'
  else
    return "table" == type( v ) and table.tostring( v ) or
      tostring( v )
  end
end

function table.key_to_str ( k )
  if "string" == type( k ) and string.match( k, "^[_%a][_%a%d]*$" ) then
    return k
  else
    return "[" .. table.val_to_str( k ) .. "]"
  end
end

function table.tostring( tbl )
  local result, done = {}, {}
  for k, v in ipairs( tbl ) do
    table.insert( result, table.val_to_str( v ) )
    done[ k ] = true
  end
  for k, v in pairs( tbl ) do
    if not done[ k ] then
      table.insert( result,
        table.key_to_str( k ) .. "=" .. table.val_to_str( v ) )
    end
  end
  return "{" .. table.concat( result, "," ) .. "}"
end

function table.invert(t)
   local s={}
   for k,v in pairs(t) do
     s[v]=k
   end
   return s
end

function script_path()
   local str = debug.getinfo(2, "S").source:sub(2)
   return str:match("(.*/)")
end

function get_cwd()
  return io.popen"cd":read'*l'
end

local _name = 'CustomMusic'
local Mod = RegisterMod(_name, 1)
local mainModule = {}
_log = {}



for i=1, 15 do
  _log[i] = "..."
end

local _moddir = string.gsub(script_path(), [[\]], [[/]])
local _cwd = string.gsub(get_cwd(), [[\]], [[/]])

settings = dofile(_moddir..'settings.lua')

local _script =             'py'
local _scriptMessenger =    'messenger.py'
local _scriptMessengerBat = 'messenger.bat'
local _scriptServer =       'web/manage.py'

local _os = "unknown"
_last_executed = "Nothing last run."

-- detect OS 'cuz we can't run .BAT on macs or linux
if(string.match(_moddir, [[C:/Users/]]) or string.match(_moddir, [[Documents/My Games/]])) then
  _os = "windows"
else
  _os = "linux or mac"
end

lastRoomID = nil

local config = {
  ['XPos']=50,
  ['YPos']=30,
  ['LineHeight']=10
}

function PrintText(thing, x, y)
  x = x or config['XPos']
  y = y or config['YPos']+100

  Isaac.RenderText(thing, x, y, 255, 255, 255, 255)
end

function Log(thing, place)

  _log[place] = thing

end

--- sendCMD sends a command and opens a command-line window.
-- Interrupts game, is annoying.
-- @param message The message to be sent to the customMusic server.
-- @param stay Should we keep the terminal open?
-- @return The message that was sent.
function sendCMD(message, stay)
  stay = stay or false
  local command = 'py "'.. _moddir .._scriptMessenger..'" '..message

  if stay then
    command = command .. " & PAUSE"
  end

  os.execute(command)
  return command
end

--- send sends a command silently.
-- @param message the message to be sent to the customMusic server.
-- @return The
function send(message)
  local command = nil
  if _os == [[windows]] then
--    command = 'cmd /K "'.._moddir.._scriptMessengerBat..'" '..message
    command = [[cmd /K "]].._moddir.._scriptMessengerBat..[[" ]]..message
    if settings.logging.debug then
--      command = command .. " & PAUSE" --for debug
    end
  else
    command = 'py "'.. _moddir .._scriptMessenger..'" '..message
  end

  _last_executed = time()..command

  local out = os.execute(command)

  return out
end

---
-- Prints a log line-by-line on the screen.
-- _log is a simple list of strings.
function displayLog()
  
  local x = config['XPos']
  local y = config['YPos']
  
  for i=1, #_log do

    local line = _log[i]
    
    x = config['XPos']
    y = config['YPos']+(i * config['LineHeight'])
    
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

  local s = _name.." mod. Isaac x="..x..",y="..y


  Log(([[CWD: "]].._cwd..[["]]), i); i=i+1
  Log(([[Moddir: "]].._moddir..[["]]), i); i=i+1

  Log(s, i); i=i+1

  Log("I think your OS is: ".._os, i); i=i+1
  Log("last exec: ".._last_executed, i); i=i+1
  Log(_moddir..'settings', i); i=i+1
  Log('settings: '..table.tostring(settings), i); i=i+1
--  Log("settings.test: "..settings:test()); i=i+1
--  Log("settings.paths: "..table.tostring(settings.paths)); i=i+1
  if settings.logging.debug then
    displayLog()
  end
--  Isaac.RenderText(lastSent, config["XPos"], config["YPos"]+(2 * config["LineHeight"]), 255, 255, 255, 255)
end

function Mod:immortality()
  local p = Isaac.GetPlayer(0)
  p:SetFullHearts()
  
  Log(time().." got hurt :'(",13)

  
end

--- Called to tell the server we changed rooms.
function Mod:roomchange()
  local i = 6
  
  local room = Game():GetRoom()
  local RoomID = room:GetType()
  local typename = table.invert(RoomType)[RoomID]
  
    if lastRoomID == nil then -- if this is the first room we've been to
    lastRoomID = RoomID
  end
  
  Log(time().."Room type we just entered: "..RoomID.." aka "..table.invert(RoomType)[RoomID],i)
  i=i+1
  
  Log("Comparing '"..lastRoomID.."' and '"..RoomID..'".',i)
  i=i+1
  
  if lastRoomID ~= RoomID then -- we should change music if we are in a different room
    
    send(typename, true) -- tell the server we've changed rooms
    
    Log("Sending that we've changed rooms!", i)
    i=i+1
  
  else
    Log("Changed rooms but not the room type. Not sending.",i)
    i=i+1
  end
  
  lastRoomID = RoomID -- record what we just changed to
  
end

if debug == false then -- disable logging if debug mode is off
  Log = function(thing) end
end

Mod:AddCallback(ModCallbacks.MC_POST_RENDER, Mod.onRender)
Mod:AddCallback(ModCallbacks.MC_ENTITY_TAKE_DMG, Mod.immortality, EntityType.ENTITY_PLAYER)
Mod:AddCallback(ModCallbacks.MC_POST_PLAYER_INIT, Mod.start, EntityType.ENTITY_PLAYER)
Mod:AddCallback(ModCallbacks.MC_POST_NEW_ROOM, Mod.roomchange, EntityType.ENTITY_PLAYER)
--Mod:AddCallback(ModCallbacks.MC_POST_NEW_LEVEL, Mod.levelchange, EntityType.ENTITY_PLAYER)