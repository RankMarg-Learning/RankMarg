'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from '@repo/common-ui'
import { Button } from '@repo/common-ui'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

interface Suggestion {
    id: string
    type: string
    category: string
    message: string
    priority: number
    actionName: string | null
    actionUrl: string | null
    sequenceOrder: number
    index: number
    total: number
}

interface AgentChatProps {
    className?: string
}

export default function AgentChat({ className = '' }: AgentChatProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [streamComplete, setStreamComplete] = useState(false)
    const eventSourceRef = useRef<EventSource | null>(null)

    // Sample "You can also ask" questions
    const sampleArticles = [
        { name: "The Silent Reason Students Forget What They Studied Last Month", slug: "the-silent-reason-students-forget-what-they-studied-last-month" },
        { name: "Revision vs Re-learning: Why Smart Students Stop Improving and How to Fix It", slug: "revision-vs-re-learning-why-smart-students-stop-improving-and-how-to-fix-it" },
        { name: "Why JEE & NEET Aspirants Stop Improving | Personalized Practice", slug: "why-jee-neet-aspirants-stop-improving-personalized-practice" },

    ]

    // Sample "Practice MCQs on" topics
    const practiceTopics = [
        { name: 'Current Affairs', url: '/ai-practice?topic=current-affairs' },
        { name: 'Indian Polity', url: '/ai-practice?topic=indian-polity' },
        { name: 'Economics', url: '/ai-practice?topic=economics' },
    ]

    // Connect to stream when component mounts
    useEffect(() => {
        const abortController = new AbortController()
        connectToStream(abortController.signal)

        return () => {
            // Abort the fetch request on unmount
            abortController.abort()
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
            }
        }
    }, [])

    const connectToStream = async (signal: AbortSignal) => {
        try {
            setIsLoading(true)
            setError(null)
            setSuggestions([])
            setStreamComplete(false)

            // Build the URL - backend uses /api/suggestion/stream (singular)
            const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
            const url = `${baseURL}/api/suggestion/stream`

            // Use native fetch with credentials for cookie-based auth
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'text/event-stream',
                },
                credentials: 'include', // Important: sends cookies for session auth
                signal, // Pass abort signal to cancel request
            })

            if (!response.ok) {
                throw new Error(`Failed to connect: ${response.status} ${response.statusText}`)
            }

            if (!response.body) {
                throw new Error('No response body')
            }

            setIsLoading(false)
            setIsStreaming(true)

            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    setIsStreaming(false)
                    break
                }

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (!line.trim()) continue

                    const eventMatch = line.match(/^event: (.+)$/m)
                    const dataMatch = line.match(/^data: (.+)$/m)

                    if (eventMatch && dataMatch) {
                        const eventType = eventMatch[1]
                        const data = JSON.parse(dataMatch[1])

                        if (eventType === 'suggestion') {
                            setSuggestions((prev) => [...prev, data])
                        } else if (eventType === 'complete') {
                            setStreamComplete(true)
                            setIsStreaming(false)
                        } else if (eventType === 'error') {
                            setError(data.message)
                            setIsStreaming(false)
                        } else if (eventType === 'empty') {
                            setStreamComplete(true)
                            setIsStreaming(false)
                        }
                    }
                }
            }
        } catch (err) {
            // Ignore abort errors (when component unmounts)
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('Stream connection aborted')
                return
            }

            console.error('Stream connection error:', err)
            setError(err instanceof Error ? err.message : 'Failed to load suggestions')
            setIsLoading(false)
            setIsStreaming(false)
        }
    }

    return (
        <div className={`max-w-4xl mx-auto px-4 py-8 ${className}`}>
            {/* Header with Action Buttons */}
            <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                    <Image
                        src="/logo_circle.png"
                        alt="RankMarg Coach"
                        width={80}
                        height={80}
                        className="rounded-full shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
                    />
                </div>

            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your personalized coaching...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center p-8 bg-red-50 border border-red-200 rounded-xl my-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => connectToStream(new AbortController().signal)} variant="destructive">
                        Try Again
                    </Button>
                </div>
            )}

            {/* Chat Messages */}
            {!isLoading && !error && (
                <div className="flex flex-col gap-4 my-8">
                    {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="flex gap-2 items-start animate-in fade-in slide-in-from-bottom-2 duration-400">
                            {/* Agent Avatar */}
                            <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src="/logo_circle.png" alt="RankMarg Coach" />
                                <AvatarFallback>RM</AvatarFallback>
                            </Avatar>

                            {/* Message Content */}
                            <div className="flex-1 flex flex-col gap-0 bg-gray-50 px-5 py-3 gap-2  rounded-tr-xl rounded-br-xl rounded-bl-xl">
                                <div className=" rounded-tr-xl rounded-br-xl rounded-bl-xl  text-gray-900 text-[15px] leading-relaxed">
                                    {suggestion.message}
                                </div>

                                {suggestion.actionName && suggestion.actionUrl && (
                                    <Link
                                        href={suggestion.actionUrl}
                                    >
                                        <Button
                                            variant='outline'
                                            className="inline-flex items-center border-primary-600 gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm py-2 rounded-full "
                                        >
                                            {suggestion.actionName}
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isStreaming && (
                        <div className="flex gap-2 items-start">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src="/logo_circle.png" alt="RankMarg Coach" />
                                <AvatarFallback>RM</AvatarFallback>
                            </Avatar>

                            <div className="bg-gray-50 px-5 py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl flex gap-2 w-fit">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* You Can Also Ask Section */}
            {streamComplete && suggestions.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">You can also read this</h3>
                    <div className="flex flex-col gap-3">
                        {sampleArticles.map((art, index) => (
                            <Link
                                href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/articles/${art.slug}`}
                                target='_blank'
                                key={index}
                                className="flex items-center justify-between p-4 px-5 py-3  bg-gray-50 border rounded-lg hover:bg-white hover:border-primary-500 hover:shadow-md  "

                            >
                                <span className="text-gray-700 text-[15px] truncate">{art.name}</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Practice MCQs Section */}
            {streamComplete && suggestions.length > 0 && (
                <div className="mt-12 hidden">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice MCQs on</h3>
                    <div className="flex gap-3 flex-wrap">
                        {practiceTopics.map((topic, index) => (
                            <Button
                                key={index}
                                className="px-5 py-2.5 bg-gray-50 border text-primary-600 rounded-full text-sm font-semibold hover:bg-primary-50 hover:text-primary-600 hover:border-primary-500 hover:-translate-y-0.5 transition-all"
                            >
                                {topic.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
