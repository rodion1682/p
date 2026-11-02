<template>
  <div class="profile">
    <div class="profile__inner _cnt-home">
      <div class="profile__bg _ibg">
        <img src="@/assets/img/profile-bg.png" />
      </div>
      <template v-if="route.name === 'account-balance'">
        <div class="profile__item">
          <div class="profile__title _h3">
            {{ $t('MY Profile') }}
          </div>
          <div class="profile__content profile__content_balance">
            <div class="profile__balance">
              <MyBalance />
            </div>
            <div class="profile__info">
              <div class="profile__meta">
                <div v-if="name" class="profile__name">{{ name }}</div>
                <div v-if="steamID" class="profile__id">
                  <span>{{ $t('Steame ID:') }}</span>
                  <div class="profile__id-value">{{ steamID }}</div>
                </div>
              </div>
              <BaseButton
                variant="bordered"
                class="profile__logout"
                @click="handleLogout"
              >
                <span>{{ $t('Log out') }}</span>

                <SvgIcon :icon="LogoutIcon" class="profile__logout-icon" />
              </BaseButton>
            </div>
          </div>
        </div>
        <div class="profile__item">
          <div class="profile__title _h3">
            {{ $t('Purchase history') }}
          </div>
          <div class="profile__content">
            <OrderHistory />
          </div>
        </div>
        <div class="profile__item">
          <div class="profile__title _h3">
            {{ $t('Payment history') }}
          </div>
          <div class="profile__content">
            <PaymentHistory />
          </div>
        </div>
      </template>
      <template
        v-if="route.name === 'account-offers' && settingsStore.payoutEnabled"
      >
        <div class="profile__item">
          <div class="profile__title _h3">
            {{ $t('Sell Item') }}
          </div>
          <div class="profile__content profile__content_balance">
            <BaseButton
              variant="bordered"
              class="profile__create"
              @click="openSellSkinModal"
            >
              <SvgIcon :icon="PlusIcon" class="profile__create-icon" />
              <span>{{ $t('Create new offer') }}</span></BaseButton
            >
            <div class="profile__balance">
              <MyWithdraw />
            </div>
          </div>
        </div>
        <div class="profile__item">
          <div class="profile__title _h3">
            {{ $t('Sell Offers') }}
          </div>
          <div class="profile__content">
            <MyOffers />
          </div>
        </div>
      </template>

      <template
        v-if="
          route.name === 'account-offers' &&
          settingsStore.payoutEnabled &&
          false
        "
      >
        <MyOffers />
        <MyWithdraw v-if="false" />
      </template>
    </div>
  </div>

  <SellSkinsModal
    v-if="isSellSkinModalOpen"
    v-model="isSellSkinModalOpen"
    @close="closeSellSkinModal"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import { LogoutIcon, PlusIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import SellSkinsModal from '@/components/modals/sellSkins/SellSkinModal/SellSkinsModal.vue'

import MyBalance from '@/pages/AccountPage/components/MyBalance.vue'
import MyWithdraw from '@/pages/AccountPage/components/MyWithdraw.vue'
import MyOffers from '@/pages/AccountPage/tabs/MyOffers.vue'
import OrderHistory from '@/pages/AccountPage/tabs/OrderHistory.vue'
import PaymentHistory from '@/pages/AccountPage/tabs/PaymentHistory.vue'

import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const toast = useToast()
const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const { name, steamID, avatar } = storeToRefs(userStore)

const isSellSkinModalOpen = ref(false)

const openSellSkinModal = () => {
  isSellSkinModalOpen.value = true
}

const closeSellSkinModal = () => {
  isSellSkinModalOpen.value = false
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push({ name: 'HomePage' })
  } catch (error) {
    console.error(error)
    toast.error(t('Failed to logout'))
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated && !userStore.user) {
    try {
      await userStore.fetchProfile()
    } catch (error) {
      console.error(error)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile {
  @include adaptiveValue('padding-top', 125, 75);
  @include adaptiveValue('margin-top', -78, -50, 1430, 992, 1);
  @include adaptiveValue('padding-bottom', 90, 25);
  position: relative;
  &__inner {
    position: relative;
  }
  &__bg {
    position: absolute;
    width: 100%;
    height: 30%;
    top: 0;
    left: 0;
    @include adaptiveValue('border-radius', 30, 6);
  }

  &__item {
    position: relative;
    z-index: 1;
    @media (min-width: $md3) {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 120, 25);
      }
    }
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 50px;
      }
    }
  }

  &__title {
    @media (min-width: $md3) {
      width: fit-content;
      min-width: 200px;
    }
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }

  &__content {
    @media (min-width: $md3) {
      flex: 1 1 auto;
      max-width: 778px;
      margin-left: auto;
    }
    @media (min-width: $md4) {
      &_balance {
        display: flex;
        gap: 20px;
        justify-content: space-between;
      }
    }
  }
  &__create {
    align-self: flex-end;
    max-width: 317px;
    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 25px;
      }
    }
    &-icon {
      min-width: 14px;
      height: 14px;
      color: var(--hint-primary-color);
    }
  }
  &__balance {
    flex: 1 1 auto;
    @media (min-width: $md4) {
      flex: 1 1 auto;
      max-width: 317px;
    }
    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 25px;
      }
    }
  }

  &__info {
    @media (min-width: $md4) {
      flex: 1 1 auto;
      max-width: 250px;
    }
  }

  &__meta {
    line-height: 24px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__name {
    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }

  &__id {
    display: flex;
    align-items: center;
    font-size: 12px;
    line-height: 12px;
    gap: 15px;
    &-value {
      font-weight: 700;
    }
  }

  &__logout {
    max-width: 109px;
    font-size: 14px;
    font-weight: 700;
    font-family: var(--font-condensed) !important;
    min-height: 36px !important;
    &-icon {
      min-width: 14px;
      height: 14px;
    }
  }
}
</style>
