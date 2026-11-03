<template>
  <main class="profile">
    <div class="profile__background _ibg">
      <img src="@/assets/img/products-bg.png" />
    </div>

    <div class="profile__inner _cnt-home">
      <h1 class="profile__title _h2">
        {{ $t('Profile') }}
      </h1>

      <template v-if="route.name === 'account-balance'">
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
              <div class="profile__status-heading">
                {{ $t('Account status:') }}
              </div>

              <div
                class="profile__status"
                :class="{
                  'profile__status--connected': authStore.isAuthenticated,
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

              <BaseButton
                variant="bordered"
                class="profile__logout"
                @click="handleLogout"
              >
                <SvgIcon :icon="LogoutIcon" class="profile__logout-icon" />

                {{ $t('Log out') }}
              </BaseButton>
            </div>
          </section>

          <section class="profile__wallet">
            <div class="profile__wallet-content">
              <MyBalance />
            </div>

            <div class="profile__topup-heading">
              {{ $t('Top up') }}
            </div>
          </section>
        </div>

        <div class="profile__histories">
          <section class="profile__history">
            <h2 class="profile__section-title">
              {{ $t('Purchase history') }}
            </h2>

            <div class="profile__table">
              <OrderHistory />
            </div>
          </section>

          <section class="profile__history">
            <h2 class="profile__section-title">
              {{ $t('Payment history') }}
            </h2>

            <div class="profile__table">
              <PaymentHistory />
            </div>
          </section>
        </div>
      </template>

      <template
        v-else-if="
          route.name === 'account-offers' && settingsStore.payoutEnabled
        "
      >
        <div class="profile__offers">
          <section class="profile__offers-overview">
            <div class="profile__offers-create">
              <h2 class="profile__section-title">
                {{ $t('Sell Item') }}
              </h2>

              <BaseButton
                variant="primary"
                class="profile__create"
                @click="openSellSkinModal"
              >
                <SvgIcon :icon="PlusIcon" class="profile__create-icon" />

                {{ $t('Create new offer') }}
              </BaseButton>
            </div>

            <div class="profile__withdraw">
              <MyWithdraw />
            </div>
          </section>

          <section class="profile__offers-history">
            <h2 class="profile__section-title">
              {{ $t('Sell Offers') }}
            </h2>

            <div class="profile__table">
              <MyOffers />
            </div>
          </section>
        </div>
      </template>
    </div>
  </main>

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
import { LogoutIcon, PlusIcon, UserIcon } from '@/components/icons'
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

const route = useRoute()
const router = useRouter()

