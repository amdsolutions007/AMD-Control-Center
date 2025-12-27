/**
 * AMD SOLUTIONS 007 - SNAPCHAT AD LAUNCH ENGINE
 * 
 * Autonomous campaign creation system for Snapchat Marketing API
 * Docs: https://marketingapi.snapchat.com/docs/
 */

import * as https from 'https'
import * as querystring from 'querystring'

// ==================== CONFIGURATION ====================

interface SnapConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  adAccountId: string
}

const config: SnapConfig = {
  clientId: process.env.SNAP_MARKETING_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
  clientSecret: process.env.SNAP_MARKETING_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE',
  refreshToken: process.env.SNAP_MARKETING_REFRESH_TOKEN || 'YOUR_REFRESH_TOKEN_HERE',
  adAccountId: process.env.SNAP_AD_ACCOUNT_ID || 'YOUR_AD_ACCOUNT_ID_HERE',
}

const BASE_URL = 'https://adsapi.snapchat.com/v1'

// ==================== OAUTH TOKEN REFRESH ====================

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

/**
 * Exchange refresh token for fresh access token
 */
async function refreshAccessToken(): Promise<string> {
  const tokenEndpoint = 'https://accounts.snapchat.com/login/oauth2/access_token'
  
  const postData = querystring.stringify({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
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
            const response: TokenResponse = JSON.parse(data)
            if (response.access_token) {
              console.log('✅ Access token refreshed')
              resolve(response.access_token)
            } else {
              reject(new Error('No access token in response'))
            }
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

// ==================== API REQUEST HELPER ====================

async function snapApiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  accessToken: string,
  body?: any
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`)

  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response)
          } else {
            console.error('API Error:', response)
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(response)}`))
          }
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', reject)

    if (body) {
      req.write(JSON.stringify(body))
    }

    req.end()
  })
}

// ==================== CAMPAIGN CREATION ====================

/**
 * CRITICAL: Campaign budgets must be null/unlimited.
 * Setting daily_budget_micro at campaign level triggers $20 minimum error.
 * ALL BUDGETS MUST BE SET AT AD SQUAD LEVEL ($5 minimum allowed).
 */
interface CampaignConfig {
  name: string
  status: 'ACTIVE' | 'PAUSED'
  startTime: string // ISO 8601
  endTime?: string
  // NO BUDGET PARAMETERS - budgets are set at Ad Squad level only
}

async function createCampaign(
  accessToken: string,
  campaignConfig: CampaignConfig
): Promise<any> {
  console.log('📢 Creating campaign:', campaignConfig.name)

  const payload = {
    campaigns: [
      {
        ad_account_id: config.adAccountId,
        name: campaignConfig.name,
        status: campaignConfig.status,
        buy_model: 'AUCTION',
        start_time: campaignConfig.startTime,
        end_time: campaignConfig.endTime,
        // NO BUDGET PARAMETERS - Snapchat enforces $20 minimum at campaign level
        // Budget MUST be set at Ad Squad level where $5 minimum is allowed
      },
    ],
  }

  const response = await snapApiRequest('POST', `/adaccounts/${config.adAccountId}/campaigns`, accessToken, payload)
  console.log('Campaign API Response:', JSON.stringify(response, null, 2))
  const campaignId = response.campaigns?.[0]?.campaign?.id

  if (campaignId) {
    console.log('✅ Campaign created:', campaignId)
    return campaignId
  } else {
    throw new Error(`Failed to create campaign. Response: ${JSON.stringify(response)}`)
  }
}

// ==================== AD SQUAD CREATION ====================

/**
 * BUDGET HIERARCHY PROTOCOL (STANDARD OPERATING PROCEDURE):
 * 
 * ✅ Ad Squad Level: Budget MUST be set here
 *    - Minimum: $5.00 = 5,000,000 micro-currency
 *    - This is the ONLY valid level for budget configuration
 * 
 * ❌ Campaign Level: Never set budget here
 *    - Triggers $20 minimum error
 *    - Leave null or unlimited
 */
