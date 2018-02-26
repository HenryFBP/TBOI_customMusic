# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import time

from django.db import models


def rightnow():
    return time.time()


# Create your models here.

class RoomEntry(models.Model):
    """
    Class that represents a single Room in TBOI.
    """
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


class FloorEntry(models.Model):
    """
    Class that represents a single Floor in TBOI.
    """
    id = models.IntegerField(primary_key=True)
    type = models.CharField(max_length=200)
    time = models.IntegerField(default=rightnow)

    def __str__(self):
        return f"{id} @ {time}: {type}"

    def as_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "time": self.time,
        }
