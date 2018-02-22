try:
    import sys
    import os
except Exception as e:
    print(e)
    input("Couldn't import basic modules.")


class settings:
    debug = False

    os_type = sys.platform
    mod_name = 'CustomMusic'
    runtime = 'python'

    host = 'localhost'
    port = 8000

    server_script = '/web/manage.py'
    script_path = os.path.dirname(sys.argv[0])
    
    message = "defaultsettings.message"


try:
    import requests
except:
    input("'requests' library not found.\nTry 'pip install requests'?")

if isinstance(sys.argv, list) and len(sys.argv) > 1:

    settings.message = "" # clear message if we have arg

    for i in range(1, len(sys.argv)):
        settings.message += sys.argv[i]

print(f'sys.argv: {repr(sys.argv)}')
print(f'Script directory: {settings.script_path}')
print(f"Sending message '{settings.message}'")


def startServerWin(debug=False, append=''):
    """
    Starts the TBOI music webserver for Windows.
    """
    command = f'cmd /K start {settings.runtime} "{settings.script_path + settings.server_script}" runserver {settings.host}:{settings.port}' + append
    print(f"Command: '{command}'")
    return os.popen(command)

def startServerLinux():
    """
    Starts the TBOI music webserver for Linux.
    """
    pass

def startServerMac():
    """
    Starts the TBOI music webserver for Mac.
    """
    pass

def startServer(os=settings.os_type, debug=False, append=''):
    if os == 'win32' or os == 'win64':
        return startServerWin(debug, append)
    elif os == 'linux' or os == 'linux2':
        return startServerLinux(debug, append)
    elif os == 'darwin':
        return startServerMac(debug, append)

    print(f"Don't know what OS '{os}' is.")
    return None

try:
    r = requests.post(f'http://{settings.host}:{str(settings.port)}/post/', data={"room": settings.message})

    print(f"Sent '{settings.message}' to '{settings.host}:{str(settings.port)}'")

    print(r.status_code)

    r.close()

    if settings.debug:
        input("Waiting 'cuz debug mode is on.")

except Exception as e:
    print(f'I\'m going to assume that the "{settings.mod_name}" server is NOT running, so I\'m going to start it.')
    print('')
    startServer(debug=settings.debug)

    if settings.debug:
        input("Waiting 'cuz debug mode is on.")

    sys.exit(1)

except Exception as e:
    print("Unhandled exception:")
    print(e)

    input("Sorry.")
