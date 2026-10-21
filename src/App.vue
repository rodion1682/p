<!-- App.vue -->
<template>
  <div v-if="appStore.isLoading">
    <LoadingSpinner class="app__loader" />
  </div>

  <template v-else-if="appStore.initializationError">
    <div class="app__error">
      <p>
        {{ $t('An error occurred during initialization:') }}
      </p>

      <p>
        {{ appStore.initializationError.message }}
      </p>
    </div>
  </template>

  <component :is="currentLayout" v-else>
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </component>

  <OfferDetailsModal
    :show="modalStore.isOpen('offerDetails')"
    :modal-data="modalStore.getData('offerDetails')"
    @close="handleOfferDetailsClose"
  />

  <PaymentMethodModal
    v-if="settingsStore.settings?.payouts?.offer_enabled"
    :show="modalStore.isOpen('paymentMethod')"
    @close="handlePaymentMethodClose"
  />

  <PaymentModal
    :show="modalStore.isOpen('payment')"
    :payment-method="modalStore.getData('payment')?.paymentMethod"
    @close="handlePaymentClose"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import OfferDetailsModal from '@/components/modals/sellSkins/OfferDetailsModal.vue'
import PaymentMethodModal from '@/components/modals/sellSkins/PaymentMethodModal.vue'
import PaymentModal from '@/components/modals/sellSkins/PaymentModal.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useFaqStore } from '@/stores/faq'
import { useHeroesStore } from '@/stores/heroes'
import { useLanguageStore } from '@/stores/language'
import { useModalStore } from '@/stores/modal'
import { useNavigationStore } from '@/stores/navigation'
import { useProductStore } from '@/stores/product'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const route = useRoute()

const appStore = useAppStore()
const authStore = useAuthStore()
const cartStore = useCartStore()
const countriesStore = useCountriesStore()
const currencyStore = useCurrencyStore()
const faqStore = useFaqStore()
const heroesStore = useHeroesStore()
const languageStore = useLanguageStore()
const modalStore = useModalStore()
const navigationStore = useNavigationStore()
const productStore = useProductStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const { isAnyDrawerOpen } = storeToRefs(navigationStore)

const layouts = {
  default: DefaultLayout,
}

const currentLayout = computed(() => {
  const layoutName = route.meta.layout || 'default'

  return layouts[layoutName] || layouts.default
})

watch(
  isAnyDrawerOpen,
  isOpen => {
    document.body.classList.toggle('mobile-navigation-open', isOpen)
  },
  {
    immediate: true,
  },
)
watch(
  () => currencyStore.currentCurrencyCode,
  () => {
    if (authStore.isAuthenticated) {
      userStore.fetchProfile()
      cartStore.fetchCartContent()
    }

    if (route.name === 'ProductDetailsPage') {
      productStore.fetchProductDetails(route.params.productId)
    }
  },
)

watch(
  () => authStore.isAuthenticated,
  isAuthenticated => {
    if (isAuthenticated) {
      cartStore.fetchCartContent()
      userStore.fetchProfile()
      return
    }
    navigationStore.closeAllDrawers()
  },
)

watch(
  () => route.path,
  () => {
    navigationStore.closeAllDrawers()
  },
)

onBeforeMount(async () => {
  try {
    await Promise.all([
      languageStore.fetchLanguages(),
      currencyStore.initializeCurrencies(),
      settingsStore.fetchSettings(),
      countriesStore.fetchCountries(),
      faqStore.fetchFaq(),
      heroesStore.fetchHeroes(),
    ])

    if (authStore.isAuthenticated) {
      await Promise.all([
        cartStore.fetchCartContent(),
        userStore.fetchProfile(),
      ])
    }
  } catch (error) {
    console.error('Error initializing app:', error)

    appStore.setInitializationError(error)
  } finally {
    appStore.setAppLoading(false)
  }
})

onMounted(async () => {
  try {
    await cartStore.fetchRentalPeriods()
  } catch (error) {
    console.error('Failed to fetch rental periods:', error)
  }
})

onBeforeUnmount(() => {
  navigationStore.closeAllDrawers()

  document.body.classList.remove('mobile-navigation-open')
})

const handlePaymentClose = () => {
  modalStore.close('payment')
}

const handleOfferDetailsClose = () => {
  modalStore.close('offerDetails')
}

const handlePaymentMethodClose = () => {
  modalStore.close('paymentMethod')
}
</script>

<style lang="scss">
.app {
  &__loader {
    position: fixed;
    top: 50%;
    left: 50%;

    transform: translate(-50%, -50%);
  }
}
</style>
