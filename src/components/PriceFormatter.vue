<template>
  <div
    class="price"
    v-bind="attrs"
    :class="[{ 'is-reverse': reverse, isOld: isOld, isBold: isBold }, size]"
  >
    <div
      v-if="showCurrencySymbol"
      class="price__currency"
      :class="{ hint: hint }"
    >
      {{ resolvedCurrencySymbol }}
    </div>

    <template v-else>
      <SvgIcon class="price__icon" :icon="CoinIcon" />
    </template>
    <div v-if="priceValue !== null" class="price__value">
      {{ formattedPrice }}
    </div>
  </div>
</template>

<script setup>
import { CoinIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useCurrencyStore } from '@/stores/currency'
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()
const currencyStore = useCurrencyStore()

const props = defineProps({
  price: { type: [Number, String], default: 0 },
  isCurrency: { type: Boolean, default: false },
  rawFiat: { type: Boolean, default: false },
  reverse: { type: Boolean, default: false },
  hint: { type: Boolean, default: false },
  isOld: { type: Boolean, default: false },
  isBold: { type: Boolean, default: true },
  size: { type: String, default: 'size-12 ' }, // size-12 | size-14 | size-20

  currencySymbol: { type: String, default: '' },
  currencyCode: { type: String, default: '' },
})

const priceValue = computed(() => {
  const number = Number(props.price)
  return Number.isFinite(number) ? number : null
})

const resolvedCurrencyCode = computed(() => {
  return props.currencyCode || currencyStore.currentCurrency?.code || 'EUR'
})

const resolvedCurrencySymbol = computed(() => {
  if (props.currencySymbol) {
    return props.currencySymbol
  }

  if (props.currencyCode) {
    return currencyStore.getCurrencySymbolByCode(props.currencyCode)
  }

  return (
    currencyStore.currentCurrency?.symbol ||
    currencyStore.currentCurrencySymbol ||
    currencyStore.currentCurrency?.code ||
    resolvedCurrencyCode.value ||
    ''
  )
})

const showCurrencySymbol = computed(() => {
  return props.isCurrency || props.rawFiat
})

const formattedFiatByCode = (value, code) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(value)
  } catch {
    return Number(value || 0).toFixed(2)
  }
}

const stripCurrencySymbols = value => {
  return String(value)
    .replace(/[^\d.,\s-]/g, '')
    .trim()
}

const formattedPrice = computed(() => {
  if (priceValue.value === null) return '0.00'

  if (showCurrencySymbol.value) {
    return stripCurrencySymbols(
      formattedFiatByCode(priceValue.value, resolvedCurrencyCode.value),
    ).trim()
  }

  const value = Number(String(priceValue.value).trim())

  return Number.isFinite(value) ? value.toFixed(2) : ''
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.price {
  display: flex;
  align-items: center;

  &.is-reverse {
    width: fit-content;
    flex-direction: row-reverse;
    justify-content: flex-start;
  }

  &__currency,
  &__value {
    transition: color 0.3s ease 0s;
    color: inherit;
    font-weight: 500;
    font-family: var(--font-inter);
  }

  &__icon {
  }

  &__value {
  }

  &.isOld {
    opacity: 0.7;
    text-decoration: line-through;
  }

  &.isBold {
    font-weight: 700;
  }
  &.size-12 {
    gap: 6px;
    .price__currency,
    .price__value {
      font-size: 12px;
      line-height: 12px;
    }

    .price__icon {
      min-width: 18px;
      height: 18px;
    }
  }
  &.size-14 {
    gap: 6px;
    .price__currency,
    .price__value {
      font-size: 14px;
      line-height: 14px;
      font-weight: 400;
    }

    .price__icon {
      min-width: 18px;
      height: 18px;
    }
  }
  &.size-20 {
    gap: 6px;
    .price__currency,
    .price__value {
      font-size: 20px;
      line-height: 20px;
    }

    .price__icon {
      min-width: 28px;
      height: 28px;
    }
  }
}
</style>
