StartDebug()

local Mod = RegisterMod("CustomMusic", 1)

Isaac.DebugString("custom music mod?? hi!")


function Mod:onRender()
    local x = Isaac.GetPlayer(0).Position.X
    local y = Isaac.GetPlayer(0).Position.Y
    Isaac.RenderText("hi. x="..x..",y="..y, x, y, 255, 255, 255, 255)
end

function Mod:immortality()
    local p = Isaac.GetPlayer(0)
    p:SetFullHearts()
end


Mod:AddCallback(ModCallbacks.MC_POST_RENDER, Mod.onRender)
-- Mod:AddCallback(ModCallbacks.MC_ENTITY_TAKE_DMG, Mod.immortality, EntityType.ENTITY_PLAYER)
