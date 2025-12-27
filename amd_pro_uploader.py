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
    flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, SCOPES)
    credentials = flow.run_local_server(port=0)
    return googleapiclient.discovery.build(API_SERVICE_NAME, API_VERSION, credentials=credentials)

def upload_thumbnail(youtube, video_id, image_path):
    print(f"🖼️ FOUND THUMBNAIL: {image_path}... Uploading.")
    try:
        youtube.thumbnails().set(
            videoId=video_id,
            media_body=MediaFileUpload(image_path)
        ).execute()
        print("✅ THUMBNAIL ATTACHED SUCCESSFULLY.")
    except Exception as e:
        print(f"❌ THUMBNAIL FAILED: {e}")

def upload_video(youtube, file_path, title, description, privacy_status="public"):
    try:
        print(f"🚀 UPLOADING VIDEO: {title} (Status: {privacy_status})")
        
        body = {
            "snippet": {
                "title": title,
                "description": description,
                "tags": ["AMD Solutions 007", "AI", "Tech", "Nigeria", "Automation"],
                "categoryId": "28" # Science & Technology
            },
            "status": {
                "privacyStatus": privacy_status, # NOW SET TO PUBLIC
                "selfDeclaredMadeForKids": False
            }
        }

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

        video_id = response['id']
        print(f"✅ VIDEO UPLOAD COMPLETE! ID: {video_id}")
        return video_id

    except Exception as e:
        print(f"❌ VIDEO UPLOAD FAILED: {e}")
        return None

def scan_and_upload():
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    files = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith(('.mp4', '.mov'))]
    
    if not files:
        print("👀 No videos found in 'Ready_to_Upload'.")
        return

    youtube = get_authenticated_service()

    for video_file in files:
        file_path = os.path.join(UPLOAD_FOLDER, video_file)
        base_name = os.path.splitext(video_file)[0]
        
        # 1. READ CUSTOM DESCRIPTION (Look for .txt file)
        desc_file = os.path.join(UPLOAD_FOLDER, base_name + ".txt")
        if os.path.exists(desc_file):
            with open(desc_file, 'r') as f:
                video_desc = f.read()
            print(f"📝 Custom Description Found.")
        else:
            video_desc = "Uploaded by AMD Solutions 007 AI.\n\nSubscribe for more innovations."

        # 2. UPLOAD VIDEO (PUBLIC)
        video_id = upload_video(youtube, file_path, base_name, video_desc, privacy_status="public")

        if video_id:
            # 3. UPLOAD THUMBNAIL (Look for .jpg/.png)
            thumb_path = os.path.join(UPLOAD_FOLDER, base_name + ".jpg")
            if not os.path.exists(thumb_path):
                 thumb_path = os.path.join(UPLOAD_FOLDER, base_name + ".png")
            
            if os.path.exists(thumb_path):
                upload_thumbnail(youtube, video_id, thumb_path)
                # Ensure archive exists before moving thumbnail
                if not os.path.exists(ARCHIVE_FOLDER):
                    os.makedirs(ARCHIVE_FOLDER)
                shutil.move(thumb_path, os.path.join(ARCHIVE_FOLDER, os.path.basename(thumb_path)))

            # 4. ARCHIVE VIDEO
            if not os.path.exists(ARCHIVE_FOLDER):
                os.makedirs(ARCHIVE_FOLDER)
            shutil.move(file_path, os.path.join(ARCHIVE_FOLDER, video_file))
            if os.path.exists(desc_file):
                shutil.move(desc_file, os.path.join(ARCHIVE_FOLDER, base_name + ".txt"))
            
            print(f"📦 Operation Complete for {base_name}")

if __name__ == "__main__":
    print("🤖 VECTOR 007 PRO UPLOADER (PUBLIC MODE) ACTIVATED.")
    scan_and_upload()