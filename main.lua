--StartDebug()

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

function script_path()
   local str = debug.getinfo(2, "S").source:sub(2)
   return str:match("(.*/)")
end


function os.capture(cmd, raw)
  local f = assert(io.popen(cmd, 'r'))
  local s = assert(f:read('*a'))
  f:close()
  if raw then return s end
  s = string.gsub(s, '^%s+', '')
  s = string.gsub(s, '%s+$', '')
  s = string.gsub(s, '[\n\r]+', ' ')
  return s
end


local _name = 'CustomMusic'
local Mod = RegisterMod(_name, 1)
local mainModule = {}
_log = {}

local _path = script_path()
local _script = 'py'
local _scriptMessenger = 'messenger.py'
local _scriptServer = 'web/manage.py'
local _ticks = 0

--local serverLog = start()
lastSent = 'oh helo'


local config = {
  ['XPos']=50,
  ['YPos']=30,
  ['LineHeight']=10
}

function PrintText(thing, x, y)
  x = x or config['XPos']
  y = y or config['YPos']+50
  
  Isaac.RenderText(thing, x, y, 255, 255, 255, 255)
end

function Log(thing, place)
        
  x = config['XPos']
  y = config['YPos']+50
  
  _log[place] = thing

end



function Mod:start()
  local command = 'cmd /K '.._script..' "'.._path.._scriptServer..'" runserver'
  os.execute(command)
  return command
end


function test()
  Log('Testing?????',10)
end

--- sendCMD sends a command and opens a command-line window.
-- Interrupts game, is annoying.
-- @param message The message to be sent to the customMusic server.
-- @param stay Should we keep the terminal open?
-- @return The message that was sent.
function sendCMD(message, stay)
  stay = stay or false
  local command = 'py "'.._path.._scriptMessenger..'"'
  
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
  local command = 'py "'.._path.._scriptMessenger..'"'
  local out = os.capture(command)
  return out
end

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

function Mod:onRender()

  local x = Isaac.GetPlayer(0).Position.X
  local y = Isaac.GetPlayer(0).Position.Y

  local s = _name..". x="..x..",y="..y
  
  PrintText("spooky text", x, y)

  Log(s, 0)
    
  Log(lastSent, 1)
  
  displayLog()
--  Isaac.RenderText(lastSent, config["XPos"], config["YPos"]+(2 * config["LineHeight"]), 255, 255, 255, 255)
end

function Mod:immortality()
  local p = Isaac.GetPlayer(0)
  p:SetFullHearts()
  
  lastSent = "last sent:" .. sendCMD("hello webserver!", true)
end


Mod:AddCallback(ModCallbacks.MC_POST_RENDER, Mod.onRender)
Mod:AddCallback(ModCallbacks.MC_ENTITY_TAKE_DMG, Mod.immortality, EntityType.ENTITY_PLAYER)
Mod:AddCallback(ModCallbacks.MC_POST_PLAYER_INIT, Mod.start, EntityType.ENTITY_PLAYER)
