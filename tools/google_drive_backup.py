"""
Google Drive Auto-Backup System
Backs up .env files and logs to Google Drive daily
"""

import os
import shutil
from pathlib import Path
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import pickle

# Scopes for Google Drive
SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_drive_service():
    """Authenticate and return Google Drive service"""
    creds = None
    token_path = Path.home() / '.amd_google_token.pickle'
    
    # Load existing credentials
    if token_path.exists():
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)
    
    # Refresh or get new credentials
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            creds_file = Path(__file__).parent.parent / 'google_drive_credentials.json'
            if not creds_file.exists():
                return None, "Missing google_drive_credentials.json - Get it from: https://console.cloud.google.com/apis/credentials"
            
            flow = InstalledAppFlow.from_client_secrets_file(str(creds_file), SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save credentials
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)
    
    service = build('drive', 'v3', credentials=creds)
    return service, None

def create_backup_folder(service):
    """Create AMD_Backups folder in Drive if it doesn't exist"""
    query = "name='AMD_Backups' and mimeType='application/vnd.google-apps.folder'"
    results = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
    folders = results.get('files', [])
    
    if folders:
        return folders[0]['id']
    
    # Create folder
    file_metadata = {
        'name': 'AMD_Backups',
        'mimeType': 'application/vnd.google-apps.folder'
    }
    folder = service.files().create(body=file_metadata, fields='id').execute()
    return folder['id']

def backup_file(service, file_path, folder_id):
    """Upload a file to Google Drive"""
    file_path = Path(file_path)
    if not file_path.exists():
        return False, f"File not found: {file_path}"
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
    
    file_metadata = {
        'name': backup_name,
        'parents': [folder_id]
    }
    
    media = MediaFileUpload(str(file_path), resumable=True)
    
    try:
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink'
        ).execute()
        
        return True, f"Backed up: {file['name']} - {file.get('webViewLink', '')}"
    except Exception as e:
        return False, f"Upload failed: {str(e)}"

def run_backup():
    """Main backup function"""
    print("🔄 Starting Google Drive backup...")
    
    service, error = get_drive_service()
    if error:
        print(f"❌ {error}")
        print("\n📝 SETUP INSTRUCTIONS:")
        print("1. Go to: https://console.cloud.google.com/apis/credentials")
        print("2. Create OAuth 2.0 Client ID (Desktop app)")
        print("3. Download JSON and save as: google_drive_credentials.json")
        print("4. Run this script again")
        return
    
    print("✅ Authenticated with Google Drive")
    
    # Create backup folder
    folder_id = create_backup_folder(service)
    print(f"✅ Backup folder ready: {folder_id}")
    
    # Files to backup
    base_path = Path(__file__).parent.parent
    files_to_backup = [
        base_path / '.env',
        base_path / 'social_engine' / 'social_engine.log',
    ]
    
    success_count = 0
    for file_path in files_to_backup:
        success, message = backup_file(service, file_path, folder_id)
        if success:
            print(f"✅ {message}")
            success_count += 1
        else:
            print(f"⚠️ {message}")
    
    print(f"\n✅ Backup complete: {success_count}/{len(files_to_backup)} files backed up")

if __name__ == '__main__':
    run_backup()
