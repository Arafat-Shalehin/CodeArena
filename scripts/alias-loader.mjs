import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const projectRoot = process.cwd()

function resolveAliasPath(specifier) {
    const raw = specifier.slice(2)
    const basePath = path.join(projectRoot, 'src', raw)

    if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
        return basePath
    }

    if (fs.existsSync(`${basePath}.js`)) {
        return `${basePath}.js`
    }

    if (fs.existsSync(path.join(basePath, 'index.js'))) {
        return path.join(basePath, 'index.js')
    }

    return null
}

export async function resolve(specifier, context, defaultResolve) {
    if (specifier.startsWith('@/')) {
        const resolvedPath = resolveAliasPath(specifier)
        if (resolvedPath) {
            return {
                url: pathToFileURL(resolvedPath).href,
                shortCircuit: true,
            }
        }
    }

    return defaultResolve(specifier, context, defaultResolve)
}
