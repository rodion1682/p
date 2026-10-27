<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="header__inner _cnt">
      <div :class="{ open: isMobileMenuVisible }" class="header__nav nav">
        <RouterLink
          v-if="false"
          :to="{ name: 'HomePage' }"
          class="nav__link"
          @click="closeMobileMenu"
        >
          {{ $t('Home') }}
        </RouterLink>
        <RouterLink
          :to="marketRoute"
          class="nav__link"
          @click="closeMobileMenu"
        >
          {{ $t('Market') }}
        </RouterLink>
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
          v-if="false"
          :to="{ name: 'ContactPage' }"
          class="nav__link"
          @click="closeMobileMenu"
        >
          {{ $t('Contact us') }}
        </RouterLink>

        <RouterLink
          :to="{ name: 'FAQ' }"
          class="nav__link"
          @click="closeMobileMenu"
        >
          {{ $t('FAQ') }}
        </RouterLink>
      </div>
      <div class="header__logo logo">
        <RouterLink :to="{ name: 'HomePage' }" class="logo__link _ibg-contain">
          <img class="logo__image_desk" src="@/assets/img/logo-full.svg" />
          <img class="logo__image_mob" src="@/assets/img/logo-small.svg" />
        </RouterLink>
        <button
          v-if="isOfferEnabled && isAuthenticated"
          class="logo__sell"
          :class="{ active: isSellSkinActive }"
          @click="openSellSkinsFromNav"
        >
          <SvgIcon :icon="SellSkinsIcon" class="logo__sell-icon" />
        </button>
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
          <!--  @click="openCartModal" -->
          <RouterLink :to="{ name: 'CartPage' }" class="header__link link">
            <SvgIcon class="link__icon" :icon="CartIcon" />
            <span v-if="cartCount" class="link__count">
              {{ cartCount }}
            </span>
          </RouterLink>

          <RouterLink
            :to="{ name: 'account-profile' }"
            class="header__link link"
          >
            <SvgIcon class="link__icon" :icon="UserIcon" />
            <div v-if="false" class="link__text">
              {{ $t('Profile') }}
            </div>
          </RouterLink>
        </template>

        <template v-else>
          <BaseButton
            variant="bordered"
            class="header__reg-button header__reg-button_login"
            @click="goToLogin"
          >
            {{ $t('Log In') }}
          </BaseButton>

          <BaseButton
            class="header__reg-button header__reg-button_signin"
            @click="goToRegister"
          >
            {{ $t('Register') }}
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

  <SellSkinsModal
    v-if="SHOW_SELL_SKIN_MODAL && isSellSkinsOpen && isAuthenticated"
    v-model="isSellSkinsOpen"
    @close="isSellSkinsOpen = false"
  />

  <!--   v-if="isCartOpen"
    v-model:show="isCartOpen" -->
  <!--<CartPageModal
    v-if="false"
    v-model="isCartOpen"
    @close="isCartOpen = false"
  />-->
</template>

<script setup>
import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import CurrencyDropdown from '@/components/header/CurrencyDropdown.vue'
import {
  CartIcon,
  PlusIcon,
  SellSkinsIcon,
  UserIcon,
  WalletIcon,
} from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useGame } from '@/composables/useGame'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { destroyDynamicAdapt, initDynamicAdapt } from '@/utils/dynamic_adapt.js'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SellSkinsModal from '../modals/sellSkins/SellSkinModal/SellSkinsModal.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
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

const { selectedGame, marketRoute, setGame, syncGame } = useGame()

const isMobileMenuVisible = ref(false)
const isSignInOpen = ref(false)
const isScrolled = ref(false)
const isSellSkinsOpen = ref(false)
const isCartOpen = ref(false)

const isOfferEnabled = computed(() => settingsStore.isOfferEnabled)
const cartCount = computed(() => cartstore.cartItemsCount)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isSellSkinActive = computed(() => {
  if (SHOW_SELL_SKIN_MODAL) {
    return isSellSkinsOpen.value
  }

  return route.name === 'SellSkisnPage'
})

//const openCartModal = () => {
//  closeMobileMenu()
//  isCartOpen.value = true
//}

const closeMobileMenu = () => {
  isMobileMenuVisible.value = false
}

const goToLogin = () => {
  closeMobileMenu()

  router.push({
    name: 'LoginPage',
    query: {
      redirect: route.fullPath,
    },
  })
}

const goToRegister = () => {
  closeMobileMenu()

  router.push({
    name: 'RegisterPage',
    query: {
      redirect: route.fullPath,
    },
  })
}

const toggleMobileMenu = () => {
  isMobileMenuVisible.value = !isMobileMenuVisible.value
}

