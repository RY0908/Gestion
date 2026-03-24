import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFilterStore = create(
    persist(
        (set) => ({
            assets: { status: '', category: '', location: '', department: '', q: '' },
            assignments: { status: '', department: '' },
            licenses: { complianceStatus: '', vendor: '' },
            setAssetFilters: (filters) => set((s) => ({ assets: { ...s.assets, ...filters } })),
            clearAssetFilters: () => set({ assets: { status: '', category: '', location: '', department: '', q: '' } }),
        }),
        { name: 'sigma-filters' }
    )
)
