import json, time, urllib.request
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

BASE="http://127.0.0.1:3104"
SLUGS=["nigeria","lagos","abuja","port-harcourt","ibadan","kano","enugu","ogun","anambra","kaduna","akwa-ibom","bauchi","delta","abia","edo","kwara","plateau","nasarawa","ondo","cross-river","imo","osun"]
VPS=[(390,844),(412,915)]
OUT=Path("/Users/mac/Desktop/AMD_WEB_REMEDIATION_20261024/apps/website/docs/g00-remediation-qa")
SHOTS=OUT/"screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)

def http_status(path):
    try:
        with urllib.request.urlopen(BASE+path, timeout=10) as r:
            return r.status
    except Exception:
        return 0

o=Options()
o.binary_location="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
o.add_argument("--headless=new")
o.add_argument("--no-sandbox")
o.add_argument("--disable-gpu")
d=webdriver.Chrome(options=o)
report={"homepage":[],"locations":[],"endpoints":{}}

for ep in ["/manifest.json","/robots.txt","/sitemap.xml"]:
    report["endpoints"][ep]=http_status(ep)

for w,h in VPS:
    d.execute_cdp_cmd("Emulation.setDeviceMetricsOverride",{"width":w,"height":h,"deviceScaleFactor":1,"mobile":False})
    d.get(BASE+"/")
    time.sleep(0.35)
    data=d.execute_script("""
      const hs=[...document.querySelectorAll('h1')].filter(e=>getComputedStyle(e).display!=='none');
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        h1Count: hs.length,
        h1Text: hs.map(e=>e.innerText.trim())
      };
    """)
    shot=SHOTS/f"homepage-{w}x{h}.png"
    d.save_screenshot(str(shot))
    data["viewport"]=f"{w}x{h}"
    data["screenshot"]=str(shot)
    data["pass"]=data["innerWidth"]==w and data["scrollWidth"]<=w and data["h1Count"]==1
    report["homepage"].append(data)

for slug in SLUGS:
    for w,h in VPS:
        path="/locations/"+slug
        status=http_status(path)
        d.execute_cdp_cmd("Emulation.setDeviceMetricsOverride",{"width":w,"height":h,"deviceScaleFactor":1,"mobile":False})
        d.get(BASE+path)
        time.sleep(0.15)
        data=d.execute_script("""
          const hs=[...document.querySelectorAll('h1')].filter(e=>getComputedStyle(e).display!=='none');
          const c=document.querySelector('link[rel=canonical]');
          return {
            innerWidth: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            h1Count: hs.length,
            h1Text: hs.map(e=>e.innerText.trim()),
            canonical: c ? c.href : '',
            bodyLength: document.body.innerText.length,
            whatsappCount: document.querySelectorAll('a[href*="wa.me/2348180021007"]').length
          };
        """)
        shot=SHOTS/f"{slug}-{w}x{h}.png"
        d.save_screenshot(str(shot))
        data["route"]=path
        data["viewport"]=f"{w}x{h}"
        data["status"]=status
        data["screenshot"]=str(shot)
        data["pass"]=status==200 and data["innerWidth"]==w and data["scrollWidth"]<=w and data["h1Count"]==1 and data["bodyLength"]>500 and data["whatsappCount"]>0 and path in data["canonical"]
        report["locations"].append(data)

d.quit()
report["summary"]={
    "homepagePass":sum(1 for x in report["homepage"] if x["pass"]),
    "homepageExpected":len(report["homepage"]),
    "locationPass":sum(1 for x in report["locations"] if x["pass"]),
    "locationExpected":len(report["locations"])
}
OUT.mkdir(parents=True, exist_ok=True)
(OUT/"report.json").write_text(json.dumps(report,indent=2))
print(json.dumps({"summary":report["summary"],"endpoints":report["endpoints"],"homepage":report["homepage"]},indent=2))
