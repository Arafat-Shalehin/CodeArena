import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function CreatePostModal({
    isOpen,
    onClose,
    user,
    postContent,
    setPostContent,
    isPosting,
    handleCreatePost,
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-bg-subtle border-border relative w-full max-w-lg rounded-xl border shadow-2xl">
                <div className="border-border flex items-center justify-between border-b p-4">
                    <h3 className="text-text-primary text-lg font-bold">Create Post</h3>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-4">
                    <div className="mb-4 flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.avatarSeed || user?.name || 'User'}`}
                            />
                        </Avatar>
                        <div>
                            <p className="text-text-primary text-sm font-bold">{user?.name}</p>
                            <p className="text-text-muted text-[11px] font-medium">
                                Posting to Feed
                            </p>
                        </div>
                    </div>
                    <textarea
                        className="bg-bg-page border-border text-text-primary focus:border-accent focus:ring-accent min-h-[150px] w-full resize-none rounded-lg border p-3 text-sm outline-none focus:ring-1"
                        placeholder="Share your coding progress or ask for a hint..."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="border-border flex items-center justify-end border-t p-4">
                    <Button
                        onClick={handleCreatePost}
                        disabled={!postContent.trim() || isPosting}
                        className="px-8 font-bold"
                    >
                        {isPosting ? 'Posting...' : 'Post'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
