"""
INTELLIGENCE VAULT CONSTRUCTOR
AMD Control Center — Data Re-Arrangement & Professionalization
Parses all raw LekeeLekee data files and builds the structured vault.
"""
import os, re, json
from datetime import datetime, timezone
from pathlib import Path

ROOT   = Path(__file__).resolve().parent.parent
VAULT  = ROOT / "intelligence_vault"

# ── OUTPUT PATHS ──────────────────────────────────────────────
PATHS = {
    "profile":        VAULT / "members" / "profile",
    "group":          VAULT / "members" / "group",
    "engagement":     VAULT / "engagement",
    "archives":       VAULT / "archives",
    "training_data":  VAULT / "training_data",
    "reports":        VAULT / "reports",
}
for p in PATHS.values():
    p.mkdir(parents=True, exist_ok=True)

print("✅ Vault directory structure created\n")

# ══════════════════════════════════════════════════════════════
# SECTION 1 — PARSE PROFILE FOLLOWERS (lekeelekee_member_registry.json)
# ══════════════════════════════════════════════════════════════
raw_registry = (ROOT / "lekeelekee_member_registry.json").read_text(encoding="utf-8")

# The file has two sections separated by "Showing all 60 followers"
# Section A = profile followers (before that line)
# Section B = group members (after "Invite Members")

split_marker = "Showing all 60 followers"
group_marker = "Invite Members"

parts = raw_registry.split(split_marker)
followers_raw = parts[0]
group_raw     = parts[1] if len(parts) > 1 else ""

"""
Follower block format (double-newline separated fields):
  NAME\n\n@HANDLE\n\nBIO_OR_EMPTY\n\nFollow

Group member format (name+handle+role concatenated on one line):
  NameWithSpaces@handleowner  OR  NameWithSpaces@handlemember
"""

# FOLLOWERS — split on double-newlines, find blocks ending in 'Follow'
follower_blocks = re.split(r'\n{2,}', followers_raw)
# Rebuild into logical records: [ [name, @handle, bio, 'Follow'], ... ]
profile_followers = []
seen_handles_f    = set()
i = 0
while i < len(follower_blocks):
    block = follower_blocks[i].strip()
    # A name block: not a @handle, not 'Follow', not a bio-only block
    if (block
            and not block.startswith('@')
            and block != 'Follow'
            and not block.startswith('"(Includes')
            and '\n' not in block):
        name = block.strip()
        # Look ahead for @handle
        if i + 1 < len(follower_blocks):
            next_b = follower_blocks[i + 1].strip()
            if next_b.startswith('@'):
                handle = next_b.split()[0]  # just the handle, not trailing text
                # Look ahead for bio or Follow
                bio = ""
                if i + 2 < len(follower_blocks):
                    b2 = follower_blocks[i + 2].strip()
                    if b2 != 'Follow' and b2:
                        bio = " ".join(b2.split())[:200]
                if handle and handle not in seen_handles_f:
                    profile_followers.append({
                        "name":   name,
                        "handle": handle,
                        "bio":    bio,
                        "source": "profile_followers"
                    })
                    seen_handles_f.add(handle)
    i += 1

# ALSO parse the CSV header rows at the top of the file (first 12 lines)
# Format: Name,@Handle,"Bio"
csv_lines = followers_raw.split('\n')[:20]
for csv_line in csv_lines:
    parts = csv_line.split(',')
    if len(parts) >= 2 and parts[1].startswith('@'):
        name   = parts[0].strip().strip('"')
        handle = parts[1].strip().strip('"')
        bio    = parts[2].strip().strip('"') if len(parts) > 2 else ""
        if handle and handle not in seen_handles_f and name and len(name) < 60:
            profile_followers.append({
                "name":   name,
                "handle": handle,
                "bio":    bio[:200],
                "source": "profile_followers"
            })
            seen_handles_f.add(handle)

# GROUP MEMBERS — format: "Name With Spaces@handlemember" on one line
group_section = group_raw.split(group_marker)[-1] if group_marker in group_raw else group_raw
# Pattern: capture everything before @handle, then handle, then owner|member
group_member_pattern = re.compile(
    r'([A-Za-z0-9][^\n@]{1,80}?)@([A-Za-z0-9_\.\-]+?)(owner|member)\s*\n',
)

