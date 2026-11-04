<template>
  <div class="sell-skins">
    <form class="sell-skins__form" @submit.prevent="submit">
      <h2 v-if="showTitle" class="sell-skins__title _h3">
        {{ $t('Sell Items') }}
      </h2>

      <div v-if="isInventoryLoading" class="sell-skins__state">
        <LoadingSpinner />
      </div>

      <div
        v-else-if="!selectedItems.length"
        class="sell-skins__state sell-skins__state--empty"
      >
        <p>{{ $t('No items available for selling') }}</p>

        <BaseButton
          v-if="!isLoading"
          type="button"
          variant="bordered"
          class="sell-skins__retry"
          @click="fetchInventory"
        >
          {{ $t('Refresh inventory') }}
        </BaseButton>
      </div>

      <template v-else>
        <div class="sell-skins__table">
          <div class="sell-skins__head">
            <div class="sell-skins__head-item">
              {{ $t('Item') }}
            </div>

            <div class="sell-skins__head-item">
              {{ $t('Available') }}
            </div>

            <div class="sell-skins__head-item">
              {{ $t('Q-ty') }}
            </div>

            <div class="sell-skins__head-item">
              {{ $t('Price') }}
            </div>
          </div>

          <div class="sell-skins__rows">
            <div
              v-for="item in selectedItems"
              :key="getItemKey(item)"
              class="sell-skins__row"
            >
              <div class="sell-skins__cell sell-skins__cell--name">
                <span class="sell-skins__mobile-label">
                  {{ $t('Item') }}
                </span>

                <span class="sell-skins__item-name">
                  {{ item.name }}
                </span>
              </div>

              <div class="sell-skins__cell sell-skins__cell--available">
                <span class="sell-skins__mobile-label">
                  {{ $t('Available') }}
                </span>

                <span class="sell-skins__available">
                  {{ item.available }}
                </span>
              </div>

              <div class="sell-skins__cell sell-skins__cell--quantity">
                <span class="sell-skins__mobile-label">
                  {{ $t('Q-ty') }}
                </span>

                <CartItemQuantity
                  class="sell-skins__quantity"
                  :model-value="item.quantity"
                  :min="1"
                  :max="item.available"
                  :loading="isLoading"
                  @change="quantity => updateQuantity(item, quantity)"
                />
              </div>

              <div class="sell-skins__cell sell-skins__cell--price">
                <span class="sell-skins__mobile-label">
                  {{ $t('Price') }}
                </span>

                <PriceFormatter
                  class="sell-skins__price"
                  :price="getItemTotal(item)"
                  skip-conversion
                  size="size-14"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="sell-skins__summary">
          <div class="sell-skins__total">
            <span class="sell-skins__total-label">
              {{ $t('Total:') }}
            </span>

            <div class="sell-skins__total-values">
              <PriceFormatter
                :price="totalPrice"
                skip-conversion
                size="size-32"
                class="sell-skins__total-coin"
              />

              <PriceFormatter
                :price="totalFiat"
                :currency-code="currentCurrencyCode"
                is-currency
                raw-fiat
                skip-conversion
                size="size-14"
                class="sell-skins__total-fiat"
              />
            </div>
          </div>
        </div>

        <div class="sell-skins__bottom">
          <BaseCheckbox
            v-model="acceptApproval"
            :error="errors.acceptApproval"
            :disabled="isLoading"
            class="sell-skins__approval"
          >
            {{ $t('I understand this transaction requires admin approval') }}
          </BaseCheckbox>

          <BaseButton
            type="submit"
            variant="primary"
            class="sell-skins__submit"
            :disabled="isLoading || !isFormValid"
          >
            {{ $t('Create New Offer') }}
          </BaseButton>
        </div>
      </template>

      <p
        v-if="errors.general"
        class="sell-skins__error _text-error"
        role="alert"
      >
        {{ errors.general }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import axios from '@/plugins/axios'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import CartItemQuantity from '@/pages/CartPage/components/CartItemQuantity.vue'

import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  showTitle: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['success', 'cancel'])

