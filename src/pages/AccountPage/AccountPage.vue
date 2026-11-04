<template>
  <main class="profile">
    <div class="profile__background _ibg" aria-hidden="true">
      <img src="@/assets/img/products-bg.png" alt="" />
    </div>

    <div class="profile__inner _cnt-home">
      <h1 class="profile__title _h2">
        {{ isOffersPage ? $t('Sell Items') : $t('Profile') }}
      </h1>

      <template v-if="isBalancePage">
        <div class="profile__overview">
          <section class="profile__account">
            <div class="profile__avatar">
              <img
                v-if="avatar"
                :src="avatar"
                :alt="name || 'Profile'"
                class="profile__avatar-image"
              />

              <SvgIcon v-else :icon="UserIcon" class="profile__avatar-icon" />
            </div>

            <div class="profile__identity">
              <div class="profile__identity-row">
                <span class="profile__label">
                  {{ $t('Username:') }}
                </span>

                <span class="profile__value">
                  {{ name || '—' }}
                </span>
              </div>

              <div class="profile__identity-row">
                <span class="profile__label">
                  {{ $t('Steam ID:') }}
                </span>

                <span class="profile__value profile__value--id">
                  {{ steamID || '—' }}
                </span>
              </div>
            </div>

            <div class="profile__account-status">
              <div class="profile__status-info">
                <span class="profile__label">
                  {{ $t('Account status:') }}
                </span>

                <div
                  class="profile__status"
                  :class="{
                    'is-connected': authStore.isAuthenticated,
                  }"
                >
                  <span class="profile__status-dot" aria-hidden="true" />

                  <span>
                    {{
                      authStore.isAuthenticated
                        ? $t('Connected')
                        : $t('Disconnected')
                    }}
                  </span>
                </div>
              </div>

              <BaseButton
                class="profile__logout"
                variant="bordered"
                :disabled="isLoggingOut"
                @click="handleLogout"
              >
                <SvgIcon :icon="LogoutIcon" class="profile__logout-icon" />

                {{ $t('Log out') }}
              </BaseButton>
            </div>
          </section>

          <section class="profile__wallet">
            <div class="profile__wallet-inner">
              <MyBalance />
            </div>
          </section>
        </div>

        <div class="profile__histories">
          <section class="profile__history">
            <h2 class="profile__section-title">
              {{ $t('Purchase History') }}
            </h2>

            <div class="profile__table">
              <OrderHistory />
            </div>
          </section>

          <section class="profile__history">
            <h2 class="profile__section-title">
              {{ $t('Payment History') }}
            </h2>

            <div class="profile__table">
              <PaymentHistory />
            </div>
          </section>
        </div>
      </template>

      <template v-else-if="isOffersPage">
        <div v-if="settingsStore.payoutEnabled" class="profile__sell-layout">
          <div class="profile__sell-left">
            <section class="profile__withdraw">
              <MyWithdraw />
            </section>

            <section class="profile__sell-panel">
              <button
                type="button"
                class="profile__sell-toggle"
                :aria-expanded="isSellItemsExpanded"
                aria-controls="profile-sell-content"
                @click="toggleSellItems"
              >
                <span class="profile__sell-toggle-title">
                  {{ $t('Sell Items') }}
                </span>

                <SvgIcon
                  :icon="ChevronDownIcon"
                  class="profile__sell-chevron"
                  :class="{
                    'is-open': isSellItemsExpanded,
                  }"
                />
              </button>

              <div
                id="profile-sell-content"
                v-show="isSellItemsExpanded"
                class="profile__sell-content"
              >
                <SellSkinFrom
                  :show-title="false"
                  @success="handleSellSuccess"
                  @cancel="closeSellItems"
                />
              </div>
            </section>
          </div>

          <section class="profile__sell-right">
            <h2 class="profile__section-title">
              {{ $t('Sell Offers') }}
            </h2>

            <div class="profile__table">
              <MyOffers :key="offersRefreshKey" />
            </div>
          </section>
        </div>

        <div v-else class="profile__unavailable">
          {{ $t('Selling is currently unavailable') }}
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { ChevronDownIcon, LogoutIcon, UserIcon } from '@/components/icons'

import SellSkinFrom from '@/components/modals/sellSkins/SellSkinModal/SellSkinFrom.vue'

import MyBalance from '@/pages/AccountPage/components/MyBalance.vue'
import MyWithdraw from '@/pages/AccountPage/components/MyWithdraw.vue'

import MyOffers from '@/pages/AccountPage/tabs/MyOffers.vue'
import OrderHistory from '@/pages/AccountPage/tabs/OrderHistory.vue'
import PaymentHistory from '@/pages/AccountPage/tabs/PaymentHistory.vue'

