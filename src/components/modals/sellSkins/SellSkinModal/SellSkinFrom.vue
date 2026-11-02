<template>
  <div class="sell-skins">
    <form class="sell-skins__form" @submit.prevent="submit">
      <div class="sell-skins__title _h3">
        {{ $t('SELL ITEMS') }}
      </div>

      <div v-if="isInventoryLoading" class="sell-skins__loading">
        {{ $t('Loading...') }}
      </div>

      <div v-else-if="!selectedItems.length" class="sell-skins__empty">
        {{ $t('No items selected for selling') }}
      </div>

      <template v-else>
        <div class="sell-skins__table">
          <div class="sell-skins__head">
            <div class="sell-skins__head-item sell-skins__head-item_name">
              {{ $t('Item') }}
            </div>

            <div class="sell-skins__head-item sell-skins__head-item_available">
              {{ $t('Available') }}
            </div>

            <div class="sell-skins__head-item sell-skins__head-item_quantity">
              {{ $t('Q-ty') }}
            </div>

            <div class="sell-skins__head-item sell-skins__head-item_price">
              {{ $t('Price') }}
            </div>
          </div>

          <div class="sell-skins__rows">
            <div
              v-for="item in selectedItems"
              :key="`${item.short_name}:${item.skin}`"
              class="sell-skins__row"
            >
              <div class="sell-skins__cell sell-skins__cell_name">
                <span class="sell-skins__mobile-label">
                  {{ $t('Item') }}
                </span>

                <div class="sell-skins__item-name">
                  {{ item.name }}
                </div>
              </div>

              <div class="sell-skins__cell sell-skins__cell_available">
                <span class="sell-skins__mobile-label">
                  {{ $t('Available') }}
                </span>

                <span>
                  {{ item.available }}
                </span>
              </div>

              <div class="sell-skins__cell sell-skins__cell_quantity">
                <span class="sell-skins__mobile-label">
                  {{ $t('Q-ty') }}
                </span>

                <CartItemQuantity
                  class="sell-skins__quantity"
                  :model-value="item.quantity"
                  :min="0"
                  :max="item.available"
                  :loading="isLoading"
                  @change="quantity => updateQuantity(item, quantity)"
                />
              </div>

              <div class="sell-skins__cell sell-skins__cell_price">
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

        <div class="sell-skins__bottom">
          <div class="sell-skins__total">
            <span class="sell-skins__total-label">
              {{ $t('Total:') }}
            </span>

            <PriceFormatter
              class="sell-skins__total-coin"
              :price="totalPrice"
              skip-conversion
              size="size-32"
            />

            <PriceFormatter
              class="sell-skins__total-fiat"
              :price="totalFiat"
              :currency-code="currentCurrencyCode"
              is-currency
              raw-fiat
              skip-conversion
              size="size-14"
            />
          </div>

          <BaseCheckbox
            v-model="acceptApproval"
            :error="errors.acceptApproval"
            class="sell-skins__approval"
            :disabled="isLoading"
          >
            {{ $t('I understand this transaction requires admin approval') }}
          </BaseCheckbox>

          <div v-if="errors.general" class="sell-skins__error _text-error">
            {{ errors.general }}
          </div>

          <BaseButton
            type="submit"
            variant="bordered"
            class="sell-skins__submit"
            :loading="isLoading"
            :disabled="isLoading || !isFormValid"
          >
            {{ $t('CREATE NEW OFFER') }}
          </BaseButton>
        </div>
      </template>
    </form>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import axios from '@/plugins/axios'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import CartItemQuantity from '@/pages/CartPage/components/CartItemQuantity.vue'

import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useSettingsStore } from '@/stores/settings'

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
    short_name: 'metal.facemask',
    skin: 101,
    amount: 3,
    catalog_item: {
      name: '★ No Mercy Helmet',
      price: 1.38,
    },
  },
  {
    short_name: 'metal.facemask',
    skin: 102,
    amount: 2,
    catalog_item: {
      name: 'StatTrak™ No Mercy Helmet',
      price: 1.45,
    },
  },
  {
    short_name: 'rifle.ak',
    skin: 201,
    amount: 1,
    catalog_item: {
      name: 'Souvenir Tempered AK (Factory New)',
      price: 4.25,
    },
  },
  {
    short_name: 'hoodie',
    skin: 301,
    amount: 5,
    catalog_item: {
      name: 'Blackout Hoodie',
      price: 2.1,
    },
  },
]

