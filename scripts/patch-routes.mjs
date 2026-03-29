import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const apiDir = './src/app/api'
const HEADER = "export const dynamic = 'force-dynamic';\n"

function getAllRouteFiles(dir) {
    const results = []
    const items = readdirSync(dir)
    for (const item of items) {
        const fullPath = join(dir, item)
        if (statSync(fullPath).isDirectory()) {
            results.push(...getAllRouteFiles(fullPath))
        } else if (item === 'route.js') {
            results.push(fullPath)
        }
    }
    return results
}

const files = getAllRouteFiles(apiDir)
console.log(`Found ${files.length} route files\n`)

for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    if (content.includes('force-dynamic')) {
        console.log(`⏭  Skip (already has it): ${file}`)
        continue
    }
    writeFileSync(file, HEADER + '\n' + content, 'utf-8')
    console.log(`✅ Patched: ${file}`)
}

console.log('\nDone!')
