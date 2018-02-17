import os
import sys
import subprocess
import urllib.error
import urllib.request
import urllib.response

_host = 'localhost'
_port = 8000
_modName = 'customMusic'
_scriptPath = os.path.dirname(sys.argv[0]) # 0th one is always name of script

# message is everything after 0th arg
_message = ''
if isinstance(sys.argv, list) and len(sys.argv) > 1:
    for i in range(1, len(sys.argv)):
        _message += sys.argv[i]

_serverScript = './web/manage.py'
_runt = 'py'

print(f'sys.argv: {str(sys.argv)}')
print(f'Script directory: {_scriptPath}')
print(f"Sending message '{_message}'")

try:
    f = urllib.request.urlopen(f'http://{_host}:{str(_port)}').read()

    print(f"Successfully sent '{_message}' to '{_host}:{_port}'")

    print(f.read().decode('utf-8'))

except (ConnectionRefusedError, urllib.error.URLError) as e:

    print(f'Connection refused by {_host}:{str(_port)}.')
    print(f'I\'m going to assume that the "{_modName}" server is NOT running, so I\'m going to start it.')
    print('')
    print(e)

    # non-blocking Popen as opposed to os.system
    os.popen(f'cmd /K start {_runt} "{_scriptPath + _serverScript}" runserver {_host}:{_port}')
