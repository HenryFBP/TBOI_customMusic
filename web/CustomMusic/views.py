# views.py
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
from pprint import pprint

import requests
from django.conf import settings
from django.http import *
from django.shortcuts import render
from django.template.response import TemplateResponse
from django.views.decorators.csrf import *
from django.views.decorators.http import *

import CustomMusic.apps as apps
from CustomMusic import *
from CustomMusic.models import FloorEntry, RoomEntry


# Create your views here.

# homepage
def index(request: HttpRequest):
    t = TemplateResponse(request, 'index.html', {})

    t.render()

    return HttpResponse(t.content)


# music XML file
def music(request: HttpRequest):
    append = 'music.json'

    if request.GET.get('name'):
        append = request.GET.get('name')  # which music file do they want?
    else:
        print("Wasn't asked for a specific location for music XML file. using this:")
        print(append)

    music_loc = settings.PROJECT_PATH + settings.STATIC_URL + append

    print("Sending music.json file!")

    respDict = {}

    with open(music_loc) as data_file:  # open music.json

        dict = json.load(data_file)  # turn into dict

        respDict["rooms"] = []  # empty processed room list
        for (roomName, songs) in dict["rooms"].items():  # go through all rooms
            room = apps.process_room(roomName, songs)  # process it
            respDict["rooms"].append(room)  # add to response

        respDict["floors"] = []  # empty processed floor list
        for (floorName, songs) in dict["floors"].items():  # go though all floors
            floor = apps.process_room(floorName, songs)  # process it
            respDict["floors"].append(floor)

    print("Response is:")
    pprint(respDict)

    with open(music_loc + '.compiled.tmp', 'w') as outfile:  # store prettily in temp file
        json.dump(respDict, outfile, sort_keys=True, indent=4, separators=(',', ': ',))

    return HttpResponse(json.dumps(respDict), content_type="application/json")


# they want a song
def play(request: HttpRequest):
    print("Person wants to play song here:")
    print("Full path: " + request.get_full_path())
    print("Absolute URI: " + request.build_absolute_uri())

    path = settings.MEDIA_ROOT + request.get_full_path().split('/')[-1]

    print("Actual path we should use: " + path)

    return StreamingHttpResponse()


# turn off server
def shutdown(request: HttpRequest):
    print("Someone wants to shut down!")

    resp = "Shutting down server."

    try:
        signal.signal(signal.SIGINT, my_signal_handler)
    except Exception as e:
        print(e)
        resp = "Couldn't shut down:"
        resp += "<br>" + repr(e)

    return HttpResponse(resp)


# to ask if we should change songs
def query(request: HttpRequest):
    print("Being asked if we should change songs.")

    rooms = RoomEntry.objects.all()
    floors = FloorEntry.objects.all()

    if rooms.count() <= 0 and floors.count() <= 0:
        print("No changes. Returning '0'.")
        return HttpResponse('0')

    print("Changes were detected! Sending ALL previous rooms/floors visited...")

    dicts = {
        "rooms": [r.as_dict() for r in rooms],
        "floors": [l.as_dict() for l in floors]
    }

    jsondata = json.dumps(dicts)

    print("Returning this:")
    print(jsondata)

    # delete ALL stuffs because we sent it to browser
    RoomEntry.objects.all().delete()
    FloorEntry.objects.all().delete()

    return HttpResponse(jsondata, content_type="application/json")


# for cross origin requests
def CORS(request: HttpRequest):
    url = request.GET.get('url')

    print("Want to GET this thing:" + url)

    req = requests.get(url)

    data = req.content

    d = {}

    d.get()

    print("We got back:")
    print(str(data)[0:1000])

    return HttpResponse(data)


# they want to turn a bandcamp album URL into a list of MP3s.
def album_to_MP3s(request: HttpRequest):
    url = request.GET.get('url')

    mp3s = apps.album_to_mp3s(url)

    # print("MP3s gotten back: ")
    # print(mp3s)

    jsondata = json.dumps(mp3s)

    return HttpResponse(jsondata, content_type="application/json")


# POST from isaac client
@csrf_exempt  # idc about no got damn security!!!
@require_POST
def post(request: HttpRequest):
    data = request.POST

    if 'room' in data:
        r = RoomEntry(type=data['room'])
        print(f"Thanks for telling us you're in room '{str(r)}'!")
        r.save()

    if 'floor' in data:
        l = FloorEntry(type=data['floor'])
        print(f"Thanks for telling us you're in floor '{str(l)}'!")
        l.save()

    return HttpResponse(json.dumps(request.POST))  # spit it back out at em


def diagnostics(request: HttpRequest):
    diags = {}

    try:
        import pprint
        diags['pprint'] = [True]
    except ImportError as e:
        diags['pprint'] = [False, e]

    try:
        import requests
        diags['requests'] = [True]
    except ImportError as e:
        diags['requests'] = [False, e]

    try:
        import corsheaders
        diags['corsheaders'] = [True]
    except ImportError as e:
        diags['corsheaders'] = [False, e]

    return render(request, 'diagnostics.html', {'diags': diags})
