<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="header__inner _cnt">
      <RouterLink
        :to="{ name: 'HomePage' }"
        class="header__logo logo _ibg-contain"
        :aria-label="$t('Home')"
      >
        <img src="@/assets/img/icons/logo-deck.png" class="logo__desk" alt="" />
        <img src="@/assets/img/icons/logo-mob.svg" class="logo__mob" alt="" />
      </RouterLink>

      <div class="header__nav nav" :class="{ open: isMobileMenuVisible }">
        <button type="button" class="nav__link" @click="playGame">
          {{ $t('Play Game') }}
        </button>

        <RouterLink :to="{ name: 'ProductListPage' }" class="nav__link">
          {{ $t('Сard store') }}
        </RouterLink>

        <RouterLink
          v-if="isAuthenticated"
          :to="{ name: 'MyCardsPage' }"
          class="nav__link"
        >
          {{ $t('My collection') }}
        </RouterLink>

        <RouterLink
          v-if="isAuthenticated"
          :to="{ path: '/buy-pack' }"
          class="nav__link"
        >
          {{ $t('Packs') }}
        </RouterLink>

        <RouterLink :to="{ name: 'AboutPage' }" class="nav__link">
          {{ $t('About Game') }}
        </RouterLink>

        <RouterLink :to="{ name: 'FaqPage' }" class="nav__link">
          {{ $t('FAQ') }}
        </RouterLink>
      </div>

      <div class="header__auth auth">
        <template v-if="isAuthenticated">
          <RouterLink
            :to="{ name: 'CartPage' }"
            class="auth__link"
            :aria-label="$t('Cart')"
          >
            <SvgIcon :icon="CartIcon" class="auth__link-icon" />

            <div v-if="cartItemsCount > 0" class="auth__link-count">
              {{ cartItemsCount }}
            </div>
          </RouterLink>
        </template>
        <CurrencyDropdown
          data-da-id="header-currency"
          data-da=".header__nav,767.98,first"
          class="header__currency"
        />
        <template v-if="isAuthenticated">
          <RouterLink
            :to="{ name: 'account-wallet' }"
            class="header__balance balance"
            :aria-label="$t('My balance')"
          >
            <SvgIcon :icon="WalletIcon" class="balance__wallet" />

            <PriceFormatter
              class="balance__price"
              size="size-14"
              :price="userStore.userBalance"
            />
            <SvgIcon :icon="PlusIcon" class="balance__plus" />
          </RouterLink>
          <div
            class="auth__profile-menu profile-menu"
            :class="{ 'profile-menu_active': isAccountRoute }"
          >
            <RouterLink
              :to="{ name: 'account-personal' }"
              class="profile-menu__trigger profile"
              :aria-label="$t('Open profile')"
            >
              <div class="profile__avatar-frame">
                <div class="profile__avatar">
                  <img
                    :src="profileImage"
                    :alt="profileImageAlt"
                    @error="handleProfileImageError"
                  />
                </div>
              </div>

              <div class="profile__meta">
                <div class="profile__name">
                  {{ nickName || $t('Profile') }}
                </div>

                <div class="profile__count">
                  {{ heroLevel }}
                </div>
              </div>

              <SvgIcon :icon="ChevronDownIcon" class="profile__chevron" />
            </RouterLink>

            <div class="profile-menu__dropdown">
              <div class="profile-menu__dropdown-inner">
                <RouterLink
                  v-for="item in accountLinks"
                  :key="item.name"
                  :to="{ name: item.name }"
                  class="profile-menu__link"
                  @click="closeMobileMenu"
                >
                  <SvgIcon :icon="item.icon" class="profile-menu__link-icon" />

                  <span> {{ item.label }}</span>
                </RouterLink>
                <button
                  type="button"
                  class="profile-menu__link"
                  :disabled="isLoggingOut"
                  @click="logout"
                >
                  <SvgIcon
                    :icon="LogoutDropdownIcon"
                    class="profile-menu__link-icon"
                  />
                  <span>
                    {{
                      isLoggingOut ? $t('Logging out...') : $t('Log out')
                    }}</span
                  >
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!isAuthenticated" class="header__auth auth">
        <BaseButton class="auth__button" variant="bordered" @click="openLogin">
          {{ $t('Sign In') }}
        </BaseButton>
      </div>

      <button
        type="button"
        class="header__icon-menu icon-menu"
        :class="{ open: isMobileMenuVisible }"
        :aria-label="$t('Toggle menu')"
        :aria-expanded="isMobileMenuVisible"
        @click="toggleMobileMenu"
      >
        <span />
      </button>
    </div>
  </header>

  <AuthModal
    v-if="authModalActive"
    :show="isAuthModalOpen"
    :initial-form="requestedAuthForm"
    @update:show="handleAuthModalUpdate"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import defaultAvatar from '@/assets/img/icons/avatar.png'
