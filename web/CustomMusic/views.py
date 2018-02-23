# views.py
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json

import requests
from django.conf import settings
from django.http import *
from django.template.response import TemplateResponse
from django.views.decorators.csrf import *
from django.views.decorators.http import *
from django.shortcuts import render

from CustomMusic import *
from CustomMusic.models import *
import CustomMusic.apps as apps


# Create your views here.

# homepage
def index(request: HttpRequest):
    t = TemplateResponse(request, 'index.html', {})

    t.render()

    return HttpResponse(t.content)


# music XML file
def music(request: HttpRequest):
    music_loc = settings.PROJECT_PATH + settings.STATIC_URL + 'music.json'

    print("Sending music.json file!")

    return HttpResponse(open(music_loc).read())


# they want a song
def play(request: HttpRequest):
    print("Person wants to play song here:")
    print("Full path: " + request.get_full_path())
    print("Absolute URI: " + request.build_absolute_uri())

    path = settings.MEDIA_ROOT + request.get_full_path().split('/')[-1]

    print("Actual path we should use: " + path)

    return StreamingHttpResponse()

#server diagnostics page
def diagnosticsOld(request: HttpRequest):
    t = TemplateResponse(request, 'diagnostics.html', {})

    t.render()

    return HttpResponse(t.content)

# turn off server
def shutdown(request: HttpRequest):
    print("Someone wants to shut down!")

    resp = "Shutting down server."

    try:
        signal.signal(signal.SIGINT, my_signal_handler)
    except Exception as e:
        print(e)
        resp = "Couldn't shut down:"
        resp += "<br>"+repr(e)

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