group_members = []
seen_handles_g = set()
for m in group_member_pattern.finditer(group_section):
    name   = m.group(1).strip()
    handle = "@" + m.group(2).strip()
    role   = m.group(3)
    # Filter single-letter avatar initials that slipped in
    if len(name) < 2:
        continue
    if handle not in seen_handles_g and name:
        group_members.append({
            "name":   name,
            "handle": handle,
            "role":   role,
            "source": "group_members"
        })
        seen_handles_g.add(handle)

print(f"📋 Profile followers parsed:  {len(profile_followers)}")
print(f"👥 Group members parsed:      {len(group_members)}")

# ── Write profiles ────────────────────────────────────────────
(PATHS["profile"] / "followers.json").write_text(
    json.dumps({"total": len(profile_followers), "members": profile_followers}, indent=2, ensure_ascii=False),
    encoding="utf-8"
)

(PATHS["group"] / "members.json").write_text(
    json.dumps({"total": len(group_members), "members": group_members}, indent=2, ensure_ascii=False),
    encoding="utf-8"
)

# ══════════════════════════════════════════════════════════════
# SECTION 2 — CROSS-REFERENCE: SUPER-FANS vs UNTAPPED MEMBERS
# ══════════════════════════════════════════════════════════════
follower_handles  = {f["handle"].lower() for f in profile_followers}
group_handles     = {g["handle"].lower() for g in group_members}

# Super-fans: appear in BOTH lists
super_fans = [
    g for g in group_members
    if g["handle"].lower() in follower_handles
]

# Group-only: joined group but not yet following the profile
group_only = [
    g for g in group_members
    if g["handle"].lower() not in follower_handles
]

# Profile-only: following profile but not yet in the group
profile_only = [
    f for f in profile_followers
    if f["handle"].lower() not in group_handles
]

print(f"\n🔗 Cross-reference complete:")
print(f"   Super-Fans (both):          {len(super_fans)}")
print(f"   Group-only (not following): {len(group_only)}")
print(f"   Profile-only (not in group):{len(profile_only)}")

crossref = {
    "super_fans":    {"count": len(super_fans),    "members": super_fans},
    "group_only":    {"count": len(group_only),    "members": group_only,
                      "note": "TARGET: Already in the group. One follow-request converts them to Super-Fans."},
    "profile_only":  {"count": len(profile_only),  "members": profile_only,
                      "note": "TARGET: Following the CEO's profile. One group invite converts them."},
}
(PATHS["engagement"] / "cross_reference.json").write_text(
    json.dumps(crossref, indent=2, ensure_ascii=False), encoding="utf-8"
)

# ══════════════════════════════════════════════════════════════
# SECTION 3 — PARSE & SANITIZE NOTIFICATIONS → activity_log.json
# ══════════════════════════════════════════════════════════════
notif_raw = (ROOT / "lekeelekee_Notifications.txt").read_text(encoding="utf-8")

# Clean up whitespace
lines = [l.strip() for l in notif_raw.splitlines()]

# Buckets
NOISE = {
    "removed by our moderation team",
    "Community Guidelines",
    "received a warning",
    "Active strikes",
    "PreviousNotifications",
    "Notifications",
    "Accept",
    "Decline",
}

RELATIVE_TIME_RE = re.compile(r'^\d+[hdwm]$')  # e.g. 14h, 2d, 1w

def is_noise(text):
    return any(n in text for n in NOISE) or RELATIVE_TIME_RE.match(text) or not text

# Event patterns — order matters (most specific first)
EVENT_PATTERNS = [
    (re.compile(r'^(.+?) joined (.+)$'),                        "joined_group"),
    (re.compile(r'^(.+?) started following you$'),              "new_follower"),
    (re.compile(r'^(.+?) reacted to your post\s*"([^"]*)"', re.S), "reaction"),
    (re.compile(r'^(.+?) reacted to your photo in (.+)$'),      "photo_reaction"),
    (re.compile(r'^(.+?) commented on your post\s*"([^"]*)"', re.S), "comment"),
    (re.compile(r'^(.+?) mentioned you'),                       "mention"),
    (re.compile(r'^(.+?) invited you to join (.+)$'),           "group_invite"),
]

