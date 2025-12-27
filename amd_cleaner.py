import os
import google_auth_oauthlib.flow
import googleapiclient.discovery
import googleapiclient.errors
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

# --- VECTOR 007 CONFIGURATION ---
CLIENT_SECRETS_FILE = "client_secret.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]
API_SERVICE_NAME = "youtube"
API_VERSION = "v3"

# --- TARGETS TO ELIMINATE ---
# Prefer deleting by explicit video IDs for safety. If IDs are empty,
# the script will match by title substrings in `TARGET_TITLES`.
TARGET_IDS = [
    # IDs produced by the last upload run
    "Vw-dNkbGquU",  # AMD_Manifesto_Full
    "lPonElZMuZQ",  # manifesto_test
    "qhrUUpoB6ew",  # audio_test_007
]
TARGET_TITLES = ["AMD_Manifesto_Full", "manifesto_test", "audio_test_007"]

def get_authenticated_service():
    creds = None
    # Load cached credentials
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    # Refresh or obtain new credentials
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
                CLIENT_SECRETS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return googleapiclient.discovery.build(API_SERVICE_NAME, API_VERSION, credentials=creds)

def delete_video(youtube, video_id, video_title):
    try:
        print(f"💥 DESTROYING TARGET: {video_title} (ID: {video_id})...")
        youtube.videos().delete(id=video_id).execute()
        print(f"✅ TARGET ELIMINATED: {video_title}")
    except Exception as e:
        print(f"❌ FAILED TO DELETE {video_title}: {e}")

def scan_and_destroy(youtube):
    print("🛰️ SCANNING CHANNEL FOR TEST ASSETS...")
    
    # 1. Get Channel's "Uploads" Playlist ID
    channels_response = youtube.channels().list(
        mine=True,
        part="contentDetails"
    ).execute()
    
    uploads_playlist_id = channels_response["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
    
    # 2. Get list of recent videos
    playlist_response = youtube.playlistItems().list(
        playlistId=uploads_playlist_id,
        part="snippet",
        maxResults=10  # Scan last 10 uploads
    ).execute()
    
    found_targets = False

    for item in playlist_response["items"]:
        video_title = item["snippet"]["title"]
        video_id = item["snippet"]["resourceId"]["videoId"]

        # Safety: skip the Final Manifesto if present
        if "AMD_Manifesto_Final" in video_title or video_id == "ZIkIbUJ9k_4":
            continue

        # Prefer ID match
        if video_id in TARGET_IDS:
            found_targets = True
            delete_video(youtube, video_id, video_title)
            continue

        # Fallback to title substring match
        for target in TARGET_TITLES:
            if target in video_title:
                found_targets = True
                delete_video(youtube, video_id, video_title)
                break
                
    if not found_targets:
        print("👀 NO TARGETS FOUND. The channel is clean.")

if __name__ == "__main__":
    print("🤖 VECTOR 007 CLEANER AGENT ACTIVATED.")
    youtube_service = get_authenticated_service()
    scan_and_destroy(youtube_service)