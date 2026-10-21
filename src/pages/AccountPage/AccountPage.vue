<script setup>
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import defaultAvatar from '@/assets/img/icons/avatar.png'
import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import {
  AvatarChangeIcon,
  CloseIcon,
  LogoutDropdownIcon,
} from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useHeroesStore } from '@/stores/heroes'
import { useNavigationStore } from '@/stores/navigation'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

import AvatarPickerModal from './components/AvatarPickerModal.vue'
import MyOffers from './components/MyOffers.vue'
import MyWallet from './components/MyWallet.vue'
import OrderHistory from './components/OrderHistory.vue'
import ProfileInfo from './components/ProfileInfo.vue'
import TransactionHistory from './components/TransactionHistory.vue'
import Withdrawals from './components/Withdrawals.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const toast = useToast()

const authStore = useAuthStore()
const heroesStore = useHeroesStore()
const navigationStore = useNavigationStore()
const settingsStore = useSettingsStore()
const topupStore = useTopUpStore()
const userStore = useUserStore()

const { myProducts, fetchMyProducts } = useProductList()
const { isProfileOpen } = storeToRefs(navigationStore)
const { userAvatarUrl } = storeToRefs(userStore)

const isProfileMobile = useMediaQuery('(max-width: 991.98px)')

const isPageLoading = ref(false)
const isAvatarModalOpen = ref(false)

const selectedHeroId = computed(() => userStore.user?.selected_hero_id ?? null)

const selectedHero = computed(() => {
  if (!selectedHeroId.value) {
    return null
  }

  return heroesStore.getHeroById(selectedHeroId.value)
})

const selectedHeroImage = computed(() => {
  const hero = selectedHero.value

  if (!hero) {
    return ''
  }

  return hero.image_plain || hero.image || hero.avatar || hero.portrait || ''
})

const profileImage = computed(() => {
  return userAvatarUrl.value || selectedHeroImage.value || defaultAvatar
})

const nickname = computed(() => userStore.user?.nickname || '')

const email = computed(() => userStore.user?.email || '')

const offersEnabled = computed(() => {
  return Boolean(settingsStore.settings?.payouts?.offer_enabled)
})

const tabs = computed(() => {
  const accountTabs = [
    {
      id: 'personal',
      label: t('Personal Data'),
    },
    {
      id: 'wallet',
      label: t('My Balance'),
    },
    {
      id: 'orders',
      label: t('Order History'),
    },
    {
      id: 'transactions',
      label: t('Transaction History'),
    },
  ]

  if (offersEnabled.value) {
    accountTabs.push(
      {
        id: 'offers',
        label: t('Offers'),
      },
      {
        id: 'withdrawals',
        label: t('Withdrawals'),
      },
    )
  }

  return accountTabs
})

const routeTab = computed(() => {
  if (
    !route.name ||
    typeof route.name !== 'string' ||
    !route.name.startsWith('account-')
  ) {
    return 'personal'
  }

  const tab = route.name.replace('account-', '')

  return tab === 'settings' ? 'personal' : tab
})

const activeTab = computed(() => {
  const exists = tabs.value.some(tab => tab.id === routeTab.value)

  return exists ? routeTab.value : 'personal'
})

const winRate = computed(() => {
  const wins = Number(userStore.user?.wins || 0)
  const totalGames = Number(userStore.user?.total_games || 0)

  if (!totalGames) {
    return '0%'
  }

  return `${Math.round((wins / totalGames) * 100)}%`
})

const cardsOwned = computed(() => {
  const owned = myProducts.value?.length || 0
  const total = settingsStore.settings?.cards_total || 0

  return `${owned} / ${total}`
})

const profileStatistics = computed(() => [
  {
    label: t('Level'),
    value: userStore.user?.hero_level ?? '—',
  },
  {
    label: t('ELO'),
    value: userStore.user?.rating ?? '—',
  },
  {
    label: t('Winrate'),
    value: winRate.value,
  },
  {
    label: t('Victories'),
    value: userStore.user?.wins ?? 0,
  },
  {
    label: t('Defeats'),
    value: userStore.user?.losses ?? 0,
  },
  {
    label: t('Cards owned'),
    value: cardsOwned.value,
  },
])

