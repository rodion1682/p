import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const activeModals = ref(new Set())
  const modalData = ref(new Map())

  const open = (modalId, data = null) => {
    activeModals.value.add(modalId)

    if (data !== null) {
      modalData.value.set(modalId, data)
    }
  }

  const close = modalId => {
    activeModals.value.delete(modalId)
    modalData.value.delete(modalId)
  }

  const closeAll = () => {
    activeModals.value.clear()
    modalData.value.clear()
  }

  const isOpen = modalId => {
    return activeModals.value.has(modalId)
  }

  const getData = modalId => {
    return modalData.value.get(modalId)
  }

  return {
    activeModals,
    modalData,
    open,
    close,
    closeAll,
    isOpen,
    getData,
  }
})
