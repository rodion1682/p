<template>
  <main class="cart-page">
    <div class="cart-page__bg _ibg">
      <img src="@/assets/img/product-list-bg.png" alt="" />
    </div>

    <div class="cart-page__inner _cnt-home">
      <div v-if="cartStore.isLoading" class="cart-state">
        <LoadingSpinner class="cart-state__loader" />
      </div>

      <div
        v-else-if="cartStore.error && cartStore.error !== 'Cart is empty'"
        class="cart-state"
      >
        <h1 class="cart-state__title _h4">
          {{ $t('Something went wrong') }}
        </h1>
        <p class="cart-state__text">{{ cartStore.error }}</p>
        <BaseButton
          class="cart-state__button"
          variant="bordered"
          @click="refreshCart"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else-if="cartStore.isEmpty" class="cart-state">
        <h1 class="cart-state__title _h4">
          {{ $t('Your cart is empty') }}
        </h1>
        <p class="cart-state__text">
          {{ $t('Add cards or packs to continue.') }}
        </p>
        <BaseButton
          class="cart-state__button"
          variant="primary"
          @click="goToStore"
        >
          {{ $t('Continue shopping') }}
        </BaseButton>
      </div>

      <div v-else class="cart-page__content">
        <div class="cart-page__cart cart">
          <h1 class="cart-page__title">
            {{ $t('Your cart') }}
          </h1>

          <div class="cart__frame">
            <div class="cart__head">
              <span>{{ $t('Item') }}</span>
              <span>{{ $t('Quantity') }}</span>
              <span>{{ $t('Price') }}</span>

              <button
                type="button"
                class="cart__delete-all"
                :disabled="isClearingCart"
                @click="clearCart"
              >
                <span class="cart__delete-icon">×</span>
                {{ $t('Delete All') }}
              </button>
            </div>

            <div class="cart__items">
              <div
                v-for="item in cartStore.items"
                :key="getItemKey(item)"
                class="cart-item"
                :class="{
                  'cart-item_loading': cartStore.isItemLoading(
                    item.purchasable_id,
                  ),
                }"
              >
                <div class="cart-item__product">
                  <button
                    type="button"
                    class="cart-item__preview"
                    @click="openProductModal(item)"
                  >
                    <img
                      :src="item.details?.image"
                      :alt="item.details?.name || $t('Item')"
                    />
                  </button>
                  <div class="cart-item__information">
                    <button
                      type="button"
                      class="cart-item__name cart-item__name_button"
                      @click="openProductModal(item)"
                    >
                      {{ item.details?.name || $t('Item') }}
                    </button>

                    <span v-if="item.is_rental" class="cart-item__meta">
                      {{ $t('Rental') }}:
                      {{ item.rental_period?.label || '' }}
                    </span>

                    <span
                      v-else-if="item.purchasable_type"
                      class="cart-item__meta"
                    >
                      {{ formatType(item.purchasable_type) }}
                    </span>
                  </div>
                </div>

                <div class="cart-item__quantity-cell">
                  <div v-if="item.is_rental" class="cart-item__rental-period">
                    {{ item.rental_period?.label || '' }}
                  </div>

                  <div v-else class="cart-item__quantity">
                    <button
                      type="button"
                      class="cart-item__quantity-button"
                      :disabled="
                        Number(item.quantity) <= 1 ||
                        cartStore.isItemLoading(item.purchasable_id)
                      "
                      :aria-label="$t('Decrease quantity')"
                      @click="decreaseQuantity(item)"
                    >
                      −
                    </button>

                    <input
                      type="text"
                      inputmode="numeric"
                      class="cart-item__quantity-input"
                      :value="item.quantity"
                      :disabled="cartStore.isItemLoading(item.purchasable_id)"
                      :aria-label="$t('Quantity')"
                      @change="quantityChange($event, item.id)"
                    />

                    <button
                      type="button"
                      class="cart-item__quantity-button"
                      :disabled="cartStore.isItemLoading(item.purchasable_id)"
                      :aria-label="$t('Increase quantity')"
                      @click="increaseQuantity(item)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div class="cart-item__price">
                  <PriceFormatter :price="getItemTotal(item)" size="size-28" />
                </div>

                <button
                  type="button"
                  class="cart-item__remove"
                  :disabled="cartStore.isItemLoading(item.purchasable_id)"
                  :aria-label="$t('Remove item')"
                  @click="
                    removeItem(
                      item.purchasable_id,
                      item.purchasable_type,
                      item.rental_period?.id,
                    )
                  "
                >
                  <span>×</span>
                </button>

                <div
                  v-if="cartStore.getItemError(item.purchasable_id)"
                  class="cart-item__error"
                >
                  {{ cartStore.getItemError(item.purchasable_id) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="cart-page__payment payment">
          <h2 class="payment__title">{{ $t('Payment') }}:</h2>

          <div class="payment__summary">
            <div class="payment__total">
              <span class="payment__total-label"> {{ $t('Total') }}: </span>

              <div class="payment__total-price">
                <PriceFormatter
                  v-if="promoCodeStore.hasActivePromo"
                  class="payment__old-price"
                  :price="cartStore.cartTotal"
                  size="size-28"
                />

                <PriceFormatter
                  :price="cartTotalInternalCurrency"
                  size="size-28"
                />
              </div>
            </div>
          </div>

          <div class="payment__rate">
            <div class="payment__rate-value">
              <span>{{ $t('Rate') }}: </span>
              <PriceFormatter :price="1" size="size-14" />
              <span>
                = {{ currentCurrencyRate }}
                {{ currencyStore.currentCurrencySymbol }}
              </span>
            </div>

            <div class="payment__fiat">
              <span
                v-if="promoCodeStore.hasActivePromo"
                class="payment__fiat-old"
              >
                {{ currencyStore.currentCurrencySymbol }}
                {{ originalAmountInFiatCurrency }}
              </span>

              <span>
                {{ currencyStore.currentCurrencySymbol }}
                {{ amountInFiatCurrency }}
              </span>
            </div>
          </div>

          <div v-if="errorMessage || paymentMethodError" class="payment__error">
            {{ errorMessage || paymentMethodError }}
          </div>

          <div class="payment__methods">
            <BaseButton
              type="button"
              class="payment__method payment__method_balance"
              variant="primary"
              :disabled="isSubmitting"
              @click="handleSubmit('balance')"
            >
              {{ $t('Pay with balance') }}
            </BaseButton>

            <button
              v-if="cardPaymentMethod"
              type="button"
              class="payment__method payment__method_external"
              :disabled="isSubmitting"
              @click="handleSubmit(cardPaymentMethod.code)"
            >
              <span class="payment__cards">

              </span>
            </button>

            <button
              v-for="method in otherPaymentMethods"
              :key="method.code"
              type="button"
              class="payment__method payment__method_external"
              :disabled="isSubmitting"
              @click="handleSubmit(method.code)"
            >
              <img
                v-if="method.image"
                :src="method.image"
                :alt="method.title"
                class="payment__method-image"
              />

              <span v-else>{{ method.title }}</span>
            </button>
          </div>

          <div v-if="isSubmitting" class="payment__processing">
            <LoadingSpinner class="payment__loader" />
            {{ $t('Processing payment') }}
          </div>

          <button type="button" class="payment__continue" @click="goToStore">
            {{ $t('Continue shopping') }}
          </button>
        </aside>
      </div>
    </div>

    <CheckoutCartModal
      :show="isCheckoutModalOpen"
      :total="cartTotalInternalCurrency"
      @close="handleCheckoutClose"
      @back="handleBackFromCheckout"
    />

    <ProductDetailsModal
      v-model:show="isProductModalActive"
      :product-id="selectedProductId"
      @close="closeProductModal"
    />
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import CheckoutCartModal from '@/components/modals/CheckoutCartModal.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'

import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'
import { usePromoCodeStore } from '@/stores/promocode'
import { usePurchaseStore } from '@/stores/purchase'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'
import ProductDetailsModal from '../ProductPages/modals/ProductDetailsModal.vue'

const router = useRouter()
const toast = useToast()

const cartStore = useCartStore()
const currencyStore = useCurrencyStore()
const promoCodeStore = usePromoCodeStore()
const purchaseStore = usePurchaseStore()
const settingsStore = useSettingsStore()
const topupStore = useTopUpStore()
const userStore = useUserStore()

const isSubmitting = ref(false)
const isClearingCart = ref(false)
const isCheckoutModalOpen = ref(false)

const errorMessage = ref('')
const paymentMethodError = ref('')

const isProductModalActive = ref(false)
const selectedProductId = ref(null)

const openProductModal = item => {
  if (item.purchasable_type !== 'card') return

  selectedProductId.value = item.purchasable_id
  isProductModalActive.value = true
}

const closeProductModal = () => {
  isProductModalActive.value = false
  selectedProductId.value = null
}

const cardPaymentMethod = computed(() => {
  return (
    settingsStore.paymentMethods?.find(method => {
      return method.code === 'card'
    }) ?? null
  )
})

const otherPaymentMethods = computed(() => {
  return (settingsStore.paymentMethods || []).filter(method => {
    return method.code !== 'card' && method.code !== 'balance'
  })
})

const priceDetails = item => {
  if (!item?.is_rental) {
    return Number(item?.unit_price ?? item?.details?.price ?? 0)
  }

  const rentalPrice = (item?.details?.rental_prices || []).find(price => {
    return String(price.rental_period_id) === String(item?.rental_period?.id)
  })

  return Number(item?.unit_price ?? rentalPrice?.price ?? 0)
}

const cartTotalInternalCurrency = computed(() => {
  const total = cartStore.items.reduce((sum, item) => {
    const unitPrice = Number(item.unit_price ?? priceDetails(item) ?? 0)
    const quantity = Math.max(1, Number(item.quantity) || 1)

    return sum + unitPrice * quantity
  }, 0)

  if (!promoCodeStore.hasActivePromo) {
    return total
  }

  const discount = Number(promoCodeStore.discount?.amount || 0)

  return Math.max(0, total - discount)
})

const currentCurrencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const internalCurrencyEuroRate = computed(() => {
  return Number(
    settingsStore.settings?.internal_currency?.exchange_rate_eur || 1,
  )
})

const amountInFiatCurrency = computed(() => {
  const totalInEuro =
    cartTotalInternalCurrency.value * internalCurrencyEuroRate.value

  return (totalInEuro * currentCurrencyRate.value).toFixed(2)
})

const originalAmountInFiatCurrency = computed(() => {
  const totalInEuro =
    Number(cartStore.cartTotal || 0) * internalCurrencyEuroRate.value

  return (totalInEuro * currentCurrencyRate.value).toFixed(2)
})

const getItemTotal = item => {
  if (item?.total !== null && item?.total !== undefined) {
    return Number(item.total)
  }

  return priceDetails(item) * Math.max(1, Number(item?.quantity) || 1)
}

const getItemKey = item => {
  return [
    item.id,
    item.purchasable_type,
    item.purchasable_id,
    item.rental_period?.id || 'purchase',
  ].join('-')
}

const getPackImage = item => {
  return (
    item?.details?.image_details ??
    item?.details?.image ??
    item?.details?.image_2 ??
    ''
  )
}

const formatType = value => {
  if (!value) return ''

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const productLink = item => {
  return {
    name:
      item.purchasable_type === 'pack'
        ? 'PackDetailsPage'
        : 'ProductDetailsPage',
    params: {
      productId: item.purchasable_id,
    },
  }
}

const goToStore = () => {
  router.push({ name: 'ProductListPage' })
}

const refreshCart = async () => {
  errorMessage.value = ''

  try {
    await cartStore.fetchCartContent()
  } catch (error) {
    console.error('Failed to refresh cart:', error)

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to refresh cart'
  }
}

const removeItem = async (id, type, rentalPeriodId) => {
  if (cartStore.isItemLoading(id)) return

  errorMessage.value = ''

  try {
    const result = await cartStore.removeFromCart(id, type, rentalPeriodId)

    if (!result?.success) {
      errorMessage.value = result?.error || 'Failed to remove item'
    }
  } catch (error) {
    console.error('Failed to remove cart item:', error)

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to remove item'
  }
}

const clearCart = async () => {
  if (isClearingCart.value || isSubmitting.value) return

  isClearingCart.value = true
  errorMessage.value = ''

  try {
    for (const item of [...cartStore.items]) {
      const result = await cartStore.removeFromCart(
        item.purchasable_id,
        item.purchasable_type,
        item.rental_period?.id,
      )

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to remove item')
      }
    }
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || error?.message || 'Failed to clear cart'

    await refreshCart()
  } finally {
    isClearingCart.value = false
  }
}

const updateItemQuantity = async (item, quantity) => {
  if (!item?.id) return

  const normalizedQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1)

  errorMessage.value = ''

  try {
    await cartStore.updateQuantity(item.id, normalizedQuantity)
  } catch (error) {
    console.error('Failed to update quantity:', error)

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to update quantity'

    await refreshCart()
  }
}

const quantityChange = async (event, itemId) => {
  const input = event.target
  const quantity = Math.max(1, Number.parseInt(input.value, 10) || 1)

  input.value = quantity

  const item = cartStore.items.find(
    cartItem => String(cartItem.id) === String(itemId),
  )

  if (item) {
    await updateItemQuantity(item, quantity)
  }
}

const decreaseQuantity = async item => {
  if (item?.is_rental || Number(item?.quantity) <= 1) return

  await updateItemQuantity(item, Number(item.quantity) - 1)
}

const increaseQuantity = async item => {
  if (item?.is_rental) return

  await updateItemQuantity(item, Number(item.quantity) + 1)
}

const handleSubmit = async methodCode => {
  if (isSubmitting.value || !methodCode) return

  errorMessage.value = ''
  paymentMethodError.value = ''

  topupStore.setPaymentType(methodCode)

  if (methodCode !== 'balance') {
    isCheckoutModalOpen.value = true
    return
  }

  try {
    isSubmitting.value = true

    const response = await purchaseStore.purchaseCartItemsFromBalance()

    if (!response?.success) {
      const message = response?.error || 'An error occurred during checkout'

      toast.error(message)
      paymentMethodError.value = message
      return
    }

    if (response.redirect_url) {
      window.location.assign(response.redirect_url)
      return
    }

    await router.push({ name: 'SuccessPaymentPage' })
  } catch (error) {
    console.error('Checkout error:', error)

    const message =
      error?.response?.data?.message ||
      error?.message ||
      'An error occurred during checkout'

    toast.error(message)
    paymentMethodError.value = message
  } finally {
    isSubmitting.value = false
  }
}

const handleCheckoutClose = () => {
  isCheckoutModalOpen.value = false
}

const handleBackFromCheckout = () => {
  isCheckoutModalOpen.value = false
}

onMounted(async () => {
  try {
    if (!settingsStore.settings) {
      await settingsStore.fetchSettings()
    }

    await refreshCart()
  } catch (error) {
    console.error('Failed to initialize cart page:', error)
  }
})
</script>

<style lang="scss" scoped>
.cart-page {
  @include adaptiveValue('padding-top', 90, 80);
  @include adaptiveValue('padding-bottom', 100, 30);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  &__bg {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;

    img {
      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: top center;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
    max-width: 1400px;

    margin: auto;
  }

  &__content {
    @include adaptiveValue('gap', 16, 12);

    display: grid;
    align-items: start;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 332px);

    width: 100%;
  }

  &__cart,
  &__payment {
    min-width: 0;
  }

  &__title {
    @include adaptiveValue('font-size', 24, 20);
    @include adaptiveValue('margin-bottom', 24, 18);
    color: var(--primary-color);
    font-family: var(--font-texturina);
    font-weight: 500;
    line-height: 120%;
    text-align: left;
    text-transform: none;
  }

  @media (max-width: $md3) {
    &__content {
      gap: 35px;
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

.cart {
  &__frame {
    @include adaptiveValue('padding-top', 24, 10);
    @include adaptiveValue('padding-left', 46, 10);
    @include adaptiveValue('padding-right', 46, 10);
    @include adaptiveValue('padding-bottom', 24, 10);

    overflow: hidden;

    border: 1px solid var(--border-fourth-color);
    border-radius: 10px;
    background: var(--bg-secondary-color);
  }

  &__head,
  .cart-item {
    display: grid;
    align-items: center;
    column-gap: 16px;
    grid-template-columns:
      minmax(0, 1fr)
      minmax(105px, 0.6fr)
      minmax(115px, 0.55fr)
      30px;
  }

  &__head {
    padding-bottom: 12px;

    border-bottom: 1px solid var(--border-fourth-color);

    color: var(--seventh-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 100%;

    span:nth-child(2) {
      text-align: center;
    }
  }

  &__delete-all {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    grid-column: 4;

    width: max-content;

    margin-left: 30px;
    padding: 0;

    border: 0;
    background: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    white-space: nowrap;

    cursor: pointer;

    transform: translateX(-100%);

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--secondary-color);
      }
    }
  }

  &__delete-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 18px;
    height: 18px;

    border: 2px solid var(--fifth-color);
    border-radius: 50%;

    color: var(--fifth-color);
    font-size: 16px;
    line-height: 1;
  }

  &__items {
    display: flex;
    flex-direction: column;
  }

  @media (max-width: $md4) {
    &__head {
      display: flex;
      justify-content: space-between;

      > span {
        display: none;
      }
    }

    &__delete-all {
      margin-left: auto;

      transform: none;
    }

    .cart-item {
      grid-template-columns: minmax(0, 1fr) auto;
    }
  }
}

.cart-item {
  @include adaptiveValue('min-height', 90, 80);

  position: relative;

  padding: 14px 0;

  border-bottom: 1px dashed var(--border-third-color);

  transition: opacity 0.2s ease;

  &_loading {
    opacity: 0.45;

    pointer-events: none;
  }

  &__product {
    display: flex;
    align-items: center;
    gap: 14px;

    min-width: 0;
  }

  &__preview {
    @include adaptiveValue('width', 64, 40);
    @include adaptiveValue('height', 64, 40);

    display: flex;
    overflow: hidden;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    border: 1px solid var(--seventh-color);
    border-radius: 50%;
    background: var(--bg-fourth-color);

    transition: transform 0.3s ease;

    img {
      width: 90%;
      height: 90%;

      object-fit: cover;
    }

    @media (any-hover: hover) {
      &:hover {
        transform: scale(1.05);
      }
    }
  }

  &__information {
    display: flex;
    flex-direction: column;
    gap: 5px;

    min-width: 0;
  }

  &__name {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    line-height: 150%;
    text-align: left;

    overflow-wrap: anywhere;

    @media (any-hover: hover) {
      &:hover {
        color: var(--secondary-color);
      }
    }
  }

  &__meta {
    @include hide-item;
  }

  &__quantity-cell {
    display: flex;
    justify-content: center;
  }

  &__quantity {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 37px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 5px;
    background: var(--bg-nineth-color);
  }

  &__quantity-button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 29px;
    height: 35px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--seventh-color);
    font-size: 22px;
    font-weight: 300;

    cursor: pointer;

    &:disabled {
      opacity: 0.35;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--primary-color);
      }
    }
  }

  &__quantity-input {
    width: 30px;

    padding: 0;

    border: 0;
    outline: 0;
    background: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;
  }

  &__rental-period {
    color: var(--secondary-color);
    font-size: 12px;
    text-align: center;
  }

  &__price {
    display: flex;
    align-items: center;

    min-width: 0;

    white-space: nowrap;

    :deep(.price) {
      flex-direction: row-reverse;
    }
  }

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--fifth-color);

    cursor: pointer;

    transition: all 0.3s ease 0s;

    span {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 18px;
      height: 18px;

      border: 2px solid currentColor;
      border-radius: 50%;

      font-size: 16px;
      line-height: 1;
    }

    &:disabled {
      opacity: 0.35;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--error-color);
      }
    }
  }

  &__error {
    grid-column: 1 / -1;

    margin-top: 8px;

    color: var(--error-color);
    font-size: 12px;
  }

  @media (max-width: $md4) {
    gap: 12px;

    &__product {
      grid-column: 1;
    }

    &__remove {
      justify-self: end;
      grid-column: 2;
      grid-row: 1;
    }

    &__quantity-cell {
      justify-content: flex-start;
      grid-column: 1;

      padding-left: 5px;
    }

    &__price {
      justify-content: flex-end;
      grid-column: 2;
      grid-row: 2;
    }
  }
}

