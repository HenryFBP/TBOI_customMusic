import sys
import lib
import settings

try:
    import requests
except Exception as e:
    lib.log(str(e))
    lib.wait(m="'requests' library not found.\nTry 'pip install requests'?")
    

def sendMessage(message, host=settings.host, port=settings.port):

    message = message.replace(' ','') # remove whitespace

    d = lib.strtodict(message)

    r = requests.post(f'http://{host}:{str(port)}/post/', data=d)

    print(f"Sent '{d}' to '{host}:{str(port)}'")

    print(r.status_code)

    r.close()


if __name__ == '__main__':
    try:        
        sendMessage(settings.message)

        sys.exit(1)
    except Exception as e:
        lib.log(str(e))