const ensureSelectedHeroLoaded = async () => {
  if (!selectedHeroId.value || heroesStore.heroes.length > 0) {
    return
  }

  try {
    await heroesStore.ensureHeroes()
  } catch (error) {
    console.error('Failed to load selected hero:', error)
  }
}

const openAvatarModal = () => {
  navigationStore.closeProfile()
  isAvatarModalOpen.value = true
}

const handleAvatarUpdated = async () => {
  await userStore.fetchProfile()
  await ensureSelectedHeroLoaded()
}

const handleProfileUpdated = async updatedUser => {
  if (updatedUser && !userStore.user) {
    userStore.user = updatedUser
  }

  await ensureSelectedHeroLoaded()
}

const openProfileSidebar = () => {
  if (isProfileMobile.value) {
    navigationStore.openProfile()
  }
}

const closeProfileSidebar = () => {
  navigationStore.closeProfile()
}

const handleTabChange = async tab => {
  const routeName = `account-${tab}`

  closeProfileSidebar()

  if (route.name === routeName) {
    return
  }

  await router.push({
    name: routeName,
  })
}

const logout = async () => {
  isAvatarModalOpen.value = false

  navigationStore.closeAllDrawers()

  await authStore.logout()

  await router.push({
    name: 'HomePage',
  })
}

const handleKeydown = event => {
  if (event.key !== 'Escape') {
    return
  }

  if (isAvatarModalOpen.value) {
    isAvatarModalOpen.value = false
    return
  }

  closeProfileSidebar()
}

watch(
  activeTab,
  (newTab, previousTab) => {
    if (newTab === 'transactions') {
      if (userStore.user) {
        topupStore.prefillCheckoutFormData(userStore.user)
      } else {
        topupStore.resetCheckoutFormData()
      }

      return
    }

    if (previousTab === 'transactions') {
      topupStore.resetCheckoutFormData()
    }
  },
  {
    immediate: true,
  },
)

watch(offersEnabled, enabled => {
  if (!enabled && ['offers', 'withdrawals'].includes(routeTab.value)) {
    router.replace({
      name: 'account-personal',
    })
  }
})

watch(isProfileMobile, isMobile => {
  if (!isMobile) {
    closeProfileSidebar()
  }
})

watch(
  () => route.path,
  () => {
    closeProfileSidebar()
  },
)

watch(selectedHeroId, async (heroId, previousHeroId) => {
  if (heroId && String(heroId) !== String(previousHeroId)) {
    await ensureSelectedHeroLoaded()
  }
})

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)

  isPageLoading.value = true

  try {
    const results = await Promise.allSettled([
      userStore.fetchProfile(),
      fetchMyProducts(),
    ])

    const profileResult = results[0]
    const productsResult = results[1]

    if (profileResult.status === 'rejected') {
      console.error('Failed to load profile:', profileResult.reason)

      toast.error(t('Failed to load profile data'))
    }

    if (productsResult.status === 'rejected') {
      console.error('Failed to load owned cards:', productsResult.reason)
    }

    if (profileResult.status === 'fulfilled') {
      await userStore.initializeAvatar()
    }

    await ensureSelectedHeroLoaded()
  } finally {
    isPageLoading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)

  isAvatarModalOpen.value = false
  closeProfileSidebar()
})
</script>