interface AdSquadConfig {
  campaignId: string
  name: string
  status: 'ACTIVE' | 'PAUSED'
  type: 'SNAP_ADS' | 'STORY_ADS'
  placement: 'USER_STORIES' | 'CONTENT_STORIES' | 'BOTH'
  targetingGeoCountries: string[] // e.g., ['NG'] for Nigeria
  bidMicro: number
  dailyBudgetMicro: number // REQUIRED: Minimum $5.00 (5000000 micro)
  optimizationGoal: 'IMPRESSIONS' | 'SWIPES' | 'APP_INSTALLS' | 'PIXEL_PAGE_VIEW'
}

async function createAdSquad(
  accessToken: string,
  squadConfig: AdSquadConfig
): Promise<any> {
  console.log('🎯 Creating ad squad:', squadConfig.name)
  
  // CRITICAL VALIDATION: Enforce $5 minimum budget
  if (!squadConfig.dailyBudgetMicro || squadConfig.dailyBudgetMicro < 5_000_000) {
    throw new Error('❌ BUDGET VIOLATION: Ad Squad daily budget must be at least $5.00 (5000000 micro). Current: ' + squadConfig.dailyBudgetMicro)
  }

  const payload = {
    adsquads: [
      {
        campaign_id: squadConfig.campaignId,
        name: squadConfig.name,
        status: squadConfig.status,
        type: squadConfig.type,
        placement_v2: {
          config: squadConfig.placement,
        },
        targeting: {
          geos: squadConfig.targetingGeoCountries.map((country) => ({ country_code: country })),
        },
        bid_micro: squadConfig.bidMicro,
        daily_budget_micro: squadConfig.dailyBudgetMicro,
        optimization_goal: squadConfig.optimizationGoal,
        billing_event: 'IMPRESSION',
      },
    ],
  }

  const response = await snapApiRequest('POST', `/campaigns/${squadConfig.campaignId}/adsquads`, accessToken, payload)
  console.log('Ad Squad API Response:', JSON.stringify(response, null, 2))
  const adSquadId = response.adsquads?.[0]?.adsquad?.id

  if (adSquadId) {
    console.log('✅ Ad Squad created:', adSquadId)
    return adSquadId
  } else {
    throw new Error(`Failed to create ad squad. Response: ${JSON.stringify(response)}`)
  }
}

// ==================== CREATIVE & AD CREATION ====================

interface AdCreativeConfig {
  name: string
  brandName: string
  headline: string
  shareable: boolean
  callToAction: 'VIEW_WEBSITE' | 'SIGN_UP' | 'LEARN_MORE' | 'GET_OFFER'
  websiteUrl: string
  topSnapMediaId: string // Pre-uploaded media ID from Snapchat
}

interface AdConfig {
  adSquadId: string
  name: string
  status: 'ACTIVE' | 'PAUSED'
  creative: AdCreativeConfig
}

async function createAd(accessToken: string, adConfig: AdConfig): Promise<any> {
  console.log('🎬 Creating ad:', adConfig.name)

  // Step 1: Create Creative
  const creativePayload = {
    creatives: [
      {
        ad_account_id: config.adAccountId,
        name: adConfig.creative.name,
        type: 'WEB_VIEW',
        brand_name: adConfig.creative.brandName,
        headline: adConfig.creative.headline,
        shareable: adConfig.creative.shareable,
        call_to_action: adConfig.creative.callToAction,
        top_snap_media_id: adConfig.creative.topSnapMediaId,
        web_view_properties: {
          url: adConfig.creative.websiteUrl,
          allow_snap_javascript_sdk: true,
        },
      },
    ],
  }

  const creativeResponse = await snapApiRequest('POST', `/adaccounts/${config.adAccountId}/creatives`, accessToken, creativePayload)
  const creativeId = creativeResponse.creatives[0]?.creative?.id

  if (!creativeId) {
    throw new Error('Failed to create creative')
  }

  console.log('✅ Creative created:', creativeId)

  // Step 2: Create Ad
  const adPayload = {
    ads: [
      {
        ad_squad_id: adConfig.adSquadId,
        creative_id: creativeId,
        name: adConfig.name,
        status: adConfig.status,
        type: 'WEB_VIEW',
      },
    ],
  }

  const adResponse = await snapApiRequest('POST', `/adaccounts/${config.adAccountId}/ads`, accessToken, adPayload)
  const adId = adResponse.ads[0]?.ad?.id

  if (adId) {
    console.log('✅ Ad created:', adId)
    return adId
  } else {
    throw new Error('Failed to create ad')
  }
}

