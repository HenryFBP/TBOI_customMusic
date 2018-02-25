--- lib.lua
--- Custom Music Mod by HenryFBP.
-- https://github.com/HenryFBP/TBOI_customMusic
--


local lib = {}

function lib.test()
    return "i am lib test func."
end

--- Pads str to length len with char from right
function stringlpad(str, len, char)
    if char == nil then char = ' ' end
    return str .. string.rep(char, len - #str)
end

--- Pads str to length len with char from left
function stringrpad(str, len, char)
    if char == nil then char = ' ' end
    return string.rep(char, len - #str) .. str
end

function lib.time()
    local s = os.clock()

    s = string.format("%.2f", s);

    return "[" .. s .. "]:"
end

function lib.tableinvert(t)
    local s = {}
    for k, v in pairs(t) do
        s[v] = k
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