const openSellSkinsFromNav = () => {
  closeMobileMenu()

  if (!authStore.isAuthenticated) {
    router.push({
      name: 'LoginPage',
      query: {
        redirect: route.fullPath,
      },
    })

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
  },
)

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

watch(isAuthenticated, async value => {
  if (value) {
    await refreshDynamicAdapt()
  } else {
    destroyDynamicAdapt()
  }
})

onMounted(async () => {
  await refreshDynamicAdapt()

  isSignInOpen.value = false

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
  background-color: var(--bg-primary-color);
  &.scrolled {
    @media (min-width: $md3) {
      .header__inner {
        padding-top: 10px;
        padding-bottom: 10px;
        min-height: 70px;
      }
    }
  }

  &__inner {
    display: flex;
    align-items: center;
    @include adaptiveValue('padding-top', 20, 5, 1440, 992, 1);
    @include adaptiveValue('padding-bottom', 20, 5, 1440, 992, 1);
    @include adaptiveValue('gap', 20, 10, 1440, 992, 1);
    transition: padding 0.3s ease 0s;
    @include adaptiveValue('min-height', 100, 50, 1440, 992, 1);
  }

  &__logo,
  &__game-switch,
  &__nav,
  &__auth {
    position: relative;
    z-index: var(--header-z-index);
  }

  &__logo {
    margin-right: auto;
    @media (min-width: $md2) {
      margin-left: auto;
    }
  }

  &__nav {
  }

  &__auth {
    display: flex;
    @include adaptiveValue('gap', 20, 10, 1440, 992, 1);
  }
  &__reg-button {
    :deep(.btn) {
      @include adaptiveValue('min-height', 50, 40, 1440, 992, 1);
    }
    :deep(.btn__text) {
      white-space: nowrap;
    }
    @media (max-width: $md7) {
      font-size: 14px;
      min-width: fit-content !important;
    }
    &_login {
      @include adaptiveValue('min-width', 150, 100);
    }
    &_signin {
      @include adaptiveValue('min-width', 150, 100);
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
    @media (min-width: $md5) {
      @include adaptiveValue('min-width', 218, 100, 1440, 992, 1);
      @include adaptiveValue('min-height', 60, 30, 1440, 992, 1);
    }
    @media (max-width: $md5) {
      min-width: 40px;
      height: 40px;
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
    @include adaptiveValue('border-radius', 20, 10);
    min-width: 50px;
    height: 40px;
    background-color: transparent;
    color: var(--primary-color);
    background-color: var(--hint-primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    transition: all 0.3s ease 0s;
    &.active {
      border-color: var(--hint-primary-color);
      background-color: var(--bg-primary-color);
    }
    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);
        background-color: var(--bg-primary-color);
      }
    }
    @media (min-width: $md2) {
      @include hide-item;
    }
    &-icon {
      margin-right: 5px;
      min-width: 39px;
      height: 20px;
    }
  }
}

.nav {
  @media (min-width: $md2) {
    display: flex;
    align-self: center;
    min-height: 50px;
    @include adaptiveValue('border-radius', 20, 10);
    background-color: var(--bg-secondary-color);
    @include adaptiveValue('padding-left', 20, 10, 1440, 992, 1);
    @include adaptiveValue('padding-right', 20, 10, 1440, 992, 1);
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
    padding: 25px 10px 30px;
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
    white-space: nowrap;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background-color: transparent;
    text-transform: capitalize;
    font-weight: 400;
    font-size: 16px;
    line-height: 120%;
    transition: color 0.3s ease 0s;
    color: var(--secondary-color);
    font-family: var(--font-inter);
    border-bottom: 1px solid transparent;
    padding-top: 8px;
    padding-bottom: 8px;
    @include adaptiveValue('padding-left', 20, 10, 1440, 992, 1);
    @include adaptiveValue('padding-right', 20, 10, 1440, 992, 1);
    position: relative;
    z-index: 1;
    &.active,
    &.router-link-active {
      pointer-events: none;
      color: var(--primary-color);
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }

    @media (max-width: $md2) {
      height: fit-content;
      width: 100%;
      min-height: 45px;
      @include adaptiveValue('border-radius', 20, 10);
      background-color: var(--bg-primary-color);
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
  border: 1px solid transparent;
  background-color: var(--bg-secondary-color);
  color: var(--primary-color);
  @include adaptiveValue('border-radius', 20, 10);
  position: relative;

  &.router-link-active {
    background-color: var(--bg-primary-color);
    color: var(--primary-color);
    border-color: var(--hint-primary-color);
    .balance__wallet {
      color: var(--primary-color);
    }
    :deep(.price__value) {
      color: var(--primary-color);
    }
    .balance__plus {
      color: var(--primary-color);
      background-color: var(--bg-primary-color);
      border-color: var(--hint-primary-color);
    }
  }
  @media (any-hover: hover) {
    &:hover {
      background-color: var(--bg-primary-color);
      color: var(--primary-color);
      border-color: var(--hint-primary-color);
      .balance__wallet {
        color: var(--primary-color);
      }
      :deep(.price__value) {
        color: var(--primary-color);
      }
      .balance__plus {
        color: var(--primary-color);
        background-color: var(--bg-primary-color);
        border-color: var(--hint-primary-color);
      }
    }
  }
  @media (min-width: $md7) {
    @include adaptiveValue('padding-left', 20, 10);
    @include adaptiveValue('padding-right', 60, 50, 1440, 992, 1);
  }
  @media (max-width: $md7) {
    min-width: 40px;
    background-color: var(--hint-primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__wallet {
    min-width: 17px;
    height: 17px;
    transition: color 0.3s ease 0s;
    color: var(--primary-color);
  }
  &__balance {
    margin-top: 3px;
    @media (max-width: $md7) {
      @include hide-item;
    }
  }
  &__plus {
    position: absolute;
    right: 0;
    top: 0;
    @include adaptiveValue('min-width', 50, 40, 1440, 992, 1);
    @include adaptiveValue('height', 50, 40, 1440, 992, 1);
    display: flex;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    background-color: var(--hint-primary-color);
    border: 1px solid transparent;
    transition: all 0.3s ease 0s;
    @include adaptiveValue('border-radius', 20, 10);
    @media (max-width: $md7) {
      @include hide-item;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
        background-color: var(--bg-primary-color);
        border-color: var(--hint-primary-color);
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
  @include adaptiveValue('border-radius', 20, 10);
  @include adaptiveValue('min-width', 50, 40, 1440, 992, 1);
  @include adaptiveValue('height', 50, 40, 1440, 992, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  background-color: var(--hint-primary-color);
  border: 1px solid transparent;
  color: var(--primary-color);
  transition: all 0.3s ease 0s;
  position: relative;

  @media (any-hover: hover) {
    &:hover {
      color: var(--primary-color);
      background-color: var(--bg-primary-color);
      border-color: var(--hint-primary-color);
      .link__count {
        background-color: var(--hint-primary-color);
      }
    }
  }
  &.router-link-active {
    color: var(--primary-color);
    background-color: var(--bg-primary-color);
    border-color: var(--hint-primary-color);
    .link__count {
      background-color: var(--hint-primary-color);
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
    background-color: var(--bg-primary-color);
    color: var(--primary-color);
    border: 1px solid var(--hint-primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px 5px;
    line-height: 1;
    @include adaptiveValue('border-radius', 10, 6);
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

.game-switch {
  display: none !important;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid transparent;
  background-image:
    linear-gradient(var(--bg-primary-color), var(--bg-primary-color)),
    linear-gradient(180deg, #909496 0%, #181e28 100%);

  background-origin: border-box;
  background-clip: padding-box, border-box;
  @media (max-width: $md4) {
    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }
  &__button {
    min-width: 73px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background-color: var(--bg-secondary-color);
    transition: all 0.3s ease;
    cursor: pointer;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color);
      }
    }
    @media (max-width: $md4) {
      min-width: none;
      flex: 0 1 50%;
      height: 37px;
    }

    &.active {
      background-color: var(--bg-primary-color);
    }

    &_dota {
      @media (any-hover: hover) {
        &:hover {
          :deep(svg path:first-child) {
            fill: #b9070a;
          }

          :deep(svg path:last-child) {
            fill: #ffffff;
          }
        }
      }

      &.active {
        :deep(svg path:first-child) {
          fill: #b9070a;
        }

        :deep(svg path:last-child) {
          fill: #ffffff;
        }
      }
    }

    &_cs {
      @media (any-hover: hover) {
        &:hover {
          :deep(svg path:nth-child(-n + 3)) {
            fill: #3b5fff;
          }

          :deep(svg path:nth-child(n + 4)) {
            fill: #ffffff;
          }
        }
      }

      &.active {
        :deep(svg path:nth-child(-n + 3)) {
          fill: #3b5fff;
        }

        :deep(svg path:nth-child(n + 4)) {
          fill: #ffffff;
        }
      }
    }
  }

  &__icon {
    width: 64px;
    height: 16px;

    :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
    }

    :deep(path) {
      transition: fill 0.3s ease;
    }
  }
}
</style>
