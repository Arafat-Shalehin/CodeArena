/**
 * Lazy-loads SweetAlert2 on demand to reduce initial bundle size.
 * Usage: const Swal = await getSwal(); Swal.fire(...)
 */
let swalInstance = null

export async function getSwal() {
    if (!swalInstance) {
        const Swal = (await import('sweetalert2')).default
        swalInstance = Swal
    }
    return swalInstance
}

/**
 * Convenience wrapper for Swal.fire with lazy loading
 */
export async function showSwal(options) {
    const Swal = await getSwal()
    return Swal.fire(options)
}
