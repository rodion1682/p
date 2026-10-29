<template>
  <section class="profile">
    <div class="profile__inner _cnt">
      <h1 class="profile__title _h2">
        {{ pageTitle }}
      </h1>

      <nav class="profile__nav" aria-label="Account navigation">
        <button
          type="button"
          class="profile__nav-button"
          :class="{ 'is-active': activeSection === 'profile' }"
          :aria-current="activeSection === 'profile' ? 'page' : undefined"
          @click="toggleSection('profile')"
        >
          <SvgIcon :icon="ProfileSettingsIcon" class="profile__nav-icon" />
          <span>{{ $t('Profile Settings') }}</span>
        </button>

        <button
          type="button"
          class="profile__nav-button"
          :class="{ 'is-active': activeSection === 'balance' }"
          :aria-current="activeSection === 'balance' ? 'page' : undefined"
          @click="toggleSection('balance')"
        >
          <SvgIcon :icon="MyBalanceIcon" class="profile__nav-icon" />
          <span>{{ $t('My Balance') }}</span>
        </button>

        <button
          type="button"
          class="profile__nav-button"
          :class="{ 'is-active': activeSection === 'payment-history' }"
          :aria-current="
            activeSection === 'payment-history' ? 'page' : undefined
          "
          @click="toggleSection('payment-history')"
        >
          <SvgIcon :icon="TransactionHistoryIcon" class="profile__nav-icon" />
          <span>{{ $t('Transaction History') }}</span>
        </button>

        <button
          v-if="isOfferEnabled"
          type="button"
          class="profile__nav-button"
          :class="{ 'is-active': activeSection === 'offers' }"
          :aria-current="activeSection === 'offers' ? 'page' : undefined"
          @click="toggleSection('offers')"
        >
          <SvgIcon :icon="OfferHistoryIcon" class="profile__nav-icon" />
          <span>{{ $t('Offer History') }}</span>
        </button>

        <button
          v-if="activeSection === 'order-history'"
          type="button"
          class="profile__nav-button is-active"
          aria-current="page"
          @click="toggleSection('order-history')"
        >
          <SvgIcon :icon="TransactionHistoryIcon" class="profile__nav-icon" />
          <span>{{ $t('Order History') }}</span>
        </button>

        <button
          type="button"
          class="profile__nav-button profile__nav-button_logout"
          :disabled="isLoggingOut"
          @click="handleLogout"
        >
          <SvgIcon :icon="LogOutIcon" class="profile__nav-icon" />
          <span>
            {{ isLoggingOut ? $t('Logging out') : $t('Log Out') }}
          </span>
        </button>
      </nav>

      <div class="profile__content">
        <PersonalInfoWithPassword
          v-if="activeSection === 'profile'"
          class="profile__settings"
        />

        <MyBalance
          v-else-if="activeSection === 'balance'"
          class="profile__balance"
          :can-withdraw="canWithdraw"
          @withdraw="openWithdrawModal"
        />

        <div
          v-else-if="activeSection === 'payment-history'"
          class="profile__history"
        >
          <div class="profile__history-group">
            <h2 class="profile__history-title">{{ $t('Payment History') }}:</h2>

            <PaymentHistory />
          </div>

          <div class="profile__history-group">
            <h2 class="profile__history-title">{{ $t('Order History') }}:</h2>

            <OrderHistory />
          </div>
        </div>

        <div
          v-else-if="activeSection === 'order-history'"
          class="profile__history"
        >
          <div class="profile__history-group">
            <h2 class="profile__history-title">{{ $t('Order History') }}:</h2>

            <OrderHistory />
          </div>
        </div>

        <MyOffers
          v-else-if="activeSection === 'offers' && isOfferEnabled"
          class="profile__offers"
        />
      </div>
    </div>

    <ContactInfoModal
      v-model:show="isWithdrawModalOpen"
      mode="balance"
      @close="closeWithdrawModal"
    />

    <PaymentModal
      :show="modalStore.isOpen('payment')"
      :mode="modalStore.getData('payment')?.mode || 'offer'"
      :payment-method="modalStore.getData('payment')?.paymentMethod"
      :redirect-url="modalStore.getData('payment')?.redirectUrl"
      @close="modalStore.close('payment')"
    />
  </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import {
  LogOutIcon,
  MyBalanceIcon,
  OfferHistoryIcon,
  ProfileSettingsIcon,
  TransactionHistoryIcon,
} from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import ContactInfoModal from '@/components/modals/sellSkins/ContactInfoModal.vue'
import PaymentModal from '@/components/modals/sellSkins/PaymentModal.vue'

import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

import MyBalance from './tabs/MyBalance.vue'
import MyOffers from './tabs/MyOffers.vue'
import OrderHistory from './tabs/OrderHistory.vue'
import PaymentHistory from './tabs/PaymentHistory.vue'
import PersonalInfoWithPassword from './tabs/PersonalInfoWithPassword.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const authStore = useAuthStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const modalStore = useModalStore()

const { userBalance } = storeToRefs(userStore)

const activeSection = ref('profile')
const isLoggingOut = ref(false)
const isWithdrawModalOpen = ref(false)

const isOfferEnabled = computed(() => Boolean(settingsStore.isOfferEnabled))

const canWithdraw = computed(
  () =>
    isOfferEnabled.value &&
    Boolean(settingsStore.settings?.payout_methods?.sepa),
)

