<template>
  <div class="balance" v-bind="attrs">
    <div class="balance__card balance__card_wallet">
      <h2 class="balance__title">
        {{ $t('My Balance') }}
      </h2>

      <div class="balance__amount">
        <SvgIcon :icon="WalletIcon" class="balance__wallet-icon" />

        <PriceFormatter
          :price="formattedBalance"
          skip-conversion
          size="size-32"
          class="balance__balance-price"
        />
      </div>

      <BaseButton
        v-if="canWithdraw"
        type="button"
        variant="white-bordered"
        class="balance__withdraw"
        @click="emit('withdraw')"
      >
        {{ $t('Withdraw') }}
      </BaseButton>
    </div>

    <div class="balance__card balance__card_topup">
      <h2 class="balance__title">
        {{ $t('Top Up Balance') }}
      </h2>

      <div class="balance__form">
        <div class="balance__label">{{ $t('Choose amount') }}:</div>

        <div class="balance__options">
          <button
            v-for="option in amountOptions"
            :key="option.baseAmount"
            type="button"
            class="balance__option"
            :class="{
              'is-active': isSelectedAmount(option.amount),
            }"
            :aria-pressed="isSelectedAmount(option.amount)"
            :disabled="isLoading"
            @click="selectAmount(option.amount)"
          >
            {{ option.label }}
            {{ currentCurrencySymbol }}
          </button>
        </div>

        <div class="balance__custom">
          <div class="balance__label">{{ $t('or enter your amount') }}:</div>

          <div class="balance__row">
            <BaseInput
              v-model="selectedAmount"
              class="balance__input"
              type="number"
              inputmode="decimal"
              min="0"
              step="0.01"
              :placeholder="$t('0')"
              :empty="true"
              :disabled="isLoading"
              @blur="validateOnBlur"
            >
              <template #suffix>
                <span class="balance__currency">
                  {{ currentCurrencySymbol }}
                </span>
              </template>
            </BaseInput>

            <div class="balance__conversion">
              <span class="balance__rate">
                {{ formattedCurrencyRate }}
                {{ currentCurrencySymbol }}
              </span>

              <span class="balance__equals">=</span>

              <PriceFormatter
                :price="1"
                skip-conversion
                class="balance__conversion-price"
              />
            </div>
          </div>
        </div>

        <div v-if="minTopupAmount > 0" class="balance__minimum">
          {{ $t('Minimal deposit is') }}
          <span>
            {{ formatAmount(minTopupAmount) }}
            {{ currentCurrencySymbol }}.
          </span>
        </div>

        <div
          v-if="shouldShowAmountError"
          class="balance__error _text-error"
          role="alert"
        >
          {{ amountError }}
        </div>

        <BaseButton
          type="button"
          variant="primary"
          class="balance__submit"
          :disabled="!isValidAmount || isLoading"
          @click="openTopUpModal"
        >
          {{ $t('Top Up Balance') }}
        </BaseButton>
      </div>
    </div>
  </div>

  <TopUpModal
    :show="isTopUpModalOpen"
    :selected-amount="Number(selectedAmount)"
    @close="closeTopUpModal"
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

import { WalletIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useToast } from '@/composables/useToast'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  canWithdraw: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['withdraw'])

const attrs = useAttrs()
const { t } = useI18n()
const toast = useToast()

const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()

const { currentCurrency, currentCurrencyCode, currentCurrencySymbol } =
  storeToRefs(currencyStore)

const { userBalance } = storeToRefs(userStore)

const BASE_AMOUNTS = [5, 25, 50, 100, 150, 200]

const selectedAmount = ref('')
const amountError = ref('')
const amountTouched = ref(false)
const isTopUpModalOpen = ref(false)

const isLoading = computed(() => settingsStore.loading)

const formattedBalance = computed(() => {
  return Number(userBalance.value || 0).toFixed(2)
})

const currencyRate = computed(() => {
  const value = Number(currentCurrency.value?.value)

  return Number.isFinite(value) && value > 0 ? value : 1
})

const formattedCurrencyRate = computed(() => {
  return currencyStore.formatFiat(currencyRate.value, currentCurrencyCode.value)
})

const minTopupAmount = computed(() => {
  return Number(settingsStore.minTopUpAmount || 0)
})

const maxTopupAmount = computed(() => {
  return Number(settingsStore.maxTopUpAmount || 0)
})

const formatAmount = amount => {
  return currencyStore.formatFiat(
    Number(amount || 0),
    currentCurrencyCode.value,
  )
}