const inventory = ref([])
const selectedItems = ref([])

const acceptApproval = ref(false)

const isLoading = ref(false)
const isInventoryLoading = ref(false)

const errors = ref({
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
  if (!selectedItems.value.length) {
    return false
  }

  if (!acceptApproval.value) {
    return false
  }

  return selectedItems.value.every(item => {
    const quantity = Number(item.quantity)
    const price = Number(item.price)

    return (
      Number.isInteger(quantity) &&
      quantity >= 1 &&
      quantity <= item.available &&
      Number.isFinite(price) &&
      price > 0
    )
  })
})

const getItemTotal = item => {
  return Number(
    (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2),
  )
}

const normalizeItemTitle = title => {
  return String(title || '')
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

  return {
    short_name: item.short_name || item.item?.short_name || '',

    skin: Number(item.skin ?? item.item?.skin ?? 0),

    name: normalizeItemTitle(rawName),

    available: Number(item.amount ?? item.available ?? item.count ?? 0),

    quantity: 1,

    price: Number(item.catalog_item?.price ?? item.price ?? 0),
  }
}

const removeItem = item => {
  selectedItems.value = selectedItems.value.filter(
    selectedItem =>
      !(
        selectedItem.short_name === item.short_name &&
        selectedItem.skin === item.skin
      ),
  )

  errors.value.general = ''
}

const updateQuantity = (item, quantity) => {
  const value = Number.parseInt(quantity, 10)

  if (!Number.isFinite(value)) {
    return
  }

  if (value <= 0) {
    removeItem(item)
    return
  }

  item.quantity = Math.min(value, item.available)

  errors.value.general = ''
}

const fetchInventory = async () => {
  if (isDebugItemsActive) {
    inventory.value = debugInventory

    selectedItems.value = debugInventory.map(normalizeInventoryItem)

    isInventoryLoading.value = false

    return
  }

  try {
    isInventoryLoading.value = true
    errors.value.general = ''

    const { data } = await axios.get('/user/inventory')

    if (data?.status !== 'OK') {
      throw new Error(data?.message || 'Failed to load inventory')
    }

    inventory.value = Array.isArray(data?.payload)
      ? data.payload.filter(
          item =>
            Number(item?.amount ?? item?.available ?? item?.count ?? 0) > 0,
        )
      : []

    selectedItems.value = inventory.value.map(normalizeInventoryItem)
  } catch (error) {
    inventory.value = []
    selectedItems.value = []

    errors.value.general =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to load inventory')
  } finally {
    isInventoryLoading.value = false
  }
}

const validate = () => {
  errors.value.acceptApproval = ''
  errors.value.general = ''

  if (!selectedItems.value.length) {
    errors.value.general = t('No items selected for selling')

    return false
  }

  if (!acceptApproval.value) {
    errors.value.acceptApproval = t('You must confirm admin approval')

    return false
  }

  const invalidItem = selectedItems.value.some(item => {
    const quantity = Number(item.quantity)

    return (
      !Number.isInteger(quantity) || quantity < 1 || quantity > item.available
    )
  })

  if (invalidItem) {
    errors.value.general = t('Please check item quantities')

    return false
  }

  return true
}

