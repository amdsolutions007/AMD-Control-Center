import fs from 'node:fs'
import path from 'node:path'
const target = path.resolve('docs/location-architecture/migration-map-wave-4.csv')
if (!fs.existsSync(target)) throw new Error(`Missing migration map: ${target}`)
const lines = fs.readFileSync(target, 'utf8').trim().split(/\r?\n/)
if (lines.length !== 76) throw new Error(`Expected 75 migration rows, found ${lines.length - 1}`)
if (lines.slice(1).some((line) => !line.includes('DEFERRED - NO LIVE CHANGE'))) throw new Error('A migration action is not deferred')
console.log(`PASS migration map: ${lines.length - 1}/75 actions remain DEFERRED`)
