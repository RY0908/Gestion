import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
    persist(
        (set) => ({
            sidebarOpen: true,
            theme: 'light',      // 'light' | 'dark' | 'system'
            activeModal: null,
            notificationsOpen: false,
            toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            setTheme: (theme) => set({ theme }),
            openModal: (name) => set({ activeModal: name }),
            closeModal: () => set({ activeModal: null }),
            toggleNotifications: () => set((s) => ({ notificationsOpen: !s.notificationsOpen })),
        }),
        { name: 'sigma-ui', partialize: (s) => ({ theme: s.theme, sidebarOpen: s.sidebarOpen }) }
    )
)
