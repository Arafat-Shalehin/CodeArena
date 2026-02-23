import dbConnect from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { checkDockerAvailability, getExecutorImages } from '@/lib/docker/executor';
import { SUPPORTED_LANGUAGES, LANGUAGE_CONFIG } from '@/lib/docker/languages';

/**
 * GET /api/evaluation/status
 * Check evaluation system status
 */
export async function GET() {
    try {
        await dbConnect();
        // Check Docker availability
        const dockerStatus = await checkDockerAvailability();

        // Get executor images
        const images = dockerStatus.available ? await getExecutorImages() : [];

        // Check which languages are ready
        const languageStatus = SUPPORTED_LANGUAGES.map(lang => {
            const config = LANGUAGE_CONFIG[lang];
            const hasImage = images.some(img =>
                img.tags.some(tag => tag.includes(config.image.split(':')[0]))
            );

            return {
                language: lang,
                name: config.name,
                ready: hasImage,
                image: config.image,
            };
        });

        return NextResponse.json({
            success: true,
            docker: dockerStatus,
            images: images.length,
            languages: languageStatus,
            supportedLanguages: SUPPORTED_LANGUAGES,
        });

    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to check system status',
                message: error.message
            },
            { status: 500 }
        );
    }
}
