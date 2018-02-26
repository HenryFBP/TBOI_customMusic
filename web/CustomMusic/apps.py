# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import re
from pprint import pprint

import requests
from django.apps import AppConfig

albumRX = re.compile(r'''"title":"(.+?)".+?"file":.+?(http.+?)\"\}''')

cache_albums = {}


class CustommusicConfig(AppConfig):
    name = 'CustomMusic'


def album_to_mp3s(albumURL: str, overwrite: bool = False, cache: bool = True) -> {}:
    """
    Turn a bandcamp album URL into a dict of {name:url} MP3 URLs.
    """
    print("Passed this URL:")
    print(albumURL)

    # if for some reason we want to get a fresh list
    if overwrite:
        if albumURL in cache_albums:
            del cache_albums[albumURL]

    if albumURL in cache_albums:  # if we've already done it, return cached MP3 URLs.
        print(f"Already seen '{albumURL}', returning cached MP3 URLs.")
        return cache_albums[albumURL]

    resp = requests.get(albumURL)  # ask bandcamp for their album.html content

    htmlString = resp.content.decode('utf-8')  # binary -> string

    matches = re.findall(albumRX, htmlString)  # get all matches

    songs = {}  # dict

    for (name, url) in matches:  # use our capturing groups
        songs[name] = url

    pprint(songs)

    if cache:
        cache_albums[albumURL] = songs  # cache it if we want to

    return songs


def song_to_mp3s(songURL: str, overwrite: bool = False, cache: bool = True):
    """
    Turn a bandcamp song URL into a dict of the song's {name:url}.
    """
    return album_to_mp3s(songURL, overwrite, cache)  # it works so why use a different one? hehe.


def process_room(roomName, songs):
    """
    Turn an unprocessed list of music into a processed one.
    """

    processedRoom = {roomName: []}

    for song in songs:  # go through all songs for a room

        # if it's a string
        if isinstance(song, str):

            # if it's a link to a bandcamp album
            if 'bandcamp' in song:

                # if it's not a bare .mp3 stream file
                if 'bcbits.com/stream/' not in song:

                    # it's a link to an album OR track page from bandcamp
                    if ('/album/' in song) or ('/track/' in song):
                        print(f"We're gonna have to get BC MP3 URLS from {song}. ")
                        songsFromAlbum = album_to_mp3s(song)

                        for name, mp3loc in songsFromAlbum.items():  # go thru all mp3s

                            songEntry = {"name": name, "uri": mp3loc}
                            processedRoom[roomName].append(songEntry)

            else:  # we don't want to get from bandcamp, but it's still a string... probably
                songEntry = {"name": song.split('/')[-1], "uri": song}

                processedRoom[roomName].append(songEntry)  # replace bare URI with dict entry

        else:  # not a string, don't care. assume user know's what they're doing.
            processedRoom[roomName].append(song)

    return processedRoom


if __name__ == '__main__':
    album_to_mp3s('https://murderchannel.bandcamp.com/album/keep-the-fire')
