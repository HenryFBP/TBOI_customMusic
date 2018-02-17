# views.py
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import sys

from django.http import *
from django.views.decorators.csrf import *
from django.views.decorators.http import *
from django.template.response import  TemplateResponse

# Create your views here.

# homepage
def index(request: HttpRequest):

    t = TemplateResponse(request, 'test_template.html', {})

    t.render()

    return HttpResponse(t.content)


# to ask if we should change songs
def should_change():
    pass

# POST from isaac client
@csrf_exempt  # idc about no got damn security!!!
@require_POST
def post(request: HttpRequest):

    data = request.POST
    respData = f"Thanks for telling us you're in room '{repr(data)}'!"

    print(respData)



    return HttpResponse(respData)