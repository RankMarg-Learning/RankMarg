'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback, Skeleton, Badge } from '@repo/common-ui'
import { Button } from '@repo/common-ui'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
import ErrorCTA from './error'

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

function formatMessage(message: string) {
    const parts: React.ReactNode[] = []
    let key = 0

    const parseInlineFormatting = (text: string): React.ReactNode[] => {
        const inlineParts: React.ReactNode[] = []
        let lastIndex = 0

        while (lastIndex < text.length) {
            const boldMatch = text.slice(lastIndex).match(/^\*\*([^*]+)\*\*/)
            if (boldMatch) {
                inlineParts.push(
                    <strong key={`bold-${key++}`} className="font-bold text-gray-900">
                        {boldMatch[1]}
                    </strong>
                )
                lastIndex += boldMatch[0].length
                continue
            }

            // Match italic: *text*
            const italicMatch = text.slice(lastIndex).match(/^\*([^*]+)\*/)
            if (italicMatch) {
                inlineParts.push(
                    <em key={`italic-${key++}`} className="italic text-gray-800">
                        {italicMatch[1]}
                    </em>
                )
                lastIndex += italicMatch[0].length
                continue
            }

            // Find next special character
            const nextSpecial = text.slice(lastIndex).search(/\*/)
            if (nextSpecial === -1) {
                inlineParts.push(
                    <span key={`text-${key++}`}>
                        {text.slice(lastIndex)}
                    </span>
                )
                break
            } else {
                inlineParts.push(
                    <span key={`text-${key++}`}>
                        {text.slice(lastIndex, lastIndex + nextSpecial)}
                    </span>
                )
                lastIndex += nextSpecial
            }
        }

        return inlineParts
    }

    const lines = message.split('\n')

    lines.forEach((line, lineIndex) => {
        if (lineIndex > 0) {
            parts.push(<br key={`br-${key++}`} />)
        }

        let currentLine = line
        let lastIndex = 0
        const lineParts: React.ReactNode[] = []

        while (lastIndex < currentLine.length) {
            const subtopicMatch = currentLine.slice(lastIndex).match(/^\[\[([^\]]+)\]\]/)
            if (subtopicMatch) {
                lineParts.push(
                    <Badge
                        key={`badge-${key++}`}
                        variant="outline"
                        className="mx-0.5 sm:mx-1 mb-1 inline-flex bg-primary-50 text-primary-700  text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5"
                    >
                        {subtopicMatch[1]}
                    </Badge>
                )
                lastIndex += subtopicMatch[0].length
                continue
            }

            const topicMatch = currentLine.slice(lastIndex).match(/^\[([^\]]+)\]/)
            if (topicMatch) {
                const innerContent = topicMatch[1]
                lineParts.push(
                    <span key={`topic-${key++}`} className="font-semibold text-gray-800 mx-0.5 sm:mx-1 text-sm pl-2 my-4 border-l-4 border-l-primary-600">
                        {parseInlineFormatting(innerContent)}
                    </span>
                )
                lastIndex += topicMatch[0].length
                continue
            }

            const boldMatch = currentLine.slice(lastIndex).match(/^\*\*([^*]+)\*\*/)
            if (boldMatch) {
                lineParts.push(
                    <strong key={`bold-${key++}`} className="font-bold text-gray-900">
                        {boldMatch[1]}
                    </strong>
                )
                lastIndex += boldMatch[0].length
                continue
            }


            const italicMatch = currentLine.slice(lastIndex).match(/^\*([^*]+)\*/)
            if (italicMatch) {
                lineParts.push(
                    <em key={`italic-${key++}`} className="italic text-gray-800">
                        {italicMatch[1]}
                    </em>
                )
                lastIndex += italicMatch[0].length
                continue
            }

            const nextSpecial = currentLine.slice(lastIndex).search(/[\[*]/)
            if (nextSpecial === -1) {
                lineParts.push(
                    <span key={`text-${key++}`}>
                        {currentLine.slice(lastIndex)}
                    </span>
                )
                break
            } else {
                lineParts.push(
                    <span key={`text-${key++}`}>
                        {currentLine.slice(lastIndex, lastIndex + nextSpecial)}
                    </span>
                )
                lastIndex += nextSpecial
            }
        }

        parts.push(...lineParts)
    })

    return <>{parts}</>
}