const amountOptions = computed(() => {
  const options = BASE_AMOUNTS.map(baseAmount => {
    const amount = Number(formatAmount(baseAmount * currencyRate.value))

    return {
      baseAmount,
      amount,
      label: formatAmount(amount),
    }
  })

  return options.filter((option, index, items) => {
    if (minTopupAmount.value > 0 && option.amount < minTopupAmount.value) {
      return false
    }

    if (maxTopupAmount.value > 0 && option.amount > maxTopupAmount.value) {
      return false
    }

    return items.findIndex(item => item.amount === option.amount) === index
  })
})

const numericAmount = computed(() => {
  if (selectedAmount.value === '' || selectedAmount.value === null) {
    return null
  }

  const value = Number(selectedAmount.value)

  return Number.isFinite(value) ? value : null
})

const isValidAmount = computed(() => {
  const amount = numericAmount.value

  if (amount === null || amount <= 0) return false

  if (minTopupAmount.value > 0 && amount < minTopupAmount.value) {
    return false
  }

  if (maxTopupAmount.value > 0 && amount > maxTopupAmount.value) {
    return false
  }

  return true
})

const shouldShowAmountError = computed(() => {
  return amountTouched.value && Boolean(amountError.value)
})

const isSelectedAmount = amount => {
  return (
    numericAmount.value !== null &&
    Math.abs(numericAmount.value - amount) < 0.001
  )
}

const validateAmount = value => {
  amountError.value = ''

  if (value === '' || value === null || value === undefined) {
    amountError.value = t('Amount is required')
    return false
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    amountError.value = t('Amount must be a number')
    return false
  }

  if (amount <= 0) {
    amountError.value = t('Amount must be greater than zero')
    return false
  }

  if (minTopupAmount.value > 0 && amount < minTopupAmount.value) {
    amountError.value = `${t('Minimal deposit is')} ${formatAmount(minTopupAmount.value)} ${currentCurrencySymbol.value}`
    return false
  }

  if (maxTopupAmount.value > 0 && amount > maxTopupAmount.value) {
    amountError.value = `${t('Maximum deposit is')} ${formatAmount(maxTopupAmount.value)} ${currentCurrencySymbol.value}`
    return false
  }

  return true
}

const selectAmount = amount => {
  selectedAmount.value = formatAmount(amount)
  amountTouched.value = false
  amountError.value = ''
}

const validateOnBlur = () => {
  amountTouched.value = true
  validateAmount(selectedAmount.value)
}

const setDefaultAmount = () => {
  const preferredAmounts = [150, 100, 50, 25, 5, 200]

  const available = preferredAmounts
    .map(baseAmount => {
      return Number(formatAmount(baseAmount * currencyRate.value))
    })
    .find(amount => {
      if (amount <= 0) return false

      if (minTopupAmount.value > 0 && amount < minTopupAmount.value) {
        return false
      }

      if (maxTopupAmount.value > 0 && amount > maxTopupAmount.value) {
        return false
      }

      return true
    })

  if (available !== undefined) {
    selectedAmount.value = formatAmount(available)
  } else if (
    minTopupAmount.value > 0 &&
    (maxTopupAmount.value <= 0 || minTopupAmount.value <= maxTopupAmount.value)
  ) {
    selectedAmount.value = formatAmount(minTopupAmount.value)
  } else {
    selectedAmount.value = ''
  }

  amountTouched.value = false
  amountError.value = ''
}

const openTopUpModal = () => {
  if (isLoading.value) return

  amountTouched.value = true

  if (!validateAmount(selectedAmount.value)) {
    toast.warning(amountError.value || t('Please enter a valid amount'))
    return
  }

  isTopUpModalOpen.value = true
}

const closeTopUpModal = () => {
  isTopUpModalOpen.value = false
}

watch(selectedAmount, () => {
  amountError.value = ''

  if (amountTouched.value) {
    validateAmount(selectedAmount.value)
  }
})

watch([minTopupAmount, maxTopupAmount], () => {
  if (amountTouched.value) {
    validateAmount(selectedAmount.value)
  }
})

watch(currentCurrencyCode, () => {
  setDefaultAmount()
})

