<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="header__inner _cnt">
      <div class="header__logo logo">
        <RouterLink :to="{ name: 'HomePage' }" class="logo__link _ibg-contain">
          <img
            v-if="route.name === 'HomePage' && !isScrolled"
            class="logo__image_desk"
            src="@/assets/img/logo-full-home.svg"
            alt="RelicForge"
          />
          <img
            v-else
            class="logo__image_desk"
            src="@/assets/img/logo-full.svg"
            alt="RelicForge"
          />
          <img
            class="logo__image_mob"
            src="@/assets/img/logo-small.svg"
            alt="RelicForge"
          />
        </RouterLink>

        <button
          v-if="isOfferEnabled && isAuthenticated"
          type="button"
          class="logo__sell"
          :class="{ active: isSellSkinActive }"
          aria-label="Sell Skins"
          @click="openSellSkinsFromNav"
        >
          <SvgIcon :icon="SellSkinsIcon" class="logo__sell-icon" />
        </button>
      </div>

      <div class="header__nav nav" :class="{ open: isMobileMenuVisible }">
        <RouterLink
          :to="{ name: 'HomePage' }"
          class="nav__link"
          @click="closeMobileMenu"
        >
          {{ $t('Home') }}
        </RouterLink>

        <button
          type="button"
          class="nav__link"
          :class="{ active: isCS2Active }"
          @click="goToCS2"
        >
          {{ $t('CS2 Skins') }}
        </button>

        <button
          type="button"
          class="nav__link"
          :class="{ active: isDota2Active }"
          @click="goToDota2"
        >
          {{ $t('Dota 2 Skins') }}
        </button>

        <button
          v-if="isOfferEnabled && isAuthenticated"
          type="button"
          class="nav__link"
          :class="{ active: isSellSkinActive }"
          @click="openSellSkinsFromNav"
        >
          {{ $t('Sell Skin') }}
        </button>

        <RouterLink
          :to="{ name: 'FAQ' }"
          class="nav__link"
          @click="closeMobileMenu"
        >
          {{ $t('FAQ') }}
        </RouterLink>

        <RouterLink
          :to="{ name: 'ContactPage' }"
          class="nav__link"
          @click="closeMobileMenu"
        >
          {{ $t('Contact us') }}
        </RouterLink>
      </div>

      <div class="header__auth">
        <LanguageSwitcher
          data-da-id="header-language"
          data-da=".header__nav,619.98,first"
          class="header__language"
        />

        <CurrencyDropdown
          data-da-id="header-currency"
          data-da=".header__nav,619.98,first"
          class="header__currency"
        />

        <template v-if="isAuthenticated">
          <RouterLink
            :to="{ name: 'account-balance' }"
            class="header__balance balance"
          >
            <SvgIcon :icon="WalletIcon" class="balance__wallet" />

            <PriceFormatter
              class="balance__balance"
              :price="userBalance"
              skipConversion
            />

            <div class="balance__plus">
              <SvgIcon :icon="PlusIcon" class="balance__plus-icon" />
            </div>
          </RouterLink>

          <RouterLink :to="{ name: 'CartPage' }" class="header__link link">
            <SvgIcon :icon="CartIcon" class="link__icon" />
            <span v-if="cartCount" class="link__count">
              {{ cartCount }}
            </span>
          </RouterLink>

          <RouterLink
            :to="{ name: 'account-profile' }"
            class="header__link link"
          >
            <SvgIcon :icon="UserIcon" class="link__icon" />
          </RouterLink>
        </template>

        <template v-else>
          <BaseButton
            variant="white-bordered"
            class="header__reg-button header__reg-button_login"
            @click="openSignIn"
          >
            {{ $t('Log In') }}
          </BaseButton>

          <BaseButton
            class="header__reg-button header__reg-button_signin"
            @click="openSignUp"
          >
            {{ $t('Sign Up') }}
          </BaseButton>
        </template>
      </div>

      <div
        class="header__icon-menu icon-menu"
        :class="{ open: isMobileMenuVisible }"
        @click="toggleMobileMenu"
      >
        <span></span>
      </div>
    </div>
  </header>

  <SignInModal
    v-model="isSignInOpen"
    @switch-to-sign-up="openSignUp"
    @switch-to-reset-password="openResetPassword"
  />

  <SignUpModal v-model="isSignUpOpen" @switch-to-sign-in="openSignIn" />

  <PasswordResetModal
    v-model="isResetPasswordOpen"
    @switch-to-sign-in="openSignIn"
  />

  <SellSkinsModal
    v-if="SHOW_SELL_SKIN_MODAL && isSellSkinsOpen && isAuthenticated"
    v-model="isSellSkinsOpen"
    @close="isSellSkinsOpen = false"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import CurrencyDropdown from '@/components/header/CurrencyDropdown.vue'
