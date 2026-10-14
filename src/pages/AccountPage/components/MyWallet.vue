<template>
  <div class="wallet">
    <div class="wallet__grid">
      <div class="wallet__column">
        <div class="wallet__column-title _h4">
          {{ $t('Balance') }}
        </div>

        <div class="wallet__frame">
          <div class="wallet__box balance-card">
            <div class="balance-card__amount">
              <PriceFormatter
                :price="userStore.userBalance"
                size="size-64"
                :balance="true"
              />
            </div>

            <div class="balance-card__divider" />

            <div class="balance-card__rate">
              <div class="balance-card__rate-row">
                <div class="balance-card__rate-info">
                  <span>{{ $t('Rate') }}:</span>

                  <PriceFormatter size="size-14" :price="1" />

                  <span>=</span>

                  <span>
                    {{ currencyStore.currentCurrencySymbol }}
                    {{ oneInternalUnitInFiat }}
                  </span>
                </div>

                <div class="balance-card__fiat">
                  =
                  {{ currencyStore.currentCurrencySymbol }}
                  {{ balanceInFiatCurrency }}
                </div>
              </div>
            </div>

            <BaseButton
              v-if="offersEnabled"
              type="button"
              class="balance-card__withdraw"
              variant="hint-bordered"
              @click="modalStore.open('contactInfo')"
            >
              {{ $t('Withdraw') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <div class="wallet__column">
        <div class="wallet__column-title _h4">
          {{ $t('Top Up Balance') }}
        </div>

        <div class="wallet__frame">
          <div class="wallet__box top-up">
            <div class="top-up__content">
              <p class="top-up__description">
                {{ $t('Choose a convenient payment amount:') }}
              </p>

              <div class="top-up__options">
                <button
                  v-for="option in convertedTopUpOptions"
                  :key="option.eurAmount"
                  type="button"
                  class="top-up__option"
                  :class="
                    selectedPresetEur === option.eurAmount
                      ? 'top-up__option_active'
                      : ''
                  "
                  :aria-pressed="selectedPresetEur === option.eurAmount"
                  @click="selectTopUpOption(option)"
                >
                  {{ currencyStore.currentCurrencySymbol }}
                  {{ formatOptionAmount(option.convertedAmount) }}
                </button>
              </div>

              <p class="top-up__description top-up__description_custom">
                {{ $t('Or enter personal amount:') }}
              </p>

              <div class="top-up__form">
                <BaseInput
                  v-model="fiatAmount"
                  class="top-up__input"
                  inputmode="decimal"
                  :placeholder="$t('Amount')"
                  @input="handleCustomAmountInput"
                >
                  <template #prefix>
                    <span class="top-up__currency">
                      {{ currencyStore.currentCurrencySymbol }}
                    </span>
                  </template>
                </BaseInput>

                <BaseButton
                  type="button"
                  class="top-up__submit"
                  :disabled="!canOpenTopUp"
                  @click="openTopUpModal"
                >
                  {{ $t('Pay') }}
                </BaseButton>
              </div>

              <div class="top-up__minimum">
                {{ $t('Min') }}
                {{ currencyStore.currentCurrencySymbol }}
                {{ minAmountInFiatCurrency }}
              </div>

              <div v-if="fiatAmount" class="top-up__conversion">
                <span> {{ $t('You will receive') }}: </span>

                <PriceFormatter :price="internalTopUpAmount" size="size-20" />
              </div>

              <p v-if="validationMessage" class="top-up__error" role="alert">
                {{ validationMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TopUpModal
      :show="modalStore.isOpen('topup')"
      :initial-amount="internalTopUpAmount"
      :fiat-amount="amountInFiatCurrency"
      @close="handleTopUpClose"
      @proceed-to-checkout="handleProceedToCheckout"
    />

    <SellSkinsModal
      v-if="offersEnabled"
      :show="modalStore.isOpen('sellSkins')"
      @close="handleSellSkinsClose"
    />

    <SellConfirmationModal
      v-if="offersEnabled"
      :show="modalStore.isOpen('sellConfirmation')"
      @close="handleSellConfirmationClose"
    />

    <ContactInfoModal
      v-if="offersEnabled"
      :show="modalStore.isOpen('contactInfo')"
      @close="handleContactInfoClose"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import ContactInfoModal from '@/components/modals/sellSkins/ContactInfoModal.vue'
import SellConfirmationModal from '@/components/modals/sellSkins/SellConfirmationModal.vue'
import SellSkinsModal from '@/components/modals/sellSkins/SellSkinsModal.vue'
import TopUpModal from '@/components/modals/TopUpModal.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'

import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const BASE_TOP_UP_OPTIONS = [10, 50, 100, 250, 500, 1000]

const userStore = useUserStore()
const modalStore = useModalStore()
const currencyStore = useCurrencyStore()
const settingsStore = useSettingsStore()

const toast = useToast()
const { t } = useI18n()

const fiatAmount = ref('')
const selectedPresetEur = ref(null)
const validationMessage = ref('')

const normalizeNumber = (value, fallback = 0) => {
  const normalizedValue =
    typeof value === 'string' ? value.replace(',', '.').trim() : value

  const number = Number(normalizedValue)

  return Number.isFinite(number) ? number : fallback
}

const currencyRate = computed(() => {
  return normalizeNumber(currencyStore.currentCurrency?.value, 1)
})

const internalCurrencyEurRate = computed(() => {
  return normalizeNumber(
    settingsStore.settings?.internal_currency?.exchange_rate_eur,
    1,
  )
})

const minimumInternalAmount = computed(() => {
  return normalizeNumber(settingsStore.settings?.min_order_amount, 0)
})

const offersEnabled = computed(() => {
  return Boolean(settingsStore.settings?.payouts?.offer_enabled)
})

const convertedTopUpOptions = computed(() => {
  return BASE_TOP_UP_OPTIONS.map(eurAmount => {
    return {
      eurAmount,
      convertedAmount: eurAmount * currencyRate.value,
    }
  })
})

const oneInternalUnitInFiat = computed(() => {
  const convertedRate = internalCurrencyEurRate.value * currencyRate.value

  return convertedRate.toFixed(2)
})

const balanceInFiatCurrency = computed(() => {
  const internalBalance = normalizeNumber(userStore.userBalance, 0)

  const fiatBalance =
    internalBalance * internalCurrencyEurRate.value * currencyRate.value

  return fiatBalance.toFixed(2)
})

const minAmountInFiatCurrency = computed(() => {
  const minimumFiatAmount =
    minimumInternalAmount.value *
    internalCurrencyEurRate.value *
    currencyRate.value

  return minimumFiatAmount.toFixed(2)
})

const normalizedFiatAmount = computed(() => {
  return normalizeNumber(fiatAmount.value, 0)
})

const internalTopUpAmount = computed(() => {
  const conversionRate = internalCurrencyEurRate.value * currencyRate.value

  if (conversionRate <= 0) {
    return 0
  }

  const internalAmount = normalizedFiatAmount.value / conversionRate

  return Number(internalAmount.toFixed(2))
})

const amountInFiatCurrency = computed(() => {
  return normalizedFiatAmount.value.toFixed(2)
})

const canOpenTopUp = computed(() => {
  const minimum = Number(minAmountInFiatCurrency.value)

  return normalizedFiatAmount.value > 0 && normalizedFiatAmount.value >= minimum
})

const formatOptionAmount = value => {
  const amount = normalizeNumber(value, 0)

  if (Number.isInteger(amount)) {
    return amount.toLocaleString()
  }

  return amount.toFixed(2)
}

const selectTopUpOption = option => {
  selectedPresetEur.value = option.eurAmount

  fiatAmount.value = Number(option.convertedAmount.toFixed(2))

  validationMessage.value = ''
}

const handleCustomAmountInput = () => {
  selectedPresetEur.value = null
  validationMessage.value = ''
}

const validateTopUpAmount = () => {
  if (normalizedFiatAmount.value <= 0) {
    return t('Please enter a valid amount')
  }

  const minimum = Number(minAmountInFiatCurrency.value)

  if (normalizedFiatAmount.value < minimum) {
    return `${t('Minimum top up amount is')} ${
      currencyStore.currentCurrencySymbol
    }${minimum.toFixed(2)}`
  }

  return ''
}

const openTopUpModal = () => {
  validationMessage.value = validateTopUpAmount()

  if (validationMessage.value) {
    toast.warning(validationMessage.value)

    return
  }

  modalStore.close('checkout')
  modalStore.open('topup')
}

const handleTopUpClose = () => {
  modalStore.close('topup')
}

const handleProceedToCheckout = () => {
  modalStore.close('topup')
  modalStore.open('checkout')
}

const handleSellSkinsClose = () => {
  modalStore.close('sellSkins')
}

const handleSellConfirmationClose = () => {
  modalStore.close('sellConfirmation')
}

const handleContactInfoClose = () => {
  modalStore.close('contactInfo')
}

watch(currencyRate, (nextRate, previousRate) => {
  if (
    !normalizedFiatAmount.value ||
    !previousRate ||
    nextRate === previousRate
  ) {
    return
  }

  const amountInEur = normalizedFiatAmount.value / previousRate

  fiatAmount.value = Number((amountInEur * nextRate).toFixed(2))

  validationMessage.value = ''
})
</script>

<style lang="scss" scoped>
.wallet {
  width: 100%;
  min-width: 0;

  &__grid {
    display: flex;
    align-items: stretch;
    gap: 16px;

    width: 100%;
  }

  &__column {
    display: flex;
    flex: 0 1 50%;
    flex-direction: column;

    min-width: 0;

    &-title {
      color: var(--primary-color);
      font-weight: 400;
      text-align: left;
      text-transform: capitalize;

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 24, 15);
      }
    }
  }

  &__frame {
    display: flex;
    flex: 1 1 auto;

    width: 100%;
    min-width: 0;

    border: 1px solid var(--border-sixth-color);
    background-color: var(--bg-primary-color);
  }

  &__box {
    width: 100%;
    min-width: 0;
    height: 100%;
  }

  @media (max-width: $md3) {
    &__grid {
      flex-direction: column;
    }

    &__column {
      flex: 1 1 auto;
    }
  }

  @media (max-width: $md5) {
    &__frame {
      width: calc(100% + 20px);

      margin-right: -10px;
      margin-left: -10px;
    }
  }
}

.balance-card {
  @include adaptiveValue('padding-top', 44, 25);
  @include adaptiveValue('padding-bottom', 32, 25);
  @include adaptiveValue('padding-left', 48, 15);
  @include adaptiveValue('padding-right', 48, 15);

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  min-height: 280px;

  &__amount {
    display: flex;
    align-items: center;

    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 24);
    }

    :deep(.price) {
      flex-direction: row-reverse;
      justify-content: flex-start;
    }

    :deep(.price__number) {
      font-family: var(--font-spectral);
      font-weight: 600;
    }
  }

  &__divider {
    width: 100%;
    height: 1px;

    background-color: var(--border-secondary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 16);
    }
  }

  &__rate {
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 36, 25);
    }
  }

  &__rate-row {
    display: flex;
    align-items: center;
    gap: 20px;

    width: 100%;
  }

  &__rate-info {
    @include adaptiveValue('margin-right', 40, 0);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 17px;
  }

  &__fiat {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 17px;
    white-space: nowrap;
  }

  &__withdraw {
    width: 100%;
    max-width: 163px;

    margin-top: auto;

    font-family: var(--font-spectral);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
  }

  @media (max-width: $md5) {
    min-height: auto;

    &__rate-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }

  @media (max-width: $md7) {
    &__withdraw {
      max-width: none;
    }
  }
}

