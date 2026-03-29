// // Store workers globally to prevent garbage collection
// let globalWorkers = {
//     submission: null,
//     stats: null,
//     ai: null,
//     interviewAI: null,
// }

// export async function register() {
//     console.log('[INSTRUMENTATION] register() called')
//     console.log('[INSTRUMENTATION] NEXT_RUNTIME:', process.env.NEXT_RUNTIME)

//     if (process.env.NEXT_RUNTIME === 'nodejs') {
//         const isBuild =
//             process.env.NEXT_PHASE === 'phase-production-build' ||
//             process.env.SKIP_WORKER_INIT === 'true'

//         if (isBuild) {
//             console.log('[INSTRUMENTATION] Skipping worker initialization during build phase.')
//             return
//         }

//         console.log('[INSTRUMENTATION] Running in Node.js runtime, initializing workers...')
//         try {
//             console.log('[INSTRUMENTATION] Importing submission worker...')
//             const { initSubmissionWorker } = await import('@/services/submission.worker')
//             const { initStatsWorker } = await import('@/services/stats.worker')
//             const { initAIWorker } = await import('@/services/ai.worker')
//             const { initInterviewAIWorker } = await import('@/services/interviewAI.worker')

//             console.log('[INSTRUMENTATION] Calling initSubmissionWorker...')
//             if (globalWorkers.submission) await globalWorkers.submission.close()
//             globalWorkers.submission = initSubmissionWorker()

//             console.log('[INSTRUMENTATION] Calling initStatsWorker...')
//             if (globalWorkers.stats) await globalWorkers.stats.close()
//             globalWorkers.stats = initStatsWorker()

//             console.log('[INSTRUMENTATION] Calling initAIWorker...')
//             if (globalWorkers.ai) await globalWorkers.ai.close()
//             globalWorkers.ai = initAIWorker()

//             console.log('[INSTRUMENTATION] Calling initInterviewAIWorker...')
//             if (globalWorkers.interviewAI) await globalWorkers.interviewAI.close()
//             globalWorkers.interviewAI = initInterviewAIWorker()
//             globalThis._workersInitialized = true
//             console.log(
//                 '>>> CodeArena Workers v2.1 Initialized (Submission, Stats, AI, InterviewAI)'
//             )
//         } catch (err) {
//             console.error('[CRITICAL] Failed to initialize Workers:', err.message)
//             console.error('[CRITICAL] Error stack:', err.stack)
//         }

//         // Start Reaction Sync Worker (runs every 5 minutes)
//         try {
//             const { default: syncReactions } = await import('@/scripts/reactionSyncWorker')
//             setInterval(
//                 () => {
//                     syncReactions().catch((err) => {
//                         console.error('[ERROR] Reaction Sync Worker failed:', err.message)
//                         // Error is caught and logged, worker continues running
//                     })
//                 },
//                 5 * 60 * 1000
//             )
//             console.log('>>> CodeArena Reaction Sync Scheduler Initialized')
//         } catch (err) {
//             console.error('[CRITICAL] Failed to initialize Reaction Sync Scheduler:', err.message)
//         }

//         // Start Contest Reminder Worker (runs every 5 minutes)
//         try {
//             const { checkUpcomingContests } = await import('@/services/notification.service')
//             setInterval(
//                 () => {
//                     checkUpcomingContests().catch((err) => {
//                         console.error('[ERROR] Contest Reminder Worker failed:', err.message)
//                         // Error is caught and logged, worker continues running
//                     })
//                 },
//                 5 * 60 * 1000
//             )
//             console.log('>>> CodeArena Contest Reminder Scheduler Initialized')
//         } catch (err) {
//             console.error(
//                 '[CRITICAL] Failed to initialize Contest Reminder Scheduler:',
//                 err.message
//             )
//         }
//     }
// }
/**
 * CodeArena Instrumentation
 * ডেভেলপমেন্ট মোডে ডুপ্লিকেট ওয়ার্কার এবং মেমোরি লিক রোধ করার জন্য global ভেরিয়েবল ব্যবহার করা হয়েছে।
 */

export async function register() {
    console.log('[INSTRUMENTATION] register() called');

    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // ১. বিল্ড ফেজে ওয়ার্কার চালু হওয়া বন্ধ করা
        const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.SKIP_WORKER_INIT === 'true';

        if (isBuild) {
            console.log('[INSTRUMENTATION] Skipping worker initialization during build phase.');
            return;
        }

        // ২. ডুপ্লিকেট ইনিশিয়ালাইজেশন চেক (খুবই গুরুত্বপূর্ণ)
        if (global._workersInitialized) {
            console.log('[INSTRUMENTATION] Workers already initialized. Skipping...');
            return;
        }

        console.log('[INSTRUMENTATION] Running in Node.js runtime, initializing workers...');

        try {
            // ৩. ডাইনামিক ইমপোর্ট (Dynamic Imports)
            const { initSubmissionWorker } = await import('@/services/submission.worker');
            const { initStatsWorker } = await import('@/services/stats.worker');
            const { initAIWorker } = await import('@/services/ai.worker');
            const { initInterviewAIWorker } = await import('@/services/interviewAI.worker');

            // ৪. ওয়ার্কার ইনিশিয়ালাইজেশন এবং গ্লোবাল স্টোরেজ
            // পুরনো ওয়ার্কার থাকলে তা ক্লোজ করার প্রয়োজন নেই যদি আমরা global চেক ব্যবহার করি
            global.submissionWorker = initSubmissionWorker();
            global.statsWorker = initStatsWorker();
            global.aiWorker = initAIWorker();
            global.interviewAIWorker = initInterviewAIWorker();

            // ৫. শিডিউলার লজিক (Reaction Sync)
            const { default: syncReactions } = await import('@/scripts/reactionSyncWorker');
            setInterval(() => {
                syncReactions().catch((err) => {
                    console.error('[ERROR] Reaction Sync Worker failed:', err.message);
                });
            }, 5 * 60 * 1000);
            console.log('>>> CodeArena Reaction Sync Scheduler Initialized');

            // ৬. শিডিউলার লজিক (Contest Reminder)
            const { checkUpcomingContests } = await import('@/services/notification.service');
            setInterval(() => {
                checkUpcomingContests().catch((err) => {
                    console.error('[ERROR] Contest Reminder Worker failed:', err.message);
                });
            }, 5 * 60 * 1000);
            console.log('>>> CodeArena Contest Reminder Scheduler Initialized');

            // ফ্ল্যাগ সেট করা যাতে নেক্সট রিলোডে আর রান না হয়
            global._workersInitialized = true;

            console.log(
                '>>> CodeArena Workers v2.2 Initialized (Submission, Stats, AI, InterviewAI)'
            );

        } catch (err) {
            console.error('[CRITICAL] Failed to initialize Workers:', err.message);
            if (err.stack) console.error('[CRITICAL] Error stack:', err.stack);
        }
    }
}