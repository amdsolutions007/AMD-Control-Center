# SNAPCHAT ADS AUTOMATION - IMMUTABLE LAWS

**AMD SOLUTIONS 007 | GOLDEN RULES FOR LOW-BUDGET CAMPAIGNS**

---

## ⚠️ CRITICAL: Read Before Any API Integration

This document contains **hard-learned lessons** from production failures. Following these laws ensures successful automated campaign launches with minimal budget requirements.

---

## 🏛️ THE THREE IMMUTABLE LAWS

### **LAW #1: THE BUDGET HIERARCHY**

**Rule:** Budget MUST be applied at the **Ad Squad Level**, NEVER at the Campaign Level.

#### ❌ NEVER DO THIS:
```typescript
// Campaign creation with budget = ERROR
const campaignPayload = {
  campaigns: [{
    ad_account_id: accountId,
    name: "My Campaign",
    daily_budget_micro: 5_000_000,  // ❌ TRIGGERS $20 MINIMUM ERROR
  }]
}
```

#### ✅ ALWAYS DO THIS:
```typescript
// Campaign creation WITHOUT budget
const campaignPayload = {
  campaigns: [{
    ad_account_id: accountId,
    name: "My Campaign",
    // NO budget parameters - leave unlimited/null
  }]
}

// Ad Squad creation WITH budget
const adSquadPayload = {
  adsquads: [{
    campaign_id: campaignId,
    name: "My Ad Squad",
    daily_budget_micro: 5_000_000,  // ✅ $5 MINIMUM ALLOWED HERE
  }]
}
```

#### Why This Matters:
- **Campaign Level:** Snapchat enforces a $20.00 minimum ($20,000,000 micro)
- **Ad Squad Level:** Snapchat allows a $5.00 minimum ($5,000,000 micro)
- For low-budget system checks and warmup campaigns, this difference is critical

#### Enforcement:
See `src/scripts/ad-engine/launcher.ts` for runtime validation that enforces this rule.

---

### **LAW #2: THE TARGETING**

**Rule:** Geo-targeting MUST be applied at the **Ad Squad Level**, not the Campaign Level.

#### Implementation:
```typescript
const adSquadPayload = {
  adsquads: [{
    campaign_id: campaignId,
    name: "US Targeting Squad",
    targeting: {
      geos: [
        { country_code: 'US' }  // Apply targeting here
      ]
    },
    daily_budget_micro: 5_000_000,
  }]
}
```

#### Supported Geo Codes:
- `US` - United States ✅
- `GB` - United Kingdom ✅
- `CA` - Canada ✅
- Note: Not all countries are supported. Check [Snapchat's geo-targeting docs](https://marketingapi.snapchat.com/docs/#targeting) for the full list.

#### Why This Matters:
- Campaigns are broad containers; Ad Squads control actual delivery
- This allows different geo-targeting per squad within the same campaign
- Enables A/B testing across markets

---

### **LAW #3: THE CREATIVE**

**Rule:** For automated system checks, always use **Single Image Format** to avoid complex asset requirements.

#### ✅ Recommended for Automation:
```typescript
const creativePayload = {
  creatives: [{
    ad_account_id: accountId,
    name: "System Check Creative",
    type: 'WEB_VIEW',
    brand_name: 'AMD SOLUTIONS 007',
    headline: 'Illuminating the Digital Dark',
    call_to_action: 'VIEW_WEBSITE',
    top_snap_media_id: mediaId,  // Single image/video
    web_view_properties: {
      url: 'https://www.amdsolutions007.com',
    }
  }]
}
```

#### ❌ Avoid for Initial Automation:
- Collection Ads (require multiple assets)
- Story Ads (require 3-20 snaps)
- Dynamic Ads (require product catalog)
- Commercial Ads (require long-form video)

#### Why This Matters:
- Single image/video creatives have minimal asset requirements
- Faster to test and validate API integration
- Lower cost for warmup campaigns
- Once system is proven, expand to complex formats

#### Asset Requirements:
- **Image:** 1080x1920px (9:16), JPEG/PNG, <5MB
- **Video:** 1080x1920px (9:16), MP4/MOV, 3-60 seconds, <1GB

---

## 📊 STANDARD OPERATING PROCEDURE

### Minimum Viable Campaign Launch:

```typescript
// 1. Create Campaign (NO BUDGET)
const campaign = await createCampaign({
  name: 'System Check',
  status: 'PAUSED',
  startTime: new Date().toISOString(),
  // NO budget parameters
})

// 2. Create Ad Squad (WITH $5 BUDGET)
const adSquad = await createAdSquad({
  campaignId: campaign.id,
  name: 'US Test Squad',
  status: 'PAUSED',
  type: 'SNAP_ADS',
  placement: 'BOTH',
  targetingGeoCountries: ['US'],
  bidMicro: 2_000_000,  // $2 CPM
  dailyBudgetMicro: 5_000_000,  // $5 daily minimum
  optimizationGoal: 'PIXEL_PAGE_VIEW',
})

// 3. Create Ad (Single Image)
const ad = await createAd({
  adSquadId: adSquad.id,
  name: 'System Check Ad',
  status: 'PAUSED',
  creative: {
    name: 'Test Creative',
    brandName: 'AMD SOLUTIONS 007',
    headline: 'Illuminating the Digital Dark',
    shareable: true,
    callToAction: 'VIEW_WEBSITE',
    websiteUrl: 'https://www.amdsolutions007.com',
    topSnapMediaId: 'your_media_id_here',
  }
})
```

---

## 🔐 ENFORCEMENT

These laws are enforced in code at:
- **[`src/scripts/ad-engine/launcher.ts`](../src/scripts/ad-engine/launcher.ts)** - Runtime validation
- **TypeScript Interfaces** - Type-level constraints
- **Documentation** - This file

### Validation Example:
```typescript
if (!squadConfig.dailyBudgetMicro || squadConfig.dailyBudgetMicro < 5_000_000) {
  throw new Error('❌ BUDGET VIOLATION: Ad Squad daily budget must be at least $5.00')
}
```

---

## 📚 REFERENCES

- [Snapchat Marketing API Docs](https://marketingapi.snapchat.com/docs/)
- [Campaign Structure Guide](https://marketingapi.snapchat.com/docs/#campaigns)
- [Budget Guidelines](https://marketingapi.snapchat.com/docs/#budgets)
- [Targeting Options](https://marketingapi.snapchat.com/docs/#targeting)
- [Creative Specs](https://marketingapi.snapchat.com/docs/#creative-specs)

---

## 🚨 FAILURE PREVENTION

### Common Errors & Solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `daily_budget_micro must be at least 20000000` | Budget set at campaign level | Move budget to ad squad level |
| `Invalid geo targeting` | Country not supported | Use supported country codes (US, GB, CA, etc.) |
| `Creative validation failed` | Missing required assets | Use single image format for testing |

---

## ✅ DEPLOYMENT CHECKLIST

Before any production launch:

- [ ] Campaign has NO budget parameters
- [ ] Ad Squad has minimum $5.00 budget (5,000,000 micro)
- [ ] Geo-targeting applied at Ad Squad level
- [ ] Single image creative uploaded and validated
- [ ] Campaign status set to 'PAUSED' for manual review
- [ ] Test in Snapchat Ads Manager before activating

---

**Last Updated:** 24 December 2025  
**Maintained By:** AMD SOLUTIONS 007  
**Version:** 1.0.0

---

*These rules were established through production testing and verified by successful manual campaign launches. Deviation from these protocols will result in API failures.*
