# views.py
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import *
from django.template.response import TemplateResponse
from django.views.decorators.csrf import *
from django.views.decorators.http import *
from django.conf import settings
from django.conf.urls.static import static
from os.path import relpath

from custommusic.models import *


# Create your views here.

# homepage
def index(request: HttpRequest):
    t = TemplateResponse(request, 'test_template.html', {})

    t.render()

    return HttpResponse(t.content)

# music XML file
def music(request: HttpRequest):

    music_loc = settings.STATIC_URL+'music.json'
    music_loc = relpath(music_loc, "/")

    print("Sending music.json file!")

    return HttpResponse(open(music_loc).read())

    pass


# to ask if we should change songs
def should_change(request: HttpRequest):
    pass


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