import LanguageSwitcher from '@/components/header/LanguageSwitcher.vue'

import {
  CartIcon,
  PlusIcon,
  SellSkinsIcon,
  UserIcon,
  WalletIcon,
} from '@/components/icons'

import SvgIcon from '@/components/icons/SvgIcon.vue'

import PasswordResetModal from '@/components/modals/auth/PasswordResetModal.vue'
import SignInModal from '@/components/modals/auth/SignInModal.vue'
import SignUpModal from '@/components/modals/auth/SignUpModal.vue'
import SellSkinsModal from '@/components/modals/sellSkins/SellSkinModal/SellSkinsModal.vue'

import { useGame } from '@/composables/useGame'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

import { destroyDynamicAdapt, initDynamicAdapt } from '@/utils/dynamic_adapt.js'

defineOptions({
  name: 'AppHeader',
})

const SHOW_SELL_SKIN_MODAL = false

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const userStore = useUserStore()
const cartstore = useCartStore()
const settingsStore = useSettingsStore()

const { userBalance } = storeToRefs(userStore)

const { syncGame } = useGame()

const isMobileMenuVisible = ref(false)
const isScrolled = ref(false)
const isSellSkinsOpen = ref(false)
const isCartOpen = ref(false)

const isSignInOpen = ref(false)
const isSignUpOpen = ref(false)
const isResetPasswordOpen = ref(false)

const isOfferEnabled = computed(() => settingsStore.isOfferEnabled)

const cartCount = computed(() => cartstore.cartItemsCount)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const isCS2Active = computed(
  () => route.name === 'ProductListPage' && route.query.category === 'cs2',
)

const isDota2Active = computed(
  () => route.name === 'ProductListPage' && route.query.category === 'dota2',
)

const isSellSkinActive = computed(() => {
  if (SHOW_SELL_SKIN_MODAL) {
    return isSellSkinsOpen.value
  }

  return route.name === 'SellSkisnPage'
})

const closeMobileMenu = () => {
  isMobileMenuVisible.value = false
}

const closeAuthModals = () => {
  isSignInOpen.value = false
  isSignUpOpen.value = false
  isResetPasswordOpen.value = false
}

const openSignIn = () => {
  if (isAuthenticated.value) return

  closeMobileMenu()
  closeAuthModals()

  isSignInOpen.value = true
}

const openSignUp = () => {
  if (isAuthenticated.value) return

  closeMobileMenu()
  closeAuthModals()

  isSignUpOpen.value = true
}

const openResetPassword = () => {
  if (isAuthenticated.value) return

  closeMobileMenu()
  closeAuthModals()

  isResetPasswordOpen.value = true
}

const goToCS2 = () => {
  closeMobileMenu()

  router.push({
    name: 'ProductListPage',
    query: {
      category: 'cs2',
    },
  })
}

const goToDota2 = () => {
  closeMobileMenu()

  router.push({
    name: 'ProductListPage',
    query: {
      category: 'dota2',
    },
  })
}

const toggleMobileMenu = () => {
  isMobileMenuVisible.value = !isMobileMenuVisible.value
}

const openSellSkinsFromNav = () => {
  closeMobileMenu()

  if (!isAuthenticated.value) {
    openSignIn()
    return
  }

  if (SHOW_SELL_SKIN_MODAL) {
    isSellSkinsOpen.value = true
    return
  }

  router.push({
    name: 'SellSkisnPage',
  })
}

const handleScroll = () => {
  isScrolled.value = (window.scrollY || window.pageYOffset) >= 1
}

const lockBodyScroll = () => {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth || 5

  document.documentElement.style.setProperty(
    '--scrollbar-compensation',
    `${scrollbarWidth}px`,
  )

  document.body.classList.add('scroll-locked')
}

const unlockBodyScroll = () => {
  document.body.classList.remove('scroll-locked')
  document.documentElement.style.removeProperty('--scrollbar-compensation')
}

watch(
  () => route.query.category,
  category => {
    syncGame(category)
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu()
    closeAuthModals()
  },
)

watch(isAuthenticated, async value => {
  if (value) {
    closeAuthModals()
    await refreshDynamicAdapt()
  } else {
    destroyDynamicAdapt()
    await refreshDynamicAdapt()
  }
})

watch(
  [isMobileMenuVisible, isSellSkinsOpen, isCartOpen],
  ([menuOpen, sellModalOpen, cartModalOpen]) => {
    if (menuOpen || sellModalOpen || cartModalOpen) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
  },
)

