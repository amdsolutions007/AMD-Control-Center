import streamlit as st
import time

# --- APP CONFIGURATION ---
st.set_page_config(page_title="Japa Readiness AI 🇳🇬✈️", page_icon="✈️", layout="centered")

# --- CUSTOM CSS (Black & Gold Theme) ---
st.markdown("""
    <style>
    .stApp {
        background-color: #000000;
        color: #D4AF37;
    }
    h1, h2, h3, p, label {
        color: #D4AF37 !important;
        font-family: 'Courier New', monospace;
    }
    .stButton>button {
        background-color: #D4AF37;
        color: #000000;
        font-weight: bold;
        border-radius: 10px;
        border: none;
        width: 100%;
        padding: 10px;
    }
    .stProgress > div > div > div > div {
        background-color: #D4AF37;
    }
    </style>
""", unsafe_allow_html=True)

# --- HEADER ---
st.title("🇳🇬 JAPA READINESS AI")
st.markdown("### By AMD Solutions 007")
st.write("🤖 *'I analyze your finances, skills, and visa options to predict your survival rate abroad.'*")

# --- INPUT FORM ---
with st.form("japa_form"):
    name = st.text_input("What is your Name?", "Olawale")
    budget = st.slider("Budget ($ USD)", 0, 50000, 5000)
    skills = st.multiselect("Select Your High-Income Skills", 
        ["Tech/Coding", "Nursing/Medical", "Plumbing/Trade", "Digital Marketing", "None (Just Vibez)"])
    destination = st.selectbox("Target Destination", ["UK 🇬🇧", "Canada 🇨🇦", "USA 🇺🇸", "Germany 🇩🇪"])
    
    submitted = st.form_submit_button("CALCULATE MY FATE 🚀")

# --- AI LOGIC ---
if submitted:
    with st.spinner("Consulting the Ancestors..."):
        time.sleep(2)
        
        # Scoring Algorithm
        score = 0
        
        # Budget Check
        if budget > 20000: score += 40
        elif budget > 10000: score += 20
        else: score += 5
        
        # Skills Check
        if "Tech/Coding" in skills or "Nursing/Medical" in skills: score += 40
        elif "Plumbing/Trade" in skills: score += 30
        elif "None (Just Vibez)" in skills: score -= 10
        else: score += 10
        
        # Destination Adjustment
        if destination == "USA 🇺🇸" and budget < 15000: score -= 10  # Hard mode
        
        # --- THE VERDICT ---
        st.divider()
        st.subheader(f"JAPA SCORE: {score}%")
        
        if score >= 80:
            st.balloons()
            st.success(f"✅ {name}, PACK YOUR BAGS! You are ready to dominate {destination}.")
            st.markdown("**Recommendation:** Book your flight today.")
        elif score >= 50:
            st.warning(f"⚠️ {name}, It will be rough.")
            st.markdown("**Recommendation:** Learn one more skill or save $5k more.")
        else:
            st.error(f"🛑 {name}, SIT DOWN.")
            st.markdown(f"**Verdict:** If you go to {destination} now, you will wash plates. Build your empire here first.")