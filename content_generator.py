"""
Content Generator for 36 States of Tech Campaign
Generates captions and manages state rotation for Leke Leke posts
"""

import json
import os
from datetime import datetime
from typing import Dict, Optional


def _default_states_data() -> Dict:
    """Fallback dataset used when 36_states_data.json is unavailable."""
    state_seed = [
        ("Abia", "Umuahia", "South East"),
        ("Adamawa", "Yola", "North East"),
        ("Akwa Ibom", "Uyo", "South South"),
        ("Anambra", "Awka", "South East"),
        ("Bauchi", "Bauchi", "North East"),
        ("Bayelsa", "Yenagoa", "South South"),
        ("Benue", "Makurdi", "North Central"),
        ("Borno", "Maiduguri", "North East"),
        ("Cross River", "Calabar", "South South"),
        ("Delta", "Asaba", "South South"),
        ("Ebonyi", "Abakaliki", "South East"),
        ("Edo", "Benin City", "South South"),
        ("Ekiti", "Ado-Ekiti", "South West"),
        ("Enugu", "Enugu", "South East"),
        ("Gombe", "Gombe", "North East"),
        ("Imo", "Owerri", "South East"),
        ("Jigawa", "Dutse", "North West"),
        ("Kaduna", "Kaduna", "North West"),
        ("Kano", "Kano", "North West"),
        ("Katsina", "Katsina", "North West"),
        ("Kebbi", "Birnin Kebbi", "North West"),
        ("Kogi", "Lokoja", "North Central"),
        ("Kwara", "Ilorin", "North Central"),
        ("Lagos", "Ikeja", "South West"),
        ("Nasarawa", "Lafia", "North Central"),
        ("Niger", "Minna", "North Central"),
        ("Ogun", "Abeokuta", "South West"),
        ("Ondo", "Akure", "South West"),
        ("Osun", "Osogbo", "South West"),
        ("Oyo", "Ibadan", "South West"),
        ("Plateau", "Jos", "North Central"),
        ("Rivers", "Port Harcourt", "South South"),
        ("Sokoto", "Sokoto", "North West"),
        ("Taraba", "Jalingo", "North East"),
        ("Yobe", "Damaturu", "North East"),
        ("Zamfara", "Gusau", "North West"),
    ]

    states = []
    for index, (name, capital, zone) in enumerate(state_seed, start=1):
        slug = name.lower().replace(" ", "-")
        states.append(
            {
                "id": index,
                "name": name,
                "capital": capital,
                "zone": zone,
                "tech_hubs": [
                    f"{capital} Innovation Hub",
                    f"{name} Digital Hub",
                    f"{name} Startup Ecosystem",
                ],
                "notable_startups": [
                    f"{name}Tech Labs",
                    f"Build{name.replace(' ', '')}",
                    f"{capital} Ventures",
                ],
                "did_you_know": (
                    f"{name} is part of Nigeria's growing digital economy, with builders and creators "
                    "driving innovation across fintech, edtech, agritech, and creator-tech."
                ),
                "landing_page": f"https://amdsolutions007.github.io/36states/{slug}",
                "hashtags": [
                    f"#{name.replace(' ', '')}",
                    "#NaijaTech",
                    "#TechEcosystem",
                    "#BuildInPublic",
                ],
            }
        )

    return {
        "metadata": {
            "country": "Nigeria",
            "total_states": 36,
            "last_updated": datetime.now().date().isoformat(),
            "source": "fallback",
        },
        "states": states,
    }

