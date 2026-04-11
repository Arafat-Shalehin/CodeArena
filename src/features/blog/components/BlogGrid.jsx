import React from 'react'
import BlogCard from './BlogCard'

/**
 * BlogGrid Component
 * Layout container for BlogCard components.
 */
const BlogGrid = ({ posts }) => {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
            ))}
        </div>
    )
}

export default BlogGrid
