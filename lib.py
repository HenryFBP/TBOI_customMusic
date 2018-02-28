import time

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

    string = string\
        .replace("{",'')\
        .replace("}",'')

    ents = string.split(delim)

    for entity in ents:
        key, val = entity.split(eq)

        d[key] = val

    return d


if __name__ == '__main__':

    x = "potato=good,tomato=yuck"

    print(x)
    print(strtodict(x))