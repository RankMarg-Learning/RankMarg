"use client"

import React, { useState, useEffect } from 'react'
import { useUserData } from '@/context/ClientContextProvider'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@repo/common-ui'
import { Button } from '@repo/common-ui'
import { Sparkles, X } from 'lucide-react'
import Link from 'next/link'

interface HighlightDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const HighlightDialog: React.FC<HighlightDialogProps> = ({
    open: controlledOpen,
    onOpenChange,
}) => {
    const { user, isPaid } = useUserData()
    const [internalOpen, setInternalOpen] = useState(false)

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setIsOpen = onOpenChange || setInternalOpen

    useEffect(() => {
        if (user && !isPaid && controlledOpen === undefined) {
            const hasSeenDialog = sessionStorage.getItem('hasSeenHighlightDialog')
            if (!hasSeenDialog) {
                const timer = setTimeout(() => {
                    setInternalOpen(true)
                    sessionStorage.setItem('hasSeenHighlightDialog', 'true')
                }, 2000)
                return () => clearTimeout(timer)
            }
        }
    }, [user, isPaid, controlledOpen])

    if (isPaid) return null

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Unlock Premium Features
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Get access to advanced learning tools
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Price Section */}
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-gray-400 line-through text-xl">₹3,250</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-primary">₹33</span>
                                <span className="text-gray-600">/year</span>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                            <Sparkles className="w-3 h-3" />
                            99% OFF with Coupon
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                            </div>
                            <div>
                                <p className="font-medium text-sm">AI-Powered Practice Sessions</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Personalized to your learning pace</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                            </div>
                            <div>
                                <p className="font-medium text-sm">Advanced Analytics</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Deep insights into your performance</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                            </div>
                            <div>
                                <p className="font-medium text-sm">Unlimited Access</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">All premium features and content</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <Link href="/subscription?plan=rank&ref=home_dialog&planId=99221f06-084f-4ce3-8bac-6a5147e6aa22&coupon=DREAM2026" className="block">
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={() => setIsOpen(false)}
                        >
                            Upgrade to Premium
                        </Button>
                    </Link>


                </div>
            </DialogContent>
        </Dialog>
    )
}

export default HighlightDialog
