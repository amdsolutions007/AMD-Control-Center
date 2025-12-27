import os
from dotenv import load_dotenv

load_dotenv()


class GoogleAdsConnector:
    """Handles connection to the Google Ads API. Uses real API when env vars provided, else falls back to placeholder data."""
    def __init__(self):
        print("✅ Google Ads Connector Initialized (Ready for Configuration)")
        self.customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID")
        self.developer_token = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN")
        self.client_id = os.getenv("GOOGLE_ADS_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_ADS_CLIENT_SECRET")
        self.refresh_token = os.getenv("GOOGLE_ADS_REFRESH_TOKEN")
        self._client = None
        self._init_client()

    def _init_client(self):
        # Try to initialize real Google Ads client if credentials are present
        if not (self.developer_token and self.client_id and self.client_secret and self.refresh_token and self.customer_id):
            return
        try:
            from google.ads.googleads.client import GoogleAdsClient
            config = {
                "developer_token": self.developer_token,
                "use_proto_plus": True,
                "login_customer_id": os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID") or None,
                "oauth2_client": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "refresh_token": self.refresh_token,
                },
            }
            self._client = GoogleAdsClient.load_from_dict(config)
            print("✅ Google Ads client initialized from environment variables")
        except Exception as e:
            print("⚠️ Google Ads client init failed:", e)
            self._client = None

    def get_campaign_performance(self):
        """Return a list of campaign performance dicts.

        If a real Google Ads client is configured, a simple GAQL query is executed.
        Otherwise returns placeholder sample data for the dashboard.
        """
        print("📡 Fetching Google Ads campaign performance...")
        if self._client:
            try:
                ga_service = self._client.get_service("GoogleAdsService")
                query = (
                    "SELECT campaign.id, campaign.name, metrics.clicks, metrics.impressions, metrics.cost_micros "
                    "FROM campaign WHERE segments.date DURING LAST_30_DAYS"
                )
                response = ga_service.search(customer_id=self.customer_id, query=query)
                results = []
                for row in response:
                    clicks = getattr(row.metrics, "clicks", 0)
                    impressions = getattr(row.metrics, "impressions", 0)
                    cost_micros = getattr(row.metrics, "cost_micros", 0)
                    cost = float(cost_micros) / 1_000_000.0 if cost_micros else 0.0
                    results.append({
                        "id": str(row.campaign.id),
                        "name": row.campaign.name,
                        "clicks": clicks,
                        "impressions": impressions,
                        "cost": cost,
                    })
                return results
            except Exception as e:
                print("⚠️ Google Ads query failed:", e)

        # Fallback sample data
        return [
            {"id": "101", "name": "Japa Viral Campaign", "clicks": 1500, "impressions": 50000, "cost": 45.00},
            {"id": "102", "name": "Manifesto Trailer Promo", "clicks": 3200, "impressions": 120000, "cost": 110.50},
        ]


if __name__ == "__main__":
    ads = GoogleAdsConnector()
    print(ads.get_campaign_performance())
