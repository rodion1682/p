<template>
  <div class="balance" v-bind="attrs">
    <div class="balance__left">
      <span class="balance__label">{{ $t('My Balance:') }}</span>

      <PriceFormatter
        class="balance__coin"
        :price="balanceInternal"
        size="size-32"
        skip-conversion
      />
    </div>

    <div class="balance__right">
      <h2 class="balance__heading">{{ $t('Top Up') }}</h2>

      <div class="balance__controls">
        <div class="balance__conversion">
          <PriceFormatter
            :price="creditsPerSelectedFiat"
            skip-conversion
            size="size-12"
          />

          <span class="balance__equals">=</span>

          <PriceFormatter
            :price="1"
            :currency-code="currencyStore.currentCurrencyCode"
            is-currency
            raw-fiat
            skip-conversion
            size="size-12"
          />
        </div>

        <BaseInput
          v-model="selectedAmount"
          class="balance__input"
          variant="checkout"
          type="number"
          inputmode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          :disabled="isLoading"
          :error="amountError"
          :aria-label="$t('Top Up amount')"
          @blur="validateAmount(selectedAmount)"
          @enter="openDepositModal"
        >
          <template #prefix>
            <SvgIcon :icon="CoinIcon" class="balance__input-icon" />
          </template>

          <template #suffix>
            <BaseButton
              type="button"
              class="balance__submit"
              variant="primary"
              :disabled="isLoading"
              @click="openDepositModal"
            >
              {{ $t('Top Up') }}
            </BaseButton>
          </template>
        </BaseInput>
      </div>
    </div>
  </div>

  <TopUpModal
    :show="depositModalIsVisible"
    :selected-amount="selectedAmountNumber"
    :have-to-pay="topUpAmountInFiat"
    @close="closeDepositModal"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, useAttrs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import TopUpModal from '@/components/modals/TopUpModal.vue'

import { CoinIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useToast } from '@/composables/useToast'
import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
const { t } = useI18n()
const toast = useToast()

const modalStore = useModalStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()

const { balanceInternal } = storeToRefs(userStore)

const selectedAmount = ref('')
const amountError = ref('')

const isLoading = computed(() => Boolean(settingsStore.loading))

const selectedCurrencyRate = computed(() => {
  const rate = Number(currencyStore.currentCurrency?.value)
  return Number.isFinite(rate) && rate > 0 ? rate : 1
})

const creditsConversionRate = computed(() => {
  const rate = Number(settingsStore.creditsConversionRate)
  return Number.isFinite(rate) && rate > 0 ? rate : 0
})

const creditsPerSelectedFiat = computed(() => {
  return Number(
    (creditsConversionRate.value / selectedCurrencyRate.value).toFixed(4),
  )
})

const selectedAmountNumber = computed(() => {
  const amount = Number(selectedAmount.value)
  return Number.isFinite(amount) ? amount : 0
})

const topUpAmountInFiat = computed(() => {
  if (creditsConversionRate.value <= 0) return 0

  return Number(
    (
      (selectedAmountNumber.value * selectedCurrencyRate.value) /
      creditsConversionRate.value
    ).toFixed(2),
  )
})

const minTopUpFiat = computed(() => {
  return Number(settingsStore.minTopUpAmount || 0) * selectedCurrencyRate.value
})

const maxTopUpFiat = computed(() => {
  return Number(settingsStore.maxOrderAmount || 0) * selectedCurrencyRate.value
})

const isValidAmount = computed(() => {
  if (!Number.isFinite(Number(selectedAmount.value))) return false
  if (selectedAmountNumber.value <= 0) return false
  if (topUpAmountInFiat.value <= 0) return false

  if (minTopUpFiat.value && topUpAmountInFiat.value < minTopUpFiat.value) {
    return false
  }

  if (maxTopUpFiat.value && topUpAmountInFiat.value > maxTopUpFiat.value) {
    return false
  }

  return true
})

const formatLimit = amount => {
  const formatted = currencyStore.formatFiat(
    amount,
    currencyStore.currentCurrencyCode,
  )
  const symbol =
    currencyStore.currentCurrency?.symbol ||
    currencyStore.currentCurrencyCode ||
    ''

  return `${formatted} ${symbol}`.trim()
}

