<template>
  <main class="account">
    <div class="account__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/profile-bg.jpg" alt="" />
    </div>

    <div class="account__inner _cnt-home">
      <div class="account__top top">
        <div class="top__title _h3">
          {{ $t('Profile') }}
        </div>
        <div class="top__body">
          <div class="top__decor top__decor_top-left _ibg-contain">
            <img src="@/assets/img/modal-decor.png" />
          </div>
          <div class="top__decor top__decor_top-right _ibg-contain">
            <img src="@/assets/img/modal-decor.png" />
          </div>
          <div class="top__decor top__decor_bottom-left _ibg-contain">
            <img src="@/assets/img/modal-decor.png" />
          </div>
          <div class="top__decor top__decor_bottom-right _ibg-contain">
            <img src="@/assets/img/modal-decor.png" />
          </div>
          <div class="top__content">
            <div class="top__inner">
              <div v-if="profileImage" class="top__avatar-wrapper">
                <div class="top__avatar _ibg-contain">
                  <img :src="profileImage" />
                </div>

                <button
                  type="button"
                  class="top__change"
                  @click="openAvatarModal"
                >
                  <SvgIcon :icon="AvatarChangeIcon" class="top__change-icon" />
                </button>
              </div>
            </div>
            <div class="top__info">
              <div data-da=".top__inner,991.98,last" class="top__block">
                <div v-if="nickname" class="top__name _h4">{{ nickname }}</div>
                <div v-if="email" class="top__email">{{ email }}</div>
              </div>
              <div class="top__list">
                <div class="top__column">
                  <div class="top__column-label">{{ $t('Level') }}</div>
                  <div class="top__column-value">
                    {{ userStore.user?.hero_level }}
                  </div>
                </div>
                <div class="top__column">
                  <div class="top__column-label">{{ $t('ELO') }}</div>
                  <div class="top__column-value">
                    {{ userStore.user?.rating }}
                  </div>
                </div>
                <div class="top__column">
                  <div class="top__column-label">{{ $t('Winrate') }}</div>
                  <div class="top__column-value">{{ winRate }}</div>
                </div>
                <div class="top__column">
                  <div class="top__column-label">{{ $t('Victories') }}</div>
                  <div class="top__column-value">
                    {{ userStore.user?.wins }}
                  </div>
                </div>
                <div class="top__column">
                  <div class="top__column-label">{{ $t('Defeats') }}</div>
                  <div class="top__column-value">
                    {{ userStore.user?.losses }}
                  </div>
                </div>
                <div class="top__column">
                  <div class="top__column-label">{{ $t('Cards owned') }}</div>
                  <div class="top__column-value">{{ cardsOwned }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="top__bottom">
            <div class="top__nav">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                class="top__nav-link"
                :class="{
                  active: activeTab === tab.id,
                }"
                :aria-selected="activeTab === tab.id"
                :tabindex="activeTab === tab.id ? 0 : -1"
                role="tab"
                @click="handleTabChange(tab.id)"
              >
                {{ tab.label }}
              </button>
            </div>
            <BaseButton
              type="button"
              class="top__logout"
              variant="hint-bordered"
              @click="logout"
            >
              <SvgIcon :icon="LogoutIcon" class="top__logout-icon" />

              <span>
                {{ $t('Log Out') }}
              </span>
            </BaseButton>
          </div>
        </div>
      </div>
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

          <!-- v-else-if="activeTab === 'offers' && offersEnabled" -->
          <MyOffers v-else-if="activeTab === 'offers' && offersEnabled" />

          <!-- v-else-if="activeTab === 'withdrawals' && offersEnabled" -->
          <Withdrawals
            v-else-if="activeTab === 'withdrawals' && offersEnabled"
          />
        </div>
      </div>
    </div>

    <AvatarPickerModal
      v-model="isAvatarModalOpen"
      @updated="handleAvatarUpdated"
    />
  </main>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import defaultAvatar from '@/assets/img/icons/avatar.png'