import BaseButton from '@/components/base/BaseButton.vue'
import CurrencyDropdown from '@/components/CurrencyDropdown.vue'
import {
  CartIcon,
  ChevronDownIcon,
  LogoutDropdownIcon,
  OffersDropdownIcon,
  OrderDropdownIcon,
  PlusIcon,
  ProfileDropdownIcon,
  TransactionDropdownIcon,
  WalletDropdownIcon,
  WalletIcon,
  WithdrawalsDropdownIcon,
} from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import AuthModal from '@/pages/AuthPage/modals/AuthModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useNavigationStore } from '@/stores/navigation'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { destroyDynamicAdapt, initDynamicAdapt } from '@/utils/dynamic_adapt.js'

const playRedirectLink = import.meta.env.VITE_PLAY_REDIRECT_LINK

const authModalActive =
  String(import.meta.env.VITE_AUTH_MODAL_ACTIVE).toLowerCase() === 'true'

const AUTH_FORMS = ['signin', 'signup', 'reset']

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const authStore = useAuthStore()
const cartStore = useCartStore()
const navigationStore = useNavigationStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const { nickName, heroLevel, userAvatarUrl } = storeToRefs(userStore)
const { isMobileMenuOpen } = storeToRefs(navigationStore)

const isScrolled = ref(false)
const isLoggingOut = ref(false)
const isAuthModalOpen = ref(false)

const isMobileMenuVisible = isMobileMenuOpen

const offersEnabled = computed(() => {
  return Boolean(settingsStore.settings?.payouts?.offer_enabled)
})

const isAuthenticated = computed(() => {
  return Boolean(authStore.isAuthenticated)
})

const isAccountRoute = computed(() => {
  return typeof route.name === 'string' && route.name.startsWith('account-')
})

const cartItemsCount = computed(() => {
  return Number(cartStore.cartItemsCount || 0)
})

const requestedAuthForm = computed(() => {
  const form = route.query.auth

  if (form === 'reset-password') {
    return 'reset'
  }

  return AUTH_FORMS.includes(form) ? form : 'signin'
})

const accountLinks = computed(() => {
  const links = [
    {
      name: 'account-personal',
      label: t('Profile'),
      icon: ProfileDropdownIcon,
    },
    {
      name: 'account-wallet',
      label: t('My Balance'),
      icon: WalletDropdownIcon,
    },
    {
      name: 'account-orders',
      label: t('Order History'),
      icon: OrderDropdownIcon,
    },
    {
      name: 'account-transactions',
      label: t('Transactions'),
      icon: TransactionDropdownIcon,
    },
  ]

  if (offersEnabled.value) {
    links.push(
      {
        name: 'account-offers',
        label: t('Offers'),
        icon: OffersDropdownIcon,
      },
      {
        name: 'account-withdrawals',
        label: t('Withdrawals'),
        icon: WithdrawalsDropdownIcon,
      },
    )
  }

  return links
})

const profileImage = computed(() => {
  return userAvatarUrl.value || defaultAvatar
})

const profileImageAlt = computed(() => {
  return `${nickName.value || 'User'} profile avatar`
})

const playGame = () => {
  closeMobileMenu()

  if (!playRedirectLink) {
    console.warn('VITE_PLAY_REDIRECT_LINK is not defined')
    return
  }

  window.open(playRedirectLink, '_blank', 'noopener,noreferrer')
}

const ensureUserProfile = async () => {
  if (!isAuthenticated.value) {
    return
  }

  try {
    if (!userStore.user) {
      await userStore.fetchProfile()
    }

    await userStore.initializeAvatar()
  } catch (error) {
    console.error('Failed to load user profile:', error)
  }
}

const handleProfileImageError = event => {
  const image = event.currentTarget

  if (!image || image.dataset.fallbackApplied === 'true') {
    return
  }

  image.dataset.fallbackApplied = 'true'
  image.src = defaultAvatar
}

const handleScroll = () => {
  isScrolled.value = (window.scrollY || window.pageYOffset) >= 1
}

const closeMobileMenu = () => {
  navigationStore.closeMobileMenu()
}

