--- lib.lua
--- Custom Music Mod by HenryFBP.
-- https://github.com/HenryFBP/TBOI_customMusic
--



local lib = {}

function lib.test()
    return "i am lib test func."
end

function lib.time()
  return "["..os.clock().."]:"
end

function lib.tableinvert(t)
   local s={}
   for k,v in pairs(t) do
     s[v]=k
   end
   return s
end

function lib.getkeys(t)
  local klst = {}
  local i = 1

  for key, value in pairs(t) do
    klst[i] = key
    i = i + 1
  end

  return k
end

return lib