import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { AvatarChangeIcon, LogoutIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'
import { useToast } from '@/composables/useToast'
import OrderHistory from '@/pages/AccountPage/components/OrderHistory.vue'
import TransactionHistory from '@/pages/AccountPage/components/TransactionHistory.vue'
import { useAuthStore } from '@/stores/auth'
import { useHeroesStore } from '@/stores/heroes'
import { useNavigationStore } from '@/stores/navigation'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

import AvatarPickerModal from './components/AvatarPickerModal.vue'
import MyOffers from './components/MyOffers.vue'
import MyWallet from './components/MyWallet.vue'
import ProfileInfo from './components/ProfileInfo.vue'
import Withdrawals from './components/Withdrawals.vue'

import { destroyDynamicAdapt, initDynamicAdapt } from '@/utils/dynamic_adapt.js'

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

const ProfileIcon = `
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="8"
      r="4"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path
      d="M4.5 20C5.35 16.4 8.15 14 12 14C15.85 14 18.65 16.4 19.5 20"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
`

const selectedHeroId = computed(() => {
  return userStore.user?.selected_hero_id ?? null
})

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

  /*
   * image_plain is the primary hero portrait.
   * Other properties are fallbacks in case the API differs.
   */
  return hero.image_plain || hero.image || hero.avatar || hero.portrait || ''
})

const profileImage = computed(() => {
  /*
   * First priority: selected user avatar from API.
   */
  if (userAvatarUrl.value) {
    return userAvatarUrl.value
  }

  /*
   * Second priority: selected hero.
   */
  if (selectedHeroImage.value) {
    return selectedHeroImage.value
  }

  /*
   * Final fallback: local default avatar.
   */
  return defaultAvatar
})

const nickname = computed(() => {
  return userStore.user?.nickname || ''
})

const email = computed(() => {
  return userStore.user?.email || ''
})

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

  if (tab === 'settings') {
    return 'personal'
  }

  return tab
})

const activeTab = computed(() => {
  const tabExists = tabs.value.some(tab => {
    return tab.id === routeTab.value
  })

  return tabExists ? routeTab.value : 'personal'
})

const winRate = computed(() => {
  const victories = Number(userStore.user?.wins || 0)

  const totalGames = Number(userStore.user?.total_games || 0)

  if (!totalGames) {
    return '0%'
  }

  return `${Math.round((victories / totalGames) * 100)}%`
})

const cardsOwned = computed(() => {
  const owned = myProducts.value?.length || 0

  const total = settingsStore.settings?.cards_total || 0

  return `${owned} / ${total}`
})

const profileStatistics = computed(() => {
  return [
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
  ]
})

const ensureSelectedHeroLoaded = async () => {
  /*
   * No selected hero means that the default avatar
   * should be used. There is nothing to fetch.
   */
  if (!selectedHeroId.value) {
    return
  }

  /*
   * Heroes are already available, so do not fetch.
   */
  if (heroesStore.heroes.length > 0) {
    return
  }

  try {
    await heroesStore.ensureHeroes()
  } catch (error) {
    /*
     * Hero loading should not break the profile page.
     * profileImage automatically falls back to avatar.
     */
    console.error('Failed to load selected hero:', error)
  }
}

const openAvatarModal = () => {
  isAvatarModalOpen.value = true
}

const handleAvatarUpdated = async () => {
  /*
   * updateAvatar() already refreshes the profile,
   * but this keeps the page synchronized if the
   * modal implementation changes later.
   */
  await userStore.fetchProfile()
}

const handleTabChange = async tab => {
  const routeName = `account-${tab}`

  if (route.name === routeName) {
    closeProfileSidebar()
    return
  }

  await router.push({
    name: routeName,
  })

  closeProfileSidebar()
}

const closeProfileSidebar = () => {
  navigationStore.closeProfile()
}

const toggleProfileSidebar = () => {
  if (!isProfileMobile.value) {
    return
  }

  navigationStore.toggleProfile()
}