.top-up {
  @include adaptiveValue('padding-top', 32, 25);
  @include adaptiveValue('padding-bottom', 32, 25);
  @include adaptiveValue('padding-left', 48, 15);
  @include adaptiveValue('padding-right', 48, 15);

  display: flex;
  flex-direction: column;

  min-height: 280px;

  &__content {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__description {
    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 150%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 15);
    }

    &_custom {
      margin-top: 20px;
    }
  }

  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    width: 100%;
  }

  &__option {
    flex: 1 1 calc(16.666% - 8px);

    min-width: 72px;
    min-height: 40px;

    padding: 6px 10px;

    border: 1px solid var(--hint-fifth-color);
    outline: none;
    background-color: transparent;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: 13px;
    font-weight: 600;
    line-height: 120%;
    white-space: nowrap;

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease,
      opacity 0.3s ease;

    &_active {
      border-color: var(--hint-secondary-color);
      background: var(--primary-gradient);

      color: var(--primary-color);
    }

    &:focus-visible {
      border-color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:not(&_active):hover {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__form {
    display: flex;
    align-items: stretch;
    gap: 8px;

    width: 100%;
  }

  &__input {
    min-width: 0;
    max-width: 190px;
  }

  &__currency {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
  }

  &__submit {
    flex: 0 0 165px;

    width: 165px;
    min-height: 40px;

    font-family: var(--font-spectral);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__minimum {
    margin-top: 8px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 11px;
    line-height: 140%;
  }

  &__conversion {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;

    margin-top: 14px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 12px;

    :deep(.price) {
      color: var(--hint-secondary-color);
    }
  }

  &__error {
    margin: 14px 0 0;
    padding: 9px 11px;

    border: 1px solid rgb(192 67 113 / 35%);
    background-color: rgb(192 67 113 / 8%);

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 140%;
  }

  :deep(.base-input__control) {
    min-height: 40px;

    border-color: var(--border-third-color);
    background-color: var(--bg-fourth-color);
  }

  :deep(.base-input__control:focus) {
    border-color: var(--hint-secondary-color);
  }

  @media (max-width: $md2) {
    &__option {
      flex-basis: calc(33.333% - 8px);
    }
  }

  @media (max-width: $md5) {
    &__form {
      flex-wrap: wrap;
    }

    &__input {
      flex: 1 1 100%;
    }

    &__submit {
      flex: 1 1 100%;

      width: 100%;
    }
  }

  @media (max-width: $md7) {
    &__option {
      flex-basis: calc(50% - 8px);

      min-height: 42px;
    }
  }
}
</style>
