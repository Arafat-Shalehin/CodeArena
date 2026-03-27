const PROCESS_TYPES = {
    API: 'API',
    WORKER: 'WORKER',
}

export function getProcessType() {
    const raw = (process.env.PROCESS_TYPE || PROCESS_TYPES.API).toUpperCase()
    if (raw === PROCESS_TYPES.WORKER) return PROCESS_TYPES.WORKER
    return PROCESS_TYPES.API
}

export function isApiProcess() {
    return getProcessType() === PROCESS_TYPES.API
}

export function isWorkerProcess() {
    return getProcessType() === PROCESS_TYPES.WORKER
}

export { PROCESS_TYPES }
