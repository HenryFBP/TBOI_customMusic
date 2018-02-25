# views.py
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json

import requests
from django.conf import settings
from django.http import *
from django.shortcuts import render
from django.template.response import TemplateResponse
from django.views.decorators.csrf import *
from django.views.decorators.http import *

import CustomMusic.apps as apps
from CustomMusic import *
from CustomMusic.models import *


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
        append = request.GET.get('name') # which music file do they want?
    else:
        print("Wasn't asked for a specific location for music XML file. using this:")
        print(append)

    music_loc = settings.PROJECT_PATH + settings.STATIC_URL + append

    print("Sending music.json file!")

    with open(music_loc) as data_file:

        dict = json.load(data_file)

        for (room, songs) in dict["rooms"].items():  # go through all rooms
            print(f"{room}:")

            i = 0
            for song in songs:  # go through all songs for a room
                print(f"{i}th song: {song}")

                #if it's a string
                if isinstance(song, str):

                    # if it's a link to a bandcamp album
                    if 'bandcamp' in song:

                        #if it's not a bare .mp3 stream file
                        if 'bcbits.com/stream/' not in song:

                            # it's a link to an album OR track page from bandcamp
                            if ('/album/' in song) or ('/track/' in song):
                                print(f"We're gonna have to get BC MP3 URLS from {song}. ")
                                songsFromAlbum = apps.album_to_mp3s(song)

                                del dict["rooms"][room][i]  # remove useless URL

                                for name, mp3loc in songsFromAlbum.items():  # go thru all mp3s

                                    songEntry = {"name": name, "uri": mp3loc}
                                    dict["rooms"][room].append(songEntry)

                    else:  # we don't want to get from bandcamp, but it's still a string... probably
                        songEntry = {"name": song.split('/')[-1], "uri":song}

                        dict["rooms"][room][i] = songEntry # replace bare URI with dict entry

                else: # not a string, don't care. assume user know's what they're doing.
                    pass

                i += 1 #unconditionally increment

    with open(music_loc + '.compiled.tmp', 'w') as outfile:
        json.dump(dict, outfile, sort_keys=True, indent=4, separators=(',', ': ',))

    return HttpResponse(json.dumps(dict), content_type="application/json")


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

    all_rooms = RoomEntry.objects.all()

    print("All room changes: ")
    print(repr(all_rooms))

    if all_rooms.count() <= 0:
        print("No changes. Returning '0'.")
        return HttpResponse('0')

    print("Changes were detected! Sending ALL previous rooms visited...")

    dicts = [obj.as_dict() for obj in all_rooms]
    jsondata = json.dumps({"data": dicts})

    print("Returning this:")
    print(jsondata)

    RoomEntry.objects.all().delete()  # delete ALL rooms because we sent it to browser
    print("Deleted all room visits.")

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
    respData = f"Thanks for telling us you're in room '{repr(data)}'!"
    room = data['room']

    print(respData)
    print("We're going to record it!")

    r = RoomEntry(type=room)

    r.save()

    return HttpResponse(respData)


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
