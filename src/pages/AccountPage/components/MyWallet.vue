<template>
  <div class="wallet">
    <div class="wallet__grid">
      <div class="wallet__column">
        <h2 class="wallet__column-title _h6">
          {{ $t('Balance') }}
        </h2>

        <div class="wallet__frame">
          <div class="wallet__box balance-card">
            <div class="balance-card__header">
              <SvgIcon
                :icon="WalletDropdownIcon"
                class="balance-card__wallet-icon"
              />

              <div class="balance-card__amount">
                <PriceFormatter
                  :price="userStore.userBalance"
                  size="size-64"
                  :balance="true"
                />
              </div>
            </div>

            <div class="balance-card__divider" />

            <div class="balance-card__rate">
              <div class="balance-card__rate-info">
                <span>{{ $t('Rate') }}:</span>

                <PriceFormatter :price="1" size="size-14" />

                <span>=</span>

                <span>
                  {{ oneInternalUnitInFiat }}
                  {{ currencyStore.currentCurrencySymbol }}
                </span>
              </div>

              <div class="balance-card__fiat">
                {{ balanceInFiatCurrency }}
                {{ currencyStore.currentCurrencySymbol }}
              </div>
            </div>

            <BaseButton
              v-if="offersEnabled"
              type="button"
              class="balance-card__withdraw"
              variant="bordered"
              @click="modalStore.open('contactInfo')"
            >
              {{ $t('Withdraw') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <div class="wallet__column">
        <h2 class="wallet__column-title _h6">
          {{ $t('Top Up Balance') }}
        </h2>

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
                  :class="{
                    'top-up__option_active':
                      selectedPresetEur === option.eurAmount,
                  }"
                  :aria-pressed="selectedPresetEur === option.eurAmount"
                  @click="selectTopUpOption(option)"
                >
                  {{ formatOptionAmount(option.convertedAmount) }}
                  {{ currencyStore.currentCurrencySymbol }}
                </button>
              </div>

              <p class="top-up__description top-up__description_custom">
                {{ $t('Or enter personal amount:') }}
              </p>

              <div class="top-up__form">
                <BaseInput
                  v-model="fiatAmount"
                  class="top-up__input"
                  :label="$t('Amount')"
                  inputmode="decimal"
                  @input="handleCustomAmountInput"
                >
                  <template #suffix>
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

              <p class="top-up__minimum">
                {{ $t('Min') }}
                {{ currencyStore.currentCurrencySymbol }}
                {{ minAmountInFiatCurrency }}
              </p>

              <div v-if="fiatAmount" class="top-up__conversion">
                <span>{{ $t('You will receive') }}:</span>

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
import TopUpModal from '@/components/modals/TopUpModal.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { WalletDropdownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useToast } from '@/composables/useToast'
import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const BASE_TOP_UP_OPTIONS = [10, 25, 50, 100, 250, 500, 750, 1000]

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
  return BASE_TOP_UP_OPTIONS.map(eurAmount => ({
    eurAmount,
    convertedAmount: eurAmount * currencyRate.value,
  }))
})

const oneInternalUnitInFiat = computed(() => {
  return (internalCurrencyEurRate.value * currencyRate.value).toFixed(2)
})

const balanceInFiatCurrency = computed(() => {
  const internalBalance = normalizeNumber(userStore.userBalance, 0)

  return (
    internalBalance *
    internalCurrencyEurRate.value *
    currencyRate.value
  ).toFixed(2)
})

const minAmountInFiatCurrency = computed(() => {
  return (
    minimumInternalAmount.value *
    internalCurrencyEurRate.value *
    currencyRate.value
  ).toFixed(2)
})

const normalizedFiatAmount = computed(() => {
  return normalizeNumber(fiatAmount.value, 0)
})

