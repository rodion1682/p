<template>
  <section class="sell">
    <div class="sell__inner _cnt-home">
      <div class="sell__title _h3">
        {{ $t('SELL ITEMS') }}
      </div>

      <div class="sell__selector">
        <BaseSelect
          v-model="itemToAdd"
          :options="availableInventoryOptions"
          option-label="label"
          option-value="value"
          :placeholder="$t('Select item')"
          :disabled="isLoading || isInventoryLoading"
          class="sell__select"
        />
      </div>

      <div v-if="isInventoryLoading" class="sell__loading">
        {{ $t('Loading...') }}
      </div>

      <div v-else-if="!selectedItems.length" class="sell__empty">
        {{ $t('Select items you want to sell') }}
      </div>

      <template v-else>
        <div class="sell__table">
          <div class="sell__head">
            <div class="sell__head-item sell__head-item_name">
              {{ $t('Item') }}
            </div>

            <div class="sell__head-item sell__head-item_available">
              {{ $t('Available') }}
            </div>

            <div class="sell__head-item sell__head-item_quantity">
              {{ $t('Q-ty') }}
            </div>

            <div class="sell__head-item sell__head-item_price">
              {{ $t('Price') }}
            </div>

            <div class="sell__head-item sell__head-item_action"></div>
          </div>

          <div class="sell__rows">
            <div
              v-for="item in selectedItems"
              :key="item.short_name"
              class="sell__row"
            >
              <div class="sell__cell sell__cell_name">
                <span class="sell__mobile-label">
                  {{ $t('Item') }}
                </span>

                <div class="sell__item-name">
                  {{ item.name }}
                </div>
              </div>

              <div class="sell__cell sell__cell_available">
                <span class="sell__mobile-label">
                  {{ $t('Available') }}
                </span>

                <span>
                  {{ item.available }}
                </span>
              </div>

              <div class="sell__cell sell__cell_quantity">
                <span class="sell__mobile-label">
                  {{ $t('Q-ty') }}
                </span>

                <CartItemQuantity
                  class="sell__quantity"
                  :model-value="item.quantity"
                  :min="1"
                  :max="item.available"
                  :loading="isLoading"
                  @change="quantity => updateItemQuantity(item, quantity)"
                />
              </div>

              <div class="sell__cell sell__cell_price">
                <span class="sell__mobile-label">
                  {{ $t('Price') }}
                </span>

                <PriceFormatter
                  class="sell__price"
                  :price="getItemTotal(item)"
                  skip-conversion
                  size="size-14"
                />
              </div>

              <div class="sell__cell sell__cell_action">
                <BaseButton
                  type="button"
                  class="sell__remove"
                  variant="trash"
                  :disabled="isLoading"
                  @click="removeSelectedItem(item.short_name)"
                >
                  <SvgIcon :icon="TrashIcon" class="sell__remove-icon" />
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <div class="sell__bottom">
          <div class="sell__total">
            <span class="sell__total-label">
              {{ $t('Total:') }}
            </span>

            <PriceFormatter
              class="sell__total-coin"
              :price="totalPrice"
              skip-conversion
              size="size-32"
            />

            <PriceFormatter
              class="sell__total-fiat"
              :price="totalPrice"
              :currency-code="currentCurrencyCode"
              is-currency
              size="size-14"
            />
          </div>

          <BaseCheckbox
            v-model="acceptApproval"
            :error="formError"
            class="sell__checkbox"
            :disabled="isLoading"
          >
            {{ $t('I understand this transaction requires admin approval') }}
          </BaseCheckbox>

          <div v-if="generalError" class="sell__error _text-error">
            {{ generalError }}
          </div>

          <BaseButton
            type="button"
            variant="bordered"
            class="sell__submit"
            :disabled="isLoading || !isFormValid"
            :loading="isLoading"
            @click="handleSubmit"
          >
            {{ $t('CREATE NEW OFFER') }}
          </BaseButton>
        </div>
      </template>
    </div>

    <SellSuccessModal
      :show="isSellSuccessModalOpen"
      @close="handleModalClose"
    />
  </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import axios from '@/plugins/axios'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import CartItemQuantity from '@/pages/CartPage/components/CartItemQuantity.vue'

import { TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import SellSuccessModal from '@/pages/SellSkin/modals/SellSuccessModal.vue'

import { useCurrencyStore } from '@/stores/currency'

const router = useRouter()

const currencyStore = useCurrencyStore()

const { currentCurrencyCode } = storeToRefs(currencyStore)

const isDebugItemsActive = true

const debugInventory = [
  {
    short_name: 'debug.no-mercy-helmet',
    amount: 10,
    catalog_item: {
      name: 'No Mercy Helmet',
      price: 1.38,
    },
  },
  {
    short_name: 'debug.glory-ak47',
    amount: 6,
    catalog_item: {
      name: 'Glory AK47',
      price: 2.15,
    },
  },
  {
    short_name: 'debug.tempered-mask',
    amount: 4,
    catalog_item: {
      name: 'Tempered Mask',
      price: 3.42,
    },
  },
  {
    short_name: 'debug.blackout-hoodie',
    amount: 8,
    catalog_item: {
      name: 'Blackout Hoodie',
      price: 1.92,
    },
  },
  {
    short_name: 'debug.forest-raiders',
    amount: 12,
    catalog_item: {
      name: 'Forest Raiders Pants',
      price: 0.95,
    },
  },
]

const inventory = ref([])
const selectedItems = ref([])

const itemToAdd = ref('')

const acceptApproval = ref(false)

const isLoading = ref(false)
const isInventoryLoading = ref(false)

const isSellSuccessModalOpen = ref(false)

const formError = ref('')
const generalError = ref('')

const inventoryOptions = computed(() => {
  return inventory.value.map(item => {
    return {
      label: item.catalog_item?.name || item.game_name || item.short_name,
      value: item.short_name,
      available: Number(item.amount || 0),
      price: Number(item.catalog_item?.price || 0),
      item,
    }
  })
})

const availableInventoryOptions = computed(() => {
  const selectedNames = new Set(
    selectedItems.value.map(item => item.short_name),
  )

  return inventoryOptions.value.filter(
    option => !selectedNames.has(option.value),
  )
})

const totalPrice = computed(() => {
  const total = selectedItems.value.reduce((sum, item) => {
    return sum + getItemTotal(item)
  }, 0)

  return Number(total.toFixed(2))
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
      price >= 0.01
    )
  })
})

const getItemTotal = item => {
  return Number(
    (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2),
  )
}

const addSelectedItem = shortName => {
  if (!shortName) {
    return
  }

  const option = inventoryOptions.value.find(item => item.value === shortName)

  if (!option) {
    return
  }

  const alreadySelected = selectedItems.value.some(
    item => item.short_name === shortName,
  )

  if (alreadySelected) {
    itemToAdd.value = ''
    return
  }

  selectedItems.value.push({
    short_name: option.value,
    name: option.label,
    available: option.available,
    quantity: 1,
    price: option.price,
  })

  itemToAdd.value = ''
  generalError.value = ''
}

const removeSelectedItem = shortName => {
  selectedItems.value = selectedItems.value.filter(
    item => item.short_name !== shortName,
  )

  generalError.value = ''
}

const updateItemQuantity = (item, quantity) => {
  const value = Number.parseInt(quantity, 10)

  if (!Number.isFinite(value)) {
    return
  }

  item.quantity = Math.max(1, Math.min(value, item.available))

  generalError.value = ''
}

const fetchInventory = async () => {
  if (isDebugItemsActive) {
    inventory.value = debugInventory
    isInventoryLoading.value = false
    generalError.value = ''
    return
  }

  try {
    isInventoryLoading.value = true
    generalError.value = ''

    const { data } = await axios.get('/user/inventory')

    if (data?.status !== 'OK') {
      throw new Error(data?.message || 'Failed to load inventory')
    }

    inventory.value = Array.isArray(data?.payload)
      ? data.payload.filter(item => Number(item?.amount || 0) > 0)
      : []
  } catch (error) {
    console.error('Inventory fetch error:', error)

    inventory.value = []

    generalError.value =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to load inventory'
  } finally {
    isInventoryLoading.value = false
  }
}