const refreshDynamicAdapt = async () => {
  await nextTick()
  initDynamicAdapt('max')
}

onMounted(async () => {
  await refreshDynamicAdapt()

  handleScroll()

  window.addEventListener('scroll', handleScroll, {
    passive: true,
  })
})

onBeforeUnmount(() => {
  destroyDynamicAdapt()
  unlockBodyScroll()
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  width: auto;
  max-width: none;
  min-width: 320px;
  transition: background-color 0.3s ease 0s;
  z-index: var(--header-z-index);
  background-color: transparent;

  &.scrolled {
    background-color: var(--bg-primary-color);

    @media (min-width: $md3) {
      .header__inner {
        padding-top: 5px;
        padding-bottom: 5px;
        min-height: 50px;
      }
    }
  }

  &__inner {
    display: flex;
    align-items: center;

    @include adaptiveValue('padding-top', 30, 5, 1440, 992, 1);
    @include adaptiveValue('padding-bottom', 30, 5, 1440, 992, 1);
    @include adaptiveValue('gap', 20, 10, 1440, 992, 1);
    @include adaptiveValue('min-height', 110, 50, 1440, 992, 1);

    transition: padding 0.3s ease 0s;
  }

  &__logo {
    @include adaptiveValue('margin-right', 40, 0, 1440, 992, 1);

    @media (max-width: $md2) {
      margin-right: auto;
    }
  }

  &__logo,
  &__nav,
  &__auth {
    position: relative;
    z-index: var(--header-z-index);
  }

  &__nav {
    @media (min-width: $md2) {
      margin-right: auto;
    }
  }

  &__auth {
    display: flex;
    align-items: stretch;

    @include adaptiveValue('gap', 20, 10, 1440, 992, 1);
  }

  &__language,
  &__currency {
    @media (min-width: $md4) {
      height: inherit;
    }
  }

  &__reg-button {
    :deep(.btn) {
      min-height: inherit !important;
    }

    :deep(.btn__text) {
      white-space: nowrap;
    }

    @include adaptiveValue('min-width', 160, 100);

    &_login {
    }

    &_signin {
    }
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: fit-content;

  &__link {
    display: block;
    width: fit-content;
    height: fit-content;

    @media (min-width: $md5) {
      @include adaptiveValue('min-width', 188, 100, 1440, 992, 1);
      aspect-ratio: 1 / 0.28;
    }

    @media (max-width: $md5) {
      min-width: 40px;
      height: 35px;
    }
  }

  &__image_desk {
    @media (max-width: $md5) {
      @include hide-item;
    }
  }

  &__image_mob {
    @media (min-width: $md5) {
      @include hide-item;
    }
  }

  &__sell {
    border-radius: 8px;
    min-width: 40px;
    height: 40px;
    color: var(--third-color);
    background-color: var(--bg-third-color);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-primary-color);
    transition: all 0.3s ease 0s;

    &.active {
      border-color: transparent;
      background-color: var(--hint-primary-color);
      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: transparent;
        background-color: var(--hint-primary-color);
      }
    }

    @media (min-width: $md2) {
      @include hide-item;
    }

    &-icon {
      min-width: 24px;
      height: 24px;
    }
  }
}

.nav {
  @media (min-width: $md2) {
    display: flex;
    align-self: stretch;
  }

  @media (max-width: $md2) {
    position: fixed;
    top: 50px;
    left: -100%;
    width: 100%;
    height: calc(100dvh - 50px);
    min-height: calc(100dvh - 50px);
    display: block;
    z-index: var(--menu-z-index);
    padding: 30px 10px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    transition: left 0.3s ease 0s;
    background-color: var(--bg-secondary-color);
    border-top: 1px solid transparent;
    margin-left: 0;

    &::before {
      content: '';
      position: fixed;
      z-index: var(--header-overlay-z-index);
      top: 0;
      left: -100%;
      width: 100%;
      height: 50px;
      background-color: var(--bg-primary-color);
      transition: left 0.3s ease 0s;
    }

    &.open {
      left: 0;

      &::before {
        left: 0;
      }
    }
  }

  &__link {
    @include adaptiveValue('--border-offset', 40, 20, 1440, 992, 1);

    white-space: nowrap;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background-color: transparent;
    text-transform: capitalize;
    font-weight: 700;
    font-size: 16px;
    line-height: 120%;
    transition: color 0.3s ease 0s;
    color: var(--border-primary-color);
    font-family: var(--font-inter);
    padding-top: 8px;
    padding-bottom: 8px;

    @include adaptiveValue('padding-left', 20, 10, 1440, 992, 1);
    @include adaptiveValue('padding-right', 20, 10, 1440, 992, 1);

    position: relative;
    z-index: 1;
    cursor: pointer;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - var(--border-offset));
      height: 1px;
      background-color: var(--hint-primary-color);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &.active,
    &.router-link-exact-active {
      pointer-events: none;
      color: var(--secondary-color);

      &::after {
        opacity: 1;
      }

      @media (max-width: $md2) {
        color: var(--third-color);
      }
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--secondary-color);
      }
    }

    @media (max-width: $md2) {
      height: fit-content;
      width: 100%;
      min-height: 45px;
      border-radius: 8px;
      background-color: var(--bg-third-color);

      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }
}

