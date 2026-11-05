<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="header__inner" :class="isHome ? '_cnt' : '_cnt'">
      <div class="header__logo-wrapper">
        <RouterLink
          :to="{ name: 'HomePage' }"
          class="header__logo _ibg-contain"
          @click="closeMobileMenu"
        >
          <img
            class="header__logo-desk"
            src="@/assets/img/icons/logo-full.svg"
          />

          <img
            class="header__logo-mobile"
            src="@/assets/img/icons/logo-small.svg"
          />
        </RouterLink>
      </div>

      <nav class="header__nav nav" :class="{ open: isMobileMenuVisible }">
        <RouterLink
          :to="{ name: 'HomePage' }"
          class="nav__link"
          @click="closeMobileMenu"
        >
          {{ $t('Home') }}
        </RouterLink>

        <RouterLink
          :to="{ name: 'ProductListPage' }"
          class="nav__link"
          @click="closeMobileMenu"
        >
          {{ $t('SHOP') }}
        </RouterLink>

        <button
          v-if="isAuthenticated"
          type="button"
          class="nav__link"
          :disabled="isSellChecking"
          @click="handleSellItemsClick"
        >
          {{ $t('Sell Items') }}
        </button>

        <button
          v-if="false"
          type="button"
          class="nav__link"
          @click="scrollToHomeSection('how-to-play')"
        >
          {{ $t('How to play') }}
        </button>

        <button
          type="button"
          class="nav__link"
          @click="scrollToHomeSection('rules')"
        >
          {{ $t('Rules') }}
        </button>

        <button
          type="button"
          class="nav__link"
          @click="scrollToHomeSection('faq')"
        >
          {{ $t('FAQ') }}
        </button>
      </nav>

      <div class="header__auth auth">
        <template v-if="isAuthenticated">
          <button
            type="button"
            class="auth__user auth__user_cart"
            :class="{ 'is-active': isCartModalOpen }"
            @click="handleCartClick"
          >
            <SvgIcon :icon="CartIcon" class="auth__user-icon" />
            <div class="auth__user-text">
              {{ $t('Cart') }}
              (
              <span class="auth__user-count"> {{ cartCount }} </span>)
            </div>
          </button>

          <RouterLink
            :to="{ name: 'account-balance' }"
            class="auth__balance balance"
            @click="closeMobileMenu"
          >
            <PriceFormatter
              class="balance__price"
              :price="balanceInternal"
              :skip-conversion="true"
            />
            <SvgIcon :icon="PlusIcon" class="balance__plus" />

            <div v-if="false" class="balance__wallet-wapper">
              <SvgIcon :icon="WalletIcon" class="balance__wallet" />
            </div>
          </RouterLink>

          <RouterLink
            :to="{ name: 'account-balance' }"
            class="auth__user auth__user_profile"
            @click="closeMobileMenu"
          >
            <span class="auth__user-text">
              {{ $t('My Profile') }}
            </span>
            <SvgIcon :icon="UserIcon" class="auth__user-icon" />
          </RouterLink>

          <CurrencyDropdown
            data-da=".header__nav,479.98,first"
            class="header__currency"
          />
        </template>

        <template v-else>
          <BaseButton
            type="button"
            class="auth__button"
            @click="handleLoginClick"
          >
            <span>
              {{ $t('Login with') }}
            </span>

            <SvgIcon :icon="SteamIcon" class="auth__button-icon" />
          </BaseButton>
        </template>
      </div>

      <button
        type="button"
        class="header__icon-menu icon-menu"
        :class="{ open: isMobileMenuVisible }"
        @click="toggleMobileMenu"
      >
        <span></span>
      </button>
    </div>
  </header>

  <SteamLoginModal
    v-if="IS_LOGIN_MODAL_ACTIVE"
    :show="isSteamLoginModalOpen"
    @close="closeSteamLoginModal"
  />

  <CartModal
    v-if="IS_CART_MODAL_ACTIVE"
    :show="isCartModalOpen"
    @close="closeCartModal"
  />

  <ComingSoonSellModal
    :show="isComingSoonOpen"
    @close="isComingSoonOpen = false"
  />
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import CurrencyDropdown from '@/components/header/CurrencyDropdown.vue'

import SteamLoginModal from '@/components/modals/SteamLoginModal.vue'

import {
  CartIcon,
  PlusIcon,
  SteamIcon,
  UserIcon,
  WalletIcon,
} from '@/components/icons'

import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

import CartModal from '@/pages/CartPage/modals/CartModal.vue'
import { useSettingsStore } from '@/stores/settings'
import { initDynamicAdapt } from '@/utils/dynamic_adapt.js'
import ComingSoonSellModal from '../modals/ComingSoonSellModal.vue'

const IS_LOGIN_MODAL_ACTIVE = false
const IS_CART_MODAL_ACTIVE = true

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const userStore = useUserStore()
const cartStore = useCartStore()
const settingsStore = useSettingsStore()

const { balanceInternal } = storeToRefs(userStore)

const isMobileMenuVisible = ref(false)
const isScrolled = ref(false)