// ==================== MAIN LAUNCHER ====================

async function launchCampaign() {
  console.log('🚀 AMD SOLUTIONS 007 - SNAPCHAT AD LAUNCH ENGINE')
  console.log('================================================\n')

  try {
    // Validate credentials
    if (
      config.clientId === 'YOUR_CLIENT_ID_HERE' ||
      config.refreshToken === 'YOUR_REFRESH_TOKEN_HERE'
    ) {
      throw new Error(
        '❌ Missing credentials. Please set SNAP_MARKETING_CLIENT_ID, SNAP_MARKETING_CLIENT_SECRET, and SNAP_MARKETING_REFRESH_TOKEN in .env.local'
      )
    }

    // Step 1: Get access token
    console.log('🔑 Refreshing access token...')
    const accessToken = await refreshAccessToken()

    // Step 2: Create Campaign (no daily budget at campaign level)
    const campaignId = await createCampaign(accessToken, {
      name: 'AMD System Check - Warmup',
      status: 'PAUSED', // Start paused for safety
      startTime: new Date().toISOString(),
    })

    // Step 3: Create Ad Squad with $5 daily budget (Targeting US - Nigeria not supported)
    const adSquadId = await createAdSquad(accessToken, {
      campaignId,
      name: 'US Warmup Test',
      status: 'PAUSED',
      type: 'SNAP_ADS',
      placement: 'BOTH',
      targetingGeoCountries: ['US'], // United States (Nigeria not supported by Snapchat)
      bidMicro: 2_000_000, // $2 CPM bid
      dailyBudgetMicro: 5_000_000, // $5 daily budget at squad level
      optimizationGoal: 'PIXEL_PAGE_VIEW',
    })

    // Step 4: Create Ad (Using hosted website image)
    // Using direct URL since we can't upload via API without media ID
    const adId = await createAd(accessToken, {
      adSquadId,
      name: 'AMD Warmup - Hero',
      status: 'PAUSED',
      creative: {
        name: 'AMD Hero Creative - Warmup',
        brandName: 'AMD SOLUTIONS 007',
        headline: 'Illuminating the Digital Dark',
        shareable: true,
        callToAction: 'VIEW_WEBSITE',
        websiteUrl: 'https://www.amdsolutions007.com',
        topSnapMediaId: 'https://www.amdsolutions007.com/dashboard_bg.jpg', // Hosted creative URL
      },
    })

    console.log('\n✅ CAMPAIGN LAUNCH COMPLETE')
    console.log('================================================')
    console.log('Campaign ID:', campaignId)
    console.log('Ad Squad ID:', adSquadId)
    console.log('Ad ID:', adId)
    console.log('\n⚠️  Campaign is PAUSED by default.')
    console.log('To activate: Go to Snapchat Ads Manager and enable.')
    console.log('Or set status to ACTIVE in this script and redeploy.')
  } catch (error) {
    console.error('❌ Campaign launch failed:', error)
    process.exit(1)
  }
}

// Execute if run directly
// Check if this is the main module (ESM compatible)
const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  launchCampaign()
}

export { launchCampaign, createCampaign, createAdSquad, createAd, refreshAccessToken }