const handleSubmit = async () => {
  if (isLoading.value) {
    return
  }

  formError.value = ''
  generalError.value = ''

  if (!selectedItems.value.length) {
    generalError.value = 'Select at least one item'
    return
  }

  if (!acceptApproval.value) {
    formError.value = 'You must confirm admin approval'
    return
  }

  if (!isFormValid.value) {
    generalError.value = 'Please check item quantities and prices'
    return
  }

  if (isDebugItemsActive) {
    isSellSuccessModalOpen.value = true
    return
  }

  try {
    isLoading.value = true

    const payload = {
      items: selectedItems.value.map(item => ({
        short_name: item.short_name,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
    }

    const { data } = await axios.post('/user/sell-requests', payload)

    if (data?.status !== 'OK') {
      throw new Error(data?.message || 'Failed to create sell request')
    }

    selectedItems.value = []
    itemToAdd.value = ''
    acceptApproval.value = false

    await fetchInventory()

    isSellSuccessModalOpen.value = true
  } catch (error) {
    console.error('Error creating sell request:', error)

    const apiData = error?.response?.data

    if (apiData?.message === 'Insufficient items in inventory') {
      generalError.value = 'You do not have enough items in inventory'

      return
    }

    if (
      apiData?.errors &&
      typeof apiData.errors === 'object' &&
      !Array.isArray(apiData.errors)
    ) {
      const firstError = Object.values(apiData.errors).find(Boolean)

      if (Array.isArray(firstError)) {
        generalError.value = firstError[0] || 'Failed to create sell request'
      } else if (firstError) {
        generalError.value = firstError
      }

      return
    }

    generalError.value =
      apiData?.message || error?.message || 'Failed to create sell request'
  } finally {
    isLoading.value = false
  }
}

const handleModalClose = () => {
  isSellSuccessModalOpen.value = false

  if (isDebugItemsActive) {
    return
  }

  router.push({
    name: 'account-offers',
  })
}

watch(itemToAdd, value => {
  if (!value) {
    return
  }

  addSelectedItem(value)
})

watch(acceptApproval, value => {
  if (value) {
    formError.value = ''
  }
})

onMounted(async () => {
  await fetchInventory()

  if (isDebugItemsActive) {
    selectedItems.value = inventoryOptions.value.slice(0, 3).map(option => ({
      short_name: option.value,
      name: option.label,
      available: option.available,
      quantity: 1,
      price: option.price,
    }))

    acceptApproval.value = true
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sell {
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;

  @include adaptiveValue('padding-top', 48, 25);
  @include adaptiveValue('padding-bottom', 96, 25);

  &__inner {
    width: 100%;
  }

  &__title {
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__selector {
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__select {
    width: 100%;
  }

  &__loading,
  &__empty {
    padding: 40px 15px;
    text-align: center;
    color: var(--seconday-color);
    background-color: var(--bg-secondary-color);
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

    @include adaptiveValue('gap', 40, 15, 1400, 992, 1);

    padding: 13px 18px;

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
      min-width: 150px;
    }

    &_available {
      flex: 0 0 120px;
    }

    &_quantity {
      flex: 0 0 160px;
    }

    &_price {
      flex: 0 0 120px;
    }

    &_action {
      flex: 0 0 44px;
    }
  }

  &__row {
    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 40, 15, 1400, 992, 1);
    @include adaptiveValue('padding-top', 13, 10);
    @include adaptiveValue('padding-bottom', 13, 10);

    padding-left: 18px;
    padding-right: 18px;

    min-height: 74px;

    background-color: #12181c;

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;

    &:not(:last-child) {
      margin-bottom: 2px;
    }

    @media (max-width: $md4) {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
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
      min-width: 150px;
    }

    &_available {
      flex: 0 0 120px;
    }

    &_quantity {
      flex: 0 0 160px;
    }

    &_price {
      flex: 0 0 120px;
    }

    &_action {
      flex: 0 0 44px;
    }

    @media (max-width: $md4) {
      flex: none;
      justify-content: space-between;
      gap: 15px;
      min-width: 0;
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
    text-overflow: ellipsis;
    white-space: nowrap;
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

  &__remove {
    min-width: 44px;
    width: 44px;
    height: 44px;

    padding: 0;

    &-icon {
      min-width: 16px;
      width: 16px;
      height: 16px;
    }
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

  &__total-fiat {
    color: var(--seconday-color);
  }

  &__checkbox {
    max-width: 600px;

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

    &__cell_action {
      justify-content: flex-end;
    }

    &__submit {
      max-width: 100%;
    }
  }
}
</style>