activity_log = []
spam_warnings = []
i = 0
current_time = None

while i < len(lines):
    line = lines[i]

    # Track the most recent relative timestamp
    if RELATIVE_TIME_RE.match(line):
        current_time = line
        i += 1
        continue

    # Capture spam/moderation alerts separately
    if "moderation team" in line or "received a warning" in line or "Active strikes" in line:
        spam_warnings.append({"alert": line, "timestamp": current_time})
        i += 1
        continue

    # Skip all noise
    if is_noise(line):
        i += 1
        continue

    # Try to match an event
    matched = False
    for pattern, event_type in EVENT_PATTERNS:
        m = pattern.match(line)
        if m:
            entry = {
                "event":     event_type,
                "actor":     m.group(1).strip(),
                "timestamp": current_time or "unknown",
            }
            if event_type in ("reaction", "comment") and len(m.groups()) >= 2:
                entry["post_preview"] = m.group(2).strip()[:80]
            if event_type in ("joined_group", "group_invite", "photo_reaction") and len(m.groups()) >= 2:
                entry["target"] = m.group(2).strip()
            activity_log.append(entry)
            matched = True
            break

    i += 1

# Break down by type
by_type = {}
for entry in activity_log:
    t = entry["event"]
    by_type.setdefault(t, []).append(entry)

summary = {k: len(v) for k, v in by_type.items()}
print(f"\n📊 Activity log parsed: {len(activity_log)} events")
for k, v in summary.items():
    print(f"   {k:25s}: {v}")
print(f"   {'spam_alerts_stripped':25s}: {len(spam_warnings)}")

# Write structured activity log
(PATHS["engagement"] / "activity_log.json").write_text(
    json.dumps({
        "total_events": len(activity_log),
        "summary": summary,
        "spam_alerts_stripped": len(spam_warnings),
        "events": activity_log,
    }, indent=2, ensure_ascii=False),
    encoding="utf-8"
)

# Write spam warnings separately (archived, not in main log)
(PATHS["archives"] / "spam_alerts.json").write_text(
    json.dumps({
        "total": len(spam_warnings),
        "note": "Moderation alerts stripped from main activity log — archived here for reference.",
        "alerts": spam_warnings
    }, indent=2, ensure_ascii=False),
    encoding="utf-8"
)

# ══════════════════════════════════════════════════════════════
# SECTION 4 — ARCHIVE RAW CONTENT FILES
# ══════════════════════════════════════════════════════════════
import shutil

for src_name, dest_name in [
    ("lekeelekee_post.txt",          "post_archive.txt"),
    ("lekeelekee_group_Messages.txt","group_messages_archive.txt"),
    ("lekeelekee_Notifications.txt", "notifications_raw.txt"),
    ("lekeelekee_member_registry.json", "member_registry_raw.txt"),
]:
    src = ROOT / src_name
    if src.exists():
        shutil.copy2(src, PATHS["archives"] / dest_name)

print(f"\n📁 Archives copied: 4 files → intelligence_vault/archives/")

# ══════════════════════════════════════════════════════════════
# SECTION 5 — BUILD TRAINING DATA (CEO COMMUNICATION STYLE)
# ══════════════════════════════════════════════════════════════
# Extract CEO messages from group_messages (unlabelled messages ARE the CEO)
group_raw_text = (ROOT / "lekeelekee_group_Messages.txt").read_text(encoding="utf-8")
post_raw_text  = (ROOT / "lekeelekee_post.txt").read_text(encoding="utf-8")

# Known non-CEO speakers from the data
NON_CEO_NAMES = {
    "Charlie Pyper", "Luqman Abubakri", "Fred Ojeh", "Moses Kahanya",
    "Destiny Brotobor", "Musa Mohammed", "Godwin Ukeje (Chigo)",
    "Sam", "Albert", "Mich Blue", "Sanusi", "Cephason Kings isuwa",
    "nastyblaze", "Nastyblaze",
}

