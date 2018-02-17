local testModule = {}

local _script = "python"
local _scriptMessenger = "test.py"
local _scriptServer = "server.py"

function testModule.test()
  return "HI MOM"
end

function testModule.send(message)
  Shell = luacom.CreateObject("WScript.Shell")
  Shell:Run (command, 0)
   os.execute(_script.." ".._scriptMessenger
)
end

return testModule