const handleProfileUpdated = async updatedUser => {
  if (updatedUser && !userStore.user) {
    userStore.user = updatedUser
  }

  await ensureSelectedHeroLoaded()
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
  if (event.key === 'Escape') {
    if (isAvatarModalOpen.value) {
      isAvatarModalOpen.value = false
      return
    }

    navigationStore.closeAllDrawers()
  }
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
  if (!enabled && ['offers', 'withdrawals'].includes(activeTab.value)) {
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

const refreshDynamicAdapt = async () => {
  await nextTick()
  initDynamicAdapt('max')
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)

  isPageLoading.value = true

  const results = await Promise.allSettled([
    userStore.fetchProfile(),
    fetchMyProducts(),
    refreshDynamicAdapt(),
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

  isPageLoading.value = false
})

onBeforeUnmount(() => {
  destroyDynamicAdapt()
  window.removeEventListener('keydown', handleKeydown)

  isAvatarModalOpen.value = false

  closeProfileSidebar()
})
</script>

<style lang="scss" scoped>
.account {
  @include adaptiveValue('padding-top', 100, 75);
  @include adaptiveValue('padding-bottom', 46, 25);
  position: relative;

  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }

  &__inner {
    position: relative;
    z-index: 1;

    display: flex;
    flex: 1 1 100%;
    flex-direction: column;

    width: 100%;
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 37, 15);
    }
    @media (max-width: $md5) {
      margin-right: -10px;
      margin-left: -10px;
    }
  }

  &__content {
    display: flex;
    flex: 1 1 100%;
    flex-direction: column;
  }

  &__loader {
    margin: auto;
  }

  &__body {
  }
}