const { t } = useI18n()
const toast = useToast()

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

    await router.push({
      name: 'HomePage',
    })
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
  position: relative;

  width: 100%;
  min-width: 0;

  @include adaptiveValue('padding-top', 114, 80);
  @include adaptiveValue('padding-bottom', 70, 30);

  &__background {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;

    pointer-events: none;
  }

  &__inner {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  &__title {
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

    @include adaptiveValue('gap', 20, 12);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 22);
    }
  }

  &__account,
  &__wallet {
    position: relative;
    min-width: 0;

    border: 1px solid var(--border-primary-color);
    border-radius: 6px;

    background-color: rgba(246, 241, 238, 0.55);
  }

  &__account {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) minmax(150px, 0.8fr);
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
    gap: 8px 12px;
  }

  &__label,
  &__status-heading {
    flex-shrink: 0;

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

    padding-left: 20px;

    border-left: 1px solid var(--border-primary-color);
  }

  &__status-heading {
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;

    &:not(:last-child) {
      margin-bottom: 15px;
    }

    &--connected {
      color: var(--hint-primary-color);

      .profile__status-dot {
        background-color: var(--success-color);
      }
    }
  }

  &__status-dot {
    display: block;

    width: 6px;
    height: 6px;

    flex-shrink: 0;

    border-radius: 50%;
    background-color: var(--hint-third-color);
  }

  &__logout {
    width: fit-content;
    min-height: 28px !important;
    padding: 5px 10px;

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 500;
    text-transform: none;
  }

  &__logout-icon {
    width: 13px;
    min-width: 13px;
    height: 13px;
  }

  &__wallet {
    display: flex;
    align-items: stretch;

    @include adaptiveValue('padding', 16, 12);
  }

  &__wallet-content {
    width: 100%;
    min-width: 0;
  }

  &__topup-heading {
    position: absolute;
    top: 18px;
    left: 44%;

    color: var(--primary-color);

    font-family: var(--font-akshar);
    font-size: 21px;
    font-weight: 700;
    line-height: 1;
    text-transform: uppercase;

    pointer-events: none;
  }

  &__wallet {
    :deep(.balance) {
      display: grid;
      grid-template-columns: minmax(0, 40%) minmax(0, 60%);
      grid-template-rows: auto 1fr;

      align-items: center;

      width: 100%;
      min-width: 0;
      min-height: 75px;

      column-gap: 0;
      row-gap: 6px;
    }

    :deep(.balance__title) {
      grid-column: 1;
      grid-row: 1;

      margin: 0 !important;

      color: var(--hint-third-color);
      font-family: var(--font-inter);
      font-size: 11px;
      font-weight: 400;
      line-height: 1.3;

      text-transform: uppercase;
    }

    :deep(.balance__row) {
      grid-column: 1;
      grid-row: 2;

      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-start;
      gap: 6px 12px;

      min-width: 0;
      margin: 0 !important;
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

      padding-left: 20px;
    }

    :deep(.balance__actions .base-input-wrap) {
      width: 100%;
      min-width: 0;
    }

    :deep(.balance__actions .base-input) {
      min-height: 44px;

      border-color: var(--border-primary-color);
      background-color: var(--bg-third-color);
    }

    :deep(.balance__actions .base-input__control) {
      min-width: 0;
      padding-right: 115px !important;
      font-family: var(--font-inter);
      font-size: 13px;
    }

    :deep(.balance__content) {
      gap: 7px;
    }

    :deep(.balance__submit) {
      width: auto;
      min-width: 72px;
      min-height: 34px;

      margin-right: 4px;
      padding: 6px 10px;

      font-family: var(--font-inter);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    :deep(.balance__total) {
      grid-column: 2;
      grid-row: 3;

      padding-left: 20px;
      margin: 0 !important;

      font-family: var(--font-inter);
      font-size: 12px;
    }

    :deep(.balance__error) {
      grid-column: 2;
      grid-row: 4;

      padding-left: 20px;
      margin: 0 !important;
    }

    :deep(.balance__warn) {
      grid-column: 2;
    }
  }

  &__histories {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    align-items: start;

    @include adaptiveValue('gap', 20, 12);
  }

  &__history {
    min-width: 0;
  }

  &__section-title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-akshar);
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 20, 17);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 12);
    }
  }

  &__table {
    width: 100%;
    min-width: 0;

    :deep(.profile-layout) {
      width: 100%;
      min-width: 0;
    }

    :deep(.profile-layout__content),
    :deep(.profile-layout__table-wrap),
    :deep(.profile-layout__table-body) {
      width: 100%;
      min-width: 0;
    }

    :deep(.profile-layout__table-head),
    :deep(.profile-layout__tr) {
      display: grid !important;

      grid-template-columns:
        minmax(0, 1.15fr)
        minmax(0, 1.8fr)
        minmax(0, 0.7fr)
        minmax(0, 1.15fr)
        minmax(0, 1fr);

      align-items: center;
      gap: 8px !important;

      width: 100%;
      min-width: 0;

      @include adaptiveValue('padding-left', 16, 10);
      @include adaptiveValue('padding-right', 16, 10);
    }

    :deep(.profile-layout__table-head) {
      min-height: 36px;
      padding-top: 10px;
      padding-bottom: 10px;

      border-radius: 5px 5px 0 0;

      background-color: var(--bg-third-color);
    }

    :deep(.profile-layout__th) {
      min-width: 0 !important;
      max-width: none !important;
      width: auto !important;

      color: var(--hint-third-color);

      font-family: var(--font-inter);
      font-size: 10px;
      font-weight: 500;
      line-height: 1.3;
      text-transform: uppercase;
    }

    :deep(.profile-layout__tr) {
      min-height: 59px;

      padding-top: 10px;
      padding-bottom: 10px;

      border-radius: 5px;
      background-color: var(--bg-third-color);

      &:not(:last-child) {
        margin-bottom: 2px;
      }
    }

    :deep(.profile-layout__td) {
      min-width: 0 !important;
      max-width: none !important;
      width: auto !important;

      overflow: visible;

      color: var(--primary-color);

      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.5;
    }

    :deep(.profile-layout__td > span:last-child) {
      min-width: 0;

      color: var(--primary-color);

      font-family: var(--font-inter);
      font-size: 12px;
      line-height: 1.5;

      overflow-wrap: anywhere;
    }

    :deep(.profile-layout__td > span:first-child) {
      display: none;
    }

    :deep(.profile-layout__td_date),
    :deep(.profile-layout__th_date) {
      min-width: 0 !important;
    }

    :deep(.profile-layout__td_skin),
    :deep(.profile-layout__th_skin) {
      min-width: 0 !important;
      max-width: none !important;
      overflow: hidden;
    }

    :deep(.profile-layout__td_type),
    :deep(.profile-layout__th_type),
    :deep(.profile-layout__td_quantity),
    :deep(.profile-layout__th_quantity),
    :deep(.profile-layout__td_coinAmount),
    :deep(.profile-layout__th_coinAmount),
    :deep(.profile-layout__td_total),
    :deep(.profile-layout__th_total),
    :deep(.profile-layout__td_status),
    :deep(.profile-layout__th_status) {
      min-width: 0 !important;
      max-width: none !important;
      flex: initial !important;
    }

    :deep(.profile-layout__skins) {
      min-width: 0;
    }

    :deep(.profile-layout__skin) {
      min-width: 0;
      gap: 6px;
    }

    :deep(.profile-layout__skin-name) {
      font-family: var(--font-inter);
      font-size: 12px;
    }

    :deep(.profile-layout__date) {
      display: flex;
      flex-direction: column;

      gap: 2px;

      font-family: var(--font-inter);
      font-size: 12px;
      line-height: 1.4;
    }

    :deep(.profile-layout__status) {
      width: fit-content;
      max-width: 100%;
      min-width: 0;
      min-height: 23px;

      padding: 5px 8px;

      border-radius: 4px;

      font-family: var(--font-akshar);
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      text-transform: uppercase;

      &.is-success {
        background-color: var(--success-color);
        color: var(--bg-third-color) !important;
      }

      &.is-warn {
        background-color: var(--pending-color);
        color: var(--bg-third-color) !important;
      }

      &.is-danger,
      &.is-muted {
        background-color: var(--error-color);
        color: var(--bg-third-color) !important;
      }
    }

    :deep(.profile-layout__bottom) {
      display: flex;
      justify-content: flex-end;

      padding-top: 16px;
    }

    :deep(.profile-layout__pagination) {
      margin-left: auto;
    }

    :deep(.profile-layout__empty) {
      padding: 30px 15px;

      border: 1px solid var(--border-primary-color);
      border-radius: 6px;

      background-color: var(--bg-third-color);

      color: var(--hint-third-color);
      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 500;
    }
  }

  &__offers {
    display: grid;
    gap: 30px;
    min-width: 0;
  }

  &__offers-overview {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: stretch;

    gap: 20px;
  }

  &__offers-create,
  &__withdraw {
    min-width: 0;
    padding: 20px;

    border: 1px solid var(--border-primary-color);
    border-radius: 6px;

    background-color: rgba(246, 241, 238, 0.7);
  }

  &__offers-create {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  &__create {
    width: fit-content;
    min-height: 42px;
    padding-inline: 15px;

    font-family: var(--font-inter);
    font-size: 12px;
  }

  &__create-icon {
    width: 15px;
    min-width: 15px;
    height: 15px;
  }

  &__offers-history {
    min-width: 0;
  }

  @media (max-width: 1200px) {
    &__overview {
      grid-template-columns: minmax(0, 1fr);
    }

    &__account {
      grid-template-columns:
        auto
        minmax(0, 1fr)
        minmax(160px, 0.6fr);
    }

    &__histories {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
    }
  }

  @media (max-width: 767px) {
    &__account {
      grid-template-columns: auto minmax(0, 1fr);
      align-items: start;
    }

    &__account-status {
      grid-column: 1 / -1;

      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;

      height: auto;
      padding: 14px 0 0;

      border-left: 0;
      border-top: 1px solid var(--border-primary-color);
    }

    &__status-heading,
    &__status {
      margin: 0 !important;
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
        padding-top: 36px;
        border-top: 1px solid var(--border-primary-color);
      }
    }

    &__topup-heading {
      top: auto;
      bottom: 76px;
      left: 14px;
      font-size: 18px;
    }

    &__table {
      :deep(.profile-layout__table-head) {
        display: none !important;
      }

      :deep(.profile-layout__table-body) {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin: 0;
      }

      :deep(.profile-layout__tr) {
        display: flex !important;
        flex-direction: column;
        align-items: stretch;

        width: 100%;
        min-width: 0;
        min-height: 0;

        padding: 14px;

        border: 1px solid var(--border-primary-color);
        border-radius: 6px;

        margin: 0 !important;
      }

      :deep(.profile-layout__td) {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;

        min-width: 0;

        &:not(:last-child) {
          margin-bottom: 12px;
        }
      }

      :deep(.profile-layout__td > span:first-child) {
        display: block;

        color: var(--hint-third-color);
        font-family: var(--font-inter);
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
      }

      :deep(.profile-layout__td > span:last-child) {
        max-width: 65%;
        text-align: right;
      }

      :deep(.profile-layout__td_skin) {
        flex-direction: row !important;
      }

      :deep(.profile-layout__td_skin .profile-layout__skins) {
        max-width: 65%;
      }

      :deep(.profile-layout__td_status .profile-layout__status) {
        margin-left: auto;
      }
    }

    &__offers-overview {
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }
  }

  @media (max-width: 480px) {
    &__account {
      grid-template-columns: 58px minmax(0, 1fr);
    }

    &__avatar {
      width: 58px;
      height: 58px;
    }

    &__identity {
      gap: 10px;
    }

    &__identity-row {
      gap: 4px 8px;
    }

    &__account-status {
      justify-content: flex-start;
    }

    &__status-heading {
      width: 100%;
    }

    &__logout {
      margin-left: auto;
    }

    &__table {
      :deep(.profile-layout__table-body) {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    &__create {
      width: 100%;
    }
  }
}
</style>
