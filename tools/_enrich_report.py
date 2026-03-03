import json
from datetime import datetime, timezone

with open("intelligence_vault/reports/empire_citizen_report.json") as f:
    r = json.load(f)

gi = r.setdefault("growth_intelligence", {})
gi["profile_followers_live_api"] = 63
gi["profile_followers_ceo_count"] = 64
gi["followers_count_note"] = (
    "CEO manually counted 64 on UI. Live paginated API sweep returned 63 "
    "authenticated records. 1-count discrepancy — likely a pending follow "
    "that cleared UI cache after CEO checked, or a deactivated account. "
    "Vault stores API-confirmed 63 citizens."
)
gi["followers_net_new"] = 3
gi["new_followers"] = [
    {"name": "Augustus CJ", "handle": "@emperoraustus", "vault_status": "NEW"},
    {"name": "Justin Iheme", "handle": "@Justin", "vault_status": "NEW"},
    {
        "name": "Grant Allen Asiboje",
        "handle": "@salaryalert",
        "vault_status": "NEW — SUPER-FAN UPGRADE (also group member)",
    },
]
gi["super_fan_upgrade"] = (
    "Grant Allen Asiboje (@salaryalert) joined the follower list, "
    "becoming the 6th super-fan (group member + follower overlap)"
)

r["generated_at"] = datetime.now(timezone.utc).isoformat()

with open("intelligence_vault/reports/empire_citizen_report.json", "w") as f:
    json.dump(r, f, indent=2, ensure_ascii=False)

print("empire_citizen_report.json enriched")
print(f"  profile_followers_live_api: {gi['profile_followers_live_api']}")
print(f"  profile_followers_ceo_count: {gi['profile_followers_ceo_count']}")
print(f"  followers_net_new: {gi['followers_net_new']}")
print(f"  super_fan_upgrade: {gi['super_fan_upgrade']}")
