import { motion, AnimatePresence } from 'motion/react'
import { useLocation } from 'react-router-dom'

export const AnimatedRoutes = ({ children }) => {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
