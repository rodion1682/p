<template>
  <div class="withdraw">
    <div class="withdraw__balance">
      <span class="withdraw__label"> {{ $t('Withdraw Balance') }}: </span>

      <PriceFormatter
        class="withdraw__balance-price"
        :price="numericBalance"
        size="size-20"
        skip-conversion
      />
    </div>

    <div class="withdraw__main">
      <h2 class="withdraw__title">
        {{ $t('Withdraw') }}
      </h2>

      <div class="withdraw__controls">
        <div class="withdraw__conversion">
          <PriceFormatter
            :price="creditsPerSelectedFiat"
            size="size-12"
            skip-conversion
          />

          <span class="withdraw__conversion-equals"> = </span>

          <PriceFormatter
            :price="1"
            :currency-code="currencyStore.currentCurrencyCode"
            is-currency
            raw-fiat
            skip-conversion
            size="size-12"
          />
        </div>

        <form class="withdraw__form" @submit.prevent="openWithdrawModal">
          <BaseInput
            v-model="selectedAmount"
            class="withdraw__input"
            type="number"
            inputmode="decimal"
            min="0"
            step="any"
            placeholder="0.00"
            variant="checkout"
            :disabled="payoutStore.isLoading"
            :aria-label="$t('Withdrawal amount')"
            @blur="validateAmount(selectedAmount)"
          >
            <template #prefix>
              <SvgIcon :icon="CoinIcon" class="withdraw__input-icon" />
            </template>

            <template #suffix>
              <BaseButton
                type="submit"
                class="withdraw__submit"
                variant="primary"
                :disabled="!isValidAmount || payoutStore.isLoading"
              >
                {{ $t('Withdraw') }}
              </BaseButton>
            </template>
          </BaseInput>
        </form>
      </div>

      <div
        v-if="selectedAmountNumber > 0 && isValidAmount"
        class="withdraw__total"
      >
        <span class="withdraw__total-label">
          {{ $t('You will get:') }}
        </span>

        <PriceFormatter
          :price="withdrawAmountInFiat"
          :currency-code="currencyStore.currentCurrencyCode"
          is-currency
          raw-fiat
          skip-conversion
          size="size-12"
          class="withdraw__total-price"
        />
      </div>

      <p v-if="amountError" class="withdraw__error _text-error" role="alert">
        {{ amountError }}
      </p>
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

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import WithdrawModal from '@/components/modals/WithdrawModal.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

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

const { payoutBalance, payoutBalanceInternal } = storeToRefs(userStore)

const selectedAmount = ref('')
const amountError = ref('')

const withdrawModalIsVisible = computed(() => {
  return modalStore.isOpen('withdraw')
})

const numericBalance = computed(() => {
  const rawBalance = settingsStore.creditsEnabled
    ? payoutBalanceInternal.value
    : payoutBalance.value

  const value = Number(rawBalance)

  return Number.isFinite(value) ? Math.max(0, value) : 0
})

const selectedCurrencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const creditsConversionRate = computed(() => {
  return Number(settingsStore.creditsConversionRate || 0)
})

const oneCoinFiatValue = computed(() => {
  if (!settingsStore.creditsEnabled) return 1

  if (creditsConversionRate.value <= 0) return 0

  return selectedCurrencyRate.value / creditsConversionRate.value
})

const creditsPerSelectedFiat = computed(() => {
  if (selectedCurrencyRate.value <= 0) {
    return 0
  }

  return Number(
    (creditsConversionRate.value / selectedCurrencyRate.value).toFixed(4),
  )
})

const selectedAmountNumber = computed(() => {
  if (selectedAmount.value === '') {
    return 0
  }

  const value = Number(selectedAmount.value)

  return Number.isFinite(value) ? value : 0
})

const withdrawAmountInFiat = computed(() => {
  return Number(
    (selectedAmountNumber.value * oneCoinFiatValue.value).toFixed(2),
  )
})

const isValidAmount = computed(() => {
  const amount = selectedAmountNumber.value

  return (
    selectedAmount.value !== '' &&
    Number.isFinite(amount) &&
    amount > 0 &&
    amount <= numericBalance.value &&
    oneCoinFiatValue.value > 0
  )
})