const submit = async () => {
  if (isLoading.value) {
    return false
  }

  if (!validate()) {
    return false
  }

  try {
    isLoading.value = true
    errors.value.general = ''

    const result = await offerFlowStore.createSellOrder({
      items: selectedItems.value.map(item => ({
        short_name: item.short_name,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
    })

    if (result?.success) {
      modalStore.open('sellConfirmation')

      emit('success')

      return true
    }

    errors.value.general = result?.error || t('Failed to create sell request')

    return false
  } catch (error) {
    const apiErrors = error?.response?.data?.errors

    const message = error?.response?.data?.message || error?.message

    if (Array.isArray(apiErrors)) {
      const first = apiErrors[0]

      errors.value.general =
        first?.available !== undefined
          ? t('Insufficient items in inventory')
          : message || t('Failed to create sell request')
    } else {
      errors.value.general = message || t('Failed to create sell request')
    }

    return false
  } finally {
    isLoading.value = false
  }
}

const reset = () => {
  acceptApproval.value = false

  errors.value.acceptApproval = ''
  errors.value.general = ''

  selectedItems.value = inventory.value.map(normalizeInventoryItem)
}

const cancel = () => {
  reset()

  emit('cancel')
}

watch(acceptApproval, value => {
  if (value) {
    errors.value.acceptApproval = ''
  }
})

onMounted(async () => {
  if (!settingsStore.settings && !settingsStore.loading) {
    await settingsStore.fetchSettings()
  }

  await fetchInventory()
})

defineExpose({
  submit,
  reset,
  cancel,
  isLoading,
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sell-skins {
  width: 100%;

  &__form {
    width: 100%;
  }

  &__title {
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__loading,
  &__empty {
    padding: 40px 15px;

    text-align: center;

    color: var(--seconday-color);

    background-color: var(--bg-primary-color);

    border-radius: 6px;
  }

  &__table {
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__head {
    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 32, 12, 1400, 992, 1);

    padding: 13px 32px;

    background-color: var(--bg-primary-color);

    border-radius: 6px;

    @media (max-width: $md4) {
      display: none;
    }
  }

  &__head-item {
    color: var(--seconday-color);

    font-family: var(--font-condensed);

    font-size: 12px;
    font-weight: 700;
    line-height: 100%;

    text-transform: uppercase;

    &_name {
      flex: 1 1 auto;
      min-width: 180px;
    }

    &_available {
      flex: 0 0 130px;
    }

    &_quantity {
      flex: 0 0 170px;
    }

    &_price {
      flex: 0 0 90px;
    }
  }

  &__rows {
  }

  &__row {
    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 32, 12, 1400, 992, 1);

    min-height: 74px;

    padding-left: 32px;
    padding-right: 32px;

    @include adaptiveValue('padding-top', 13, 10);
    @include adaptiveValue('padding-bottom', 13, 10);

    background-color: #12181c;

    border: 1px solid var(--border-secondary-color);

    border-radius: 6px;

    &:not(:last-child) {
      margin-bottom: 2px;
    }

    @media (max-width: $md4) {
      display: grid;

      grid-template-columns:
        minmax(0, 1fr)
        minmax(0, 1fr);

      gap: 15px;

      padding: 15px;
    }

    @media (max-width: $md6) {
      grid-template-columns: 1fr;
    }
  }

  &__cell {
    min-width: 0;

    display: flex;
    align-items: center;

    color: var(--primary-color);

    font-family: var(--font-open-sans);

    font-size: 14px;
    font-weight: 400;
    line-height: 19px;

    &_name {
      flex: 1 1 auto;
      min-width: 180px;
    }

    &_available {
      flex: 0 0 130px;
    }

    &_quantity {
      flex: 0 0 170px;
    }

    &_price {
      flex: 0 0 90px;
    }

    @media (max-width: $md4) {
      flex: none;

      justify-content: space-between;

      gap: 15px;
    }
  }

  &__mobile-label {
    display: none;

    @media (max-width: $md4) {
      display: block;

      color: var(--seconday-color);

      font-family: var(--font-condensed);

      font-size: 12px;
      font-weight: 700;
      line-height: 100%;

      text-transform: uppercase;
    }
  }

  &__item-name {
    min-width: 0;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__quantity {
    width: 132px;

    @media (max-width: $md4) {
      margin-left: auto;
    }
  }

  &__price {
    width: fit-content;
  }

  &__bottom {
    width: 100%;
  }

  &__total {
    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 14, 10);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 20);
    }

    @media (max-width: $md6) {
      flex-wrap: wrap;
    }
  }

  &__total-label {
    color: var(--seconday-color);

    font-family: var(--font-condensed);

    font-size: 20px;
    font-weight: 700;
    line-height: 100%;

    text-transform: uppercase;
  }

  &__total-coin {
  }

  &__total-fiat {
    color: var(--seconday-color);
  }

  &__approval {
    max-width: 650px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__error {
    text-align: center;

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__submit {
    max-width: 318px;

    margin-left: auto;
    margin-right: auto;

    @include adaptiveValue('min-height', 44, 40);

    font-family: var(--font-condensed);

    font-size: 16px;
    font-weight: 700;
    line-height: 100%;

    text-transform: uppercase;
  }

  @media (max-width: $md6) {
    &__table {
      margin-left: -10px;
      margin-right: -10px;

      width: auto;
    }

    &__submit {
      max-width: 100%;
    }
  }
}
</style>
