// Security configurations for Docker sandbox
export const SANDBOX_CONFIG = {
    // Network settings
    network: {
        disabled: true,
        mode: 'none',
    },

    // Resource limits
    resources: {
        cpus: '1.0',
        memory: '512m',
        memorySwap: '512m',
        pidsLimit: 50,
    },

    // Security options
    security: {
        privileged: false,
        readOnly: false,
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

    // Blacklisted patterns in code
    blacklist: {
        patterns: [
            /system\s*\(/i,
            /exec\s*\(/i,
            /eval\s*\(/i,
            /import\s+os/i,
            /import\s+subprocess/i,
            /require\s*\(\s*['"]child_process['"]/i,
            /require\s*\(\s*['"]fs['"]/i,
            /#include\s*<windows\.h>/i,
        ],
        message: 'Code contains potentially unsafe operations',
    },
};

export const validateCodeSecurity = (code) => {
    const errors = [];

    // Check code size
    if (code.length > SANDBOX_CONFIG.execution.maxSourceSize) {
        errors.push('Code size exceeds maximum allowed size');
    }

    // Check for blacklisted patterns
    for (const pattern of SANDBOX_CONFIG.blacklist.patterns) {
        if (pattern.test(code)) {
            errors.push(SANDBOX_CONFIG.blacklist.message);
            break;
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export const getDockerRunConfig = (language) => {
    return {
        HostConfig: {
            Memory: parseInt(SANDBOX_CONFIG.resources.memory) * 1024 * 1024,
            MemorySwap: parseInt(SANDBOX_CONFIG.resources.memorySwap) * 1024 * 1024,
            CpuPeriod: 100000,
            CpuQuota: parseInt(SANDBOX_CONFIG.resources.cpus * 100000),
            PidsLimit: SANDBOX_CONFIG.resources.pidsLimit,
            NetworkMode: SANDBOX_CONFIG.network.mode,
            ReadonlyRootfs: SANDBOX_CONFIG.security.readOnly,
            CapDrop: SANDBOX_CONFIG.security.capDrop,
            SecurityOpt: SANDBOX_CONFIG.security.securityOpt,
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
    };
};
