import fs from 'node:fs'
const baseUrl=process.argv[2] || 'http://127.0.0.1:3104'
const slugs=['nigeria','lagos','abuja','port-harcourt','ibadan','kano','enugu','ogun','anambra','kaduna','akwa-ibom','bauchi','delta','abia','edo','kwara','plateau','nasarawa','ondo','cross-river','imo','osun']
const routes=slugs.map(s=>'/locations/'+s)
const legacy=['/states/delta.html','/nigeria/delta','/states/index.html']
const results=[]
for(const route of routes){
 const response=await fetch(baseUrl+route)
 const html=await response.text()
 const canonical='https://www.amdsolutions007.com'+route
 const pass=response.status===200&&html.includes('<h1')&&html.includes(canonical)&&html.includes('https://wa.me/2348180021007')&&html.includes('application/ld+json')&&html.length>4000
 results.push({route,status:response.status,canonical,bytes:html.length,pass})
}
for(const route of legacy){
 const response=await fetch(baseUrl+route)
 results.push({route,status:response.status,legacyBaselinePreserved:response.status===200,pass:response.status===200})
}
const failures=results.filter(x=>!x.pass)
const report={generatedAt:new Date().toISOString(),baseUrl,status:failures.length?'FAIL':'PASS',results,failures}
fs.mkdirSync('docs/location-architecture',{recursive:true})
fs.writeFileSync('docs/location-architecture/runtime-validation-wave-4.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
if(failures.length)process.exit(1)
