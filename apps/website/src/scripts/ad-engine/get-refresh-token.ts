/**
 * SNAPCHAT OAUTH TOKEN EXCHANGE
 * 
 * Exchanges authorization code for refresh token (one-time operation)
 */

import * as https from 'https'
import * as querystring from 'querystring'
import * as fs from 'fs'
import * as path from 'path'

const config = {
  clientId: process.env.SNAP_CLIENT_ID || process.env.SNAP_MARKETING_CLIENT_ID,
  clientSecret: process.env.SNAP_CLIENT_SECRET || process.env.SNAP_MARKETING_CLIENT_SECRET,
  authCode: process.env.SNAP_AUTH_CODE,
  redirectUri: process.env.SNAP_REDIRECT_URI || 'https://www.amdsolutions007.com/callback',
}

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

async function exchangeCodeForToken(): Promise<TokenResponse> {
  console.log('🔑 Exchanging authorization code for refresh token...\n')

  const tokenEndpoint = 'https://accounts.snapchat.com/login/oauth2/access_token'
  
  const postData = querystring.stringify({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: config.authCode,
    redirect_uri: config.redirectUri,
  })

  return new Promise((resolve, reject) => {
    const req = https.request(
      tokenEndpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const response = JSON.parse(data)
            
            if (res.statusCode !== 200) {
              console.error('❌ OAuth Error:', response)
              reject(new Error(`OAuth error: ${response.error} - ${response.error_description}`))
              return
            }

            if (!response.refresh_token) {
              reject(new Error('No refresh token in response'))
              return
            }

            console.log('✅ Token exchange successful!\n')
            console.log('Access Token:', response.access_token.substring(0, 20) + '...')
            console.log('Refresh Token:', response.refresh_token.substring(0, 20) + '...')
            console.log('Expires In:', response.expires_in, 'seconds')
            console.log('Scope:', response.scope)
            
            resolve(response)
          } catch (err) {
            reject(err)
          }
        })
      }
    )

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

async function appendToEnvFile(refreshToken: string) {
  const envPath = path.join(process.cwd(), '.env.local')
  
  console.log('\n📝 Updating .env.local with refresh token...')

  // Read existing content
  let envContent = ''
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8')
  }

  // Check if SNAP_MARKETING_REFRESH_TOKEN already exists
  if (envContent.includes('SNAP_MARKETING_REFRESH_TOKEN=')) {
    // Replace existing token
    envContent = envContent.replace(
      /SNAP_MARKETING_REFRESH_TOKEN=.*/,
      `SNAP_MARKETING_REFRESH_TOKEN=${refreshToken}`
    )
    console.log('✅ Updated existing SNAP_MARKETING_REFRESH_TOKEN')
  } else {
    // Append new token
    envContent += `\n# Auto-generated refresh token (do not share)\nSNAP_MARKETING_REFRESH_TOKEN=${refreshToken}\n`
    console.log('✅ Added SNAP_MARKETING_REFRESH_TOKEN to .env.local')
  }

  // Write back to file
  fs.writeFileSync(envPath, envContent, 'utf-8')
  
  console.log('✅ .env.local updated successfully')
  console.log('\n⚠️  SECURITY: Never commit .env.local to version control!')
}

async function main() {
  try {
    console.log('🚀 SNAPCHAT OAUTH TOKEN EXCHANGE')
    console.log('================================\n')

    if (!config.clientId || !config.clientSecret || !config.authCode) {
      throw new Error('Missing required environment variables: SNAP_CLIENT_ID, SNAP_CLIENT_SECRET, SNAP_AUTH_CODE')
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForToken()

    // Save refresh token to .env.local
    await appendToEnvFile(tokenResponse.refresh_token)

    console.log('\n✅ TOKEN EXCHANGE COMPLETE')
    console.log('================================')
    console.log('Next step: Run `npm run launch-campaign`')
    
  } catch (error) {
    console.error('❌ Token exchange failed:', error)
    process.exit(1)
  }
}

main()
