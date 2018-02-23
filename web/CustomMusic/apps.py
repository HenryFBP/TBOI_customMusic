# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.apps import AppConfig
import requests
import re
from pprint import pprint

fileRX = re.compile(r'''"title":"(.+?)".+?"file":.+?(http.+?)\"\}''')

cache_albums = {}

class CustommusicConfig(AppConfig):
    name = 'CustomMusic'

def album_to_mp3s(albumURL: str, overwrite: bool=False, cache: bool=True) -> {}:
    """
    Turn a bandcamp album URL into a dict of {name:url} MP3 URLs.
    """
    print("Passed this URL:")
    print(albumURL)

    #if for some reason we want to get a fresh list
    if overwrite:
        if albumURL in cache_albums:
            del cache_albums[albumURL]

    if albumURL in cache_albums: #if we've already done it, return cached MP3 URLs.
        print(f"Already seen '{albumURL}', returning cached MP3 URLs.")
        return cache_albums[albumURL]

    resp = requests.get(albumURL) # ask bandcamp for their album.html content

    htmlString = resp.content.decode('utf-8') # binary -> string

    matches = re.findall(fileRX, htmlString) # get all matches

    songs = {} # dict

    for (name, url) in matches: # use our capturing groups
        songs[name] = url

    pprint(songs)

    if(cache):
        cache_albums[albumURL] = songs # cache it if we want to

    return songs

if __name__ == '__main__':
    album_to_mp3s('https://murderchannel.bandcamp.com/album/keep-the-fire')