.balance {
  @include adaptiveValue('min-height', 50, 40, 1440, 992, 1);

  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  transition: all 0.3s ease 0s;
  border: 1px solid var(--border-primary-color);
  background-color: var(--bg-third-color);
  color: var(--third-color);
  border-radius: 8px;
  position: relative;

  &.router-link-active {
    background-color: var(--hint-primary-color);
    color: var(--third-color);
    border-color: transparent;

    .balance__wallet {
      color: var(--third-color);
    }

    :deep(.price__value) {
      color: var(--third-color);
    }

    .balance__plus {
      color: var(--hint-primary-color);
      background-color: var(--third-color);
    }
  }

  @media (any-hover: hover) {
    &:hover {
      background-color: var(--hint-primary-color);
      color: var(--third-color);
      border-color: transparent;

      .balance__wallet {
        color: var(--third-color);
      }

      :deep(.price__value) {
        color: var(--third-color);
      }

      .balance__plus {
        color: var(--hint-primary-color);
        background-color: var(--third-color);
      }
    }
  }

  @media (min-width: $md7) {
    @include adaptiveValue('padding-left', 12, 10);
  }

  @media (max-width: $md7) {
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__wallet {
    min-width: 18px;
    height: 17px;
    transition: color 0.3s ease 0s;
    color: var(--border-primary-color);

    @media (max-width: $md7) {
      color: var(--third-color);
    }
  }

  &__balance {
    margin-top: 3px;

    @media (max-width: $md7) {
      @include hide-item;
    }
  }

  &__plus {
    @include adaptiveValue('min-width', 50, 40, 1440, 992, 1);

    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--third-color);
    background-color: var(--hint-primary-color);
    border: 1px solid transparent;
    transition: all 0.3s ease 0s;
    border-radius: 8px;

    @media (max-width: $md7) {
      @include hide-item;
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
        background-color: var(--third-color);
      }
    }

    &-icon {
      min-width: 14px;
      height: 14px;
    }
  }
}

.link {
  width: fit-content;
  border-radius: 8px;

  @include adaptiveValue('min-width', 50, 40, 1440, 992, 1);

  height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  background-color: var(--bg-third-color);
  border: 1px solid var(--border-primary-color);
  color: var(--third-color);
  transition: all 0.3s ease 0s;
  position: relative;

  @media (any-hover: hover) {
    &:hover {
      background-color: var(--hint-primary-color);
      border-color: transparent;

      .link__count {
        background-color: var(--hint-primary-color);
      }
    }
  }

  &.router-link-active {
    background-color: var(--hint-primary-color);
    border-color: transparent;

    .link__count {
      background-color: var(--bg-third-color);
    }
  }

  &__icon {
    min-width: 15px;
    height: 15px;
  }

  &__count {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    background-color: var(--hint-primary-color);
    color: var(--third-color);
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px 5px;
    line-height: 1;
    border-radius: 4px;
    transform: translate(25%, -25%);
    font-size: 12px;
    font-weight: 400;
    transition: all 0.3s ease 0s;
  }

  &__text {
    font-size: 12px;
    line-height: 15px;
    text-transform: uppercase;
    font-weight: 700;

    @media (max-width: $md7) {
      @include hide-item;
    }
  }
}

.icon-menu {
  @media (min-width: $md2) {
    @include hide-item;
  }

  @media (max-width: $md2) {
    align-self: center;
    position: relative;
    min-width: 30px;
    height: 30px;
    cursor: pointer;
    z-index: 12;

    span,
    &::before,
    &::after {
      content: '';
      transition: all 0.3s ease 0s;
      right: 0;
      position: absolute;
      width: 100%;
      height: 2px;
      background-color: var(--third-color);
    }

    &::before {
      top: 20%;
    }

    &::after {
      bottom: 20%;
    }

    span {
      top: calc(50% - 1px);
    }

    &.open {
      span {
        width: 0;
      }

      &::before {
        top: calc(50% - 1px);
        transform: rotate(-45deg);
      }

      &::after {
        bottom: calc(50% - 1px);
        transform: rotate(45deg);
      }
    }
  }
}
</style>