const pageTitle = computed(() => {
  switch (activeSection.value) {
    case 'profile':
      return t('PROFILE')
    case 'balance':
      return t('MY BALANCE')
    case 'payment-history':
      return t('TRANSACTION HISTORY')
    case 'order-history':
      return t('ORDER HISTORY')
    case 'offers':
      return t('OFFER HISTORY')
    default:
      return t('PROFILE')
  }
})

const sectionPaths = {
  profile: '/account/profile',
  balance: '/account/balance',
  'payment-history': '/account/payment-history',
  'order-history': '/account/order-history',
  offers: '/account/offers',
}

const toggleSection = section => {
  if (section === 'offers' && !isOfferEnabled.value) return

  const path = sectionPaths[section]

  if (!path || route.path === path) return

  router.push(path)
}

const syncActiveSection = path => {
  if (path.includes('/payment-history')) {
    activeSection.value = 'payment-history'
    return
  }

  if (path.includes('/order-history')) {
    activeSection.value = 'order-history'
    return
  }

  if (path.includes('/offers')) {
    if (isOfferEnabled.value) {
      activeSection.value = 'offers'
    } else {
      router.replace('/account/profile')
    }
    return
  }

  if (path.includes('/balance')) {
    activeSection.value = 'balance'
    return
  }

  activeSection.value = 'profile'
}

const openWithdrawModal = () => {
  if (!canWithdraw.value) return

  isWithdrawModalOpen.value = true
}

const closeWithdrawModal = () => {
  isWithdrawModalOpen.value = false
}

const handleLogout = async () => {
  if (isLoggingOut.value) return

  isLoggingOut.value = true

  try {
    await authStore.logout()
    await router.replace({ name: 'HomePage' })
  } catch (error) {
    console.error('Logout error:', error)
    toast.error(t('Failed to logout'))
  } finally {
    isLoggingOut.value = false
  }
}

watch(
  () => route.path,
  path => {
    syncActiveSection(path)
  },
  { immediate: true },
)

watch(isOfferEnabled, enabled => {
  if (!enabled && activeSection.value === 'offers') {
    router.replace('/account/profile')
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;

  background-color: var(--bg-primary-color);

  @include adaptiveValue('padding-top', 130, 90);
  @include adaptiveValue('padding-bottom', 150, 60);

  &__inner {
    width: 100%;
  }

  &__title {
    margin: 0;
    color: var(--third-color);
    font-family: var(--font-orbitron);
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 24);
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 12);
    }
  }

  &__nav-button {
    display: flex;
    flex: 1 1 0;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-width: 0;
    min-height: 44px;
    padding: 9px 12px;

    border: 1px solid transparent;
    border-radius: 7px;
    background-color: transparent;

    color: var(--third-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    cursor: pointer;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease;

    &.is-active {
      background-color: #111821;
      color: #65a7ff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 3px;
    }

    @media (any-hover: hover) {
      &:not(.is-active):not(:disabled):hover {
        background-color: #111821;
        color: #65a7ff;
      }
    }

    &_logout {
      @media (any-hover: hover) {
        &:not(:disabled):hover {
          color: #f56b76;
        }
      }
    }
  }

  &__nav-icon {
    position: relative;
    display: block;
    flex: 0 0 24px;
    width: 24px;
    min-width: 24px;
    height: 24px;
    color: inherit;

    :deep(svg) {
      display: block;
      width: 24px;
      height: 24px;
    }
  }

  &__content {
    width: 100%;
    min-width: 0;
  }

  &__settings {
    width: 100%;
  }

  &__section {
    width: 100%;
    min-width: 0;
    padding: clamp(20px, 3vw, 35px);
    border: 1px solid rgba(153, 161, 176, 0.18);
    border-radius: 10px;
    background-color: #111821;
  }

  &__history {
    display: flex;
    flex-direction: column;
    gap: clamp(28px, 4vw, 42px);
    width: 100%;
    min-width: 0;
  }

  &__history-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }

  &__history-title {
    margin: 0 0 14px;
    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.4;
    text-transform: none;
  }

  &__offers {
    width: 100%;
    min-width: 0;
  }

  &__balance-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(153, 161, 176, 0.12);
  }

  &__balance-summary {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__balance-icon {
    display: block;
    width: 24px;
    min-width: 24px;
    height: 24px;
    color: #65a7ff;
  }

  &__balance-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__balance-label {
    font-family: var(--font-inter);
    font-size: 13px;
    color: #99a1b0;
  }

  &__balance-value {
    :deep(.price__value) {
      color: var(--third-color);
      font-family: var(--font-orbitron);
      font-size: 20px;
      font-weight: 700;
    }
  }

  &__withdraw {
    width: auto;
    min-width: 170px;
  }

  @media (max-width: $md2) {
    &__nav {
      gap: 6px;
    }

    &__nav-button {
      padding: 9px 7px;
      font-size: 11px;
      gap: 6px;
    }
  }

  @media (max-width: $md3) {
    &__nav {
      justify-content: flex-start;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 6px;
      scrollbar-width: thin;
      scrollbar-color: #344050 transparent;
    }

    &__nav-button {
      flex: 0 0 auto;
      min-height: 42px;
      padding: 9px 15px;
      font-size: 12px;
    }
  }

  @media (max-width: $md5) {
    &__section {
      padding: 18px 14px;
    }

    &__nav-icon {
      width: 22px;
      min-width: 22px;
      height: 22px;
      flex-basis: 22px;

      :deep(svg) {
        width: 22px;
        height: 22px;
      }
    }
  }
}
</style>
