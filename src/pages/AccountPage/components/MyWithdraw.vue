<template>
  <div class="withdraw">
    <div class="withdraw__title">
      {{ $t('My Balance:') }}
    </div>

    <div class="withdraw__row">
      <PriceFormatter
        class="withdraw__coin"
        :price="balanceInternal"
        size="size-32"
        skip-conversion
      />

      <div class="withdraw__conversion">
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

    <div v-if="selectedAmountNumber > 0" class="withdraw__total">
      <span class="withdraw__total-label">
        {{ $t('You will get:') }}
      </span>

      <PriceFormatter
        :price="withdrawAmountInFiat"
        :currency-code="currencyStore.currentCurrencyCode"
        is-currency
        raw-fiat
        skip-conversion
        size="size-14"
        class="withdraw__total-price"
      />
    </div>

    <div v-if="amountError" class="withdraw__error _text-error">
      {{ amountError }}
    </div>

    <div class="withdraw__actions">
      <BaseInput
        v-model.number="selectedAmount"
        class="withdraw__input"
        type="number"
        min="0"
        step="1"
        :placeholder="$t('Sum')"
        :disabled="payoutStore.isLoading"
      >
        <template #suffix>
          <div class="withdraw__content">
            <SvgIcon :icon="CoinIcon" class="withdraw__icon" />

            <BaseButton
              class="withdraw__submit"
              variant="primary"
              :disabled="!isValidAmount || payoutStore.isLoading"
              @click="openWithdrawModal"
            >
              {{ $t('WITHDRAW') }}
            </BaseButton>
          </div>
        </template>
      </BaseInput>
    </div>
  </div>

  <WithdrawModal
    :show="withdrawModalIsVisible"
    :balance="numericBalance"
    :selected-amount="selectedAmountNumber"
    @close="closeWithdrawModal"
    @success="handleWithdrawSuccess"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import WithdrawModal from '@/components/modals/WithdrawModal.vue'

import { CoinIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useToast } from '@/composables/useToast'
import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { usePayoutStore } from '@/stores/payout'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()

const toast = useToast()

const modalStore = useModalStore()
const payoutStore = usePayoutStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()

const { balanceInternal } = storeToRefs(userStore)

const selectedAmount = ref(null)
const amountError = ref('')

const withdrawModalIsVisible = computed(() => {
  return modalStore.isOpen?.('withdraw') || false
})

const numericBalance = computed(() => {
  return Number(balanceInternal.value || 0)
})

const selectedCurrencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const creditsConversionRate = computed(() => {
  return Number(settingsStore.creditsConversionRate || 0)
})

// credits_conversion_rate = credits received for 1 base currency unit.
//
// Example:
// credits_conversion_rate = 0.5
//
// 0.5 coins = €1
// 1 coin = €2
const oneCoinFiatValue = computed(() => {
  if (!creditsConversionRate.value) {
    return 0
  }

  return selectedCurrencyRate.value / creditsConversionRate.value
})

// Used only for the small conversion label:
//
// 0.5 coins = €1
const creditsPerSelectedFiat = computed(() => {
  if (!selectedCurrencyRate.value) {
    return 0
  }

  return Number(
    (creditsConversionRate.value / selectedCurrencyRate.value).toFixed(4),
  )
})

const selectedAmountNumber = computed(() => {
  const amount = Number(selectedAmount.value)

  return Number.isFinite(amount) ? amount : 0
})

const creditsToFiat = credits => {
  const amount = Number(credits) || 0

  return Number((amount * oneCoinFiatValue.value).toFixed(2))
}

const withdrawAmountInFiat = computed(() => {
  return creditsToFiat(selectedAmountNumber.value)
})

const isValidAmount = computed(() => {
  const amount = selectedAmountNumber.value

  if (!amount) {
    return false
  }

  if (amount <= 0) {
    return false
  }

  if (amount > numericBalance.value) {
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

  if (amount > numericBalance.value) {
    amountError.value = t('Amount must be smaller than your balance')
    return
  }

  amountError.value = ''
}

const openWithdrawModal = () => {
  validateAmount(selectedAmount.value)

  if (!isValidAmount.value) {
    toast.warning(amountError.value || t('Please enter a valid amount'))
    return
  }

  payoutStore.clearError?.()

  modalStore.open?.('withdraw')
}

const closeWithdrawModal = () => {
  modalStore.close?.('withdraw')
}

const handleWithdrawSuccess = async () => {
  closeWithdrawModal()

  payoutStore.resetFormData?.()

  selectedAmount.value = null

  try {
    await userStore.fetchProfile?.()
  } catch (error) {
    console.error(error)
  }

  toast.success(t('Withdraw request submitted'))
}

watch(
  () => selectedAmount.value,
  value => {
    validateAmount(value)
  },
)

watch(
  () => balanceInternal.value,
  () => {
    validateAmount(selectedAmount.value)
  },
)

watch(
  () => [selectedCurrencyRate.value, creditsConversionRate.value],
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

.withdraw {
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
    align-items: center;

    gap: 6px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }

    &-label {
      color: var(--seconday-color);
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
    width: 100%;

    :deep(.base-input__control) {
      padding-right: 145px !important;
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
    width: 16px;
    height: 16px;
  }

  &__submit {
    min-width: 90px;

    text-transform: uppercase;

    font-family: var(--font-condensed);
    font-weight: 700;
  }
}
</style>
