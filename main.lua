-- StartDebug()
local Mod = RegisterMod("CustomMusic", 1)

local httpsocket = require("socket.http")
--local http = require('http')

local config = {
  ["XPos"]="50",
  ["YPos"]="30",

}

--http.createServer(function (req, res)
--  local body = "Hello world\n"
--  res:setHeader("Content-Type", "text/plain")
--  res:setHeader("Content-Length", #body)
--  res:finish(body)
--end):listen(1337, '127.0.0.1')

--print('Server running at httcvp://127.0.0.1:1337/')


function Mod:onRender()
    local x = Isaac.GetPlayer(0).Position.X
    local y = Isaac.GetPlayer(0).Position.Y
    
    local s = "hi. x="..x..",y="..y
    
    Isaac.RenderText(s, x, y, 255, 255, 255, 255)
end

function Mod:immortality()
    local p = Isaac.GetPlayer(0)
    p:SetFullHearts()
    local body, code, headers, status = http.request("https://localhost:8080")
end


Mod:AddCallback(ModCallbacks.MC_POST_RENDER, Mod.onRender)
-- Mod:AddCallback(ModCallbacks.MC_ENTITY_TAKE_DMG, Mod.immortality, EntityType.ENTITY_PLAYER)
