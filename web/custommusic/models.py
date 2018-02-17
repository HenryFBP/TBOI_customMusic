# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.

class RoomEntry(models.Model):
    type = models.CharField(max_length=200)
    time = models.IntegerField(default=0)