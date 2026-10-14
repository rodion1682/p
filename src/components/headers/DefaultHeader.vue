<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="header__inner _cnt">
      <RouterLink
        :to="{ name: 'HomePage' }"
        class="header__logo logo _ibg-contain"
        :aria-label="$t('Home')"
      >
        <img src="@/assets/img/icons/logo-deck.svg" class="logo__desk" alt="" />
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
          {{ $t('About Varellune') }}
        </RouterLink>

        <RouterLink :to="{ name: 'FaqPage' }" class="nav__link">
          {{ $t('FAQ') }}
        </RouterLink>
      </div>

      <CurrencyDropdown
        data-da-id="header-currency"
        data-da=".header__nav,767.98,first"
        class="header__currency"
      />

      <div v-if="isAuthenticated" class="header__auth auth">
        <RouterLink
          :to="{ name: 'account-wallet' }"
          class="header__balance balance"
          :aria-label="$t('My balance')"
        >
          <SvgIcon :icon="WalletIcon" class="balance__wallet" />

          <PriceFormatter
            class="balance__price"
            size="size-24"
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
                <span>{{ item.label }}</span>
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
                  {{ isLoggingOut ? $t('Logging out...') : $t('Log out') }}
                </span>
              </button>
            </div>
          </div>
        </div>

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
      </div>

      <div v-else class="header__auth auth">
        <BaseButton class="auth__button" @click="openLogin">
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
    v-model:show="isAuthModalOpen"
    initial-form="signin"
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
import { WithdrawalsDropdownIcon } from '../icons'

const playRedirectLink = import.meta.env.VITE_PLAY_REDIRECT_LINK

const authModalActive =
  String(import.meta.env.VITE_AUTH_MODAL_ACTIVE).toLowerCase() === 'true'

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

