import os
import sys

import requests

_debug = False
_append = ''

# we want to PAUSE the console if in debug mode
if _debug:
    _append = ' && PAUSE'

_host = 'localhost'
_port = 8000
_modName = 'CustomMusic'
_scriptPath = os.path.dirname(sys.argv[0])  # 0th one is always name of script

_serverScript = '/web/manage.py'
_runt = 'python'

# message is everything after 0th arg
_message = ""

if isinstance(sys.argv, list) and len(sys.argv) > 1:
    for i in range(1, len(sys.argv)):
        _message += sys.argv[i]



print(f'sys.argv: {repr(sys.argv)}')
print(f'Script directory: {_scriptPath}')
print(f"Sending message '{_message}'")


def startServer():
    command = f'cmd /K start {_runt} "{_scriptPath + _serverScript}" runserver {_host}:{_port}' + _append
    print(f"Command: '{command}'")
    return os.popen(command+_append)


try:
    r = requests.post(f'http://{_host}:{str(_port)}/post/', data={"room":_message})

    print(f"Sent '{_message}' to '{_host}:{str(_port)}'")

    print(r.status_code)

    r.close()

    if _debug:
        sys.exit(1)
    else:
        while True:
            input("Waiting 'cuz debug mode is on.")

except Exception as e:
    print(f'I\'m going to assume that the "{_modName}" server is NOT running, so I\'m going to start it.')
    print('')
    startServer()
    if _debug:
        sys.exit(1)
    else:
        while True:
            input("Waiting 'cuz debug mode is on.")

# except Exception as e:
#     print("Unhandled exception:")
#     print(e)

