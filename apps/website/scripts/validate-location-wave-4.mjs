import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd()
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8')
const json=(p)=>JSON.parse(read(p))
const wave3=json('src/data/location-wave-3.json')
const wave4=json('src/data/location-wave-4.json')
const governance=json('src/data/location-governance.json')
const network=read('src/lib/location-network.ts')
const component=read('src/components/location/LocationLandingPage.tsx')
const page=read('src/app/locations/[slug]/page.tsx')
const migration=read('docs/location-architecture/migration-map-wave-4.csv').trim().split(/\r?\n/)
const baseSlugs=['nigeria','lagos','abuja','port-harcourt','ibadan','kano','enugu','ogun','anambra','kaduna','akwa-ibom','bauchi']
const wave3Slugs=['delta','abia','edo','kwara','plateau']
const wave4Slugs=['nasarawa','ondo','cross-river','imo','osun']
const slugs=[...baseSlugs,...wave3Slugs,...wave4Slugs]
const failures=[],checks=[]
const check=(name,ok,detail)=>{const row={name,status:ok?'PASS':'FAIL',detail};checks.push(row);if(!ok)failures.push(row)}
check('22 governed routes',Object.keys(governance).length===22,String(Object.keys(governance).length)+'/22')
check('Exactly five Wave 4 states',wave4.length===5&&wave4Slugs.every(s=>wave4.some(r=>r.slug===s))&&wave4.every(r=>wave4Slugs.includes(r.slug)),wave4.map(r=>r.slug).join(', '))
check('Exactly five Wave 3 states',wave3.length===5&&wave3Slugs.every(s=>wave3.some(r=>r.slug===s)),wave3.map(r=>r.slug).join(', '))
const baseMarker='const baseLocations: LocationRecord[] = '
const baseStart=network.indexOf(baseMarker)+baseMarker.length
const baseEnd=network.indexOf('\nconst governance',baseStart)
const base=JSON.parse(network.slice(baseStart,baseEnd))
const titles=[...base.map(r=>r.title),...wave3.map(r=>r.title),...wave4.map(r=>r.title)]
const descriptions=[...base.map(r=>r.description),...wave3.map(r=>r.description),...wave4.map(r=>r.description)]
const h1s=[...base.map(r=>r.h1),...wave3.map(r=>r.h1),...wave4.map(r=>r.h1)]
check('Unique titles',titles.length===22&&new Set(titles).size===22,String(new Set(titles).size)+'/'+String(titles.length))
check('Unique descriptions',descriptions.length===22&&new Set(descriptions).size===22,String(new Set(descriptions).size)+'/'+String(descriptions.length))
check('Unique H1s',h1s.length===22&&new Set(h1s).size===22,String(new Set(h1s).size)+'/'+String(h1s.length))
check('Governance coverage',slugs.every(s=>governance[s]?.evidenceReviewedAt&&governance[s]?.contentOwner&&governance[s]?.demandConfidence&&governance[s]?.lastValidatedAt),'22/22 required fields')
check('Related locations',slugs.every(s=>{const x=governance[s]?.relatedLocations||[];return x.length>=3&&x.length<=6&&!x.includes(s)&&new Set(x).size===x.length&&x.every(v=>slugs.includes(v))}),'3–6 valid non-self peers per route')
const w4=JSON.stringify(wave4).toLowerCase()
check('Nasarawa claim lock',!/(45 minutes|90 minutes|45-minute|90-minute)/.test(w4),'No exact Abuja travel time')
check('Ondo coastline lock',!/(180 km|75 km|180km|75km)/.test(w4),'No coastline length figure')
check('Ondo port truth',!/deep[- ]?sea port.{0,120}(operational|operating)/s.test(w4),'No operational-port claim')
check('Approved schema graph',['Organization','WebSite','WebPage','Service','BreadcrumbList','FAQPage'].every(x=>component.includes("'@type': '"+x+"'")),'Approved graph types present')
check('Prohibited schema absence',['LocalBusiness','PostalAddress','AggregateRating','Review'].every(x=>!component.includes("'@type': '"+x+"'")),'No prohibited state schema')
check('Remote-service truth',component.includes('does not represent an AMD office, branch or local team'),'Explicit non-Lagos denial')
check('Canonical WhatsApp',network.includes('https://wa.me/2348180021007')&&network.includes('+2348180021007'),'Canonical contact preserved')
check('Self-canonical',page.includes('alternates: { canonical }')&&component.includes('/locations/')&&component.includes('location.slug'),'Per-route AMD-domain canonical')
check('Crawlable static generation',page.includes('generateStaticParams')&&page.includes('dynamicParams = false'),'Static params bounded to governed network')
check('Migration actions deferred',migration.length===76&&migration.slice(1).every(line=>line.includes('DEFERRED - NO LIVE CHANGE')),String(migration.length-1)+'/75')
const stop=new Set(['with','that','from','this','your','into','where','business','businesses','digital','systems','website','websites','automation','services','service','remote','lagos'])
const tokens=(s)=>new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>3&&!stop.has(w)))
const content=(r)=>[r.summary,...r.market,...r.centres,...r.services,...r.journey,...r.faq.flatMap(x=>[x.question,x.answer])].join(' ')
const sims=[]
for(let i=0;i<wave4.length;i++)for(let j=i+1;j<wave4.length;j++){const a=tokens(content(wave4[i])),b=tokens(content(wave4[j]));const inter=[...a].filter(x=>b.has(x)).length;const union=new Set([...a,...b]).size;sims.push({pair:wave4[i].slug+' / '+wave4[j].slug,percentage:+(100*inter/union).toFixed(1)})}
sims.sort((a,b)=>b.percentage-a.percentage)
check('Wave 4 similarity',sims[0]?.percentage<=35,String(sims[0]?.percentage)+'% ('+sims[0]?.pair+')')
const report={generatedAt:new Date().toISOString(),status:failures.length?'FAIL':'PASS',routeCount:22,wave4RouteCount:5,migrationRouteCount:75,highestWave4Similarity:sims[0],wave4SimilarityMatrix:sims,checks,failures}
fs.mkdirSync(path.join(root,'docs/location-architecture'),{recursive:true})
fs.writeFileSync(path.join(root,'docs/location-architecture/validation-report-wave-4.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
if(failures.length)process.exit(1)
