<template>
  <div class="balance" v-bind="attrs">
    <div class="balance__title">
      {{ $t('My Balance:') }}
    </div>
    <div class="balance__row">
      <PriceFormatter
        class="balance__coin"
        :price="balanceInternal"
        size="size-32"
        skip-conversion
      />
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
    </div>
    <div v-if="selectedAmountNumber > 0" class="balance__total">
      <span class="balance__total-label">
        {{ $t('You will get:') }}
      </span>

      <PriceFormatter
        :price="selectedAmountNumber"
        :currency-code="currencyStore.currentCurrencyCode"
        skip-conversion
        size="size-14"
        class="balance__total-price"
      />
    </div>
    <div v-if="amountError" class="balance__error _text-error">
      {{ amountError }}
    </div>
    <div class="balance__actions">
      <BaseInput
        v-model.number="selectedAmount"
        class="balance__input"
        type="number"
        min="0"
        step="1"
        :placeholder="$t('Sum')"
        :disabled="isLoading"
      >
        <template #suffix>
          <span v-if="false" class="balance__input-symbol">
            {{ currentCurrencyDisplay }}
          </span>
          <div class="balance__content">
            <SvgIcon :icon="CoinIcon" class="balance__icon" />
            <BaseButton
              class="balance__submit"
              variant="primary"
              :disabled="!isValidAmount || isLoading"
              @click="openDepositModal"
            >
              {{ $t('TOP UP') }}
            </BaseButton>
          </div>
        </template>
      </BaseInput>
    </div>
    <div v-if="minTopUpAmount && false" class="balance__warn">
      <span>
        {{ $t('Min. Top up - ') }}
      </span>

      <PriceFormatter
        :price="minTopUpFiat"
        :currency-code="currencyStore.currentCurrencyCode"
        is-currency
        raw-fiat
        skip-conversion
        size="size-14"
      />
    </div>
  </div>

  <div class="balance__options" v-if="false">
    <button
      v-for="option in TOP_UP_OPTIONS"
      :key="option"
      type="button"
      class="balance__option"
      :class="{
        active: Number(selectedAmount) === option,
      }"
      :disabled="isLoading"
      @click="selectAmount(option)"
    >
      <PriceFormatter
        :price="getOptionFiatValue(option)"
        :currency-code="currencyStore.currentCurrencyCode"
        is-currency
        raw-fiat
        skip-conversion
        size="size-14"
        class="balance__option-fiat"
      />
    </button>
  </div>
  <button
    v-if="settingsStore.payoutEnabled && false"
    type="button"
    class="balance__withdraw _link"
    @click="openWithdrawModal"
  >
    {{ $t('Withdraw') }}
  </button>

  <TopUpModal
    :show="depositModalIsVisible"
    :selected-amount="selectedAmountNumber"
    :have-to-pay="topUpAmountInFiat"
    @close="closeDepositModal"
  />
  <WithdrawModal
    :show="withdrawModalIsVisible"
    :balance="balance"
    @close="closeWithdrawModal"
    @success="handleWithdrawSuccess"
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
import WithdrawModal from '@/components/modals/WithdrawModal.vue'

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

// How much fiat 1 coin costs.
// rate 0.5 => 1 coin = €2
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

  const availableBalance = Number(balance.value || 0)

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
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.balance {
  &__title {
    font-size: 12px;
    line-height: 12px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 20);
    }
  }

  &__coin {
  }

  &__conversion {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--primary-color) !important;
    font-size: 12px;
    line-height: 12px;
    font-weight: 700;
  }

  &__total {
    display: flex;
    gap: 6px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
    &-label {
    }

    &-price {
    }
  }

  &__error {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__actions {
    display: flex;
  }
  &__input {
    :deep(.base-input__control) {
      padding-right: 120px !important;
    }

    :deep(.base-input__suffix) {
      right: 0 !important;
    }
  }
  &__content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  &__icon {
    min-width: 16px;
    height: 16px;
  }

  &__submit {
    min-width: 64px;
  }
}
</style>