const toggleMobileMenu = () => {
  navigationStore.toggleMobileMenu()
}

const clearAuthQuery = async () => {
  if (!Object.prototype.hasOwnProperty.call(route.query, 'auth')) {
    return
  }

  const { auth, redirect, ...remainingQuery } = route.query

  await router.replace({
    path: route.path,
    query: remainingQuery,
    hash: route.hash,
  })
}

const handleAuthModalUpdate = async isOpen => {
  isAuthModalOpen.value = isOpen

  if (!isOpen) {
    try {
      await clearAuthQuery()
    } catch (error) {
      console.error('Failed to clear authentication query:', error)
    }
  }
}

const openLogin = async () => {
  closeMobileMenu()

  if (authModalActive) {
    try {
      await router.push({
        path: route.path,
        query: {
          ...route.query,
          auth: 'signin',
        },
        hash: route.hash,
      })

      isAuthModalOpen.value = true
    } catch (error) {
      console.error('Failed to open sign-in modal:', error)
    }

    return
  }

  try {
    await router.push({
      name: 'Auth',
      query: {
        form: 'signin',
      },
    })
  } catch (error) {
    console.error('Failed to navigate to sign-in page:', error)
  }
}

const logout = async () => {
  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true

  try {
    closeMobileMenu()

    await authStore.logout()

    isAuthModalOpen.value = false

    await router.push({
      name: 'HomePage',
    })
  } catch (error) {
    console.error('Failed to log out:', error)
  } finally {
    isLoggingOut.value = false
  }
}

const refreshDynamicAdapt = async () => {
  await nextTick()
  initDynamicAdapt('max')
}

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu()
  },
)

watch(
  () => route.query.auth,
  async form => {
    if (!authModalActive) {
      return
    }

    if (isAuthenticated.value) {
      isAuthModalOpen.value = false
      return
    }

    if (AUTH_FORMS.includes(form) || form === 'reset-password') {
      isAuthModalOpen.value = true
    } else {
      isAuthModalOpen.value = false
    }
  },
  {
    immediate: true,
  },
)

watch(
  isAuthenticated,
  async authenticated => {
    if (!authenticated) {
      return
    }

    isAuthModalOpen.value = false

    await ensureUserProfile()
  },
  {
    immediate: true,
  },
)

onMounted(async () => {
  await Promise.all([refreshDynamicAdapt(), ensureUserProfile()])

  handleScroll()

  window.addEventListener('scroll', handleScroll, {
    passive: true,
  })
})