const internalTopUpAmount = computed(() => {
  const conversionRate = internalCurrencyEurRate.value * currencyRate.value

  if (conversionRate <= 0) {
    return 0
  }

  return Number((normalizedFiatAmount.value / conversionRate).toFixed(2))
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
    @include adaptiveValue('gap', 14, 12);

    display: grid;
    align-items: stretch;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    width: 100%;
    min-width: 0;
  }

  &__column {
    display: flex;
    flex-direction: column;

    min-width: 0;
  }

  &__column-title {
    color: var(--primary-color);
    font-weight: 500;
    line-height: 120%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__frame {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-width: 0;

    border: 1px solid var(--border-fourth-color);
    border-radius: 12px;
    background: var(--bg-third-color);
  }

  &__box {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  @media (max-width: $md4) {
    &__grid {
      gap: 28px;
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: $md6) {
    &__frame {
      min-height: 0;
    }
  }
}

.balance-card {
  @include adaptiveValue('padding-top', 32, 10);
  @include adaptiveValue('padding-right', 46, 10);
  @include adaptiveValue('padding-bottom', 32, 10);
  @include adaptiveValue('padding-left', 46, 10);

  display: flex;
  flex-direction: column;
  align-items: stretch;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;

    width: 100%;
    min-width: 0;
  }

  &__wallet-icon {
    @include adaptiveValue('width', 64, 34);
    @include adaptiveValue('height', 64, 34);

    flex: 0 0 auto;

    opacity: 0.5;

    color: var(--secondary-color);
  }

  &__amount {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    min-width: 0;

    :deep(.price) {
      flex-direction: row-reverse;

      color: var(--primary-color);
    }
  }

  &__divider {
    @include adaptiveValue('margin-top', 32, 18);
    @include adaptiveValue('margin-bottom', 24, 18);
    width: 100%;
    height: 1px;

    background-color: var(--border-priamry-color);
  }

  &__rate {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;

    width: 100%;
    min-width: 0;
  }

  &__rate-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;

    min-width: 0;

    color: var(--seventh-color);
    font-family: var(--font-inter);
    font-size: 14px;
  }

  &__fiat {
    flex: 0 0 auto;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-align: right;
    white-space: nowrap;
  }

  &__withdraw {
    @include adaptiveValue('margin-top', 46, 20);
    align-self: flex-end;

    width: 100%;
    max-width: 110px;

    margin-left: auto;

    :deep(button) {
      width: 100%;
    }
  }

  @media (max-width: $md6) {
    &__header {
      gap: 10px;
    }

    &__rate {
      flex-wrap: wrap;
    }

    &__withdraw {
      margin-top: 28px;
    }
  }
}

.top-up {
  @include adaptiveValue('padding-top', 32, 10);
  @include adaptiveValue('padding-right', 46, 10);
  @include adaptiveValue('padding-bottom', 32, 10);
  @include adaptiveValue('padding-left', 46, 10);

  display: flex;
  flex-direction: column;

  &__content {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__description {
    margin: 0;

    opacity: 0.7;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }

    &_custom {
      @include adaptiveValue('margin-top', 24, 20);

      &:not(:last-child) {
        margin-bottom: 14px;
      }
    }
  }

  &__options {
    display: grid;
    gap: 7px;
    grid-template-columns: repeat(4, minmax(0, 1fr));

    width: 100%;
    min-width: 0;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;
    min-height: 40px;

    padding: 7px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;
    background: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;
    white-space: nowrap;

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease;

    &_active {
      border-color: transparent;
      background-color: var(--sixth-color);

      color: var(--primary-color);
    }

    &:focus-visible {
      outline: 1px solid var(--sixth-color);
      outline-offset: 2px;
    }

    @media (any-hover: hover) {
      &:not(&_active):hover {
        border-color: var(--sixth-color);
        background-color: rgb(143 110 226 / 18%);
      }
    }
  }

  &__form {
    display: grid;
    align-items: end;
    gap: 8px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    width: 100%;
    min-width: 0;
  }

  &__input {
    width: 100%;
    min-width: 0;
  }

  &__currency {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
  }

  &__submit {
    width: 100%;
    min-width: 0;
    min-height: 35px;

    margin-bottom: 0;

    :deep(button) {
      width: 100%;
      min-height: 35px;
    }
  }

  &__minimum {
    margin: 12px 0 0;

    color: var(--seventh-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.4;
  }

  &__conversion {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;

    margin-top: 16px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;

    :deep(.price) {
      color: var(--hint-secondary-color);
    }

    :deep(.price__number) {
      font-family: var(--font-inter);
      font-size: 14px;
    }

    :deep(.price__image) {
      width: 18px;
      min-width: 18px;
      height: 18px;
    }
  }

  &__error {
    margin: 14px 0 0;
    padding: 10px 12px;

    border: 1px solid rgb(192 67 113 / 35%);
    border-radius: 5px;
    background: rgb(192 67 113 / 8%);

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 1.5;
  }

  @media (max-width: 1199.98px) and (min-width: $md4) {
    &__options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $md6) {
    &__options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__form {
      grid-template-columns: 1fr;
    }

    &__submit {
      margin-top: 4px;
    }
  }
}
</style>
