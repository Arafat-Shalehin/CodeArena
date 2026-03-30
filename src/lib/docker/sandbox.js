import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Resolve path to the seccomp profile JSON
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SECCOMP_PROFILE_CANDIDATES = [
    // Local development / source runtime
    path.resolve(__dirname, '../../../docker/executors/seccomp-profile.json'),
    // Next standalone runtime where this file lives under .next/standalone/src/...
    path.resolve(__dirname, '../../../../docker/executors/seccomp-profile.json'),
    // Fallback from process cwd
    path.resolve(process.cwd(), 'docker/executors/seccomp-profile.json'),
]

function loadSeccompProfile() {
    for (const profilePath of SECCOMP_PROFILE_CANDIDATES) {
        try {
            if (!fs.existsSync(profilePath)) continue
            const raw = fs.readFileSync(profilePath, 'utf-8')
            return { profile: JSON.parse(raw), profilePath }
        } catch (err) {
            console.warn(
                `[SANDBOX] Failed to parse seccomp profile at ${profilePath}:`,
                err.message
            )
        }
    }
    return { profile: null, profilePath: null }
}

// Load seccomp profile at module init (fail fast if missing)
const { profile: seccompProfile, profilePath: loadedSeccompPath } = loadSeccompProfile()
if (!seccompProfile) {
    console.warn(
        `[SANDBOX] Could not load seccomp profile. Tried: ${SECCOMP_PROFILE_CANDIDATES.join(', ')}`
    )
    console.warn('[SANDBOX] Containers will run without a custom seccomp profile.')
} else {
    console.log(`[SANDBOX] Loaded seccomp profile from ${loadedSeccompPath}`)
}

// Security configurations for Docker sandbox
export const SANDBOX_CONFIG = {
    // Network settings
    network: {
        disabled: true,
        mode: 'none',
    },

    // Resource limits
    resources: {
        cpus: '0.5',
        memory: '256m',
        memorySwap: '256m',
        pidsLimit: 32,
    },

    // Security options
    security: {
        privileged: false,
        readOnly: true, // Read-only root filesystem (workspace is tmpfs)
        noNewPrivileges: true,
        capDrop: ['ALL'],
        securityOpt: ['no-new-privileges:true'],
    },

    // Filesystem restrictions
    filesystem: {
        tmpfs: {
            '/tmp': 'rw,noexec,nosuid,size=65536k',
            '/var/tmp': 'rw,noexec,nosuid,size=65536k',
        },
        workDir: '/workspace',
    },

    // Execution limits
    execution: {
        maxExecutionTime: 10000, // milliseconds
        maxOutputSize: 10485760, // 10 MB
        maxSourceSize: 65536, // 64 KB
    },

    // Ulimits for inside the container
    ulimits: {
        nofile: { Name: 'nofile', Soft: 1024, Hard: 1024 }, // Increased from 256 - Python needs more FDs during startup
        nproc: { Name: 'nproc', Soft: 128, Hard: 128 }, // Increased from 64 - Python threading and subprocess use
        fsize: { Name: 'fsize', Soft: 10485760, Hard: 10485760 }, // 10 MB file size limit
    },

    // Blacklisted patterns in code (enhanced with more dangerous operations)
    blacklist: {
        patterns: [
            // Generic dangerous calls
            /system\s*\(/i,
            /exec\s*\(/i,
            /eval\s*\(/i,

            // Python-specific
            /os\.system\s*\(/i,
            /subprocess\.run\s*\(/i,
            /subprocess\.Popen\s*\(/i,
            /subprocess\.call\s*\(/i,
            /os\.popen\s*\(/i,
            /os\.exec/i,
            /os\.fork\s*\(/i,
            /os\.kill\s*\(/i,
            /import\s+shutil/i,
            /import\s+ctypes/i,
            /__import__\s*\(/i,

            // JavaScript / Node.js
            /require\s*\(\s*['"]child_process['"]/i,
            /require\s*\(\s*['"]net['"]/i,
            /require\s*\(\s*['"]dgram['"]/i,
            /require\s*\(\s*['"]cluster['"]/i,
            /process\.binding\s*\(/i,

            // Java
            /Runtime\.getRuntime\s*\(\s*\)\s*\.exec/i,
            /ProcessBuilder/i,

            // C/C++
            /fork\s*\(/i,
            /execve\s*\(/i,
            /execvp\s*\(/i,
            /popen\s*\(/i,
            /#include\s*<windows\.h>/i,
        ],
        message: 'Code contains potentially unsafe operations',
    },
}

export const validateCodeSecurity = (code) => {
    const errors = []

    // Check code size
    if (code.length > SANDBOX_CONFIG.execution.maxSourceSize) {
        errors.push('Code size exceeds maximum allowed size')
    }

    // Check for blacklisted patterns
    for (const pattern of SANDBOX_CONFIG.blacklist.patterns) {
        if (pattern.test(code)) {
            errors.push(SANDBOX_CONFIG.blacklist.message)
            break
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

export const getDockerRunConfig = (language) => {
    const config = {
        HostConfig: {
            Memory: parseInt(SANDBOX_CONFIG.resources.memory) * 1024 * 1024,
            MemorySwap: parseInt(SANDBOX_CONFIG.resources.memorySwap) * 1024 * 1024,
            CpuPeriod: 100000,
            CpuQuota: parseInt(SANDBOX_CONFIG.resources.cpus * 100000),
            PidsLimit: SANDBOX_CONFIG.resources.pidsLimit,
            NetworkMode: SANDBOX_CONFIG.network.mode,
            ReadonlyRootfs: SANDBOX_CONFIG.security.readOnly,
            CapDrop: SANDBOX_CONFIG.security.capDrop,
            SecurityOpt: [...SANDBOX_CONFIG.security.securityOpt],
            OomKillDisable: false, // Ensure OOM killer can act on runaway processes
            Ulimits: [
                SANDBOX_CONFIG.ulimits.nofile,
                SANDBOX_CONFIG.ulimits.nproc,
                SANDBOX_CONFIG.ulimits.fsize,
            ],
            Tmpfs: {
                // Mount /tmp and /var/tmp as noexec for security
                '/tmp': 'rw,noexec,nosuid,size=65536k',
                '/var/tmp': 'rw,noexec,nosuid,size=65536k',
                // Workspace must allow execution for compiled languages (C++, Go)
                '/workspace': 'rw,exec,nosuid,size=65536k',
            },
        },
        WorkingDir: SANDBOX_CONFIG.filesystem.workDir,
        AttachStdout: true,
        AttachStderr: true,
    }

    // Apply seccomp profile if loaded successfully
    if (seccompProfile) {
        config.HostConfig.SecurityOpt.push(
            `seccomp=${JSON.stringify(seccompProfile)}`
        )
    }

    return config
}
