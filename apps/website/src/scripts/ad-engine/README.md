# SNAPCHAT AD LAUNCH ENGINE

**Purpose:** Autonomous Snapchat ad campaign creation via Marketing API.

---

## PREREQUISITES

1. Complete OAuth setup (see `SETUP_MARKETING_API.md` in project root)
2. Credentials in `.env.local`:
   ```env
   SNAP_MARKETING_CLIENT_ID=...
   SNAP_MARKETING_CLIENT_SECRET=...
   SNAP_MARKETING_REFRESH_TOKEN=...
   SNAP_AD_ACCOUNT_ID=...
   ```

---

## USAGE

### Run Campaign Launcher

```bash
npm run launch-campaign
```

Or directly:

```bash
npx ts-node src/scripts/ad-engine/launcher.ts
```

---

## WHAT IT DOES

1. **Refreshes OAuth token** — Exchanges refresh token for active access token
2. **Creates Campaign** — Top-level campaign container with budget
3. **Creates Ad Squad** — Targeting set (Nigeria geo-targeting, bid strategy, optimization goal)
4. **Creates Ad** — Links creative (media + copy) to ad squad

---

## BEFORE FIRST RUN

⚠️ **Upload media first:**

Snapchat requires media to be uploaded separately before ad creation.

Use Snapchat's Media Upload API or manually upload via Ads Manager, then update:

```typescript
topSnapMediaId: 'REPLACE_WITH_ACTUAL_MEDIA_ID'
```

---

## CAMPAIGN PARAMETERS

Edit `launcher.ts` to customize:

- **Budget**: `dailyBudgetMicro` (in micro-currency, e.g., $50 = 50000000)
- **Targeting**: `targetingGeoCountries` (e.g., `['NG', 'US', 'GB']`)
- **Creative**: `headline`, `brandName`, `callToAction`
- **Optimization**: `optimizationGoal` (IMPRESSIONS, SWIPES, PAGE_VIEW, etc.)

---

## SAFETY FEATURES

- Campaigns start **PAUSED** by default
- Requires manual activation in Ads Manager
- Prevents accidental spend during testing

---

## NEXT STEPS

1. Complete OAuth setup → Get credentials
2. Upload hero media → Get media ID
3. Update `topSnapMediaId` in launcher.ts
4. Run: `npm run launch-campaign`
5. Activate campaign in Snapchat Ads Manager

---

**API Docs:** https://marketingapi.snapchat.com/docs/