# Parse group messages: nameless blocks are CEO, named blocks are members
message_blocks = re.split(r'\n\n+', group_raw_text.strip())
ceo_messages   = []
member_messages = []

for block in message_blocks:
    block = block.strip()
    if not block:
        continue
    # Check if block starts with a known non-CEO name
    first_line = block.split('\n')[0].strip()
    is_member = any(first_line.startswith(name) for name in NON_CEO_NAMES)
    if is_member:
        member_messages.append({"speaker": first_line, "message": block})
    elif first_line and not first_line[0].isdigit():
        # Unlabelled blocks with text content = CEO
        # Strip timestamp lines (e.g. "07:15" "45")
        lines_in_block = [l for l in block.split('\n')
                          if l.strip() and not re.match(r'^\d{1,2}:\d{2}$', l.strip())
                          and not re.match(r'^\d{1,3}$', l.strip())
                          and l.strip() not in ('👍','❤️','🙏','L')]
        message_text = '\n'.join(lines_in_block).strip()
        if message_text and len(message_text) > 20:
            ceo_messages.append({
                "type":    "group_message",
                "content": message_text,
                "style_markers": {
                    "uses_hashtags": bool(re.search(r'#\w+', message_text)),
                    "uses_emojis":   bool(re.search(r'[\U0001F300-\U0001FFFE]', message_text)),
                    "uses_mentions": bool(re.search(r'@\w+', message_text)),
                    "bulleted":      bool(re.search(r'^[•\-\*]', message_text, re.M)),
                    "length":        len(message_text),
                }
            })

# Extract posts from lekeelekee_post.txt
# Format: "Post\nDATE\nCONTENT\n\n0\n0"
post_blocks = re.split(r'\nPost\n', post_raw_text)
for block in post_blocks[1:]:  # skip header
    lines_block = block.strip().split('\n')
    # First line is the date
    if not lines_block:
        continue
    date_line = lines_block[0].strip()
    content_lines = []
    for l in lines_block[1:]:
        # Stop at the engagement counters
        if re.match(r'^0\s*$', l.strip()):
            break
        content_lines.append(l)
    content = '\n'.join(content_lines).strip()
    if content and len(content) > 30:
        ceo_messages.append({
            "type":    "profile_post",
            "date":    date_line,
            "content": content,
            "style_markers": {
                "uses_hashtags": bool(re.search(r'#\w+', content)),
                "uses_emojis":   bool(re.search(r'[\U0001F300-\U0001FFFE]', content)),
                "uses_mentions": bool(re.search(r'@\w+', content)),
                "bulleted":      bool(re.search(r'^[•\-\*]', content, re.M)),
                "length":        len(content),
            }
        })

# Style analytics
total_training = len(ceo_messages)
hashtag_rate   = sum(1 for m in ceo_messages if m["style_markers"]["uses_hashtags"]) / max(total_training, 1)
emoji_rate     = sum(1 for m in ceo_messages if m["style_markers"]["uses_emojis"]) / max(total_training, 1)
avg_length     = sum(m["style_markers"]["length"] for m in ceo_messages) / max(total_training, 1)

style_profile = {
    "total_training_samples": total_training,
    "avg_message_length_chars": round(avg_length),
    "hashtag_usage_rate": f"{hashtag_rate:.0%}",
    "emoji_usage_rate":   f"{emoji_rate:.0%}",
    "signature_pattern":  "Executive authority. Thought leadership. Never casual. Ends with #hashtags.",
    "recurring_phrases": [
        "Let's build 🌍",
        "Solutions 007",
        "#007Systems",
        "#AfricanTech",
        "#BuildInNaija",
        "AMD Intel:",
        "The floor is yours",
        "Welcome to the ecosystem",
    ]
}

(PATHS["training_data"] / "ceo_messages.json").write_text(
    json.dumps({
        "style_profile": style_profile,
        "messages": ceo_messages,
    }, indent=2, ensure_ascii=False),
    encoding="utf-8"
)

