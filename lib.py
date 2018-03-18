import os.path
import time

import settings


def log(msg, path=os.path.join(settings.script_path, 'log.txt')):
    if os.path.isfile(path):
        file = open(path, 'a')
    else:
        file = open(path, 'w+')

    file.write(f"[{str(time.time())}]\n")
    file.write(msg)
    file.write("\n\n")

    file.close()


def wait(t=60 * 10, m="Waiting 'cuz debug mode is on."):
    print(m)
    time.sleep(t)


def strtodict(string: str, delim=',', eq="="):
    """

    :param string:
    :return:
    Example:
    strtodict("potato=good,tomato=yuck") -> {"potato": "good", "tomato": "yuck"}
    """

    d = {}

    string = string \
        .replace("{", '') \
        .replace("}", '')

    ents = string.split(delim)

    for entity in ents:
        key, val = entity.split(eq)

        d[key] = val

    return d


if __name__ == '__main__':
    x = "potato=good,tomato=yuck"

    print(x)
    print(strtodict(x))
