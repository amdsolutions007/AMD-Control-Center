#!/usr/bin/env python3
import os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import googleapiclient.discovery
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]

def get_authenticated_service():
    if not os.path.exists('token.json'):
        print('token.json not found. Cannot authenticate without interactive login.')
        return None

    creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        except Exception as e:
            print('Failed to refresh credentials:', e)
            return None

    return googleapiclient.discovery.build('youtube', 'v3', credentials=creds)

def find_video_id(youtube, title_substring='AMD_Manifesto_Final', prefer_id=None):
    # Try to find by listing uploads playlist
    channels_resp = youtube.channels().list(part='contentDetails,snippet', mine=True).execute()
    if not channels_resp.get('items'):
        print('No channel found.')
        return None

    uploads_playlist_id = channels_resp['items'][0]['contentDetails']['relatedPlaylists']['uploads']

    next_page = None
    while True:
        resp = youtube.playlistItems().list(
            playlistId=uploads_playlist_id,
            part='snippet',
            maxResults=50,
            pageToken=next_page
        ).execute()

        for item in resp.get('items', []):
            vid = item['snippet']['resourceId']['videoId']
            title = item['snippet']['title']
            if prefer_id and vid == prefer_id:
                return vid
            if title_substring in title:
                return vid

        next_page = resp.get('nextPageToken')
        if not next_page:
            break

    return None

def set_channel_trailer(youtube, video_id):
    try:
        # Get channel id
        ch_resp = youtube.channels().list(part='brandingSettings', mine=True).execute()
        if not ch_resp.get('items'):
            print('Channel not found')
            return False

        channel_id = ch_resp['items'][0]['id']

        body = {
            'id': channel_id,
            'brandingSettings': {
                'channel': {
                    'unsubscribedTrailer': video_id
                }
            }
        }

        youtube.channels().update(part='brandingSettings', body=body).execute()
        return True

    except HttpError as e:
        status = getattr(e, 'resp', None)
        code = None
        if status:
            code = getattr(status, 'status', None)
        if code == 403:
            print('API BLOCKED. RECOMMEND SELENIUM BOT.')
        else:
            print('HTTP error setting trailer:', e)
        return False
    except Exception as e:
        print('Error setting trailer:', e)
        return False

def main():
    youtube = get_authenticated_service()
    if youtube is None:
        return

    # Prefer exact known ID if available
    preferred_id = 'ZIkIbUJ9k_4'
    vid = find_video_id(youtube, title_substring='AMD_Manifesto_Final', prefer_id=preferred_id)
    if not vid:
        print('AMD_Manifesto_Final not found in uploads.')
        return

    print('Found AMD_Manifesto_Final ID:', vid)

    ok = set_channel_trailer(youtube, vid)
    if ok:
        print('Channel trailer set to', vid)
    else:
        print('Failed to set channel trailer.')

if __name__ == '__main__':
    main()
