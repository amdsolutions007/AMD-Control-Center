web: python -m streamlit run amd_dashboard.py --server.port=$PORT --server.address=0.0.0.0
worker: npm install -g pm2 && npx pm2-runtime ecosystem.config.js
digital_twin: python amd_digital_twin.py
