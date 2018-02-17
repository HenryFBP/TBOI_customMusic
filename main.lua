StartDebug()

local _name = "CustomMusic"
local Mod = RegisterMod(_name, 1)

local testModule = require('testModule')

local config = {
  ["XPos"]=50,
  ["YPos"]=30,
  ["LineHeight"]=10,
}

function Mod:onRender()

  local x = Isaac.GetPlayer(0).Position.X
  local y = Isaac.GetPlayer(0).Position.Y

  local s = _name..". x="..x..",y="..y

  Isaac.RenderText(s, config["XPos"], config["YPos"], 255, 255, 255, 255)
  Isaac.RenderText(testModule.test(), config["XPos"], config["YPos"]+(1 * config["LineHeight"]), 255, 255, 255, 255)
end

function Mod:immortality()
  testModule.send("hello webserver!")
  local p = Isaac.GetPlayer(0)
  p:SetFullHearts()
--    local body, code, headers, status = http.request("https://localhost:8080")
end


Mod:AddCallback(ModCallbacks.MC_POST_RENDER, Mod.onRender)
Mod:AddCallback(ModCallbacks.MC_ENTITY_TAKE_DMG, Mod.immortality, EntityType.ENTITY_PLAYER)
