import sys
import os

debug = False

os_type = sys.platform
mod_name = 'CustomMusic'
runtime = 'python'

host = 'localhost'
port = 8000

messages_path = "/messages"
messages_file = "msg.log"

file_watcher_script = 'file_watcher.py'
server_script = '/web/manage.py'
script_path = os.path.dirname(sys.argv[0])

message = {"defaultsettings": "message"}
