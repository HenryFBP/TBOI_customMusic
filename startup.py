import os
import sys

import settings
import lib


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


def startFileWatcherWin(dir, debug=False, append=''):
    command = f'cmd /K start {settings.runtime} "{dir}"' + append
    print("Command:" + command)
    return os.popen(command)


def startFileWatcherLinux(dir, debug=False, append=''):
    pass


def startFileWatcherMac(dir, debug=False, append=''):
    pass


def startFileWatcher(OS=settings.os_type, dir=None, append='', debug=False):
    if dir is None:
        dir = os.path.join(settings.script_path, settings.file_watcher_script)

    if OS == 'win32' or OS == 'win64':
        return startFileWatcherWin(dir, debug, append)
    elif OS == 'linux' or OS == 'linux2':
        return startFileWatcherLinux(dir, debug, append)
    elif OS == 'darwin':
        return startFileWatcherMac(dir, debug, append)

    print(f"Don't know what OS '{OS}' is.")
    return None


if __name__ == '__main__':
    startFileWatcher()

    startServer()

    if settings.debug:
        lib.wait()