<template>
  <div v-if="shouldShowBalance" class="balance" v-bind="attrs">
    <div class="balance__icon-wrapper">
      <SvgIcon :icon="WalletIcon" class="balance__icon" />
    </div>

    <div class="balance__content">
      <div class="balance__prices">
        <PriceFormatter
          :reverse="true"
          size="size-24"
          class="balance__coin"
          :price="userBalance"
        />
      </div>

      <RouterLink
        v-if="showTopUpButton"
        class="balance__button"
        :to="{ name: 'account-profile' }"
      >
        <BaseButton variant="secondary" icon="plus">
          {{ $t('Top up balance') }}
        </BaseButton>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, useAttrs } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import { WalletIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'
import { usePromoCodeStore } from '@/stores/promocode'
import { useUserStore } from '@/stores/user'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const authStore = useAuthStore()
const cartStore = useCartStore()
const currencyStore = useCurrencyStore()
const promoCodeStore = usePromoCodeStore()
const userStore = useUserStore()

const { userBalance: balance, isProfileLoaded } = storeToRefs(userStore)

const userBalance = computed(() => Number(balance.value || 0))

const cartTotal = computed(() => {
  const total = currencyStore.isInternalCurrencyEnabled
    ? Number(cartStore.totalAmountInternal || cartStore.cartTotalInternal || 0) ||
      (cartStore.items || []).reduce((sum, row) => {
        const price = Number(row.item?.price_internal ?? row.price_internal ?? 0)
        const count = Number(row.count ?? row.quantity ?? 1)

        return sum + price * count
      }, 0)
    : Number(cartStore.totalAmount || cartStore.cartTotal || 0) ||
      (cartStore.items || []).reduce((sum, row) => {
        const price = Number(row.item?.price ?? row.price ?? 0)
        const count = Number(row.count ?? row.quantity ?? 1)

        return sum + price * count
      }, 0)

  if (promoCodeStore.hasActivePromo) {
    const discountAmount = Number(promoCodeStore.discount?.amount ?? 0)
    return Math.max(0, total - discountAmount)
  }

  return total
})

const hasEnoughBalance = computed(() => {
  return userBalance.value >= cartTotal.value
})

const showTopUpButton = computed(() => {
  return authStore.isAuthenticated && !hasEnoughBalance.value
})

const shouldShowBalance = computed(() => {
  return authStore.isAuthenticated
})

onMounted(async () => {
  if (authStore.isAuthenticated && !isProfileLoaded.value) {
    await userStore.fetchProfile()
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.balance {
  display: flex;

  @include adaptiveValue('gap', 40, 20, 1820, 992, 1);

  &__icon-wrapper {
    min-width: 38px;
    height: fit-content;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: var(--secondary-color);
    background: linear-gradient(180deg, #fb9930 0%, #e3b37f 100%);

    @include adaptiveValue('border-radius', 12, 8);
  }

  &__icon {
    min-width: 18px;
    height: 18px;
  }

  &__content {
    padding-top: 9px;
    flex: 1 1 auto;
  }

  &__prices {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 12);
    }
  }

  &__coin {
    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }

  &__button {
    display: block;
    width: fit-content;
  }
}
</style>