export default function AgentChat({ className = '' }: AgentChatProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [streamComplete, setStreamComplete] = useState(false)
    const eventSourceRef = useRef<EventSource | null>(null)


    const sampleArticles = [
        { name: "The Silent Reason Students Forget What They Studied Last Month", slug: "the-silent-reason-students-forget-what-they-studied-last-month" },
        { name: "Revision vs Re-learning: Why Smart Students Stop Improving and How to Fix It", slug: "revision-vs-re-learning-why-smart-students-stop-improving-and-how-to-fix-it" },
        { name: "Why JEE & NEET Aspirants Stop Improving | Personalized Practice", slug: "why-jee-neet-aspirants-stop-improving-personalized-practice" },

    ]

    const badges = [
        { name: "Mistakes Tracker", url: "/mistakes-tracker" },
        { name: "Analytics", url: "/analytics" },
    ]


    useEffect(() => {
        const abortController = new AbortController()
        connectToStream(abortController.signal)

        return () => {
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

            const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
            const url = `${baseURL}/api/suggestion/stream`

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'text/event-stream',
                },
                credentials: 'include',
                signal,
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
        <div className={`max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 ${className}`}>
            {/* Header with Action Buttons */}
            <div className="text-center mb-6 sm:mb-12 hidden">
                <div className="flex justify-center mb-4 sm:mb-6">
                    <Image
                        src="/aniq.png"
                        alt="AniQ"
                        width={60}
                        height={60}
                        className="sm:w-20 sm:h-20 rounded-full shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
                    />
                </div>

            </div>

            {isLoading && (
                <div className="flex flex-col gap-3 sm:gap-4 my-4 sm:my-8">
                    <div className="flex gap-2 items-start">
                        <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full" />
                        <div className="flex-1 bg-gray-50 px-3 sm:px-5 py-2.5 sm:py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl space-y-2.5">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>

                    <div className="flex gap-2 items-start">
                        <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full" />
                        <div className="flex-1 bg-gray-50 px-3 sm:px-5 py-2.5 sm:py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl space-y-2.5">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>

                    <div className="flex gap-2 items-start">
                        <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full" />
                        <div className="flex-1 bg-gray-50 px-3 sm:px-5 py-2.5 sm:py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl space-y-2.5">
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-2/3" />
                            <div className="pt-1">
                                <Skeleton className="h-9 w-32 rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-gray-500 text-sm animate-pulse">Analyzing your progress and generating personalized suggestions...</p>
                    </div>
                </div>
            )}

            {error && (
                <ErrorCTA message={error} />
            )}


            {!isLoading && !error && (
                <div className="flex flex-col gap-3 sm:gap-4 my-4 sm:my-8">
                    {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="flex flex-col sm:flex-row gap-1 sm:items-start animate-in fade-in slide-in-from-bottom-2 duration-400">
                            {/* Mobile: Logo + RankCoach text */}
                            <div className="flex sm:hidden items-center gap-2 mb-1">
                                <Image
                                    src="/aniq.png"
                                    alt="RankMarg Coach"
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                />
                                <span className="text-primary-600 font-semibold text-sm">AniQ</span>
                            </div>

                            {/* Desktop: Circular Avatar */}
                            <Avatar className="hidden sm:flex w-8 h-8 flex-shrink-0">
                                <AvatarImage src="/aniq.png" alt="RankMarg Coach" />
                                <AvatarFallback>RM</AvatarFallback>
                            </Avatar>

                            {/* Message Content */}
                            <div className="flex-1 flex flex-col gap-0 bg-gray-50 px-3 sm:px-5 py-2.5 sm:py-3 gap-2 rounded-tr-xl rounded-br-xl rounded-bl-xl">
                                <div className="rounded-tr-xl rounded-br-xl rounded-bl-xl text-gray-900 text-[14px] sm:text-[15px] leading-relaxed">
                                    {formatMessage(suggestion.message)}
                                </div>

                                {suggestion.actionName && suggestion.actionUrl && (
                                    <Link
                                        href={suggestion.actionUrl}
                                    >
                                        <Button
                                            variant='outline'
                                            className="inline-flex items-center border-primary-600 gap-1.5 sm:gap-2 text-primary-600 hover:text-primary-700 font-semibold text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 rounded-full"
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
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
                            {/* Mobile: Logo + RankCoach text */}
                            <div className="flex sm:hidden items-center gap-2 mb-1">
                                <Image
                                    src="/aniq.png"
                                    alt="AniQ"
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                />
                                <span className="text-primary-600 font-semibold text-sm">AniQ</span>
                            </div>

                            {/* Desktop: Circular Avatar */}
                            <Avatar className="hidden sm:flex w-8 h-8 flex-shrink-0">
                                <AvatarImage src="/aniq.png" alt="AniQ" />
                                <AvatarFallback>RM</AvatarFallback>
                            </Avatar>

                            <div className="bg-gray-50 px-3 sm:px-5 py-2.5 sm:py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl flex gap-2 w-fit">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>
            )}


            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Check out your progress</h3>
                <div className="flex flex-row gap-3">
                    {badges.map((art, index) => (
                        <Link
                            href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}${art.url}`}
                            target='_blank'
                            key={index}
                            className="flex items-center gap-2"
                        >
                            <Badge className="text-primary-600 font-semibold text-sm">{art.name}</Badge>
                        </Link>
                    ))}
                </div>
            </div>

            {/* You Can Also Ask Section */}
            {streamComplete || suggestions.length > 0 && (
                <div className="mt-6">
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


        </div>
    )
}