onMounted(async () => {
  if (!settingsStore.settings && !settingsStore.loading) {
    await settingsStore.fetchSettings()
  }

  setDefaultAmount()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.balance {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2.04fr);
  align-items: start;
  gap: 16px;
  width: 100%;
  min-width: 0;

  &__card {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;

    padding: clamp(24px, 2.7vw, 40px);

    border: 1px solid #303948;
    border-radius: 10px;
    background-color: #111821;
    color: var(--third-color);

    &_wallet {
      min-height: 250px;
    }

    &_topup {
      min-height: 390px;
    }
  }

  &__title {
    margin: 0 0 34px;

    font-family: var(--font-orbitron);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.4;
    text-transform: none;
    color: #f4f6fb;
  }

  &__amount {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    margin-bottom: 38px;
  }

  &__wallet-icon {
    display: block;
    width: 24px;
    height: 24px;
    min-width: 24px;
    flex: 0 0 24px;
    color: #99a1b0;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  &__balance-price {
    color: var(--third-color);
  }

  &__withdraw {
    width: 100%;
    min-height: 42px;
    height: 42px;
    margin-top: auto;

    border: 1px solid #8794a6 !important;
    border-radius: 6px;
    background: transparent !important;
    color: #f4f6fb !important;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color) !important;
        background: var(--hint-primary-color) !important;
        color: #ffffff !important;
      }
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }

  &__label {
    margin-bottom: 10px;

    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
  }

  &__options {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;

    margin-bottom: 26px;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;
    min-height: 41px;
    padding: 8px 6px;

    border: 1px solid #8794a6;
    border-radius: 6px;
    background-color: transparent;

    color: #f4f6fb;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
    white-space: nowrap;

    cursor: pointer;

    transition:
      border-color 0.25s ease,
      background-color 0.25s ease,
      color 0.25s ease;

    &.is-active {
      border-color: #65a7ff;
      color: #ffffff;
      background-color: rgba(26, 115, 255, 0.08);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 3px;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--hint-primary-color);
        background-color: rgba(26, 115, 255, 0.1);
        color: #ffffff;
      }
    }
  }

  &__custom {
    width: 100%;
    min-width: 0;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    min-width: 0;
  }

  &__input {
    flex: 0 1 338px;
    min-width: 0;
    width: 100%;

    :deep(.base-input) {
      min-height: 42px;
      height: 42px;

      border: 1px solid rgba(153, 161, 176, 0.12);
      border-radius: 6px;
      background-color: #222934;
    }

    :deep(.base-input.is-focused) {
      border-color: var(--hint-primary-color);
    }

    :deep(.base-input__control) {
      color: #f4f6fb;
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 600;
    }

    :deep(.base-input__suffix) {
      color: #f4f6fb;
    }
  }

  &__currency {
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    color: #f4f6fb;
  }

  &__conversion {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    min-width: 0;

    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  &__equals {
    color: #99a1b0;
  }

  &__conversion-price {
    gap: 4px;
    color: #99a1b0;

    :deep(.price__value) {
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 600;
      color: #99a1b0;
    }

    :deep(.price__icon) {
      width: 12px;
      height: 12px;
      min-width: 12px;
    }
  }

  &__minimum {
    margin-top: 16px;

    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;

    span {
      color: #b9c4d3;
      font-weight: 600;
    }
  }

  &__error {
    margin-top: 12px;

    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
  }

  &__submit {
    width: 100%;
    max-width: 338px;
    min-height: 42px;
    height: 42px;
    margin-top: 30px;

    border: 1px solid #1a73ff !important;
    border-radius: 6px;

    background-color: #1a73ff !important;
    color: #ffffff !important;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease;

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: #005fe8 !important;
        background-color: #005fe8 !important;
      }
    }
  }

  @media (max-width: $md2) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);

    &__options {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    &__card {
      padding: 25px;
    }
  }

  @media (max-width: $md3) {
    grid-template-columns: minmax(0, 1fr);

    &__card {
      &_wallet {
        min-height: 220px;
      }

      &_topup {
        min-height: 0;
      }
    }

    &__options {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    &__amount {
      margin-bottom: 25px;
    }

    &__withdraw {
      max-width: 338px;
    }
  }

  @media (max-width: $md5) {
    gap: 12px;

    &__card {
      padding: 22px 18px;
    }

    &__title {
      margin-bottom: 22px;
    }

    &__options {
      gap: 8px;
      margin-bottom: 22px;
    }

    &__option {
      min-height: 40px;
      padding: 6px 4px;
      font-size: 12px;
    }

    &__row {
      flex-wrap: wrap;
      gap: 12px;
    }

    &__input {
      flex-basis: 100%;
    }

    &__submit {
      max-width: none;
      margin-top: 24px;
    }

    &__conversion {
      font-size: 12px;
    }
  }

  @media (max-width: $md7) {
    &__options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