const { t } = useI18n()

const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()
const currencyStore = useCurrencyStore()
const settingsStore = useSettingsStore()

const { currentCurrencyCode } = storeToRefs(currencyStore)

const isDebugItemsActive = false

const debugInventory = [
  {
    short_name: 'stones',
    skin: 0,
    amount: 1000,
    catalog_item: {
      name: 'Rock',
      price: 0.02,
    },
  },
  {
    short_name: 'torch',
    skin: 0,
    amount: 10,
    catalog_item: {
      name: 'Torch',
      price: 0.05,
    },
  },
  {
    short_name: 'spiderweb',
    skin: 0,
    amount: 10,
    catalog_item: {
      name: 'Spider webs',
      price: 0.1,
    },
  },
  {
    short_name: 'spider',
    skin: 0,
    amount: 100,
    catalog_item: {
      name: 'Spider',
      price: 0.15,
    },
  },
]

const inventory = ref([])
const selectedItems = ref([])

const acceptApproval = ref(false)
const isLoading = ref(false)
const isInventoryLoading = ref(false)

const errors = reactive({
  acceptApproval: '',
  general: '',
})

const selectedCurrencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const creditsConversionRate = computed(() => {
  return Number(settingsStore.creditsConversionRate || 0)
})

const oneCoinFiatValue = computed(() => {
  return selectedCurrencyRate.value * creditsConversionRate.value
})

const totalPrice = computed(() => {
  const total = selectedItems.value.reduce((sum, item) => {
    return sum + getItemTotal(item)
  }, 0)

  return Number(total.toFixed(2))
})

const totalFiat = computed(() => {
  return Number((totalPrice.value * oneCoinFiatValue.value).toFixed(2))
})

const isFormValid = computed(() => {
  if (!selectedItems.value.length) return false
  if (!acceptApproval.value) return false
  if (totalPrice.value <= 0) return false

  return selectedItems.value.every(item => {
    const quantity = Number(item.quantity)
    const price = Number(item.price)

    return (
      Boolean(item.short_name) &&
      Number.isInteger(quantity) &&
      quantity >= 1 &&
      quantity <= item.available &&
      Number.isFinite(price) &&
      price > 0
    )
  })
})

const getItemKey = item => {
  return `${item.short_name}:${item.skin}`
}

const getItemTotal = item => {
  const price = Number(item.price) || 0
  const quantity = Number(item.quantity) || 0

  return Number((price * quantity).toFixed(2))
}

