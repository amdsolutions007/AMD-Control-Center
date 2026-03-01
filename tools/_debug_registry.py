import re

text = open('lekeelekee_member_registry.json').read()
follower_part = text.split('Showing all 60 followers')[0]
# Show first 1200 chars with repr
print(repr(follower_part[300:1200]))

# Also show group_section
print('\n\n--- GROUP SECTION SAMPLE ---')
group_part = text.split('Invite Members')[-1]
print(repr(group_part[:500]))
