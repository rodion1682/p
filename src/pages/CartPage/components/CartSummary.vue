<template>
  <div class="summary" :class="attrs.class">
    <div class="summary__body">
      <div class="summary__title _h4">
        {{ $t('Checkout') }}
      </div>
      <div class="summary__subtitle">
        {{ $t('Total to pay:') }}
      </div>
      <PriceFormatter
        v-if="cartTotalInitial"
        size="size-32"
        class="summary__coin"
        :price="cartTotalInitial"
      />
      <PriceFormatter
        v-if="cartTotalFiatPrice"
        is-currency
        class="summary__fiat"
        :price="cartTotalFiatPrice"
        size="size-12"
      />
      <BaseButton
        class="summary__button"
        variant="bordered"
        :disabled="cartStore.isEmpty || cartStore.isLoading"
        @click="openCheckoutModal"
      >
        {{ $t('Continue') }}
      </BaseButton>
    </div>

    <div v-if="false" class="summary__conversion">
      <PriceFormatter
        :price="oneCoinFiatValue"
        :currency-code="currencyStore.currentCurrencyCode"
        size="size-14"
        reverse
      />
      <span>=</span>
      <PriceFormatter
        :price="1"
        :currency-code="currencyStore.currentCurrencyCode"
        is-currency
        raw-fiat
        skip-conversion
        size="size-14"
      />
    </div>
  </div>

  <CartCheckoutModal
    v-if="isCheckoutModalOpen"
    :show="isCheckoutModalOpen"
    :total-coins="cartTotalInitial"
    :total-fiat="cartTotalFiatPrice"
    @close="closeCheckoutModal"
  />
</template>

<script setup>
import { computed, ref, useAttrs } from 'vue'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'

import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'

import CartCheckoutModal from '../modals/CartCheckoutModal.vue'

const attrs = useAttrs()

const cartStore = useCartStore()
const currencyStore = useCurrencyStore()
const settingsStore = useSettingsStore()

const isCheckoutModalOpen = ref(false)

const cartTotalInitial = computed(() => {
  return Number(cartStore.totalAmountInternal || 0)
})

const cartTotalFiatPrice = computed(() => {
  return Number(cartStore.totalAmount || cartStore.cartTotal || 0)
})

const selectedCurrencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const creditsConversionRate = computed(() => {
  return Number(settingsStore.creditsConversionRate || 0)
})

const oneCoinFiatValue = computed(() => {
  return selectedCurrencyRate.value * creditsConversionRate.value
})

const openCheckoutModal = () => {
  if (cartStore.isEmpty) return

  isCheckoutModalOpen.value = true
}

const closeCheckoutModal = () => {
  isCheckoutModalOpen.value = false
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.summary {
  @include adaptiveValue('border-radius', 10, 6);
  background-color: var(--bg-primary-color);
  @include adaptiveValue('padding', 32, 10);
  display: flex;
  align-items: center;
  &__body {
    max-width: 266px;
    width: 100%;
    margin: 0 auto;
    text-align: center;
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__subtitle {
    color: var(--seconday-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__coin {
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 13, 15);
    }
  }

  &__fiat {
    color: var(--seconday-color);
    justify-content: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__button {
  }
}
</style>
