import os
import sys

import requests

_host = 'localhost'
_port = 8000
_modName = 'customMusic'
_scriptPath = os.path.dirname(sys.argv[0])  # 0th one is always name of script

# message is everything after 0th arg
_message = ""

if isinstance(sys.argv, list) and len(sys.argv) > 1:
    for i in range(1, len(sys.argv)):
        _message += sys.argv[i]

_serverScript = './web/manage.py'
_runt = 'py'

print(f'sys.argv: {repr(sys.argv)}')
print(f'Script directory: {_scriptPath}')
print(f"Sending message '{_message}'")


def startServer():
    return os.popen(f'cmd /K start {_runt} "{_scriptPath + _serverScript}" runserver {_host}:{_port}')


try:
    r = requests.post(f'http://{_host}:{str(_port)}', _message)

    print(f"Sent '{_message}' to '{_host}:{str(_port)}'")

    print(r.status_code, r.reason)

except Exception as e:
    print(f'I\'m going to assume that the "{_modName}" server is NOT running, so I\'m going to start it.')
    print('')
    startServer()
    exit(1)

# except Exception as e:
#     print("Unhandled exception:")
#     print(e)