# Write member interaction samples (context for bot training)
(PATHS["training_data"] / "member_interactions.json").write_text(
    json.dumps({
        "total": len(member_messages),
        "interactions": member_messages,
    }, indent=2, ensure_ascii=False),
    encoding="utf-8"
)

print(f"\n🧠 Training data built:")
print(f"   CEO messages extracted:    {total_training}")
print(f"   Member interactions:       {len(member_messages)}")
print(f"   Avg message length:        {round(avg_length)} chars")
print(f"   Hashtag usage rate:        {hashtag_rate:.0%}")
print(f"   Emoji usage rate:          {emoji_rate:.0%}")

# ══════════════════════════════════════════════════════════════
# SECTION 6 — EMPIRE CITIZEN REPORT
# ══════════════════════════════════════════════════════════════
all_handles   = follower_handles | group_handles
unique_citizens = len(all_handles)

report = {
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "empire_citizen_report": {
        "profile_followers":         len(profile_followers),
        "group_members":             len(group_members),
        "overlap_super_fans":        len(super_fans),
        "unique_total_reach":        unique_citizens,
        "formula": f"{len(profile_followers)} profile + {len(group_members)} group − {len(super_fans)} overlap = {unique_citizens} unique citizens",
    },
    "growth_intelligence": {
        "group_only_unconverted":    len(group_only),
        "profile_only_unconverted":  len(profile_only),
        "conversion_note": (
            f"{len(group_only)} group members haven't followed the CEO profile yet — "
            f"highest-priority invite targets. "
            f"{len(profile_only)} profile followers haven't joined the group yet — "
            f"send one group invite to double their engagement."
        )
    },
    "engagement_breakdown": summary,
    "spam_alerts_total": len(spam_warnings),
    "top_super_fans": [sf["name"] for sf in super_fans[:10]],
    "training_data": {
        "ceo_samples":        total_training,
        "style_profile":      style_profile,
    },
    "vault_structure": {
        "members/profile/followers.json":         f"{len(profile_followers)} profile followers",
        "members/group/members.json":             f"{len(group_members)} group members",
        "engagement/cross_reference.json":        "Super-fans, group-only, profile-only splits",
        "engagement/activity_log.json":           f"{len(activity_log)} sanitized events",
        "archives/post_archive.txt":              "Full post history",
        "archives/group_messages_archive.txt":    "Full group chat history",
        "archives/spam_alerts.json":              f"{len(spam_warnings)} stripped alerts",
        "training_data/ceo_messages.json":        f"{total_training} CEO message samples",
        "training_data/member_interactions.json": f"{len(member_messages)} member samples",
        "reports/empire_citizen_report.json":     "This report",
    }
}

(PATHS["reports"] / "empire_citizen_report.json").write_text(
    json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
)

# ── PRINT FINAL SUMMARY ──────────────────────────────────────
print(f"""
{'='*60}
  🏛️  INTELLIGENCE VAULT — SEALED
{'='*60}

  EMPIRE CITIZEN REPORT
  ─────────────────────────────────────────────
  Profile Followers:        {len(profile_followers):>4}
  Group Members:            {len(group_members):>4}
  ─── Overlap (Super-Fans): {len(super_fans):>4}
  ═══ UNIQUE TOTAL REACH:   {unique_citizens:>4}
  Formula: {report['empire_citizen_report']['formula']}

  GROWTH INTELLIGENCE
  ─────────────────────────────────────────────
  Group-only (not following):  {len(group_only):>3}  ← invite to follow profile
  Profile-only (not in group): {len(profile_only):>3}  ← invite to join group

  TOP SUPER-FANS (in both lists)
  ─────────────────────────────────────────────""")
for sf in super_fans[:10]:
    print(f"  • {sf['name']:35s} {sf['handle']}")

print(f"""
  ACTIVITY LOG (sanitized, {len(spam_warnings)} spam alerts stripped)
  ─────────────────────────────────────────────""")
for k, v in summary.items():
    print(f"  • {k:30s}: {v}")

print(f"""
  VAULT LOCATION:  intelligence_vault/
  FILES WRITTEN:   {sum(1 for _ in VAULT.rglob('*') if _.is_file())}
  STATUS:          ✅ SEALED
{'='*60}
""")
