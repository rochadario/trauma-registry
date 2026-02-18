import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { db, type LocalPatient } from '@/lib/db'

interface WizardState {
  currentStep: number
  localId: string | null
  formData: Record<string, unknown>
  isDirty: boolean
  isLoading: boolean

  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateField: (field: string, value: unknown) => void
  updateFields: (fields: Record<string, unknown>) => void
  startNewRecord: (userId: string) => void
  loadRecord: (localId: string) => Promise<void>
  saveToIndexedDB: () => Promise<void>
  submitRecord: () => Promise<void>
  reset: () => void
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      localId: null,
      formData: {},
      isDirty: false,
      isLoading: false,

      setStep: (step) => {
        if (step >= 1 && step <= 17) {
          set({ currentStep: step })
        }
      },

      nextStep: () => {
        const { currentStep } = get()
        if (currentStep < 17) {
          set({ currentStep: currentStep + 1 })
        }
      },

      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 })
        }
      },

      updateField: (field, value) => {
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          isDirty: true,
        }))
      },

      updateFields: (fields) => {
        set((state) => ({
          formData: { ...state.formData, ...fields },
          isDirty: true,
        }))
      },

      startNewRecord: (userId) => {
        const localId = uuidv4()
        const now = new Date().toISOString()
        set({
          localId,
          currentStep: 1,
          formData: {
            local_id: localId,
            created_by: userId,
            created_at: now,
            updated_at: now,
            record_status: 'draft',
            sync_status: 'pending',
          },
          isDirty: false,
        })
      },

      loadRecord: async (localId) => {
        set({ isLoading: true })
        try {
          const patient = await db.patients.get(localId)
          if (patient) {
            set({
              localId: patient.localId,
              currentStep: patient.currentStep,
              formData: patient.data,
              isDirty: false,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Failed to load record:', error)
          set({ isLoading: false })
        }
      },

      saveToIndexedDB: async () => {
        const { localId, formData, currentStep } = get()
        if (!localId) return

        const now = new Date().toISOString()
        const updatedData = { ...formData, updated_at: now }

        const patient: LocalPatient = {
          localId,
          remoteId: formData.remote_id as string | undefined,
          data: updatedData,
          currentStep,
          status: (formData.record_status as LocalPatient['status']) || 'draft',
          syncStatus: 'pending',
          createdBy: formData.created_by as string,
          createdAt: formData.created_at as string,
          updatedAt: now,
        }

        await db.patients.put(patient)

        // Add to sync queue
        await db.syncQueue.add({
          localId,
          action: 'update',
          data: updatedData,
          timestamp: now,
          retries: 0,
        })

        set({ formData: updatedData, isDirty: false })
      },

      submitRecord: async () => {
        const { localId, formData } = get()
        if (!localId) return

        const now = new Date().toISOString()
        const updatedData = {
          ...formData,
          record_status: 'complete',
          updated_at: now,
        }

        const patient: LocalPatient = {
          localId,
          remoteId: formData.remote_id as string | undefined,
          data: updatedData,
          currentStep: 17,
          status: 'complete',
          syncStatus: 'pending',
          createdBy: formData.created_by as string,
          createdAt: formData.created_at as string,
          updatedAt: now,
        }

        await db.patients.put(patient)
        await db.syncQueue.add({
          localId,
          action: 'update',
          data: updatedData,
          timestamp: now,
          retries: 0,
        })

        set({ formData: updatedData, isDirty: false })
      },

      reset: () => {
        set({
          currentStep: 1,
          localId: null,
          formData: {},
          isDirty: false,
          isLoading: false,
        })
      },
    }),
    {
      name: 'wizard-store',
      partialize: (state) => ({
        currentStep: state.currentStep,
        localId: state.localId,
        formData: state.formData,
      }),
    }
  )
)
