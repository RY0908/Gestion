import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { canDo } from '@/lib/permissions.js'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
            
            // Helpers
            canDo: (action) => canDo(get().user?.role, action),
        }),
        { name: 'sigma-auth' }
    )
)