import { useToast } from '@/composables/useToast'

import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()

const { t } = useI18n()
const toast = useToast()

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const { name, steamID, avatar } = storeToRefs(userStore)

const isLoggingOut = ref(false)
const isSellItemsExpanded = ref(true)
const offersRefreshKey = ref(0)

const isBalancePage = computed(() => {
  return route.name === 'account-balance'
})

const isOffersPage = computed(() => {
  return route.name === 'account-offers'
})

const toggleSellItems = () => {
  isSellItemsExpanded.value = !isSellItemsExpanded.value
}

const closeSellItems = () => {
  isSellItemsExpanded.value = false
}

const handleSellSuccess = () => {
  offersRefreshKey.value += 1
}

const handleLogout = async () => {
  if (isLoggingOut.value) return

  isLoggingOut.value = true

  try {
    await authStore.logout()

    await router.push({
      name: 'HomePage',
    })
  } catch (error) {
    console.error(error)
    toast.error(t('Failed to logout'))
  } finally {
    isLoggingOut.value = false
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
  position: relative;
  isolation: isolate;

  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 80vh;

  @include adaptiveValue('padding-top', 114, 80);
  @include adaptiveValue('padding-bottom', 80, 35);

  &__background {
    position: absolute;
    z-index: -1;
    inset: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__inner {
    position: relative;

    width: 100%;
    min-width: 0;
  }

  &__title {
    margin: 0;

    color: var(--primary-color);
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__overview {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;

    width: 100%;
    min-width: 0;

    @include adaptiveValue('gap', 20, 12);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 22);
    }
  }

  &__account,
  &__wallet,
  &__withdraw,
  &__sell-panel {
    min-width: 0;

    border: 1px solid var(--border-primary-color);
    border-radius: 6px;

    background-color: rgba(246, 241, 238, 0.65);
  }

  &__account {
    display: grid;
    grid-template-columns:
      auto
      minmax(0, 1fr)
      minmax(140px, 0.8fr);

    align-items: center;

    @include adaptiveValue('gap', 18, 12);
    @include adaptiveValue('padding', 16, 12);
  }

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('width', 78, 58);
    @include adaptiveValue('height', 78, 58);

    overflow: hidden;

    border-radius: 5px;
    background-color: var(--primary-color);
    color: var(--bg-third-color);
  }

  &__avatar-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: cover;
  }

  &__avatar-icon {
    width: 44%;
    height: 44%;
  }

  &__identity {
    display: flex;
    flex-direction: column;
    justify-content: center;

    min-width: 0;
    gap: 14px;
  }

  &__identity-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    min-width: 0;
    gap: 6px 12px;
  }

  &__label {
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.4;

    text-transform: uppercase;
  }

  &__value {
    min-width: 0;

    color: var(--primary-color);

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;

    overflow-wrap: anywhere;

    &--id {
      font-weight: 700;
    }
  }

  &__account-status {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    min-width: 0;
    height: 100%;

    gap: 14px;
    padding-left: 20px;

    border-left: 1px solid var(--border-primary-color);
  }

  &__status-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    min-width: 0;
    gap: 10px;
  }

  &__status {
    display: inline-flex;
    align-items: center;

    gap: 6px;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;

    &.is-connected {
      color: var(--hint-primary-color);

      .profile__status-dot {
        background-color: var(--success-color);
      }
    }
  }

  &__status-dot {
    display: block;

    width: 6px;
    min-width: 6px;
    height: 6px;

    border-radius: 50%;
    background-color: var(--hint-third-color);
  }

  &__logout {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: fit-content;
    max-width: 100%;
    min-width: 0;
    min-height: 30px;

    gap: 7px;
    padding: 6px 10px;

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;

    text-transform: none;
  }

  &__logout-icon {
    width: 13px;
    min-width: 13px;
    height: 13px;
  }

  &__wallet {
    display: flex;
    align-items: center;

    width: 100%;

    @include adaptiveValue('padding', 18, 12);
  }

  &__wallet-inner {
    width: 100%;
    min-width: 0;
  }

  &__wallet {
    :deep(.balance) {
      display: grid;
      grid-template-columns:
        minmax(0, 40%)
        minmax(0, 60%);
      grid-template-rows: auto auto auto;

      align-items: center;
      gap: 8px 0;

      width: 100%;
      min-width: 0;
    }

    :deep(.balance__title) {
      grid-column: 1;
      grid-row: 1;

      margin: 0;

      color: var(--hint-third-color);
      font-family: var(--font-inter);
      font-size: 11px;
      font-weight: 400;
      text-transform: uppercase;
    }

    :deep(.balance__row) {
      grid-column: 1;
      grid-row: 2;

      display: flex;
      align-items: center;
      flex-wrap: wrap;

      min-width: 0;
      margin: 0;

      gap: 8px;
    }

    :deep(.balance__coin) {
      justify-content: flex-start;
    }

    :deep(.balance__conversion) {
      display: none;
    }

    :deep(.balance__actions) {
      grid-column: 2;
      grid-row: 2;

      width: 100%;
      min-width: 0;

      padding-left: 18px;
    }

    :deep(.balance__input) {
      width: 100%;
      min-width: 0;
    }

    :deep(.balance__content) {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    :deep(.balance__submit) {
      min-width: 74px;
      min-height: 34px;

      padding: 7px 10px;

      font-family: var(--font-inter);
      font-size: 11px;
      font-weight: 600;
    }

    :deep(.balance__total),
    :deep(.balance__error) {
      grid-column: 2;
      grid-row: auto;

      min-width: 0;
      padding-left: 18px;
    }
  }

  &__histories {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    align-items: start;

    width: 100%;
    min-width: 0;

    @include adaptiveValue('gap', 20, 12);
  }

  &__history,
  &__table {
    width: 100%;
    min-width: 0;
  }

  &__section-title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-akshar);
    font-weight: 700;
    line-height: 1.2;

    text-transform: uppercase;

    @include adaptiveValue('font-size', 21, 18);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 12);
    }
  }

  &__sell-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    align-items: start;

    width: 100%;
    min-width: 0;

    @include adaptiveValue('gap', 22, 14);
  }

  &__sell-left,
  &__sell-right {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__sell-left {
    @include adaptiveValue('gap', 12, 8);
  }

  &__withdraw {
    width: 100%;

    @include adaptiveValue('padding', 18, 12);
  }

  &__sell-panel {
    width: 100%;
    overflow: hidden;
  }

  &__sell-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    min-height: 58px;

    gap: 12px;

    @include adaptiveValue('padding-left', 20, 14);
    @include adaptiveValue('padding-right', 20, 14);

    border: 0;
    background-color: transparent;

    color: var(--primary-color);

    font-family: var(--font-akshar);
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;

    text-align: left;
    text-transform: uppercase;

    cursor: pointer;

    transition: background-color 0.25s ease;

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: -3px;
    }

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-fourth-color);
      }
    }
  }

  &__sell-toggle-title {
    min-width: 0;
  }

  &__sell-chevron {
    flex-shrink: 0;

    width: 16px;
    height: 16px;

    transition: transform 0.25s ease;

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__sell-content {
    width: 100%;
    min-width: 0;

    @include adaptiveValue('padding-left', 20, 12);
    @include adaptiveValue('padding-right', 20, 12);
    @include adaptiveValue('padding-bottom', 20, 12);
  }

  &__unavailable {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 160px;

    padding: 24px;

    border: 1px solid var(--border-primary-color);
    border-radius: 6px;

    background-color: var(--bg-third-color);
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;
  }

  @media (max-width: $md2) {
    &__overview,
    &__histories,
    &__sell-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    &__histories {
      gap: 28px;
    }

    &__account {
      grid-template-columns:
        auto
        minmax(0, 1fr)
        minmax(160px, 0.6fr);
    }
  }

  @media (max-width: $md4) {
    &__account {
      grid-template-columns: auto minmax(0, 1fr);
    }

    &__account-status {
      grid-column: 1 / -1;

      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;

      height: auto;
      min-height: 0;

      padding: 14px 0 0;

      border-left: 0;
      border-top: 1px solid var(--border-primary-color);
    }

    &__status-info {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 12px;
    }

    &__wallet {
      :deep(.balance) {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto;
        gap: 12px;
      }

      :deep(.balance__title),
      :deep(.balance__row),
      :deep(.balance__actions),
      :deep(.balance__total),
      :deep(.balance__error) {
        grid-column: 1;
        grid-row: auto;

        padding-left: 0;
      }

      :deep(.balance__actions) {
        padding-top: 12px;
        border-top: 1px solid var(--border-primary-color);
      }
    }

    &__sell-toggle {
      min-height: 54px;
      font-size: 19px;
    }
  }

  @media (max-width: $md6) {
    &__account {
      gap: 12px;
    }

    &__avatar {
      width: 58px;
      height: 58px;
    }

    &__identity {
      gap: 9px;
    }

    &__identity-row {
      gap: 4px 8px;
    }

    &__account-status {
      align-items: flex-start;
    }

    &__logout {
      margin-left: auto;
    }

    &__sell-toggle {
      min-height: 50px;
      font-size: 18px;
    }

    &__section-title {
      font-size: 18px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile__sell-toggle,
  .profile__sell-chevron {
    transition: none;
  }
}
</style>
