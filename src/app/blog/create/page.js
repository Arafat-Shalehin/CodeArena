import { BlogEditor } from '@/features/blog'

export const metadata = {
    title: 'Create New Post | CodeArena',
    description: 'Draft and publish technical articles on CodeArena.',
}

export default function CreateBlogPage() {
    return <BlogEditor />
}
