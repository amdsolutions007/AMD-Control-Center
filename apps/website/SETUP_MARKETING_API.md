# SNAPCHAT MARKETING API SETUP GUIDE

**Mission:** Obtain OAuth credentials to enable autonomous ad campaign creation via the Snapchat Marketing API.

---

## PREREQUISITES

- Active Snapchat Ads Account (https://ads.snapchat.com)
- Business Manager access with Admin permissions
- Ad Account ID ready for API connection

---

## STEP 1: CREATE A SNAPCHAT APP

1. Navigate to **Snap Kit Developer Portal**: https://kit.snapchat.com/portal
2. Click **"Create App"** (top-right corner)
3. Fill in App Details:
   - **App Name**: `AMD Solutions Marketing Engine`
   - **App Type**: Select **"Business"**
   - **App Description**: `Automated ad campaign management for AMD Solutions 007`
4. Click **"Create App"**

---

## STEP 2: ENABLE MARKETING API

1. Inside your newly created App, navigate to **"Products"** tab (left sidebar)
2. Locate **"Marketing API"** in the products list
3. Click **"Add Product"** next to Marketing API
4. Accept the **Terms of Service**
5. Click **"Enable Marketing API"**

---

## STEP 3: OBTAIN CLIENT CREDENTIALS

1. Go to **"OAuth2"** tab (left sidebar)
2. Under **"OAuth2 Client IDs"** section:
   - **Client ID**: Copy and save this (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - **Client Secret**: Click **"Show"** → Copy and save securely
3. Set **Redirect URI**: 
   - Add: `https://localhost:3000/oauth/callback`
   - Click **"Add"** → **"Save"**

---

## STEP 4: CONFIGURE AD ACCOUNT ACCESS

1. Navigate to **"Business Manager"** tab in the app dashboard
2. Click **"Connect Ad Account"**
3. Select your **Organization**
4. Select your **Ad Account** (the one you want to manage via API)
5. Grant permissions:
   - ✅ **CREATE_CAMPAIGN**
   - ✅ **CREATE_AD_SQUAD**
   - ✅ **CREATE_AD**
   - ✅ **READ_STATS**
6. Click **"Connect"**

---

## STEP 5: GENERATE REFRESH TOKEN (CRITICAL)

This is the most important step for autonomous operation.

### Option A: Using OAuth Playground (Recommended)

1. Visit: https://developers.snap.com/oauth-playground
2. Enter your **Client ID** and **Client Secret**
3. Select scopes:
   - `snapchat-marketing-api`
4. Click **"Authorize"**
5. Log in with your Snapchat account
6. Authorize the app
7. **Copy the Refresh Token** (starts with `refresh_`)
8. Store securely - this does NOT expire unless revoked

### Option B: Manual OAuth Flow (Advanced)

If the playground doesn't work:

1. Construct authorization URL:
```
https://accounts.snapchat.com/login/oauth2/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://localhost:3000/oauth/callback&
  response_type=code&
  scope=snapchat-marketing-api
```

2. Visit the URL in browser → Authorize app
3. Copy the `code` from redirect URL
4. Exchange code for tokens:
```bash
curl -X POST https://accounts.snapchat.com/login/oauth2/access_token \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=YOUR_AUTH_CODE" \
  -d "redirect_uri=https://localhost:3000/oauth/callback"
```

5. Extract `refresh_token` from response

---

## STEP 6: SECURE CREDENTIAL STORAGE

Create `.env.local` in project root:

```env
# Snapchat Marketing API Credentials
SNAP_MARKETING_CLIENT_ID=your_client_id_here
SNAP_MARKETING_CLIENT_SECRET=your_client_secret_here
SNAP_MARKETING_REFRESH_TOKEN=refresh_token_here
SNAP_AD_ACCOUNT_ID=your_ad_account_id_here
```

**CRITICAL:** Add `.env.local` to `.gitignore` to prevent credential leaks.

---

## STEP 7: VERIFY CREDENTIALS

Test the credentials with a basic API call:

```bash
npm run test-snap-api
```

Expected output:
```
✅ Snapchat Marketing API: Connected
✅ Ad Account: [Your Account Name]
✅ Ready to launch campaigns
```

---

## REFERENCE DOCUMENTATION

- **Marketing API Docs**: https://marketingapi.snapchat.com/docs/
- **OAuth Guide**: https://developers.snap.com/api/marketing-api/authentication
- **API Explorer**: https://developers.snap.com/api/marketing-api/reference

---

## SECURITY NOTES

⚠️ **NEVER commit credentials to version control**  
⚠️ **Refresh tokens grant full API access - treat like passwords**  
⚠️ **Rotate tokens if compromised**  
⚠️ **Use production secrets ONLY on secure production servers**

---

## TROUBLESHOOTING

**Q: "Invalid Client ID"**  
A: Verify Client ID matches exactly from Developer Portal (no spaces)

**Q: "Redirect URI mismatch"**  
A: Ensure redirect URI in OAuth request matches exactly what's configured in app settings

**Q: "Insufficient permissions"**  
A: Re-connect Ad Account in Business Manager tab and grant all required scopes

**Q: "Refresh token expired"**  
A: Refresh tokens should NOT expire. If they do, regenerate using Step 5.

---

**STATUS:** Once credentials are secured, notify the engineering team to inject into `.env.local` and run the ad launcher script.

**NEXT ACTION:** `npm run launch-campaign`
