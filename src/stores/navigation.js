import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const activeDrawer = ref(null)

  const isMobileMenuOpen = computed(() => {
    return activeDrawer.value === 'menu'
  })

  const isFiltersOpen = computed(() => {
    return activeDrawer.value === 'filters'
  })

  const isProfileOpen = computed(() => {
    return activeDrawer.value === 'profile'
  })

  const isAnyDrawerOpen = computed(() => {
    return activeDrawer.value !== null
  })

  const openMobileMenu = () => {
    activeDrawer.value = 'menu'
  }

  const openFilters = () => {
    activeDrawer.value = 'filters'
  }

  const openProfile = () => {
    activeDrawer.value = 'profile'
  }

  const closeMobileMenu = () => {
    if (activeDrawer.value === 'menu') {
      activeDrawer.value = null
    }
  }

  const closeFilters = () => {
    if (activeDrawer.value === 'filters') {
      activeDrawer.value = null
    }
  }

  const closeProfile = () => {
    if (activeDrawer.value === 'profile') {
      activeDrawer.value = null
    }
  }

  const toggleMobileMenu = () => {
    activeDrawer.value = activeDrawer.value === 'menu' ? null : 'menu'
  }

  const toggleFilters = () => {
    activeDrawer.value = activeDrawer.value === 'filters' ? null : 'filters'
  }

  const toggleProfile = () => {
    activeDrawer.value = activeDrawer.value === 'profile' ? null : 'profile'
  }

  const closeAllDrawers = () => {
    activeDrawer.value = null
  }

  return {
    activeDrawer,

    isMobileMenuOpen,
    isFiltersOpen,
    isProfileOpen,
    isAnyDrawerOpen,

    openMobileMenu,
    openFilters,
    openProfile,

    closeMobileMenu,
    closeFilters,
    closeProfile,
    closeAllDrawers,

    toggleMobileMenu,
    toggleFilters,
    toggleProfile,
  }
})