const normalizeItemTitle = value => {
  return String(value || '')
    .replace(/^★\s*/, '')
    .replace(/StatTrak™?\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/\s*\((.*?)\)\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const normalizeInventoryItem = item => {
  const rawName =
    item.catalog_item?.name ||
    item.game_name ||
    item.item?.name ||
    item.title ||
    item.short_name ||
    ''

  const available = Number(item.amount ?? item.available ?? item.count ?? 0)

  return {
    short_name: item.short_name || item.item?.short_name || '',

    skin: Number(item.skin ?? item.item?.skin ?? 0),

    name: normalizeItemTitle(rawName),

    available: Number.isFinite(available)
      ? Math.max(0, Math.floor(available))
      : 0,

    quantity: 1,

    price: Number(item.catalog_item?.price ?? item.price ?? 0),
  }
}

const clearErrors = () => {
  errors.acceptApproval = ''
  errors.general = ''
}

const updateQuantity = (item, value) => {
  const quantity = Number.parseInt(value, 10)

  if (!Number.isFinite(quantity)) return

  item.quantity = Math.max(1, Math.min(quantity, item.available))

  errors.general = ''
}

const fetchInventory = async () => {
  isInventoryLoading.value = true
  errors.general = ''

  try {
    if (isDebugItemsActive) {
      inventory.value = debugInventory
    } else {
      const { data } = await axios.get('/user/inventory')

      if (data?.status !== 'OK') {
        throw new Error(data?.message || t('Failed to load inventory'))
      }

      inventory.value = Array.isArray(data?.payload) ? data.payload : []
    }

    selectedItems.value = inventory.value
      .map(normalizeInventoryItem)
      .filter(item => item.available > 0)
  } catch (error) {
    inventory.value = []
    selectedItems.value = []

    errors.general =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to load inventory')
  } finally {
    isInventoryLoading.value = false
  }
}

const validate = () => {
  clearErrors()

  if (!selectedItems.value.length) {
    errors.general = t('No items selected for selling')
    return false
  }

  if (!acceptApproval.value) {
    errors.acceptApproval = t('You must confirm admin approval')
    return false
  }

  if (!isFormValid.value) {
    errors.general = t('Please check item quantities and prices')
    return false
  }

  return true
}

const submit = async () => {
  if (isLoading.value || isInventoryLoading.value) {
    return false
  }

  if (!validate()) return false

  try {
    isLoading.value = true

    const result = await offerFlowStore.createSellOrder({
      items: selectedItems.value.map(item => ({
        short_name: item.short_name,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
    })

    if (!result?.success) {
      const validationErrors = result?.validationErrors

      const firstValidationError =
        validationErrors && typeof validationErrors === 'object'
          ? Object.values(validationErrors).flat().find(Boolean)
          : null

      errors.general =
        firstValidationError ||
        result?.error ||
        t('Failed to create sell request')

      return false
    }

    acceptApproval.value = false

    await fetchInventory()

    emit('success', result)

    modalStore.open('sellConfirmation')

    return true
  } catch (error) {
    errors.general =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to create sell request')

    return false
  } finally {
    isLoading.value = false
  }
}

const reset = () => {
  acceptApproval.value = false
  clearErrors()

  selectedItems.value = inventory.value
    .map(normalizeInventoryItem)
    .filter(item => item.available > 0)
}

const cancel = () => {
  reset()
  emit('cancel')
}

watch(acceptApproval, value => {
  if (value) {
    errors.acceptApproval = ''
  }
})

onMounted(async () => {
  if (!settingsStore.settings && !settingsStore.loading) {
    try {
      await settingsStore.fetchSettings()
    } catch (error) {
      console.error(error)
    }
  }

  await fetchInventory()
})

defineExpose({
  submit,
  reset,
  cancel,
  fetchInventory,
  isLoading,
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sell-skins {
  width: 100%;
  min-width: 0;

  &__form {
    width: 100%;
    min-width: 0;
  }

  &__title {
    color: var(--primary-color);
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 16);
    }
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    min-height: 150px;
    padding: 24px 12px;

    border-radius: 5px;
    background-color: var(--bg-third-color);

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 13px;
    text-align: center;
  }

  &__retry {
    width: fit-content;
    min-width: 130px;
    min-height: 36px;
    font-size: 12px;
  }

  &__table {
    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 16);
    }
  }

  &__head,
  &__row {
    display: grid;
    grid-template-columns:
      minmax(0, 1.8fr)
      minmax(0, 0.8fr)
      minmax(100px, 1fr)
      minmax(0, 0.8fr);

    align-items: center;
    column-gap: clamp(6px, 1vw, 16px);

    width: 100%;
    min-width: 0;

    @include adaptiveValue('padding-left', 16, 9);
    @include adaptiveValue('padding-right', 16, 9);
  }

  &__head {
    min-height: 35px;
    padding-top: 9px;
    padding-bottom: 9px;

    border-radius: 5px;
    background-color: var(--bg-third-color);
  }

  &__head-item {
    min-width: 0;

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 10px;
    font-weight: 500;
    line-height: 1.3;
    text-transform: uppercase;
  }

  &__rows {
    display: grid;
    gap: 2px;

    width: 100%;
    min-width: 0;
  }

  &__row {
    min-height: 60px;
    padding-top: 10px;
    padding-bottom: 10px;

    border-radius: 4px;
    background-color: var(--bg-third-color);

    transition: background-color 0.25s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-fourth-color);
      }
    }
  }

  &__cell {
    display: flex;
    align-items: center;

    min-width: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;

    &--name {
      overflow-wrap: anywhere;
    }

    &--quantity,
    &--price {
      justify-content: flex-start;
    }
  }

  &__mobile-label {
    display: none;
  }

  &__item-name {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  &__available {
    font-variant-numeric: tabular-nums;
  }

  &__quantity {
    width: 100%;
    max-width: 105px;
    min-width: 0;

    :deep(.cart-quantity) {
      min-width: 0;
    }

    :deep(.cart-quantity__button) {
      flex: 0 0 30px;
      min-width: 0;
      height: 34px;
      background-color: transparent;
      color: var(--primary-color);
    }

    :deep(.cart-quantity__input) {
      flex: 1 1 auto;
      width: 100%;
      min-width: 0;
      height: 34px;

      padding: 0 2px;
      background-color: transparent;

      font-family: var(--font-inter);
      font-size: 12px;
    }

    :deep(.cart-quantity) {
      border-color: var(--border-primary-color);
      border-radius: 5px;
      background-color: var(--bg-third-color);
    }
  }

  &__price {
    min-width: 0;

    :deep(.price) {
      min-width: 0;
      justify-content: flex-start;
    }
  }

  &__summary {
    display: flex;
    justify-content: flex-end;

    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__total {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 20px;

    min-width: 0;
  }

  &__total-label {
    padding-top: 7px;

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }

  &__total-values {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;

    min-width: 0;
  }

  &__total-coin {
    justify-content: flex-end;
    color: var(--primary-color);
  }

  &__total-fiat {
    justify-content: flex-end;
    color: var(--primary-color);
  }

  &__bottom {
    display: grid;
    grid-template-columns:
      minmax(0, 1.2fr)
      minmax(0, 1fr);

    align-items: center;
    gap: 16px;

    width: 100%;
    min-width: 0;
  }

  &__approval {
    min-width: 0;

    :deep(.base-checkbox__row) {
      gap: 12px;
    }

    :deep(.base-checkbox__box) {
      width: 22px;
      min-width: 22px;
      height: 22px;
    }

    :deep(.base-checkbox__label) {
      color: var(--primary-color);
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 400;
      line-height: 1.5;
    }
  }

  &__submit {
    width: 100%;
    min-width: 0;

    @include adaptiveValue('min-height', 44, 40);

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    white-space: normal;
  }

  &__error {
    width: 100%;
    margin-top: 14px;

    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
    overflow-wrap: anywhere;
  }

  @media (max-width: $md4) {
    &__head {
      display: none;
    }

    &__rows {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    &__row {
      display: flex;
      flex-direction: column;
      align-items: stretch;

      min-width: 0;
      gap: 12px;
      padding: 14px;

      border: 1px solid var(--border-primary-color);
      border-radius: 6px;
    }

    &__cell {
      display: flex;
      justify-content: space-between;
      gap: 10px;

      &--price,
      &--quantity {
        justify-content: space-between;
      }
    }

    &__mobile-label {
      display: block;
      flex: 0 0 35%;

      color: var(--hint-third-color);
      font-family: var(--font-inter);
      font-size: 11px;
      font-weight: 500;
      line-height: 1.4;
      text-transform: uppercase;
    }

    &__item-name {
      text-align: right;
    }

    &__quantity {
      margin-left: auto;
    }

    &__bottom {
      grid-template-columns: 1fr;
    }

    &__submit {
      max-width: 100%;
    }
  }

  @media (max-width: $md6) {
    &__rows {
      grid-template-columns: minmax(0, 1fr);
    }

    &__row {
      gap: 10px;
      padding: 12px;
    }

    &__summary {
      justify-content: flex-end;
    }

    &__total {
      gap: 12px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .sell-skins__row {
    transition: none;
  }
}
</style>