const isSteamLoginModalOpen = ref(false)
const isCartModalOpen = ref(false)

const isComingSoonOpen = ref(false)
const isSellChecking = ref(false)

const handleSellItemsClick = async () => {
  if (!authStore.isAuthenticated || isSellChecking.value) return

  closeMobileMenu()
  isSellChecking.value = true
  isComingSoonOpen.value = false

  try {
    await settingsStore.fetchSettings()

    if (!settingsStore.canSellItems) {
      isComingSoonOpen.value = true
      return
    }

    await router.push({ name: 'account-offers' })
  } catch (error) {
    isComingSoonOpen.value = true
  } finally {
    isSellChecking.value = false
  }
}

const isAuthenticated = computed(() => {
  return authStore.isAuthenticated
})

const cartCount = computed(() => {
  return cartStore.cartItemsCount || 0
})

const isHome = computed(() => {
  return route.name === 'HomePage'
})

const closeMobileMenu = () => {
  isMobileMenuVisible.value = false
}

const toggleMobileMenu = () => {
  isMobileMenuVisible.value = !isMobileMenuVisible.value
}

const openSteamLoginModal = () => {
  closeMobileMenu()

  isSteamLoginModalOpen.value = true
}

const closeSteamLoginModal = () => {
  isSteamLoginModalOpen.value = false
}

const handleLoginClick = async () => {
  closeMobileMenu()

  if (IS_LOGIN_MODAL_ACTIVE) {
    openSteamLoginModal()

    return
  }

  await router.push({
    name: 'LoginPage',
    query: {
      redirect: route.fullPath,
    },
  })
}

const openCartModal = () => {
  closeMobileMenu()

  isCartModalOpen.value = true
}

const closeCartModal = () => {
  isCartModalOpen.value = false
}

const handleCartClick = async () => {
  closeMobileMenu()

  if (IS_CART_MODAL_ACTIVE) {
    openCartModal()

    return
  }

  await router.push({
    name: 'CartPage',
  })
}

const scrollToSection = sectionId => {
  const section = document.getElementById(sectionId)
  const header = document.querySelector('.header')

  if (!section) {
    return
  }

  const headerHeight = header?.offsetHeight || 0

  const sectionTop =
    section.getBoundingClientRect().top + window.scrollY - headerHeight

  window.scrollTo({
    top: sectionTop,
    behavior: 'smooth',
  })
}

const scrollToHomeSection = async sectionId => {
  closeMobileMenu()

  if (route.name !== 'HomePage') {
    await router.push({
      name: 'HomePage',
    })

    await nextTick()

    requestAnimationFrame(() => {
      scrollToSection(sectionId)
    })

    return
  }

  await nextTick()

  requestAnimationFrame(() => {
    scrollToSection(sectionId)
  })
}

const handleScroll = () => {
  isScrolled.value = window.scrollY >= 1
}

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu()
  },
)

watch(isMobileMenuVisible, open => {
  if (isSteamLoginModalOpen.value || isCartModalOpen.value) {
    return
  }

  document.body.style.overflow = open ? 'hidden' : ''
})

watch(isSteamLoginModalOpen, open => {
  if (open) {
    closeMobileMenu()
  }
})

watch(isCartModalOpen, open => {
  if (open) {
    closeMobileMenu()
  }
})

