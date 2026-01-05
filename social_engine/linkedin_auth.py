#!/usr/bin/env python3
"""
LinkedIn OAuth Authentication Flow
Generates Access Token for LinkedIn API
"""
import os
import sys
from dotenv import load_dotenv
import requests
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
import webbrowser
from threading import Thread
import time

print("🔐 LINKEDIN AUTHENTICATION PROTOCOL")
print("=" * 70)

# Load credentials
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/social_engine/.env')

CLIENT_ID = os.getenv('LINKEDIN_CLIENT_ID')
CLIENT_SECRET = os.getenv('LINKEDIN_CLIENT_SECRET')
REDIRECT_URI = os.getenv('LINKEDIN_REDIRECT_URI')

if not all([CLIENT_ID, CLIENT_SECRET, REDIRECT_URI]):
    print("❌ LinkedIn credentials not found in .env")
    sys.exit(1)

print(f"✅ Client ID: {CLIENT_ID}")
print(f"✅ Redirect URI: {REDIRECT_URI}")

# Global variable to capture authorization code
auth_code = None
server_running = True

class CallbackHandler(BaseHTTPRequestHandler):
    """Handle OAuth callback from LinkedIn"""
    
    def do_GET(self):
        global auth_code, server_running
        
        # Parse the callback URL
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        
        if 'code' in params:
            auth_code = params['code'][0]
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html = """
            <html>
            <head><title>LinkedIn Auth Success</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: #0077B5;">✅ Authentication Successful!</h1>
                <p>You can close this window and return to the terminal.</p>
                <p style="color: #666;">Authorization code captured.</p>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
            
            # Stop server after callback
            server_running = False
            
        elif 'error' in params:
            self.send_response(400)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            error = params['error'][0]
            html = f"""
            <html>
            <head><title>LinkedIn Auth Error</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: red;">❌ Authentication Failed</h1>
                <p>Error: {error}</p>
                <p>Please return to the terminal and try again.</p>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
            server_running = False
    
    def log_message(self, format, *args):
        # Suppress server log messages
        pass

# Step 1: Generate Authorization URL
print("\n📋 STEP 1: AUTHORIZATION URL")
print("=" * 70)

# Scopes for posting content and accessing profile
scopes = [
    'openid',
    'profile',
    'w_member_social',  # Post content
    'email'
]

auth_params = {
    'response_type': 'code',
    'client_id': CLIENT_ID,
    'redirect_uri': REDIRECT_URI,
    'scope': ' '.join(scopes),
    'state': 'random_string_12345'  # CSRF protection
}

auth_url = f"https://www.linkedin.com/oauth/v2/authorization?{urllib.parse.urlencode(auth_params)}"

print("\n🔗 AUTHORIZATION URL:")
print(auth_url)
print("\n📋 INSTRUCTIONS:")
print("1. Click the link above (or copy to browser)")
print("2. Log in to LinkedIn")
print("3. Authorize AMD Media Solutions")
print("4. Wait for automatic redirect...")

# Step 2: Start local server to capture callback
print("\n⚙️  Starting local callback server on port 8000...")

def run_server():
    global server_running
    server = HTTPServer(('localhost', 8000), CallbackHandler)
    while server_running:
        server.handle_request()

server_thread = Thread(target=run_server)
server_thread.start()

print("✅ Server ready. Waiting for LinkedIn callback...")

# Open browser automatically
time.sleep(1)
try:
    webbrowser.open(auth_url)
    print("✅ Browser opened automatically")
except:
    print("⚠️  Could not open browser automatically")

# Wait for callback
timeout = 120  # 2 minutes
start_time = time.time()

while auth_code is None and (time.time() - start_time) < timeout:
    time.sleep(1)

if auth_code is None:
    print("\n❌ Timeout: No authorization code received")
    print("   Please try again and complete the authorization.")
    server_running = False
    sys.exit(1)

print("\n✅ Authorization code received!")

# Step 3: Exchange code for access token
print("\n🔄 STEP 2: EXCHANGING CODE FOR ACCESS TOKEN")
print("=" * 70)

token_url = 'https://www.linkedin.com/oauth/v2/accessToken'

# LinkedIn requires URL-encoded form data
headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
}

# Build URL-encoded payload
token_params = urllib.parse.urlencode({
    'grant_type': 'authorization_code',
    'code': auth_code,
    'redirect_uri': REDIRECT_URI,
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET
})

print(f"   Client ID: {CLIENT_ID}")
print(f"   Client Secret: {CLIENT_SECRET[:15]}...")
print(f"   Redirect URI: {REDIRECT_URI}")
print(f"   Code (first 20 chars): {auth_code[:20]}...")

try:
    response = requests.post(token_url, data=token_params, headers=headers, timeout=30)
    
    if response.status_code == 200:
        token_response = response.json()
        access_token = token_response['access_token']
        expires_in = token_response.get('expires_in', 'Unknown')
        
        print(f"✅ Access Token received!")
        print(f"   Expires in: {expires_in} seconds ({int(expires_in)/3600:.1f} hours)")
        
        # Save to .env
        print("\n💾 Saving to .env...")
        
        with open('/Users/mac/Desktop/AMD_Control_Center/.env', 'a') as f:
            f.write(f"\nLINKEDIN_ACCESS_TOKEN={access_token}\n")
        
        print("✅ Access token saved to .env")
        
        print("\n" + "=" * 70)
        print("✅ LINKEDIN AUTHENTICATION COMPLETE!")
        print("=" * 70)
        print("You can now post to LinkedIn using the API.")
        print("=" * 70)
        
    else:
        print(f"❌ Token exchange failed: {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Error exchanging token: {e}")
    sys.exit(1)

# Cleanup
server_running = False
server_thread.join(timeout=5)
