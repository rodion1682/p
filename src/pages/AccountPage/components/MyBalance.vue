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
          <span>=</span>
          <PriceFormatter
            :price="1"
            :currency-code="currencyStore.currentCurrencyCode"
            is-currency
            raw-fiat
            skip-conversion
            size="size-12"
          />
        </div>
        <div class="balance__actions">
          <BaseInput
            v-model.number="selectedAmount"
            class="balance__input"
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            :disabled="isLoading"
          >
            <template #suffix>
              <div class="balance__content">
                <SvgIcon :icon="CoinIcon" class="balance__icon" />
                <BaseButton
                  class="balance__submit"
                  variant="primary"
                  :disabled="!isValidAmount || isLoading"
                  @click="openDepositModal"
                  >{{ $t('Top Up') }}</BaseButton
                >
              </div>
            </template>
          </BaseInput>
        </div>
      </div>
      <p v-if="amountError" class="balance__error _text-error">
        {{ amountError }}
      </p>
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

const TOP_UP_OPTIONS = [25, 50, 100, 250, 500]

const attrs = useAttrs()

const { t } = useI18n()
const toast = useToast()

const modalStore = useModalStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()

const { balanceInternal } = storeToRefs(userStore)

const selectedAmount = ref(null)
const amountError = ref('')

const isLoading = computed(() => {
  return settingsStore.loading
})

const selectedCurrencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const creditsConversionRate = computed(() => {
  return Number(settingsStore.creditsConversionRate || 0)
})

const oneCoinFiatValue = computed(() => {
  if (!creditsConversionRate.value) {
    return 0
  }

  return selectedCurrencyRate.value / creditsConversionRate.value
})

const creditsPerSelectedFiat = computed(() => {
  if (!selectedCurrencyRate.value) {
    return 0
  }

  return Number(
    (creditsConversionRate.value / selectedCurrencyRate.value).toFixed(4),
  )
})

const selectedAmountNumber = computed(() => {
  const value = Number(selectedAmount.value)

  return Number.isFinite(value) ? value : 0
})

const coinsToFiat = coins => {
  const amount = Number(coins) || 0

  return Number((amount * oneCoinFiatValue.value).toFixed(2))
}

const topUpAmountInFiat = computed(() => {
  return coinsToFiat(selectedAmountNumber.value)
})

const getOptionFiatValue = option => {
  return option * selectedCurrencyRate.value
}

const minTopUpAmount = computed(() => {
  return Number(settingsStore.minTopUpAmount || 0)
})

const minTopUpFiat = computed(() => {
  return minTopUpAmount.value * selectedCurrencyRate.value
})

const maxTopUpAmount = computed(() => {
  return Number(settingsStore.maxOrderAmount || 0)
})

const maxTopUpFiat = computed(() => {
  if (!maxTopUpAmount.value) {
    return 0
  }

  return maxTopUpAmount.value * selectedCurrencyRate.value
})

const currentCurrencyDisplay = computed(() => {
  return (
    currencyStore.currentCurrency?.symbol ||
    currencyStore.currentCurrency?.code ||
    currencyStore.currentCurrencyCode ||
    ''
  )
})

const selectAmount = amount => {
  selectedAmount.value = amount
}

const isValidAmount = computed(() => {
  const amount = selectedAmountNumber.value

  if (!amount) return false
  if (amount <= 0) return false

  if (minTopUpFiat.value && topUpAmountInFiat.value < minTopUpFiat.value) {
    return false
  }

  if (maxTopUpFiat.value && topUpAmountInFiat.value > maxTopUpFiat.value) {
    return false
  }

  return true
})