<template>
  <main class="account">
    <div class="account__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.png" alt="" />
    </div>

    <div class="account__container _cnt-home">
      <div class="account__heading">
        <h1 class="account__title _h3">
          {{ $t('Profile') }}
        </h1>

        <button
          type="button"
          class="account__profile-toggle"
          :aria-expanded="isProfileOpen"
          aria-controls="account-profile-sidebar"
          @click="openProfileSidebar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="8"
              r="3.5"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M5 20C5.8 16.5 8.3 15 12 15C15.7 15 18.2 16.5 19 20"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>

          <span>{{ $t('Profile Info') }}</span>

          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="account__layout">
        <div
          v-if="isProfileMobile && isProfileOpen"
          class="account__overlay"
          aria-hidden="true"
          @click="closeProfileSidebar"
        />

        <aside
          id="account-profile-sidebar"
          class="account__sidebar"
          :class="{
            account__sidebar_open: isProfileOpen,
          }"
          :aria-label="$t('Profile Info')"
          :inert="isProfileMobile && !isProfileOpen"
        >
          <div class="account__sidebar-inner">
            <div class="account__sidebar-top">
              <h2 class="account__sidebar-heading">
                {{ $t('Profile Info') }}
              </h2>

              <button
                type="button"
                class="account__sidebar-close"
                :aria-label="$t('Close')"
                @click="closeProfileSidebar"
              >
                <SvgIcon
                  :icon="CloseIcon"
                  class="account__sidebar-close-icon"
                />
              </button>
            </div>

            <div class="account__profile">
              <div class="account__avatar-wrapper">
                <div class="account__avatar _ibg-contain">
                  <img :src="profileImage" :alt="nickname || $t('Profile')" />
                </div>

                <button
                  type="button"
                  class="account__avatar-change"
                  :aria-label="$t('Change Avatar')"
                  @click="openAvatarModal"
                >
                  <SvgIcon
                    :icon="AvatarChangeIcon"
                    class="account__avatar-change-icon"
                  />
                </button>
              </div>

              <div class="account__identity">
                <div v-if="nickname" class="account__name _h6">
                  {{ nickname }}
                </div>

                <p v-if="email" class="account__email">
                  {{ email }}
                </p>
              </div>

              <div class="account__profile-divider">
                <div class="account__profile-divider-image _ibg-contain">
                  <img src="@/assets/img/profile-decor.png" />
                </div>
              </div>

              <div class="account__statistics">
                <div
                  v-for="stat in profileStatistics"
                  :key="stat.label"
                  class="account__stat"
                >
                  <span class="account__stat-label"> {{ stat.label }}: </span>

                  <span class="account__stat-value">
                    {{ stat.value }}
                  </span>
                </div>
              </div>

              <BaseButton
                type="button"
                class="account__logout"
                variant="bordered"
                @click="logout"
              >
                <SvgIcon
                  :icon="LogoutDropdownIcon"
                  class="account__logout-icon"
                />

                <span>{{ $t('Log Out') }}</span>
              </BaseButton>
            </div>
          </div>
        </aside>

        <div class="account__main">
          <nav class="account__tabs" :aria-label="$t('Profile')">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="account__tab"
              :class="{
                account__tab_active: activeTab === tab.id,
              }"
              :aria-current="activeTab === tab.id ? 'page' : undefined"
              @click="handleTabChange(tab.id)"
            >
              {{ tab.label }}
            </button>
          </nav>

          <div class="account__content">
            <LoadingSpinner v-if="isPageLoading" class="account__loader" />

            <div v-else class="account__body">
              <ProfileInfo
                v-if="activeTab === 'personal'"
                @profile-updated="handleProfileUpdated"
              />

              <MyWallet v-else-if="activeTab === 'wallet'" />

              <OrderHistory v-else-if="activeTab === 'orders'" />

              <TransactionHistory v-else-if="activeTab === 'transactions'" />

              <MyOffers v-else-if="activeTab === 'offers' && offersEnabled" />

              <Withdrawals
                v-else-if="activeTab === 'withdrawals' && offersEnabled"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <AvatarPickerModal
      v-model="isAvatarModalOpen"
      @updated="handleAvatarUpdated"
    />
  </main>
</template>

