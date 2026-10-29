<template>
  <section class="sell">
    <div class="sell__inner _cnt">
      <div class="sell__top">
        <h1 class="sell__title">
          {{ $t('SELL SKIN') }}
        </h1>
      </div>

      <form class="sell__form" novalidate @submit.prevent="handleSubmit">
        <div class="sell__fields">
          <div class="sell__field">
            <BaseInput
              v-model="formData.item_url"
              :label="$t('Steam trade link')"
              :placeholder="'https://steamcommunity.com/my/tradeoffers/privacy'"
              :error="formErrors.item_url"
              :disabled="isLoading"
              autocomplete="off"
              class="sell__input sell__input_trade"
            />
          </div>

          <div class="sell__field">
            <BaseSelect
              v-model="formData.game"
              :label="$t('Game')"
              :options="gameOptions"
              option-label="label"
              option-value="value"
              :error="formErrors.game"
              :disabled="isLoading"
              class="sell__select"
            />
          </div>

          <div class="sell__field">
            <BaseInput
              v-model="formData.title"
              :label="$t('Skin name')"
              :placeholder="$t('Skin name')"
              :error="formErrors.title"
              :disabled="isLoading"
              autocomplete="off"
              class="sell__input"
            />
          </div>

          <div class="sell__field">
            <div class="sell__field-label">{{ $t('Quantity') }}:</div>

            <div
              class="sell__quantity"
              :class="{
                'has-error': !!formErrors.quantity,
                'is-disabled': isLoading,
              }"
            >
              <button
                type="button"
                class="sell__quantity-button"
                :disabled="isLoading || formData.quantity <= 1"
                :aria-label="$t('Decrease quantity')"
                @click="changeQuantity(-1)"
              >
                <span aria-hidden="true">−</span>
              </button>

              <input
                v-model.number="formData.quantity"
                type="number"
                class="sell__quantity-input"
                min="1"
                max="99"
                step="1"
                inputmode="numeric"
                :disabled="isLoading"
                :aria-label="$t('Quantity')"
                @blur="normalizeQuantity"
              />

              <button
                type="button"
                class="sell__quantity-button"
                :disabled="isLoading || formData.quantity >= 99"
                :aria-label="$t('Increase quantity')"
                @click="changeQuantity(1)"
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>

            <div
              v-if="formErrors.quantity"
              class="sell__field-error _text-error"
            >
              {{ formErrors.quantity }}
            </div>
          </div>

          <div class="sell__field">
            <BaseInput
              v-model="formData.price"
              :label="$t('Price')"
              placeholder="150.00"
              :error="formErrors.price"
              :disabled="isLoading"
              inputmode="decimal"
              autocomplete="off"
              class="sell__input sell__input_price"
            >
              <template #suffix>
                <span class="sell__currency">
                  {{ currentCurrencySymbol }}
                </span>
              </template>
            </BaseInput>
          </div>
        </div>

        <div class="sell__terms">
          <BaseCheckbox v-model="termsAccepted" terms class="sell__checkbox" />

          <div v-if="formErrors.terms" class="sell__terms-error _text-error">
            {{ formErrors.terms }}
          </div>
        </div>

        <div
          v-if="formErrors.general"
          class="sell__error _text-error"
          role="alert"
        >
          {{ formErrors.general }}
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          class="sell__submit"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading"> {{ $t('Creating') }}... </span>

          <span v-else>
            {{ $t('Sell') }}
          </span>
        </BaseButton>
      </form>
    </div>
  </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useToast } from '@/composables/useToast'

import { useCurrencyStore } from '@/stores/currency'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useUserStore } from '@/stores/user'

const DEFAULT_GAME = 'dota2'
const DEFAULT_QUALITY = 1
const MAX_QUANTITY = 99
const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const offerFlowStore = useOfferFlowStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()

const { currentCurrencySymbol } = storeToRefs(currencyStore)

const isLoading = ref(false)
const termsAccepted = ref(false)

