import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils.js'

/**
 * Reusable modal component built with Radix UI Dialog and Framer Motion.
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to call when modal closes
 * @param {string} title - Title of the modal
 * @param {string} description - Optional description text
 * @param {ReactNode} children - Modal body content (forms, texts, etc.)
 * @param {string} maxWidth - Tailwind max-width class for the modal (e.g. max-w-md, max-w-2xl)
 */
export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-md' }) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AnimatePresence>
                {isOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                            >
                                <Dialog.Content asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        className={cn('w-full bg-[var(--color-surface)] rounded-2xl shadow-xl overflow-hidden relative m-auto select-none outline-none', maxWidth)}
                                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                                    >
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                                            <div>
                                                <Dialog.Title className="text-lg font-bold font-display">{title}</Dialog.Title>
                                                {description && (
                                                    <Dialog.Description className="text-sm text-[var(--color-muted)] mt-0.5">
                                                        {description}
                                                    </Dialog.Description>
                                                )}
                                            </div>
                                            <Dialog.Close asChild>
                                                <button className="p-2 text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] rounded-full transition-colors outline-none focus:ring-2 focus:ring-sonatrach-green/50">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </Dialog.Close>
                                        </div>

                                        <div className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
                                            {children}
                                        </div>
                                    </motion.div>
                                </Dialog.Content>
                            </motion.div>
                        </Dialog.Overlay>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    )
}