const validateAmount = value => {
  const amount = Number(value)

  if (value === null || value === undefined || value === '') {
    amountError.value = ''
    return
  }

  if (!Number.isFinite(amount)) {
    amountError.value = t('Amount must be a number')

    return
  }

  if (amount <= 0) {
    amountError.value = t('Amount must be higher than 0')

    return
  }

  if (minTopUpFiat.value && topUpAmountInFiat.value < minTopUpFiat.value) {
    amountError.value = `${t('Min. Top Up is')} ${currencyStore.formatFiat(
      minTopUpFiat.value,
      currencyStore.currentCurrencyCode,
    )} ${
      currencyStore.currentCurrency?.symbol || currencyStore.currentCurrencyCode
    }`

    return
  }

  if (maxTopUpFiat.value && topUpAmountInFiat.value > maxTopUpFiat.value) {
    amountError.value = `${t('Max. Top Up is')} ${currencyStore.formatFiat(
      maxTopUpFiat.value,
      currencyStore.currentCurrencyCode,
    )} ${
      currencyStore.currentCurrency?.symbol || currencyStore.currentCurrencyCode
    }`

    return
  }

  amountError.value = ''
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

const withdrawModalIsVisible = computed(() => {
  return modalStore.isOpen?.('withdraw') || false
})

const openWithdrawModal = () => {
  if (!settingsStore.payoutEnabled) {
    return
  }

  const availableBalance = Number(balanceInternal.value || 0)

  if (availableBalance <= 0) {
    toast.warning(t('You do not have enough balance to withdraw'))

    return
  }

  modalStore.open?.('withdraw')
}
const closeWithdrawModal = () => {
  modalStore.close?.('withdraw')
}

const handleWithdrawSuccess = async () => {
  closeWithdrawModal()

  try {
    await userStore.fetchProfile()
  } catch (error) {
    console.error(error)
  }

  toast.success(t('Withdrawal request submitted successfully'))
}

watch(
  () => [
    selectedAmount.value,
    selectedCurrencyRate.value,
    creditsConversionRate.value,
    minTopUpFiat.value,
    maxTopUpFiat.value,
  ],
  () => {
    validateAmount(selectedAmount.value)
  },
)

onMounted(async () => {
  if (!settingsStore.settings && !settingsStore.loading) {
    await settingsStore.fetchSettings()
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
    text-transform: uppercase;
  }
  &__coin {
    justify-content: flex-start;
    min-width: 0;
    :deep(.price__value) {
      font-size: 30px;
      font-weight: 500;
      line-height: 1;
    }
    :deep(.price__icon) {
      width: 30px;
      height: 30px;
    }
  }
  &__right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    min-width: 0;
    padding-left: 20px;
    border-left: 1px solid var(--border-primary-color);
  }
  &__heading {
    margin: 0;
    font-family: var(--font-akshar);
    font-size: 21px;
    font-weight: 700;
    line-height: 1;
    text-transform: uppercase;
  }
  &__controls {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
  &__conversion {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 5px;
    color: var(--hint-third-color);
    font-size: 11px;
    white-space: nowrap;
    :deep(.price__value),
    :deep(.price__currency) {
      color: var(--hint-third-color);
      font-size: 11px;
    }
    :deep(.price__icon) {
      width: 11px;
      height: 11px;
    }
  }
  &__actions,
  &__input {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
  }
  &__input {
    :deep(.base-input) {
      min-height: 44px;
      background-color: var(--bg-third-color);
      border-color: var(--border-primary-color);
    }
    :deep(.base-input__control) {
      min-width: 0;
      padding-right: 112px;
      font-size: 12px;
    }
  }
  &__content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__icon {
    width: 15px;
    height: 15px;
  }
  &__submit {
    flex: 0 0 auto;
    min-width: 68px;
    min-height: 32px;
    padding: 6px 10px;
    font-size: 11px;
    text-transform: uppercase;
  }
  &__error {
    font-size: 11px;
    overflow-wrap: anywhere;
  }
  @media (max-width: 1300px) {
    &__controls {
      flex-wrap: wrap;
      gap: 8px;
    }
    &__conversion {
      width: 100%;
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
