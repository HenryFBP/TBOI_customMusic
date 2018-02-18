# views.py
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from os.path import relpath

import sys
from custommusic.models import *
from django.conf import settings
from django.http import *
from django.template.response import TemplateResponse
from django.views.decorators.csrf import *
from django.views.decorators.http import *
import logging
import json


# Create your views here.

# homepage
def index(request: HttpRequest):
    t = TemplateResponse(request, 'test_template.html', {})

    t.render()

    return HttpResponse(t.content)


# music XML file
def music(request: HttpRequest):
    music_loc = settings.PROJECT_PATH + settings.STATIC_URL + 'music.json'

    print("Sending music.json file!")

    return HttpResponse(open(music_loc).read())

    pass


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

    RoomEntry.objects.all().delete() # delete ALL rooms because we sent it to browser
    print("Deleted all room visits.")

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
