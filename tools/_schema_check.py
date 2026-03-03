import json
with open("intelligence_vault/members/group/members.json") as f:
    g = json.load(f)
sample = g["members"][0]
print("GROUP MEMBER SCHEMA:", list(sample.keys()))
print("SAMPLE:", json.dumps(sample, indent=2)[:500])
print()
with open("intelligence_vault/members/profile/followers.json") as f:
    fl = json.load(f)
print("FOLLOWER SCHEMA:", list(fl["members"][0].keys()))
with open("intelligence_vault/engagement/cross_reference.json") as f:
    xr = json.load(f)
print("SUPER-FAN HANDLES:", [m["handle"] for m in xr["super_fans"]["members"]])
