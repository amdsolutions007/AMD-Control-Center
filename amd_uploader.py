import os
import time
import shutil
import google_auth_oauthlib.flow
import googleapiclient.discovery
import googleapiclient.errors
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

# --- VECTOR 007 CONFIGURATION ---
CLIENT_SECRETS_FILE = "client_secret.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.force-ssl"]
API_SERVICE_NAME = "youtube"
API_VERSION = "v3"

# --- FOLDER PATHS ---
UPLOAD_FOLDER = "Ready_to_Upload"
ARCHIVE_FOLDER = "Uploaded_Archive"

def get_authenticated_service():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
                CLIENT_SECRETS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return googleapiclient.discovery.build(API_SERVICE_NAME, API_VERSION, credentials=creds)

def upload_video(youtube, file_path, title, description):
    try:
        print(f"🚀 INITIATING UPLOAD FOR: {title}")
        
        body = {
            "snippet": {
                "title": title,
                "description": description,
                "tags": ["AMD Solutions 007", "AI", "Tech", "Nigeria"],
                "categoryId": "28" # Science & Technology
            },
            "status": {
                "privacyStatus": "private" # UPLOADS AS PRIVATE FIRST (SAFETY CHECK)
            }
        }

        # Call the API to upload
        media_body = MediaFileUpload(file_path, chunksize=-1, resumable=True)
        request = youtube.videos().insert(
            part="snippet,status",
            body=body,
            media_body=media_body
        )

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                print(f"⏳ Uploading... {int(status.progress() * 100)}%")

        print(f"✅ UPLOAD COMPLETE! Video ID: {response['id']}")
        return True

    except Exception as e:
        print(f"❌ UPLOAD FAILED: {e}")
        return False

def scan_and_upload():
    # Check if folder exists
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
        print(f"📂 Created folder: {UPLOAD_FOLDER}")

    # List files
    files = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith(('.mp4', '.mov'))]
    
    if not files:
        print("👀 No videos found in 'Ready_to_Upload'. Waiting for ammo...")
        return

    # Authenticate ONCE
    youtube = get_authenticated_service()

    for video_file in files:
        file_path = os.path.join(UPLOAD_FOLDER, video_file)
        
        # Use filename as Title for now (remove .mp4)
        video_title = os.path.splitext(video_file)[0]
        video_desc = "Uploaded automatically by AMD Solutions 007 AI Agent.\n\nSubscribe for more."

        # Execute Upload
        success = upload_video(youtube, file_path, video_title, video_desc)

        if success:
            # Move to Archive so we don't upload it again
            if not os.path.exists(ARCHIVE_FOLDER):
                os.makedirs(ARCHIVE_FOLDER)
            shutil.move(file_path, os.path.join(ARCHIVE_FOLDER, video_file))
            print(f"📦 Moved {video_file} to Archive.")

if __name__ == "__main__":
    print("🤖 VECTOR 007 AUTO-UPLOADER ACTIVATED.")
    scan_and_upload()