import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useGroupStore = create(
  persist(
    (set) => ({
      selectedGroupId: null,
      selectedGroup: null,

      setSelectedGroup: (group) =>
        set({ selectedGroup: group, selectedGroupId: group?.id ?? null }),

      clearSelectedGroup: () =>
        set({ selectedGroup: null, selectedGroupId: null }),
    }),
    {
      name: 'bills-group',
      partialize: (state) => ({
        selectedGroupId: state.selectedGroupId,
      }),
    }
  )
)