const validateAmount = value => {
  if (value === '' || value === null || value === undefined) {
    amountError.value = ''
    return
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    amountError.value = t('Amount must be a number')
  } else if (amount <= 0) {
    amountError.value = t('Amount must be higher than 0')
  } else if (topUpAmountInFiat.value <= 0) {
    amountError.value = t('Invalid top up amount')
  } else if (
    minTopUpFiat.value &&
    topUpAmountInFiat.value < minTopUpFiat.value
  ) {
    amountError.value = `${t('Min. Top Up is')} ${formatLimit(minTopUpFiat.value)}`
  } else if (
    maxTopUpFiat.value &&
    topUpAmountInFiat.value > maxTopUpFiat.value
  ) {
    amountError.value = `${t('Max. Top Up is')} ${formatLimit(maxTopUpFiat.value)}`
  } else {
    amountError.value = ''
  }
}

const depositModalIsVisible = computed(() => {
  return modalStore.isOpen?.('deposit') || false
})

const openDepositModal = () => {
  validateAmount(selectedAmount.value)

  if (!isValidAmount.value) {
    toast.warning(amountError.value || t('Please enter a valid amount'))
    return
  }

  modalStore.open?.('deposit')
}

const closeDepositModal = () => {
  modalStore.close?.('deposit')
}

watch(
  () => [
    selectedAmount.value,
    selectedCurrencyRate.value,
    creditsConversionRate.value,
    minTopUpFiat.value,
    maxTopUpFiat.value,
  ],
  () => validateAmount(selectedAmount.value),
)

onMounted(async () => {
  if (!settingsStore.settings && !settingsStore.loading) {
    try {
      await settingsStore.fetchSettings()
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

.balance {
  display: grid;
  grid-template-columns: minmax(0, 40%) minmax(0, 60%);
  align-items: center;

  width: 100%;
  min-width: 0;

  &__left {
    display: flex;
    flex-direction: column;
    justify-content: center;

    min-width: 0;
    gap: 16px;
    padding-right: 16px;
  }

  &__label {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.4;
    text-transform: uppercase;
  }

  &__coin {
    justify-content: flex-start;
    min-width: 0;

    :deep(.price__value) {
      color: var(--primary-color);
      font-size: 30px;
      font-weight: 500;
      line-height: 1;
    }

    :deep(.price__icon) {
      width: 30px;
      min-width: 30px;
      height: 30px;
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
    justify-content: center;

    min-width: 0;
    gap: 12px;
    padding-left: 20px;

    border-left: 1px solid var(--border-primary-color);
    container-type: inline-size;
  }

  &__heading {
    margin: 0;

    color: var(--primary-color);
    font-family: var(--font-akshar);
    font-size: 21px;
    font-weight: 700;
    line-height: 1;
    text-transform: uppercase;
  }

  &__controls {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    align-items: center;
    gap: 12px;

    width: 100%;
    min-width: 0;
  }

  &__conversion {
    display: flex;
    align-items: center;
    gap: 5px;

    min-width: 0;

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 11px;
    line-height: 1.2;
    white-space: nowrap;

    :deep(.price) {
      flex: 0 0 auto;
      gap: 4px;
    }

    :deep(.price__value),
    :deep(.price__currency) {
      color: var(--hint-third-color);
      font-size: 11px;
      font-weight: 400;
      line-height: 1.2;
    }

    :deep(.price__icon) {
      width: 12px;
      min-width: 12px;
      height: 12px;
    }
  }

  &__equals {
    color: var(--hint-third-color);
  }

  &__input {
    width: 100%;
    min-width: 0;

    :deep(.base-input) {
      min-height: 44px;
      border: 1px solid var(--border-primary-color);
      border-radius: 6px;
      background-color: var(--bg-third-color);
    }

    :deep(.base-input__control.has-prefix.has-suffix) {
      width: 100%;
      min-width: 0;
      min-height: 42px;
      padding: 0 92px 0 38px;

      color: var(--primary-color);
      font-family: var(--font-inter);
      font-size: 12px;
      line-height: 1.4;
    }

    :deep(.base-input__control::placeholder) {
      color: var(--hint-third-color);
      opacity: 1;
    }

    :deep(.base-input__prefix) {
      left: 12px;
    }

    :deep(.base-input__suffix) {
      right: 5px;
    }

    :deep(.base-input__error) {
      padding-left: 0;
      font-family: var(--font-inter);
      font-size: 11px;
    }
  }

  &__input-icon {
    display: block;
    width: 16px;
    min-width: 16px;
    height: 16px;
  }

  &__submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: auto;
    min-width: 72px;
    min-height: 32px;

    padding: 6px 10px;
    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
  }

  @container (max-width: 295px) {
    &__controls {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 9px;
    }
  }

  @media (max-width: $md4) {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;

    &__left {
      gap: 10px;
      padding: 0;
    }

    &__right {
      padding: 16px 0 0;
      border-left: 0;
      border-top: 1px solid var(--border-primary-color);
    }
  }
}
</style>