onMounted(() => {
  initDynamicAdapt('max')

  handleScroll()

  window.addEventListener('scroll', handleScroll, {
    passive: true,
  })
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''

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

  max-width: 100vw;
  min-width: 320px;
  width: 100%;

  z-index: var(--header-z-index);

  background: linear-gradient(180deg, #f0eae5 0%, rgb(240, 234, 229, 0.7) 100%);

  &.scrolled {
    // background: var(--bg-primary-color);
    // border-color: var(--primary-color);
  }

  &__inner {
    display: flex;

    @include adaptiveValue('gap', 14, 10);

    @include adaptiveValue('min-height', 94, 50, 1430, 992, 1);
  }

  &__logo-wrapper {
    position: relative;

    z-index: var(--header-z-index);

    align-self: center;

    width: fit-content;

    min-width: 145px;
    height: 17px;

    @media (max-width: $md3) {
      margin-right: auto;
    }

    @media (max-width: $md5) {
      min-width: 32px;
      height: 32px;
    }
  }

  &__logo {
    position: absolute;

    width: 100%;
    height: 100%;

    top: 0;
    left: 0;

    &-desk {
      @media (max-width: $md5) {
        @include hide-item;
      }
    }

    &-mobile {
      @media (min-width: $md5) {
        @include hide-item;
      }
    }
  }

  &__nav {
    margin: 0 auto;
  }

  &__currency {
    position: relative;

    align-self: center;

    z-index: var(--header-z-index);

    @media (max-width: $md6) {
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }
}

.nav {
  @media (min-width: $md3) {
    display: flex;
    align-items: stretch;
    min-height: 100%;
  }

  @media (max-width: $md3) {
    position: fixed;
    top: 49px;
    left: -100%;

    width: 100%;
    box-sizing: border-box;

    height: calc(100vh - 49px);
    height: calc(100dvh - 49px);
    min-height: 0;

    padding: 25px 10px calc(30px + env(safe-area-inset-bottom, 0px));

    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
    background-color: var(--bg-primary-color);

    border-top: 1px solid var(--primary-color);

    &::before {
      content: '';

      position: fixed;

      z-index: var(--header-overlay-z-index);

      top: 0;
      left: -100%;

      width: 100%;
      height: 49px;

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
    min-height: inherit;

    white-space: nowrap;

    display: flex;
    justify-content: center;
    align-items: center;

    text-align: center;

    font-weight: 400;
    font-size: 14px;
    line-height: 100%;

    transition: all 0.3s ease 0s;

    color: var(--primary-color);

    background-color: transparent;

    font-family: var(--font-inter);

    text-transform: uppercase;

    @include adaptiveValue('padding-top', 8, 5);
    @include adaptiveValue('padding-bottom', 8, 5);
    @include adaptiveValue('padding-left', 21, 10, 1400, 992, 1);
    @include adaptiveValue('padding-right', 21, 10, 1400, 992, 1);

    position: relative;

    &.router-link-active {
      pointer-events: none;

      font-weight: 700;
    }

    @media (any-hover: hover) {
      &:hover {
        font-weight: 700;
      }
    }

    @media (max-width: $md3) {
      min-height: 45px;

      width: 100%;

      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }
}

.auth {
  position: relative;

  display: flex;
  align-items: center;

  @include adaptiveValue('gap', 16, 10);

  z-index: var(--header-z-index);

  &__user {
    appearance: none;

    padding: 0;

    font: inherit;

    cursor: pointer;

    transition: all 0.3s ease 0s;

    position: relative;

    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;

    width: fit-content;

    @include adaptiveValue('height', 36, 40, 1400, 992, 1);

    border-radius: 4px;
    padding: 0px 10px;
    border: 1px solid var(--border-primary-color);

    color: var(--primary-color);

    background-color: var(--bg-primary-color);

    &.router-link-active,
    &.is-active {
      color: var(--secondary-color);
      background-color: var(--hint-primary-color);
      border-color: var(--border-primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--secondary-color);
        background-color: var(--hint-primary-color);
        border-color: var(--border-primary-color);
      }
    }

    @media (min-width: $md4) {
    }

    &-icon {
      min-width: 16px;
      height: 16px;
    }

    &-text {
      @media (min-width: $md4) {
        font-size: 12px;
        font-family: var(--font-inter);
        font-weight: 500;
        line-height: 100%;
        color: var(--font-inter);
        text-transform: uppercase;
      }

      @media (max-width: $md4) {
        @include hide-item;
      }
    }

    &-count {
    }
  }

  &__button {
    min-width: 110px;

    font-size: 16px;
    line-height: 100%;

    text-transform: uppercase;

    font-family: var(--font-condensed);

    @include adaptiveValue('min-height', 36, 40);

    height: fit-content;

    padding-top: 5px !important;
    padding-bottom: 5px !important;

    &-icon {
      min-width: 16px;
      height: 16px;
    }
  }
}

.balance {
  display: flex;
  align-items: center;

  height: fit-content;

  align-self: center;
  @include adaptiveValue('height', 36, 40, 1400, 992, 1);
  gap: 10px;

  border-radius: 4px;

  border: 1px solid var(--border-primary-color);

  color: var(--primary-color);
  padding: 0px 10px;
  background-color: var(--bg-primary-color);

  transition: all 0.3s ease 0s;

  &.router-link-active {
    color: var(--secondary-color);
    background-color: var(--hint-primary-color);
    border-color: var(--border-primary-color);
    .balance__plus {
      color: var(--secondary-color);
    }
  }

  @media (any-hover: hover) {
    &:hover {
      color: var(--secondary-color);
      background-color: var(--hint-primary-color);
      border-color: var(--border-primary-color);
      .balance__plus {
        color: var(--secondary-color);
      }
    }
  }

  @media (max-width: $md5) {
    min-width: fit-content;

    padding: 0 10px;

    justify-content: center;
  }

  &__wallet {
    @include hide-item;
  }

  &__plus {
    @media (min-width: $md5) {
      min-width: 10px;
      height: 10px;
      transition: color 0.3s ease 0s;
      color: var(--hint-primary-color);
    }

    @media (max-width: $md5) {
      @include hide-item;
    }
  }

  &__price {
    color: inherit;

    :deep(.price__value) {
      text-overflow: ellipsis;

      min-width: 0;

      overflow: hidden;
    }
  }
}

.icon-menu {
  @media (min-width: $md3) {
    @include hide-item;
  }

  @media (max-width: $md3) {
    align-self: center;

    position: relative;

    min-width: 30px;
    height: 30px;

    cursor: pointer;

    z-index: 12;

    background-color: transparent;

    outline: transparent;

    span,
    &::before,
    &::after {
      content: '';

      transition: all 0.3s ease 0s;

      right: 0;

      position: absolute;

      width: 100%;
      height: 2px;

      background-color: var(--primary-color);
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
