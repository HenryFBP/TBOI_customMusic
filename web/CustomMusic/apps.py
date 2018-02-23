# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.apps import AppConfig
import requests
import re
from pprint import pprint

fileRX = re.compile(r'''"title":"(.+?)".+?"file":.+?(http.+?\")\}''')

class CustommusicConfig(AppConfig):
    name = 'CustomMusic'

def album_to_mp3s(albumURL: str) -> {}:
    """
    Turn a bandcamp album URL into a dict of {name:url} MP3 URLs.
    """
    print("Passed this URL:")
    print(albumURL)

    resp = requests.get(albumURL)

    htmlString = resp.content.decode('utf-8')

    matches = re.findall(fileRX, htmlString )


    songs = {}

    for (name, url) in matches:
        songs[name] = url

    pprint(songs)

    return songs

if __name__ == '__main__':
    album_to_mp3s('https://murderchannel.bandcamp.com/album/keep-the-fire')
