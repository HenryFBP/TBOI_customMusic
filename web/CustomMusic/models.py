# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
import time


def rightnow():
    return time.time()

# Create your models here.

class RoomEntry(models.Model):
    id = models.IntegerField(primary_key=True)
    type = models.CharField(max_length=200)
    time = models.IntegerField(default=rightnow)

    def __str__(self):
        return f"[{id} @ {time}]: {type} "

    def as_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "time": self.time,
        }

    def as_json(self):
        return "GO AWAY IM NOT IMPLEMENTED YET >:("