const accountLinks = computed(() => {
  const links = [
    {
      icon: ProfileDropdownIcon,
      name: 'account-personal',
      label: t('Personal Data'),
    },
    {
      icon: WalletDropdownIcon,
      name: 'account-wallet',
      label: t('My Balance'),
    },
    {
      icon: OrderDropdownIcon,
      name: 'account-orders',
      label: t('Order History'),
    },
    {
      icon: TransactionDropdownIcon,
      name: 'account-transactions',
      label: t('Transactions'),
    },
  ]

  if (offersEnabled.value) {
    links.push(
      {
        icon: OffersDropdownIcon,
        name: 'account-offers',
        label: t('Offers'),
      },
      {
        icon: WithdrawalsDropdownIcon,
        name: 'account-withdrawals',
        label: t('Withdrawals'),
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

const openLogin = async () => {
  closeMobileMenu()

  if (authModalActive) {
    isAuthModalOpen.value = true
    return
  }

  await router.push({
    name: 'Auth',
    query: {
      form: 'signin',
    },
  })
}

const logout = async () => {
  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true

  try {
    closeMobileMenu()

    await authStore.logout()

    await router.push({
      name: 'HomePage',
    })
  } catch (error) {
    console.error('Failed to log out:', error)
  } finally {
    isLoggingOut.value = false
  }
}

const toggleMobileMenu = () => {
  navigationStore.toggleMobileMenu()
}

const closeMobileMenu = () => {
  navigationStore.closeMobileMenu()
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

  border-bottom: 1px solid var(--border-priamry-color);
  background-color: var(--bg-third-color);

  &.scrolled {
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
    @include adaptiveValue('gap', 32, 10, 1840, 1370, 1);
    @include adaptiveValue('min-height', 67, 50, 1840, 1370, 1);

    position: relative;
    z-index: 1;

    display: flex;
    align-items: stretch;

    padding-top: 5px;
    padding-bottom: 5px;

    transition: min-height 0.3s ease;
  }
  &__logo {
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

      min-width: 73px;

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
  @include adaptiveValue('min-width', 158, 100, 1840, 1370, 1);
  @include adaptiveValue('height', 40, 25, 1840, 1370, 1);

  display: block;
  align-self: center;

  width: fit-content;

  @media (max-width: $md6) {
    min-width: 40px;
    height: 40px;
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
    @include adaptiveValue('gap', 16, 10, 1840, 1370, 1);

    display: flex;

    min-height: inherit;
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

    border-top: 1px solid var(--border-priamry-color);
    background-color: var(--bg-primary-color);

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
    @include adaptiveValue('padding-left', 16, 10, 1840, 1370, 1);
    @include adaptiveValue('padding-right', 16, 10, 1840, 1370, 1);

    display: flex;
    align-items: center;
    justify-content: center;

    padding-top: 10px;
    padding-bottom: 10px;

    border-bottom: 1px solid transparent;

    color: var(--secondary-color);
    font-size: 16px;
    font-weight: 500;
    text-transform: uppercase;
    white-space: nowrap;

    transition: all 0.3s ease;

    &.router-link-active {
      border-color: var(--hint-primary-color);

      color: var(--primary-color);

      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }

    @media (max-width: 1399.98px) {
      width: 100%;
    }
  }
}

.auth {
  @include adaptiveValue('gap', 32, 10, 1840, 1370, 1);

  display: flex;
  align-items: stretch;

  &__profile-menu {
    align-self: stretch;
  }

  &__link {
    @include adaptiveValue('min-width', 64, 46, 1840, 1370, 1);

    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    height: inherit;

    color: var(--hint-primary-color);

    transition: color 0.3s ease;

    &.router-link-active {
      color: var(--primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }

    &-icon {
      @include adaptiveValue('height', 29, 24);

      min-width: 24px;
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

      border-radius: 50%;
      background-color: var(--hint-primary-color);

      color: var(--primary-color);
      font-size: 12px;
      line-height: 18px;

      transform: translate(25%, -50%);
    }
  }

  &__button {
    align-self: center;

    width: fit-content;
    min-width: 111px;
    min-height: 36px !important;

    font-family: var(--font-inter) !important;
    font-size: 14px !important;
  }
}

.balance {
  @include adaptiveValue('gap', 18, 10);

  display: flex;
  align-items: center;

  height: 100%;

  @media (max-width: $md8) {
    min-width: 46px;
  }

  @media (any-hover: hover) {
    &:hover {
      .balance__price {
        color: var(--hint-secondary-color);
      }
    }
  }

  @media (max-width: $md5) {
    width: fit-content;
  }

  &__wallet {
    min-width: 26px;
    height: 26px;

    color: var(--hint-secondary-color);
  }

  &__price {
    color: var(--primary-color);

    @media (max-width: $md6) {
      :deep(.price__number) {
        overflow: hidden;

        min-width: 0;
        max-width: 86px;

        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__plus {
    @include hide-item;
  }
}

.profile-menu {
  position: relative;

  display: flex;
  align-items: stretch;

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
      color: var(--primary-color);

      transform: rotate(180deg);
    }

    .profile__name {
      color: var(--hint-secondary-color);
    }

    .profile__avatar-frame {
      filter: brightness(1.12);
    }

    .profile__avatar img {
      transform: scale(1.04);
    }
  }

  &_active {
    .profile__name {
      color: var(--primary-color);
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

    padding-top: 8px;

    opacity: 0;

    pointer-events: none;

    transform: translateY(-6px);
    transition:
      visibility 0.25s ease,
      opacity 0.25s ease,
      transform 0.25s ease;
  }

  &__dropdown-inner {
    overflow: hidden;

    padding: 12px 0;

    border: 1px solid var(--border-fourth-color);
    background-color: var(--bg-primary-color);
    box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 8px;

    width: 100%;
    min-height: 33px;

    padding: 7px;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--third-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 500;
    line-height: 120%;
    text-align: left;

    cursor: pointer;

    transition: all 0.3s ease 0s;

    &:focus-visible {
      color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-gradient-color);

        color: var(--primary-color);
      }
    }

    &-icon {
      min-width: 19px;
      height: 19px;

      color: var(--hint-secondary-color);
    }

    &.router-link-active {
      background-color: var(--hint-gradient-color);

      color: var(--primary-color);

      pointer-events: none;
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
  @include adaptiveValue('gap', 14, 8);

  display: flex;
  align-items: center;

  min-width: 0;

  &__avatar-frame {
    @include adaptiveValue('width', 58, 46);
    @include adaptiveValue('min-width', 58, 46);

    position: relative;

    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    height: auto;
    aspect-ratio: 1 / 1;

    background-image: url('../../assets/img/avarat-frame.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;

    pointer-events: none;

    transition: filter 0.3s ease;
  }

  &__avatar {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;

    overflow: hidden;

    width: 65%;
    height: auto;
    aspect-ratio: 1 / 1;

    border-radius: 50%;

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

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: 16px;
    font-weight: 600;
    line-height: 120%;
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.3s ease;
  }

  &__count {
    color: var(--hint-third-color);
    font-size: 12px;
    font-weight: 500;
    line-height: 120%;
  }

  &__chevron {
    min-width: 8px;
    height: 5px;

    color: var(--hint-primary-color);

    transform: rotate(0deg);
    transition:
      color 0.3s ease,
      transform 0.3s ease;

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
          background-color: var(--primary-color);
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

      background-color: var(--primary-color);

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
        background-color: var(--primary-color);
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
      outline: 1px solid var(--hint-gradient-color);
      outline-offset: 4px;
    }
  }
}
</style>
