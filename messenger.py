try:
    import sys
    import os
    import time
except Exception as e:
    print(e)
    input("Couldn't import basic modules.")


def wait(t=60 * 10, m="Waiting 'cuz debug mode is on."):
    print(m)
    time.sleep(t)


class settings:
    debug = False

    os_type = sys.platform
    mod_name = 'CustomMusic'
    runtime = 'python'

    host = 'localhost'
    port = 8000

    server_script = '/web/manage.py'
    script_path = os.path.dirname(sys.argv[0])

    message = {"defaultsettings": "message"}


try:
    import requests
except:
    wait(m="'requests' library not found.\nTry 'pip install requests'?")

if isinstance(sys.argv, list) and len(sys.argv) > 1:

    args = ""

    for i in range(1, len(sys.argv)):
        args += sys.argv[i]

    print("Args: ")
    print(args)

    argsl = args.split('=')

    settings.message = {argsl[0]: argsl[1]}  # room: room1, or level: level2

print(f'sys.argv: {repr(sys.argv)}')
print(f'Script directory: {settings.script_path}')


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


def sendMessage(message, host=settings.host, port=settings.port):
    try:
        r = requests.post(f'http://{host}:{str(port)}/post/', data=message)

        print(f"Sent '{message}' to '{host}:{str(port)}'")

        print(r.status_code)

        r.close()

    except Exception as e:
        print(f'I\'m going to assume that the "{settings.mod_name}" server is NOT running, so I\'m going to start it.')
        print('')
        startServer(debug=settings.debug)

    if settings.debug:
        wait()

sendMessage(settings.message)

sys.exit(1)
