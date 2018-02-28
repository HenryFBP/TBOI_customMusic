import sys
import os
import time

import settings

from watchdog.observers import Observer
from watchdog.events import *

print(os.path.dirname(sys.argv[0]))

path = os.path.dirname(sys.argv[0]) + os.path.join(settings.messages_path)

print(f"Watching folder {path} for files changed by Lua.")


class MyHandler(FileSystemEventHandler):

    most_recent_data = []

    def on_modified(self, event):

        data = []

        f = open(event.src_path, "r")

        for line in f:
            data.append(line)

        f.close()

        if set(data) & set(self.most_recent_data):  # if messages are the same
            return

        self.most_recent_data = data #record that we have a new message

        print(self.most_recent_data)


if __name__ == '__main__':

    event_handler = MyHandler()

    observer = Observer()
    observer.schedule(event_handler, path, recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