const gameOptions = [
  {
    label: 'CS2',
    value: 'cs2',
  },
  {
    label: 'Dota 2',
    value: 'dota2',
  },
]

const formData = ref({
  item_url: '',
  game: DEFAULT_GAME,
  title: '',
  quantity: 1,
  price: '',
})

const formErrors = ref({
  item_url: '',
  game: '',
  title: '',
  quantity: '',
  price: '',
  terms: '',
  general: '',
})

const norm = value => String(value ?? '').trim()

const isPriceValid = computed(() => {
  const price = Number(formData.value.price)

  return (
    norm(formData.value.price) !== '' && Number.isFinite(price) && price > 0
  )
})

const isQuantityValid = computed(() => {
  const quantity = Number(formData.value.quantity)

  return Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_QUANTITY
})

const isFormValid = computed(() => {
  return Boolean(
    norm(formData.value.item_url) &&
    formData.value.game &&
    norm(formData.value.title) &&
    isQuantityValid.value &&
    isPriceValid.value &&
    termsAccepted.value,
  )
})

const changeQuantity = direction => {
  if (isLoading.value) return

  const current = Number(formData.value.quantity)

  const quantity = Number.isFinite(current) ? current : 1

  formData.value.quantity = Math.max(
    1,
    Math.min(MAX_QUANTITY, Math.trunc(quantity) + direction),
  )

  formErrors.value.quantity = ''
}

const normalizeQuantity = () => {
  const value = Number(formData.value.quantity)

  formData.value.quantity = Number.isFinite(value)
    ? Math.max(1, Math.min(MAX_QUANTITY, Math.trunc(value)))
    : 1

  formErrors.value.quantity = ''
}

const getSavedCheckoutData = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saveCheckoutTradeLink = () => {
  const data = getSavedCheckoutData()

  localStorage.setItem(
    CHECKOUT_STORAGE_KEY,
    JSON.stringify({
      ...data,
      tradeLink: formData.value.item_url,
    }),
  )
}

const getProfileTradeLink = user => {
  if (!user) return ''

  return (
    user.steam_trade_link ||
    user.tradeLink ||
    user.trade_url ||
    user.tradeUrl ||
    ''
  )
}

const prefillTradeLink = async () => {
  await userStore.fetchProfile?.()

  const profileTradeLink = getProfileTradeLink(userStore.user)
  const savedData = getSavedCheckoutData()

  formData.value.item_url = norm(profileTradeLink)
    ? profileTradeLink
    : savedData.tradeLink || ''
}

const clearFormErrors = () => {
  formErrors.value = {
    item_url: '',
    game: '',
    title: '',
    quantity: '',
    price: '',
    terms: '',
    general: '',
  }
}

const resetForm = () => {
  const currentTradeLink = formData.value.item_url

  formData.value = {
    item_url: currentTradeLink,
    game: DEFAULT_GAME,
    title: '',
    quantity: 1,
    price: '',
  }

  termsAccepted.value = false

  clearFormErrors()
}

const validateForm = () => {
  const errors = {}

  if (!norm(formData.value.item_url)) {
    errors.item_url = t('Steam inventory link is required')
  }

  if (!formData.value.game) {
    errors.game = t('Game is required')
  }

  if (!norm(formData.value.title)) {
    errors.title = t('Skin name is required')
  }

  if (!isQuantityValid.value) {
    errors.quantity = t('Quantity must be a whole number between 1 and 99')
  }

  if (!norm(formData.value.price)) {
    errors.price = t('Price is required')
  } else if (!isPriceValid.value) {
    errors.price = t('Price must be a positive number')
  }

  if (!termsAccepted.value) {
    errors.terms = t(
      'You must agree to the Terms & Conditions and Privacy Policy',
    )
  }

  return errors
}

const createPayload = () => {
  return {
    title: norm(formData.value.title),
    price: Number(formData.value.price),
    item_url: norm(formData.value.item_url),
    type: formData.value.game,
    quantity: Number(formData.value.quantity),
    quality: DEFAULT_QUALITY,
  }
}

