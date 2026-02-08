#!/bin/bash
# AMD Signal Beacon - Deployment Health Monitor
# Run this script daily to check deployment health
# Usage: ./monitor-deployment.sh

echo "🎖️ AMD SIGNAL BEACON - DEPLOYMENT HEALTH CHECK"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check production site
echo "1️⃣ Checking Production Site..."
PROD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://amd-signal-beacon.vercel.app/)

if [ "$PROD_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Production site is LIVE (Status: $PROD_STATUS)${NC}"
else
    echo -e "${RED}❌ Production site is DOWN! (Status: $PROD_STATUS)${NC}"
    echo -e "${RED}🚨 ACTION REQUIRED: Check Vercel dashboard immediately${NC}"
    exit 1
fi

echo ""

# Check analytics dashboard
echo "2️⃣ Checking Analytics Dashboard..."
ANALYTICS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://amd-signal-beacon.vercel.app/admin-analytics)

if [ "$ANALYTICS_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Analytics dashboard is accessible (Status: $ANALYTICS_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  Analytics dashboard returned: $ANALYTICS_STATUS${NC}"
fi

echo ""

# Check RSS feed
echo "3️⃣ Checking RSS Feed..."
RSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://amd-signal-beacon.vercel.app/api/feed)

if [ "$RSS_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ RSS feed is working (Status: $RSS_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  RSS feed returned: $RSS_STATUS${NC}"
fi

echo ""

# Check response time
echo "4️⃣ Checking Response Time..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://amd-signal-beacon.vercel.app/)

echo "⏱️  Response time: ${RESPONSE_TIME}s"

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    echo -e "${GREEN}✅ Response time is excellent (<2s)${NC}"
elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Response time is acceptable (2-5s)${NC}"
else
    echo -e "${RED}❌ Response time is slow (>5s)${NC}"
fi

echo ""

# Check SSL certificate
echo "5️⃣ Checking SSL Certificate..."
SSL_EXPIRY=$(echo | openssl s_client -servername amd-signal-beacon.vercel.app -connect amd-signal-beacon.vercel.app:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)

if [ -n "$SSL_EXPIRY" ]; then
    echo -e "${GREEN}✅ SSL certificate is valid${NC}"
    echo "📅 Expires: $SSL_EXPIRY"
else
    echo -e "${YELLOW}⚠️  Could not verify SSL certificate${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}🎖️ HEALTH CHECK COMPLETE${NC}"
echo ""
echo "📊 Summary:"
echo "  • Production Site: $([ "$PROD_STATUS" -eq 200 ] && echo "✅ LIVE" || echo "❌ DOWN")"
echo "  • Analytics Dashboard: $([ "$ANALYTICS_STATUS" -eq 200 ] && echo "✅ OK" || echo "⚠️ CHECK")"
echo "  • RSS Feed: $([ "$RSS_STATUS" -eq 200 ] && echo "✅ OK" || echo "⚠️ CHECK")"
echo "  • Response Time: ${RESPONSE_TIME}s"
echo ""

# Check Vercel deployment status via API (if VERCEL_TOKEN is set)
if [ -n "$VERCEL_TOKEN" ]; then
    echo "6️⃣ Checking Latest Deployment..."
    DEPLOYMENT_DATA=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
        "https://api.vercel.com/v6/deployments?projectId=amd-signal-beacon&limit=1")
    
    DEPLOYMENT_STATE=$(echo "$DEPLOYMENT_DATA" | grep -o '"state":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ "$DEPLOYMENT_STATE" = "READY" ]; then
        echo -e "${GREEN}✅ Latest deployment is READY${NC}"
    elif [ "$DEPLOYMENT_STATE" = "BUILDING" ]; then
        echo -e "${YELLOW}🔄 Deployment in progress...${NC}"
    elif [ "$DEPLOYMENT_STATE" = "ERROR" ]; then
        echo -e "${RED}❌ Latest deployment FAILED${NC}"
        echo -e "${RED}🚨 Check Vercel dashboard: https://vercel.com/solutions007s-projects/amd-signal-beacon/deployments${NC}"
    fi
    echo ""
fi

echo "🔗 Quick Links:"
echo "  • Production: https://amd-signal-beacon.vercel.app/"
echo "  • Analytics: https://amd-signal-beacon.vercel.app/admin-analytics"
echo "  • Deployments: https://vercel.com/solutions007s-projects/amd-signal-beacon/deployments"
echo ""

# Exit with appropriate code
if [ "$PROD_STATUS" -eq 200 ]; then
    exit 0
else
    exit 1
fi