<style lang="scss" scoped>
.account {
  @include adaptiveValue('padding-top', 116, 80);
  @include adaptiveValue('padding-bottom', 44, 30);

  position: relative;

  display: flex;
  overflow: hidden;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }

  &__container {
    position: relative;
    z-index: 1;

    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-width: 0;
    max-width: 1400px;

    margin: 0 auto;
  }

  &__heading {
    @include adaptiveValue('--padding-left', 320, 220, 1870, 992, 1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    padding-left: var(--padding-left);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__title {
    @include adaptiveValue('font-size', 30, 24);

    margin: 0;

    color: #f4d8c5;
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 1.2;
  }

  &__profile-toggle {
    display: none;
  }

  &__layout {
    @include adaptiveValue('gap', 40, 20, 1870, 992, 1);
    @include adaptiveValue('--sidebar-width', 280, 200, 1870, 992, 1);

    display: grid;
    align-items: start;
    grid-template-columns: var(--sidebar-width) minmax(0, 1fr);

    width: 100%;
    min-width: 0;
  }

  &__sidebar {
    position: relative;

    width: 100%;
    min-width: 0;

    margin-top: -76px;
  }

  &__sidebar-inner {
    width: 100%;
  }

  &__sidebar-top {
    display: none;
  }

  &__profile {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
    min-width: 0;
  }

  &__avatar-wrapper {
    position: relative;

    flex: 0 0 auto;

    width: 100%;
    aspect-ratio: 1 / 1;

    background-image: url('@/assets/img/avatar-frame-big.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }

  &__avatar {
    position: absolute;
    top: 50%;
    left: 50%;

    overflow: hidden;

    width: 72%;
    height: 72%;

    border-radius: 12px;

    transform: translate(-50%, -50%);

    img {
      width: 100%;
      height: 100%;

      object-fit: cover;
    }
  }

  &__avatar-change {
    @include adaptiveValue('width', 46, 40);
    @include adaptiveValue('height', 46, 40);
    @include adaptiveValue('bottom', -17, -10);
    position: absolute;
    right: 50%;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid var(--border-fourth-color);
    border-radius: 6px;
    background-color: var(--bg-fourth-color);

    color: var(--seventh-color);

    transform: translateX(50%);
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-secondary-color);
        background-color: var(--third-color);

        color: var(--primary-color);
      }
    }
  }

  &__avatar-change-icon {
    width: 22px;
    height: 22px;
  }

  &__identity {
    @include adaptiveValue('margin-top', 24, 28);
    width: 100%;
    min-width: 0;
    max-width: 240px;

    margin-right: auto;
    margin-left: auto;

    text-align: center;
  }

  &__name {
    overflow: hidden;

    font-weight: 500;
    line-height: 120%;
    text-overflow: ellipsis;

    text-wrap: nowrap;
  }

  &__email {
    @include adaptiveValue('margin-top', 16, 15);
    overflow: hidden;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 17px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__profile-divider {
    @include adaptiveValue('margin-top', 24, 18);
    @include adaptiveValue('margin-bottom', 24, 18);
    position: relative;

    display: flex;
    display: flex;
    align-items: center;
    align-items: center;
    justify-content: center;
    justify-content: center;

    width: 100%;
    max-width: 240px;

    margin-right: auto;
    margin-left: auto;
    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 1;
      z-index: -1;

      width: 100%;
      height: 1px;

      background-color: var(--border-priamry-color);

      content: '';

      transform: translate(-50%, -50%);
    }
  }
  &__profile-divider-image {
    width: 132px;
    height: 32px;
  }

  &__statistics {
    @include adaptiveValue('gap', 24, 18);
    display: flex;
    flex-direction: column;

    width: 100%;
    max-width: 240px;
  }

  &__stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    width: 100%;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 17px;
  }

  &__stat-label {
    color: var(--seventh-color);
  }

  &__stat-value {
    color: var(--primary-color);
    text-align: right;
  }

  &__logout {
    @include adaptiveValue('margin-top', 46, 20);
    width: 100%;
    max-width: 240px;

    margin-right: auto;
    margin-left: auto;
  }

  &__logout-icon {
    width: 24px;
    height: 24px;

    color: var(--secondary-color);
  }

  &__main {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__tabs {
    @include adaptiveValue('--tabs-padding-left', 344, 232, 1870, 992, 1);

    @include adaptiveValue('padding-top', 16, 10);
    @include adaptiveValue('padding-bottom', 16, 10);
    @include adaptiveValue('padding-right', 24, 10);
    @include adaptiveValue('--tabs-extra-width', 344, 232, 1870, 992, 1);

    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;

    width: calc(100% + var(--tabs-extra-width));
    min-width: 0;

    margin-left: calc(-1 * var(--tabs-extra-width));
    padding-left: var(--tabs-padding-left);

    border: 1px solid var(--border-fourth-color);
    border-radius: 12px;
    background: var(--bg-nineth-color);

    @media (max-width: $md3) {
      width: 100%;

      margin-left: 0;
      padding-right: 10px;
      padding-left: 10px;
    }
  }

  &__tab {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 40px;

    padding: 8px 10px;

    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
    text-align: center;
    text-transform: uppercase;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease;

    &_active {
      border-color: var(--border-fourth-color);
      background-color: var(--bg-third-color);

      color: var(--secondary-color);
    }

    @media (any-hover: hover) {
      &:not(&_active):hover {
        border-color: var(--border-fourth-color);
        background-color: var(--bg-third-color);

        color: var(--secondary-color);
      }
    }
  }

  &__content {
    @include adaptiveValue('padding-top', 46, 24);

    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__loader {
    margin: 50px auto;
  }

  &__body {
    width: 100%;
    min-width: 0;
  }

  &__overlay {
    display: none;
  }

  &__sidebar-close {
    display: none;
  }

  @media (max-width: $md3) {
    &__heading {
      padding-left: 0;
    }

    &__layout {
      display: block;
    }

    &__profile-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      min-height: 40px;

      padding: 8px 14px;

      border: 1px solid var(--border-secondary-color);
      border-radius: 6px;
      background: rgb(48 43 91 / 70%);

      color: #f4d8c5;
      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 500;

      transition:
        background-color 0.3s ease,
        border-color 0.3s ease;

      svg {
        flex: 0 0 auto;
      }

      @media (any-hover: hover) {
        &:hover {
          border-color: var(--hint-secondary-color);
          background: var(--bg-fifth-color);
        }
      }
    }

    &__overlay {
      position: fixed;
      inset: 0;
      z-index: 100;

      display: block;

      background: rgb(8 6 28 / 75%);
    }

    &__sidebar {
      position: fixed;
      top: 50px;
      bottom: 0;
      left: 0;
      z-index: 101;

      visibility: hidden;
      overflow-x: hidden;
      overflow-y: auto;

      width: min(340px, 90vw);
      height: calc(100dvh - 50px);

      margin-top: 0;
      padding: 30px 10px 30px;

      border-right: 1px solid var(--border-secondary-color);
      background-color: var(--bg-fourth-color);

      transform: translateX(-105%);
      transition:
        transform 0.3s ease,
        visibility 0.3s ease;

      &_open {
        visibility: visible;

        transform: translateX(0);
      }
    }

    &__sidebar-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      margin-bottom: 18px;
    }

    &__sidebar-heading {
      margin: 0;

      color: #f4d8c5;
      font-family: var(--font-texturina);
      font-size: 22px;
      font-weight: 500;
    }

    &__sidebar-close {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 34px;
      height: 34px;

      border: 1px solid var(--border-fourth-color);
      border-radius: 5px;
      background: rgb(48 43 91 / 48%);

      color: var(--secondary-color);

      transition:
        color 0.3s ease,
        border-color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          border-color: var(--border-secondary-color);

          color: var(--primary-color);
        }
      }
    }

    &__sidebar-close-icon {
      width: 22px;
      height: 22px;
    }

    &__avatar-wrapper {
      width: 200px;
      height: 200px;
    }

    &__main {
      width: 100%;
    }

    &__body {
      :deep(.profile-info__form) {
        padding: 28px 24px;
      }
    }
  }

  @media (max-width: $md4) {
    &__decoration {
      height: 25px;

      margin-bottom: 20px;

      img {
        max-height: 36px;
      }
    }

    &__heading {
      margin-bottom: 18px;
    }

    &__tabs {
      gap: 6px;

      padding: 10px;
    }

    &__tab {
      flex: 1 1 calc(50% - 6px);

      min-width: 0;

      padding: 8px;

      font-size: 11px;
    }

    &__body {
      :deep(.profile-info) {
        gap: 24px;
        grid-template-columns: 1fr;
      }

      :deep(.profile-info__form) {
        min-height: 0;

        padding: 24px 20px;
      }
    }
  }

  @media (max-width: $md6) {
    &__profile-toggle {
      gap: 7px;

      padding: 8px 10px;

      font-size: 11px;
    }

    &__sidebar {
      width: min(320px, 92vw);

      padding-right: 16px;
      padding-left: 16px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__sidebar {
      transition: none;
    }
  }
}
</style>
