import React, { useState, useEffect, useRef } from 'react'
import { Bot, User as UserIcon, Loader2, AlertCircle, Send } from 'lucide-react'

export default function AiChatPanel({ messages, onSend, isAiTyping, currentPhase }) {
    const [draft, setDraft] = useState('')
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isAiTyping])

    const submit = () => {
        const trimmed = draft.trim()
        if (!trimmed) return
        onSend(trimmed)
        setDraft('')
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
        }
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-border bg-bg-subtle flex h-[42px] flex-shrink-0 items-center gap-2 border-b px-4">
                <Bot size={16} className="text-accent" />
                <span className="text-text-primary text-xs font-bold">AI Interviewer</span>
                <span className="bg-accent/10 border-accent/20 text-accent ml-auto rounded-full border px-2 py-0.5 text-[9px] font-black tracking-tighter uppercase">
                    {currentPhase?.replace('_', ' ') || ''}
                </span>
                {isAiTyping && (
                    <span className="text-text-muted flex items-center gap-1 text-[11px]">
                        <Loader2 size={11} className="animate-spin" /> typing…
                    </span>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages?.length === 0 && (
                    <div className="text-text-muted flex h-full flex-col items-center justify-center gap-2 text-center text-xs">
                        <Bot size={32} className="text-accent/40" />
                        <p>The AI interviewer will guide you through the session.</p>
                        <p className="opacity-60">Ask questions or explain your approach!</p>
                    </div>
                )}

                {messages?.map((msg, idx) => {
                    const isUser = msg.role === 'user'
                    return (
                        <div
                            key={idx}
                            className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div
                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isUser
                                        ? 'bg-accent/20 text-accent'
                                        : 'bg-purple-500/20 text-purple-400'
                                }`}
                            >
                                {isUser ? <UserIcon size={14} /> : <Bot size={14} />}
                            </div>
                            <div
                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                                    isUser
                                        ? 'bg-accent/15 text-text-primary rounded-tr-none'
                                        : msg.isError
                                          ? 'rounded-tl-none border border-red-500/50 bg-red-500/10 text-red-400'
                                          : 'bg-bg-muted text-text-secondary rounded-tl-none'
                                }`}
                            >
                                {msg.content}
                                {msg.isError && (
                                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase opacity-70">
                                        <AlertCircle size={10} />
                                        System Error
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {isAiTyping && (
                    <div className="flex gap-2.5">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-400">
                            <Bot size={14} />
                        </div>
                        <div className="bg-bg-muted flex items-center gap-1 rounded-2xl rounded-tl-none px-4 py-3">
                            <span className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                            <span className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                            <span className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-border border-t p-3">
                <div className="border-border bg-bg-muted flex items-end gap-2 rounded-xl border px-3 py-2">
                    <textarea
                        rows={1}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Ask the AI or explain your approach…"
                        className="text-text-primary placeholder:text-text-muted flex-1 resize-none bg-transparent text-[13px] outline-none"
                        style={{ maxHeight: 100 }}
                    />
                    <button
                        onClick={submit}
                        disabled={!draft.trim() || isAiTyping}
                        className="text-accent hover:bg-accent/10 flex-shrink-0 rounded-lg p-1.5 transition-colors disabled:opacity-40"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-text-muted mt-1.5 text-center text-[10px]">
                    Enter to send · Shift+Enter for newline
                </p>
            </div>
        </div>
    )
}