.payment {
  &__title {
    @include adaptiveValue('font-size', 24, 20);
    @include adaptiveValue('margin-bottom', 20, 14);

    color: var(--primary-color);
    font-family: var(--font-texturina);
    font-weight: 500;
    line-height: 1.25;
    text-transform: none;
  }

  &__summary {
    @include adaptiveValue('padding', 20, 15);

    border: 1px solid var(--border-fourth-color);
    border-radius: 10px;
    background: var(--bg-secondary-color);
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  &__total-label {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 500;
  }

  &__total-price {
    display: flex;
    justify-content: flex-end;
    :deep(.price) {
      flex-direction: row-reverse;
    }
  }

  &__old-price,
  &__fiat-old {
    opacity: 0.5;

    text-decoration: line-through;
  }

  &__rate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    margin-top: 12px;
    padding: 0 20px;

    color: var(--seventh-color);
    font-family: var(--font-inter);
    font-size: 12px;
  }

  &__rate-value,
  &__fiat {
    display: flex;
    align-items: center;
    gap: 6px;

    color: var(--seventh-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 100%;
  }

  &__rate-value {
    :deep(.price) {
      flex-direction: row-reverse;
    }
  }

  &__fiat {
    color: var(--secondary-color);
    white-space: nowrap;
  }

  &__methods {
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin-top: 22px;
  }

  &__method {
    @include adaptiveValue('min-height', 38, 36);

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    width: 100%;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;

    cursor: pointer;

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }

    &_balance {
      background: var(--third-color);

      color: var(--primary-color);
    }

    &_external {
      border: 1px solid #08070e;
      background: #050508;

      color: var(--primary-color);

      transition:
        border-color 0.2s ease,
        background-color 0.2s ease;

      @media (any-hover: hover) {
        &:not(:disabled):hover {
          border-color: var(--third-color);
          background: #151127;
        }
      }
    }
  }

  &__cards {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;

    img {
      display: block;

      width: auto;
      max-width: 45px;
      height: 21px;

      object-fit: contain;
    }
  }

  &__method-image {
    display: block;

    width: auto;
    max-width: 110px;
    max-height: 23px;

    object-fit: contain;
  }

  &__error {
    margin-top: 14px;
    padding: 10px;

    border: 1px solid var(--border-third-color);
    border-radius: 5px;
    background: rgb(252 102 119 / 8%);

    color: var(--error-color);
    font-size: 12px;
    text-align: center;
  }

  &__processing {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    margin-top: 15px;

    color: var(--secondary-color);
    font-size: 12px;
  }

  &__loader {
    width: 22px;
    height: 22px;
  }

  &__continue {
    @include hide-item;
  }

  @media (max-width: $md3) {
    width: 100%;
    max-width: 480px;

    margin: 0 auto;
  }

  @media (max-width: $md6) {
    max-width: none;

    &__rate {
      padding: 0 5px;
    }
  }
}

.cart-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;

  width: 100%;

  margin: auto;

  text-align: center;

  &__loader {
    width: 48px;
    height: 48px;
  }

  &__title {
    color: var(--primary-color);
  }

  &__text {
    max-width: 450px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 1.5;
  }
  &__button {
    max-width: 300px;

    margin: 0 auto;
  }
}
</style>
