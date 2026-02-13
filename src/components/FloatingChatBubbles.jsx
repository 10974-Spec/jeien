import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export const FloatingChatBubbles = () => {
    const [showChatModal, setShowChatModal] = useState(false)
    const [showWhatsApp, setShowWhatsApp] = useState(false)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!message.trim()) {
            toast.error('Please enter a message')
            return
        }

        setSending(true)
        try {
            // TODO: Replace with actual API endpoint
            // await fetch('/api/messages', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ message, type: 'chat' })
            // })

            toast.success('Message sent to admin!')
            setMessage('')
            setShowChatModal(false)
        } catch (error) {
            console.error('Failed to send message:', error)
            toast.error('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const handleWhatsAppClick = () => {
        // TODO: Replace with actual WhatsApp number
        const phoneNumber = '254746917511' // Format: country code + number
        const defaultMessage = 'Hello, I need assistance with...'
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`
        window.open(whatsappUrl, '_blank')
    }

    return (
        <>
            {/* Floating Bubbles - Bottom Left */}
            <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
                {/* AI Assistant Bubble */}
                <motion.button
                    onClick={() => setShowChatModal(true)}
                    className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Chat with us"
                >
                    <MessageCircle className="h-6 w-6" />
                </motion.button>

                {/* WhatsApp Bubble */}
                <motion.button
                    onClick={handleWhatsAppClick}
                    className="w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="WhatsApp us"
                >
                    <Phone className="h-6 w-6" />
                </motion.button>
            </div>

            {/* Chat Modal */}
            <AnimatePresence>
                {showChatModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowChatModal(false)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed bottom-24 left-6 w-96 max-w-[calc(100vw-3rem)] bg-white shadow-2xl z-50 flex flex-col max-h-[600px]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5" />
                                    <h3 className="font-semibold">Chat with Admin</h3>
                                </div>
                                <button
                                    onClick={() => setShowChatModal(false)}
                                    className="hover:bg-blue-700 p-1 rounded transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                                <div className="space-y-3">
                                    {/* Welcome Message */}
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                            A
                                        </div>
                                        <div className="bg-white p-3 shadow-sm max-w-[80%]">
                                            <p className="text-sm text-gray-800">
                                                Hello! How can we help you today?
                                            </p>
                                            <span className="text-xs text-gray-500 mt-1 block">Admin</span>
                                        </div>
                                    </div>

                                    {/* Info Message */}
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 bg-white inline-block px-3 py-1 shadow-sm">
                                            Send us a message and we'll get back to you soon
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !message.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Your message will be sent to the admin team
                                </p>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default FloatingChatBubbles