const validateAmount = value => {
  if (value === '' || value === null || value === undefined) {
    amountError.value = ''
    return
  }

  const amount = Number(value)

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

  if (oneCoinFiatValue.value <= 0) {
    amountError.value = t('Currency conversion is unavailable')
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

  modalStore.open('withdraw')
}

const closeWithdrawModal = () => {
  modalStore.close('withdraw')
}

const handleWithdrawSuccess = async () => {
  closeWithdrawModal()

  payoutStore.resetFormData?.()

  selectedAmount.value = ''
  amountError.value = ''

  try {
    await userStore.fetchProfile()
  } catch (error) {
    console.error(error)
  }

  toast.success(t('Withdraw request submitted'))
}

watch(selectedAmount, value => {
  validateAmount(value)
})

watch(numericBalance, () => {
  validateAmount(selectedAmount.value)
})

watch([selectedCurrencyRate, creditsConversionRate], () => {
  validateAmount(selectedAmount.value)
})

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

.withdraw {
  display: grid;
  grid-template-columns:
    minmax(0, 40%)
    minmax(0, 60%);

  align-items: stretch;

  width: 100%;
  min-width: 0;

  &__balance {
    display: flex;
    flex-direction: column;
    justify-content: center;

    min-width: 0;
    gap: 16px;

    @include adaptiveValue('padding-right', 20, 12);
  }

  &__label {
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.4;

    text-transform: uppercase;
  }

  &__balance-price {
    justify-content: flex-start;
    min-width: 0;

    :deep(.price__icon) {
      width: 30px;
      min-width: 30px;
      height: 30px;
    }

    :deep(.price__value) {
      color: var(--primary-color);

      font-family: var(--font-inter);
      font-size: 30px;
      font-weight: 500;
      line-height: 1;
    }
  }

  &__main {
    display: flex;
    flex-direction: column;
    justify-content: center;

    min-width: 0;

    @include adaptiveValue('padding-left', 20, 12);

    border-left: 1px solid var(--border-primary-color);
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-akshar);
    font-size: 21px;
    font-weight: 700;
    line-height: 1.2;

    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 12);
    }
  }

  &__controls {
    display: flex;
    align-items: center;

    width: 100%;
    min-width: 0;
    gap: 14px;
  }

  &__conversion {
    display: flex;
    flex: 0 0 auto;
    align-items: center;

    min-width: 0;
    gap: 5px;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 11px;
    line-height: 1.3;

    :deep(.price) {
      gap: 4px;
    }

    :deep(.price__value),
    :deep(.price__currency) {
      color: var(--hint-third-color);
      font-size: 11px;
      font-weight: 500;
    }

    :deep(.price__icon) {
      width: 12px;
      min-width: 12px;
      height: 12px;
    }
  }

  &__conversion-equals {
    color: var(--hint-third-color);
  }

  &__form {
    flex: 1 1 auto;

    width: 100%;
    min-width: 0;
  }

  &__input {
    width: 100%;
    min-width: 0;

    :deep(.base-input) {
      min-height: 44px;

      border: 1px solid var(--border-primary-color);
      border-radius: 5px;

      background-color: var(--bg-third-color);
    }

    :deep(.base-input__control) {
      width: 100%;
      min-width: 0;
      min-height: 42px;

      padding-top: 0;
      padding-left: 39px;
      padding-right: 105px;

      color: var(--primary-color);

      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 500;

      font-variant-numeric: tabular-nums;
    }

    :deep(.base-input__prefix) {
      left: 10px;
    }

    :deep(.base-input__suffix) {
      right: 5px;
    }

    :deep(.base-input__placeholder) {
      display: none;
    }

    :deep(.base-input__control::placeholder) {
      color: var(--hint-third-color);
      opacity: 1;
    }
  }

  &__input-icon {
    width: 16px;
    min-width: 16px;
    height: 16px;
  }

  &__submit {
    width: auto;
    min-width: 85px;
    min-height: 32px;

    padding: 7px 12px;

    border-radius: 4px;

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;

    text-transform: uppercase;
  }

  &__total {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    min-width: 0;
    gap: 6px;

    margin-top: 9px;
  }

  &__total-label {
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 400;
  }

  &__total-price {
    color: var(--primary-color);

    :deep(.price__value),
    :deep(.price__currency) {
      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 600;
    }
  }

  &__error {
    margin-top: 8px;

    font-family: var(--font-inter);
    font-size: 11px;
    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  @media (max-width: 1200px) {
    &__controls {
      flex-wrap: wrap;
      gap: 10px;
    }

    &__conversion {
      width: 100%;
    }
  }

  @media (max-width: $md4) {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;

    &__balance {
      padding-right: 0;
      gap: 10px;
    }

    &__main {
      padding-left: 0;
      padding-top: 16px;

      border-left: 0;
      border-top: 1px solid var(--border-primary-color);
    }

    &__controls {
      flex-wrap: nowrap;
    }

    &__conversion {
      width: auto;
    }
  }

  @media (max-width: $md6) {
    &__controls {
      flex-wrap: wrap;
    }

    &__conversion {
      width: 100%;
    }

    &__form {
      width: 100%;
    }

    &__balance-price {
      :deep(.price__value) {
        font-size: 27px;
      }
    }
  }
}
</style>