.top {
  &__title {
    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__body {
    position: relative;
  }

  &__content {
    @include adaptiveValue('padding-top', 24, 10);
    @include adaptiveValue('padding-bottom', 24, 10);
    @include adaptiveValue('padding-left', 28, 10);
    @include adaptiveValue('padding-right', 28, 10);
    @include adaptiveValue('gap', 29, 10);
    display: flex;
    flex-wrap: wrap;

    border: 1px solid var(--border-sixth-color);
    background-color: var(--bg-fifth-color);
  }

  &__decor {
    @include adaptiveValue('min-width', 58, 38);
    @include adaptiveValue('height', 48, 38);
    position: absolute;
    z-index: 1;
    &_top-left {
      @include adaptiveValue('left', -6, -8);
      top: -6px;

      transform: rotate(-90deg);
    }

    &_top-right {
      @include adaptiveValue('right', -6, -8);
      top: -6px;
    }

    &_bottom-left {
      @include adaptiveValue('left', -6, -8);
      bottom: -6px;

      transform: rotate(-180deg);
    }

    &_bottom-right {
      @include adaptiveValue('right', -6, -8);
      bottom: -6px;

      transform: rotate(90deg);
    }
  }
  &__inner {
    @media (max-width: $md3) {
      display: flex;
      align-items: center;
      gap: 20px;

      width: 100%;
    }
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }
  &__avatar-wrapper {
    @include adaptiveValue('min-width', 102, 82);
    @include adaptiveValue('max-width', 102, 82);
    @include adaptiveValue('height', 102, 82);
    position: relative;

    width: fit-content;

    border-radius: 50%;
    background-image: url('../../assets/img/avatar-frame-big.png');
    background-repeat: no-repeat;
    background-size: contain;
  }

  &__avatar {
    @include adaptiveValue('min-width', 76, 56);
    @include adaptiveValue('min-height', 76, 56);
    position: absolute;
    top: 50%;
    left: 50%;
    overflow: hidden;

    border-radius: 50%;

    transform: translate(-50%, -50%);
  }

  &__change {
    position: absolute;
    right: 0;
    bottom: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 40px;
    height: 40px;

    border: 1px solid var(--border-sixth-color);
    border-radius: 50%;
    background-color: var(--bg-primary-color);

    color: var(--hint-secondary-color);

    transition: all 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-gradient-color);

        color: var(--primary-color);
      }
    }
    &-icon {
      min-width: 24px;
      height: 24px;
    }
  }

  &__info {
    position: relative;

    display: flex;
    flex: 1 1 auto;
    align-self: center;
    column-gap: 20px;
    @media (min-width: $md3) {
      &::before {
        position: absolute;
        top: 50%;
        left: 0;

        width: 100%;
        height: 1px;

        background-color: var(--border-sixth-color);

        content: '';

        transform: translate(0px, -50%);
      }
    }
    @media (max-width: $md3) {
      flex: 1 1 100%;
      flex-wrap: wrap;
      row-gap: 15px;
    }
  }
  &__block {
    overflow: hidden;

    min-width: 0;
    @media (min-width: $md3) {
      flex: 0 1 20%;
    }
    @media (max-width: $md3) {
      flex: 1 1 auto;
    }
  }
  &__name {
    overflow: hidden;

    text-overflow: ellipsis;
    white-space: nowrap;
    @media (min-width: $md3) {
      flex: 0 1 20%;

      min-width: 20%;

      margin-bottom: 8px;
      padding-bottom: 9px;
    }
    @media (max-width: $md3) {
      padding-bottom: 8px;
    }
  }
  &__email {
    overflow: hidden;

    color: var(--hint-sixth-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 17px;
    text-overflow: ellipsis;
    white-space: nowrap;
    @media (min-width: $md3) {
      flex: 0 1 20%;

      min-width: 20%;
    }
    @media (max-width: $md3) {
      min-width: 0;
    }
  }
  &__list {
    display: flex;
    flex: 0 1 80%;
    align-self: center;
    gap: 20px;
    @media (max-width: $md3) {
      flex: 1 1 100%;
      gap: 0px;
    }
    @media (max-width: $md5) {
      flex-wrap: wrap;
      row-gap: 20px;
    }
  }
  &__column {
    flex: 0 1 20%;
    @media (max-width: $md3) {
      position: relative;

      padding-right: 20px;
      &::before {
        position: absolute;
        top: 50%;
        left: 0;

        width: 100%;
        height: 1px;

        background-color: var(--border-sixth-color);

        content: '';

        transform: translate(0px, -50%);
      }
    }
    @media (max-width: $md5) {
      flex: 0 1 50%;
    }

    &-label {
      padding-bottom: 11px;

      color: var(--hint-third-color);
      font-size: 12px;
      font-weight: 500;
      line-height: 15px;
    }

    &-value {
      padding-top: 11px;

      font-size: 14px;
      font-weight: 500;
      line-height: 17px;
    }
  }

  &__bottom {
    display: flex;
    align-items: center;
    gap: 20px;

    background-color: var(--bg-primary-color);
    @media (min-width: $md5) {
      @include adaptiveValue('padding-right', 50, 0);
      @include adaptiveValue('padding-left', 50, 0);
    }
    @media (max-width: $md5) {
      flex-wrap: wrap;
      gap: 0px;

      padding: 0px 10px 20px;
    }
  }

  &__nav {
    @include adaptiveValue('gap', 16, 0);
    display: flex;
    flex-wrap: wrap;

    margin: 0 auto;
    @media (max-width: $md5) {
      gap: 0px;
    }
    &-link {
      @include adaptiveValue('min-height', 65, 40);

      @include adaptiveValue('padding-left', 16, 10);
      @include adaptiveValue('padding-right', 16, 10);
      padding-top: 8px;
      padding-bottom: 8px;

      border-bottom: 2px solid transparent;

      color: var(--secondary-color);
      font-size: 16px;
      font-weight: 500;
      line-height: 120%;
      text-transform: uppercase;

      transition: all 0.3s ease 0s;
      &.active {
        border-color: var(--hint-primary-color);

        color: var(--primary-color);

        pointer-events: none;
      }
      @media (any-hover: hover) {
        &:hover {
          color: var(--primary-color);
        }
      }
      @media (max-width: $md5) {
        flex: 0 1 50%;
      }
      @media (max-width: $md8) {
        flex: 1 1 100%;
      }
    }
  }

  &__logout {
    align-items: center;

    max-width: 152px;
    height: fit-content;
    @media (max-width: $md5) {
      max-width: 50%;
    }
    @media (max-width: $md8) {
      max-width: 100%;
    }
    &-icon {
      min-width: 24px;
      height: 24px;

      color: var(--hint-secondary-color);
    }
  }
}
</style>