const handleSubmit = async () => {
  if (isLoading.value) return

  clearFormErrors()

  const errors = validateForm()

  if (Object.keys(errors).length) {
    formErrors.value = {
      ...formErrors.value,
      ...errors,
    }

    return
  }

  try {
    isLoading.value = true

    saveCheckoutTradeLink()

    const payload = createPayload()

    const result = await offerFlowStore.createSellOrder(payload)

    if (result?.success) {
      resetForm()

      toast.success(t('Offer created successfully'))

      await router.push({
        name: 'account-offers',
      })

      return
    }

    if (result?.validationErrors) {
      Object.entries(result.validationErrors).forEach(([key, messages]) => {
        if (key in formErrors.value) {
          formErrors.value[key] = Array.isArray(messages)
            ? messages[0] || ''
            : String(messages || '')
        }
      })
    }

    if (result?.error) {
      formErrors.value.general = result.error
    }
  } catch (error) {
    console.error('Error creating offer:', error)

    const apiErrors = error?.response?.data?.errors
    const apiMessage = error?.response?.data?.message

    if (apiErrors) {
      Object.entries(apiErrors).forEach(([key, messages]) => {
        if (key in formErrors.value) {
          formErrors.value[key] = Array.isArray(messages)
            ? messages[0] || ''
            : String(messages || '')
        }
      })

      return
    }

    formErrors.value.general =
      apiMessage || error?.message || t('Failed to create offer')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => formData.value.item_url,
  () => {
    saveCheckoutTradeLink()
    formErrors.value.item_url = ''
  },
)

watch(
  () => formData.value.game,
  () => {
    formErrors.value.game = ''
  },
)

watch(
  () => formData.value.title,
  () => {
    formErrors.value.title = ''
  },
)

watch(
  () => formData.value.price,
  () => {
    formErrors.value.price = ''
  },
)

watch(
  () => formData.value.quantity,
  () => {
    formErrors.value.quantity = ''
  },
)

watch(termsAccepted, value => {
  if (value) {
    formErrors.value.terms = ''
  }
})

onMounted(async () => {
  await prefillTradeLink()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sell {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;

  background-color: #030b17;

  @include adaptiveValue('padding-top', 124, 95);
  @include adaptiveValue('padding-bottom', 105, 60);

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
    min-width: 0;
  }

  &__top {
    width: 100%;
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 52, 32);
    }
  }

  &__title {
    margin: 0;

    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: clamp(28px, 3.2vw, 40px);
    font-weight: 800;
    line-height: 1.3;
    text-align: center;
    text-transform: uppercase;
  }

  &__form {
    display: flex;
    flex-direction: column;

    width: 100%;
    max-width: 373px;
    min-width: 0;
    margin: 0 auto;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 13px;

    width: 100%;
    min-width: 0;
  }

  &__field {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  &__field-label {
    margin-bottom: 5px;

    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
  }

  &__input,
  &__select {
    width: 100%;
    min-width: 0;

    :deep(.base-input__label),
    :deep(.base-select__field-label) {
      margin-bottom: 5px;

      color: #99a1b0;
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 400;
      line-height: 1.5;
    }

    :deep(.base-input),
    :deep(.base-select) {
      min-height: 40px;
      height: 40px;

      border: 1px solid #303948;
      border-radius: 6px;
      background-color: #222934;

      transition:
        border-color 0.25s ease,
        background-color 0.25s ease;
    }

    :deep(.base-input:hover),
    :deep(.base-select:hover) {
      border-color: #52627a;
    }

    :deep(.base-input.is-focused),
    :deep(.base-select.is-open),
    :deep(.base-select:focus-visible) {
      border-color: #1a73ff;
    }

    :deep(.base-input.has-error),
    :deep(.base-select.has-error) {
      border-color: #f25563;
    }

    :deep(.base-input__control) {
      height: 100%;
      padding: 0 15px;

      color: #f4f6fb;
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;
    }

    :deep(.base-input__placeholder) {
      left: 15px;

      color: #b5becb;
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 400;
    }

    :deep(.base-select__value-text),
    :deep(.base-select__placeholder) {
      color: #f4f6fb;
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 600;
    }

    :deep(.base-select__caret) {
      color: #f4f6fb;
    }

    :deep(.base-select__dropdown) {
      border: 1px solid #344050;
      border-radius: 7px;
      background-color: #19212c;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
    }

    :deep(.base-input__error),
    :deep(.base-select__error) {
      margin-top: 6px;
      font-size: 12px;
    }
  }

  &__input_trade {
    :deep(.base-input__control) {
      color: #65a7ff;
    }

    :deep(.base-input__placeholder) {
      color: #65a7ff;
      font-size: 12px;
    }
  }

  &__input_price {
    :deep(.base-input__control) {
      padding-right: 45px;
      font-weight: 600;
    }
  }

  &__currency {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-width: 16px;

    color: #f4f6fb;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
  }

  &__quantity {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    height: 40px;

    border: 1px solid #303948;
    border-radius: 6px;
    background-color: #222934;

    transition: border-color 0.25s ease;

    &:focus-within {
      border-color: #1a73ff;
    }

    &.has-error {
      border-color: #f25563;
    }

    &.is-disabled {
      opacity: 0.65;
    }
  }

  &__quantity-button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 45px;

    width: 45px;
    height: 100%;
    padding: 0;

    border: 0;
    background-color: transparent;

    color: #65a7ff;
    font-family: var(--font-inter);
    font-size: 23px;
    font-weight: 400;
    line-height: 1;

    cursor: pointer;

    transition:
      color 0.25s ease,
      background-color 0.25s ease;

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      color: #ffffff;
      background-color: rgba(26, 115, 255, 0.08);
    }

    &:focus-visible {
      outline: 2px solid #65a7ff;
      outline-offset: -3px;
      border-radius: 5px;
    }
  }

  &__quantity-input {
    display: block;
    flex: 1 1 auto;

    width: 100%;
    min-width: 0;
    height: 100%;
    padding: 0 5px;

    border: 0;
    outline: 0;
    background: transparent;

    color: #f4f6fb;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
    text-align: center;

    appearance: textfield;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      margin: 0;
      -webkit-appearance: none;
    }
  }

  &__field-error {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.4;
  }

  &__terms {
    width: 100%;
    min-width: 0;

    margin-top: 14px;

    @include adaptiveValue('margin-bottom', 34, 25);
  }

  &__checkbox {
    display: block;

    :deep(.base-checkbox__row) {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    :deep(.base-checkbox__box) {
      margin-top: 2px;
      border-color: #344050;
      background-color: #222934;
    }

    :deep(.base-checkbox__label) {
      color: #99a1b0;
      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.6;
    }

    :deep(.base-checkbox__label a),
    :deep(.base-checkbox__label ._link) {
      color: #f4f6fb;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: #65a7ff;
      }
    }
  }

  &__terms-error {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.5;
  }

  &__error {
    margin-bottom: 12px;
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
  }

  &__submit {
    width: 100%;
    min-height: 41px !important;
    height: 41px;

    padding: 8px 15px;

    border: 1px solid #1a73ff !important;
    border-radius: 6px !important;
    background-color: #1a73ff !important;

    color: #ffffff !important;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.4;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease;

    &:not(:disabled):hover {
      border-color: #005fe8 !important;
      background-color: #005fe8 !important;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  @media (max-width: $md3) {
    &__top {
      margin-bottom: 35px;
    }
  }

  @media (max-width: $md6) {
    padding-top: 105px;
    padding-bottom: 65px;

    &__title {
      font-size: 28px;
    }

    &__form {
      max-width: 100%;
    }

    &__fields {
      gap: 15px;
    }

    &__terms {
      margin-top: 17px;
    }
  }
}
</style>