onBeforeUnmount(() => {
  destroyDynamicAdapt()
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 12;

  width: auto;
  min-width: 320px;
  max-width: none;

  border-bottom: 1px solid transparent;
  background-color: var(--bg-secondary-color);

  transition: all 0.3s ease 0s;

  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  &.scrolled {
    background-color: var(--bg-primary-color);
    @media (min-width: $md2) {
      .header__inner {
        min-height: 50px;
      }
    }
  }

  &__bg {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__inner {
    @include adaptiveValue('gap', 24, 10, 1800, 1370, 1);
    @include adaptiveValue('min-height', 84, 50, 1800, 1370, 1);

    position: relative;
    z-index: 1;

    display: flex;
    align-items: stretch;

    padding-top: 5px;
    padding-bottom: 5px;

    transition: min-height 0.3s ease;
  }
  &__logo {
    @media (min-width: 1399.98px) {
      @include adaptiveValue('margi-right', 24, 0, 1800, 1400, 1);
    }
    @media (max-width: 1399.98px) {
      margin-right: auto;
    }
  }
  &__logo,
  &__auth,
  &__balance,
  &__currency {
    position: relative;
    z-index: 12;
  }
  &__nav {
    @media (min-width: 1399.98px) {
      margin-right: auto;
    }
  }
  &__currency {
    @media (min-width: $md4) {
      align-self: center;

      min-width: 80px;

      margin-left: auto;
    }

    @media (max-width: $md4) {
      width: 100%;
    }
  }

  &__auth {
    @media (max-width: $md4) {
      margin-left: auto;
    }
  }
}

.logo {
  @include adaptiveValue('min-width', 103, 60, 1800, 1370, 1);
  @include adaptiveValue('height', 58, 40, 1800, 1370, 1);

  display: block;
  align-self: center;

  width: fit-content;

  @media (max-width: $md6) {
    min-width: 32px;
    height: 32px;
  }

  &__desk {
    @media (max-width: $md6) {
      @include hide-item;
    }
  }

  &__mob {
    @media (min-width: $md6) {
      @include hide-item;
    }
  }
}

.nav {
  @media (min-width: 1399.98px) {
    display: flex;
    align-items: stretch;
    gap: 8px;
  }

  @media (max-width: 1399.98px) {
    position: fixed;
    top: 50px;
    left: -100%;
    z-index: 10;

    display: block;
    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    height: calc(100dvh - 50px);
    min-height: calc(100dvh - 50px);

    margin-left: 0;
    padding: 25px 10px 30px;

    background-color: var(--bg-fifth-color);

    transition: left 0.3s ease;

    -webkit-overflow-scrolling: touch;

    &::before {
      position: fixed;
      top: 0;
      left: -100%;
      z-index: 11;

      width: 100%;
      height: 50px;

      background-color: var(--bg-primary-color);

      content: '';

      transition: left 0.3s ease;
    }

    &.open {
      left: 0;

      &::before {
        left: 0;
      }
    }
  }

  &__link {
    @include adaptiveValue('padding-left', 16, 10, 1800, 1370, 1);
    @include adaptiveValue('padding-right', 16, 10, 1800, 1370, 1);

    display: flex;
    align-items: center;
    justify-content: center;

    padding-top: 10px;
    padding-bottom: 10px;

    border-bottom: 1px solid transparent;
    background: transparent;

    color: var(--secondary-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 700;
    line-height: 100%;
    letter-spacing: 0px;
    text-transform: uppercase;
    white-space: nowrap;

    transition: all 0.3s ease;

    &.router-link-active {
      border-color: inherit;
      background: linear-gradient(
        180deg,
        rgba(72, 217, 255, 0.1) 0%,
        rgba(72, 217, 255, 0) 100%
      );

      color: var(--hint-primary-color);

      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: inherit;

        color: var(--third-color);
      }
    }
    @media (min-width: 1399.98px) {
      height: 100%;
    }
    @media (max-width: 1399.98px) {
      width: 100%;
      min-height: 45px;

      border: 1px solid transparent;
      border-radius: 6px;
      background: var(--bg-third-color);
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }
}

.auth {
  @include adaptiveValue('gap', 24, 10, 1800, 1370, 1);

  display: flex;
  align-items: center;

  &__profile-menu {
    // align-self: stretch;
  }

  &__link {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 40px;
    height: 40px;

    border: 1px solid inherit;
    border-radius: 6px;

    color: var(--third-color);

    transition: opacity 0.3s ease 0s;

    &.router-link-active {
      color: var(--hint-primary-color);

      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }

    &-icon {
      min-width: 18px;
      height: 18px;
    }

    &-count {
      position: absolute;
      top: 30%;
      right: 0;
      z-index: 1;

      display: flex;
      align-items: center;
      justify-content: center;

      min-width: 18px;
      min-height: 18px;

      padding: 0px 5px;

      border-radius: 6px;
      background-color: var(--bg-fourth-color);

      color: var(--hint-primary-color);
      font-size: 12px;
      line-height: 12px;
      letter-spacing: 0px;

      transform: translate(70%, -70%);
    }
  }

  &__button {
    align-self: center;

    width: fit-content;
    min-width: 109px;
    min-height: 40px !important;
  }
}

.balance {
  @include adaptiveValue('gap', 15, 10);

  display: flex;
  align-items: center;

  height: 40px;

  padding-right: 10px;
  padding-left: 10px;

  border-radius: 6px;
  background-color: var(--bg-third-color);

  color: var(--primary-color);

  @media (any-hover: hover) {
    &:hover {
      color: var(--hint-primary-color);
      .balance__wallet {
        color: var(--hint-primary-color);
      }
    }
  }

  @media (max-width: $md5) {
    justify-content: center;

    width: fit-content;
  }
  @media (max-width: $md8) {
    min-width: 40px;
  }

  &__wallet {
    @include hide-item;
  }

  &__price {
    flex-direction: row-reverse;

    margin-top: 3px;
    @media (max-width: $md6) {
      :deep(.price__number) {
        overflow: hidden;

        min-width: 0;
        max-width: 90px;

        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__plus {
    min-width: 12px;
    height: 12px;

    color: var(--hint-primary-color);
  }
}

.profile-menu {
  position: relative;

  display: flex;
  // align-items: stretch;

  min-width: 0;

  &:hover,
  &:focus-within {
    .profile-menu__dropdown {
      visibility: visible;

      opacity: 1;

      pointer-events: auto;

      transform: translateY(0);
    }

    .profile__chevron {
      transform: rotate(180deg);
    }
  }

  &_active {
    .profile__name {
    }
  }

  &__trigger {
    height: 100%;
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 30;

    visibility: hidden;

    width: max-content;
    min-width: 230px;

    padding-top: 4px;

    opacity: 0;

    pointer-events: none;

    transform: translateY(-4px);
    transition: all 0.3s ease 0s;
  }

  &__dropdown-inner {
    overflow-x: hidden;
    overflow-y: auto;

    max-height: calc(100dvh - 100px);

    padding: 11px 0;

    border: 1px solid var(--hint-primary-color);
    border-radius: 8px;
    background-color: var(--bg-fifth-color);
    box-shadow: 0 4px 16px 0px var(--shadow-primary-color);

    -webkit-overflow-scrolling: touch;

    overscroll-behavior: contain;
    scrollbar-color: var(--hint-primary-color) transparent;

    // Scrollbar styling
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 8px;
      background-color: var(--hint-primary-color);
    }

    @media (max-width: $md4) {
      max-height: calc(100dvh - 80px);
    }
  }

  &__link {
    @include adaptiveValue('padding-left', 24, 10);
    @include adaptiveValue('padding-right', 24, 10);
    display: flex;
    flex: 1 1 100%;
    align-items: center;
    gap: 8px;

    width: 100%;
    min-height: 38px;

    padding-top: 10px;
    padding-bottom: 10px;

    background-color: transparent;

    color: var(--fourth-color);
    font-family: var(--font-audiowide);
    font-size: 14px;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: 0px;
    text-align: center;
    text-transform: capitalize;
    white-space: nowrap;

    cursor: pointer;

    transition: all 0.3s ease 0s;

    &-icon {
      @include hide-item;
    }

    &.router-link-active {
      color: var(--hint-primary-color);

      pointer-events: none;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  @media (max-width: $md7) {
    &__dropdown {
      right: -12px;

      min-width: 210px;
    }
  }
}

.profile {
  @include adaptiveValue('gap', 16, 10);

  display: flex;
  align-items: center;

  min-width: 0;

  &__avatar-frame {
    @include adaptiveValue('width', 58, 40, 1800, 1370, 1);
    @include adaptiveValue('min-width', 58, 40, 1800, 1370, 1);
    @include adaptiveValue('height', 58, 40, 1800, 1370, 1);

    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    pointer-events: none;
    &::before {
      position: absolute;
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      background-image: url('@/assets/img/avatar.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;

      content: '';
    }
  }

  &__avatar {
    @include adaptiveValue('width', 45, 35, 1800, 1370, 1);
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;

    overflow: hidden;

    height: auto;
    aspect-ratio: 1 / 1;

    transform: translate(-50%, -50%);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center;

      transition: transform 0.3s ease;
    }
  }

  &__meta {
    overflow: hidden;

    min-width: 0;
    max-width: 100px;

    @media (max-width: $md7) {
      @include hide-item;
    }
  }

  &__name {
    overflow: hidden;

    min-width: 0;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 600;
    line-height: 100%;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;

    transition: color 0.3s ease;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 6, 3, 1800, 1370, 1);
    }
  }

  &__count {
    color: var(--fifth-color);
    font-size: 12px;
    font-weight: 700;
    line-height: 100%;
  }

  &__chevron {
    min-width: 12px;
    height: 7px;

    color: var(--hint-primary-color);

    transform: rotate(0deg);
    transition: all 0.3s ease 0s;

    @media (max-width: $md5) {
      @include hide-item;
    }
  }
}

.icon-menu {
  padding: 0;

  border: 0;
  outline: none;
  background: transparent;

  @media (min-width: 1399.98px) {
    @include hide-item;
  }

  @media (max-width: 1399.98px) {
    position: relative;
    z-index: 12;

    align-self: center;

    min-width: 30px;
    height: 30px;

    cursor: pointer;

    @media (any-hover: hover) {
      &:hover {
        span,
        &::before,
        &::after {
          background-color: var(--fourth-color);
        }
      }
    }

    span,
    &::before,
    &::after {
      position: absolute;
      right: 0;

      width: 100%;
      height: 2px;

      background-color: var(--fifth-color);

      content: '';

      transition: all 0.3s ease;
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

      &::before,
      &::after {
        background-color: var(--fourth-color);
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

    &:focus-visible {
      outline: 1px solid var(--hint-primary-color);
      outline-offset: 4px;
    }
  }
}
</style>