class ContentGenerator:
    """Generates captions for Nigerian state tech spotlights"""
    
    def __init__(self, data_file: str = "36_states_data.json"):
        """Initialize with state data"""
        self.data_file = data_file
        self.states_data = self._load_data()
        self.current_day = 0
        self.progress_file = "campaign_progress.json"
        self._load_progress()
        
    def _load_data(self) -> Dict:
        """Load 36 states data from JSON"""
        try:
            with open(self.data_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"⚠️ {self.data_file} not found. Using built-in fallback dataset.")
            return _default_states_data()
            
    def _load_progress(self):
        """Load campaign progress (which day we're on)"""
        if os.path.exists(self.progress_file):
            with open(self.progress_file, 'r') as f:
                progress = json.load(f)
                self.current_day = progress.get('current_day', 0)
        else:
            self.current_day = 0
            
    def _save_progress(self):
        """Save campaign progress"""
        with open(self.progress_file, 'w') as f:
            json.dump({
                'current_day': self.current_day,
                'last_updated': datetime.now().isoformat()
            }, f, indent=2)
            
    def get_next_state(self) -> Optional[Dict]:
        """Get next state in rotation"""
        if self.current_day >= len(self.states_data['states']):
            # Campaign complete, restart
            self.current_day = 0
            
        state = self.states_data['states'][self.current_day]
        return state
        
    def generate_caption(self, state: Dict) -> str:
        """Generate Leke Leke post caption for a state"""
        
        day_num = self.current_day + 1
        
        caption = f"""🎯 DAY {day_num}/36: {state['name'].upper()} TECH ECOSYSTEM 🌍

INTEL BRIEF:
📍 Capital: {state['capital']}
🌐 Zone: {state['zone']}
💼 Tech Hubs: {', '.join(state['tech_hubs'][:2])}
🚀 Notable Startups: {', '.join(state['notable_startups'][:3])}

💡 DID YOU KNOW?
{state['did_you_know']}

👥 WHO'S BUILDING IN {state['name'].upper()}?
Drop your projects below 👇

Join the Builders 👇
www.amdsolutions007.com/tech

#{state['name'].replace(' ', '')} #Africantech #007system #AMD007 #Solutions007 #AMDsolutions #NigeriaTech #BuildDontBeg #LekeeLekee"""

        return caption
        
    def generate_next_post(self) -> Dict:
        """Generate next post (state + caption)"""
        
        state = self.get_next_state()
        caption = self.generate_caption(state)
        
        post = {
            'day': self.current_day + 1,
            'state_name': state['name'],
            'state_id': state['id'],
            'capital': state.get('capital', ''),
            'zone': state.get('zone', ''),
            'caption': caption,
            'hashtags': state['hashtags'],
            'landing_page': state['landing_page'],
            'generated_at': datetime.now().isoformat()
        }
        
        return post
        
    def mark_posted(self):
        """Mark current state as posted, move to next"""
        self.current_day += 1
        self._save_progress()
        print(f"✅ Moved to Day {self.current_day + 1}/36")
        
    def get_campaign_status(self) -> Dict:
        """Get current campaign status"""
        total = len(self.states_data['states'])
        completed = self.current_day
        remaining = total - completed
        progress_pct = (completed / total) * 100
        
        return {
            'total_states': total,
            'completed': completed,
            'remaining': remaining,
            'progress_percent': round(progress_pct, 1),
            'current_day': self.current_day + 1
        }


def demo():
    """Demo usage"""
    generator = ContentGenerator()
    
    print("=" * 80)
    print("36 STATES OF TECH - CONTENT GENERATOR")
    print("=" * 80)
    print()
    
    # Campaign status
    status = generator.get_campaign_status()
    print(f"📊 CAMPAIGN STATUS:")
    print(f"   Total States: {status['total_states']}")
    print(f"   Completed: {status['completed']}")
    print(f"   Remaining: {status['remaining']}")
    print(f"   Progress: {status['progress_percent']}%")
    print()
    
    # Generate next post
    print(f"🎯 GENERATING NEXT POST (Day {status['current_day']}/36)...")
    print()
    
    post = generator.generate_next_post()
    
    print(f"STATE: {post['state_name']}")
    print(f"DAY: {post['day']}/36")
    print()
    print("CAPTION:")
    print("-" * 80)
    print(post['caption'])
    print("-" * 80)
    print()
    print(f"🔗 Landing Page: {post['landing_page']}")
    print()
    print("=" * 80)


if __name__ == "__main__":
    demo()
