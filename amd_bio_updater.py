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

# --- THE NEW BIO DATA ---
NEW_BIO_TEXT = """Welcome to the Future of Media.

🛑 The Old Way is Dead.
AMD Media Solutions is the Intelligence Hub where Human Creativity meets Artificial Intelligence. We don't just "post content"—we engineer digital dominance.

Our Mission: Illuminating the Digital Dark.

What We Deploy:
🚀 AI & Software Engineering: Custom bots, "Japa" calculators, and automation tools.
📈 Algorithmic Warfare: We break the code of YouTube, Google, and Taboola to make movies and brands go viral.
🛡️ Digital Identity: We verify and fortify your online presence.

The Pilot: Solutions 007 (Man Powered by AI).

Subscribed? You are now part of the resistance.
📧 Direct Line: amdmediaoffice@gmail.com"""

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

def update_channel_branding(youtube, new_description):
    try:
        # 1. Get current channel info (we need the ID)
        request = youtube.channels().list(part="snippet", mine=True)
        response = request.execute()
        
        if not response['items']:
            print("❌ ERROR: No channel found.")
            return

        channel_id = response['items'][0]['id']
        current_title = response['items'][0]['snippet']['title']
        
        print(f"✅ CONNECTED TO: {current_title}")
        print("⏳ UPDATING BIO (SURGICAL STRIKE)...")

        # 2. Update ONLY the description (Title removed to fix 400 Error)
        update_request = youtube.channels().update(
            part="snippet",
            body={
                "id": channel_id,
                "snippet": {
                    "description": new_description
                }
            }
        )
        update_request.execute()
        
        print("------------------------------------------------")
        print("✅ SUCCESS: CHANNEL BIO UPDATED AUTOMATICALLY.")
        print("------------------------------------------------")

    except Exception as e:
        print(f"❌ AN ERROR OCCURRED: {e}")

if __name__ == "__main__":
    print("🤖 VECTOR 007: INITIATING CHANNEL UPDATE SEQUENCE...")
    youtube_service = get_authenticated_service()
    update_channel_branding(youtube_service, NEW_BIO_TEXT)