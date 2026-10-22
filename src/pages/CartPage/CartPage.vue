<template>
  <main class="cart-page">
    <div class="cart-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="cart-page__inner _cnt">
      <BaseButton
        variant="back"
        icon="arrow"
        class="cart-page__back"
        @click="goBack"
      >
        {{ $t('Back') }}
      </BaseButton>

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

        <p class="cart-state__text">
          {{ cartStore.error }}
        </p>

        <BaseButton
          type="button"
          variant="clear"
          class="cart-state__button"
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
          type="button"
          variant="primary"
          class="cart-state__button"
          @click="goToStore"
        >
          {{ $t('Continue shopping') }}
        </BaseButton>
      </div>

      <div v-else class="cart-page__content">
        <div class="cart-page__cart cart">
          <div class="cart-page__heading">
            <h1 class="cart-page__title _h6">
              {{ $t('My Cart') }}
            </h1>
          </div>

          <div class="cart__frame">
            <div class="cart__head">
              <span>{{ $t('Item') }}</span>
              <span>{{ $t('Quantity') }}</span>
              <span>{{ $t('Price') }}</span>

              <button
                type="button"
                class="cart__delete-all"
                :disabled="isClearingCart || isSubmitting"
                @click="clearCart"
              >
                {{ $t('Clear all cart') }}
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
                    :aria-label="item.details?.name || $t('Item')"
                    @click="openProduct(item)"
                  >
                    <img
                      v-if="getItemImage(item)"
                      :src="getItemImage(item)"
                      :alt="item.details?.name || $t('Item')"
                    />
                  </button>

                  <div class="cart-item__information">
                    <button
                      type="button"
                      class="cart-item__name"
                      @click="openProduct(item)"
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
                  <span class="cart-item__mobile-label">
                    {{ $t('Quantity') }}
                  </span>

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
                  <span class="cart-item__mobile-label">
                    {{ $t('Price') }}
                  </span>

                  <PriceFormatter :price="getItemTotal(item)" size="size-14" />
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
                  <SvgIcon class="cart-item__remove-icon" :icon="TrashIcon" />
                  <span>{{ $t('Delete item') }}</span>
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

          <div v-if="errorMessage" class="cart__error" role="alert">
            {{ errorMessage }}
          </div>
        </div>

        <aside class="cart-page__payment payment">
          <h2 class="payment__title _h6">
            {{ $t('Checkout') }}
          </h2>

          <div class="payment__summary">
            <div class="payment__total">
              <span class="payment__total-label">
                {{ $t('Total') }}
              </span>

              <div class="payment__total-prices">
                <PriceFormatter
                  v-if="promoCodeStore.hasActivePromo"
                  class="payment__old-price"
                  :price="cartStore.cartTotal"
                  size="size-20"
                />

                <PriceFormatter
                  :price="cartTotalInternalCurrency"
                  size="size-28"
                />
              </div>
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

            <div class="payment__rate">
              <span>{{ $t('Rate') }}:</span>

              <PriceFormatter :price="1" size="size-14" />

              <span>
                = {{ currentCurrencyRate }}
                {{ currencyStore.currentCurrencySymbol }}
              </span>
            </div>
          </div>

          <div v-if="paymentMethodError" class="payment__error" role="alert">
            {{ paymentMethodError }}
          </div>

          <div class="payment__methods">
            <BaseButton
              type="button"
              variant="primary"
              class="payment__method payment__method_balance"
              :disabled="isSubmitting || isClearingCart"
              @click="handleSubmit('balance')"
            >
              <span class="payment__method-content">
                <span>{{ $t('Pay with balance') }}</span>

                <span class="payment__balance">
                  <PriceFormatter
                    :price="userStore.user?.balance ?? 0"
                    size="size-14"
                  />
                </span>
              </span>
            </BaseButton>

            <button
              v-if="cardPaymentMethod"
              type="button"
              class="payment__method payment__method_external"
              :disabled="isSubmitting || isClearingCart"
              @click="handleSubmit(cardPaymentMethod.code)"
            >
              <span>{{ $t('Continue with') }}</span>

              <img
                v-if="cardPaymentMethod.image"
                :src="cardPaymentMethod.image"
                :alt="cardPaymentMethod.title || $t('Card')"
                class="payment__method-image"
              />

              <span v-else class="payment__method-name">
                {{ cardPaymentMethod.title || $t('Card') }}
              </span>
            </button>

            <button
              v-for="method in otherPaymentMethods"
              :key="method.code"
              type="button"
              class="payment__method payment__method_external"
              :disabled="isSubmitting || isClearingCart"
              @click="handleSubmit(method.code)"
            >
              <span>{{ $t('Pay with') }}</span>

              <img
                v-if="method.image"
                :src="method.image"
                :alt="method.title"
                class="payment__method-image"
              />

              <span v-else class="payment__method-name">
                {{ method.title }}
              </span>
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
      v-if="IS_DETAILS_MODAL_ACTIVE"
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

import { TrashIcon } from '@/components/icons/index.js'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useToast } from '@/composables/useToast'

import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'
import { usePromoCodeStore } from '@/stores/promocode'
import { usePurchaseStore } from '@/stores/purchase'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

import ProductDetailsModal from '../ProductPages/modals/ProductDetailsModal.vue'

const IS_DETAILS_MODAL_ACTIVE = false

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

const cardPaymentMethod = computed(() => {
  return (
    settingsStore.paymentMethods?.find(method => method.code === 'card') ?? null
  )
})

const otherPaymentMethods = computed(() => {
  return (settingsStore.paymentMethods || []).filter(
    method => method.code !== 'card' && method.code !== 'balance',
  )
})

const priceDetails = item => {
  if (!item?.is_rental) {
    return Number(item?.unit_price ?? item?.details?.price ?? 0)
  }

  const rentalPrice = (item?.details?.rental_prices || []).find(
    price => String(price.rental_period_id) === String(item?.rental_period?.id),
  )

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

const getItemImage = item => {
  return (
    item?.details?.image_details ||
    item?.details?.image ||
    item?.details?.image_2 ||
    ''
  )
}

const formatType = value => {
  if (!value) return ''

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Both cards and packs have their own details pages.
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

// Controls whether a card opens its details page or modal.
const openProduct = item => {
  if (!item?.purchasable_id) return

  // When the modal is disabled, always navigate to the details page.
  if (!IS_DETAILS_MODAL_ACTIVE) {
    router.push(productLink(item))
    return
  }

  // Packs still use their own details page.
  if (item.purchasable_type !== 'card') {
    router.push(productLink(item))
    return
  }

  // When enabled, cards open the details modal.
  selectedProductId.value = item.purchasable_id
  isProductModalActive.value = true
}

const closeProductModal = () => {
  isProductModalActive.value = false
  selectedProductId.value = null
}

const goToStore = () => {
  router.push({
    name: 'ProductListPage',
  })
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  goToStore()
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
  if (isClearingCart.value || isSubmitting.value) {
    return
  }

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
  if (item?.is_rental || Number(item?.quantity) <= 1) {
    return
  }

  await updateItemQuantity(item, Number(item.quantity) - 1)
}

const increaseQuantity = async item => {
  if (item?.is_rental) return

  await updateItemQuantity(item, Number(item.quantity) + 1)
}

const handleSubmit = async methodCode => {
  if (isSubmitting.value || isClearingCart.value || !methodCode) {
    return
  }

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

    await router.push({
      name: 'SuccessPaymentPage',
    })
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
  @include adaptiveValue('padding-top', 100, 80);
  @include adaptiveValue('padding-bottom', 80, 30);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 100%;

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__inner {
    position: relative;
    z-index: 1;

    display: flex;
    flex: 1 1 100%;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__back {
    position: relative;
    z-index: 1;

    width: fit-content;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 24);
    }
  }

  &__content {
    @include adaptiveValue('column-gap', 16, 12);

    display: grid;
    align-items: flex-start;
    grid-template-columns: minmax(0, 1fr) 366px;

    width: 100%;
    max-width: 1192px;

    margin: auto;
  }

  &__cart,
  &__payment {
    min-width: 0;
  }

  &__heading {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 27, 18);
    }
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    text-align: left;
    text-transform: none;
  }

  @media (max-width: $md3) {
    &__content {
      align-items: start;
      row-gap: 24px;
      grid-template-columns: minmax(0, 1fr);

      max-width: 680px;
    }

    &__heading {
      min-height: auto;
    }
  }
}

.cart {
  &__frame {
    @include adaptiveValue('border-radius', 16, 10);

    width: 100%;
    min-width: 0;

    padding: 8px;

    background: linear-gradient(180deg, #111624 0%, #111624 100%);
  }

  &__head,
  .cart-item {
    display: grid;
    align-items: center;
    column-gap: 12px;
    grid-template-columns:
      minmax(0, 2fr)
      minmax(0, 1fr)
      minmax(0, 1fr)
      minmax(0, 1fr);
  }

  &__head {
    @include adaptiveValue('padding-left', 22, 10);
    @include adaptiveValue('padding-right', 22, 10);
    min-height: 40px;

    padding-top: 8px;
    padding-bottom: 8px;

    background-color: var(--bg-primary-color);

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    font-weight: 700;
    line-height: 150%;

    > span:nth-child(2) {
      text-align: center;
    }

    > span:nth-child(3) {
      text-align: center;
    }
  }

  &__delete-all {
    justify-self: end;

    width: max-content;
    max-width: none;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--error-color);
    font-family: var(--font-open-sans);
    font-size: 11px;
    font-weight: 500;
    line-height: 140%;
    white-space: nowrap;

    cursor: pointer;

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        text-decoration: underline;
      }
    }
  }

  &__items {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__error {
    margin-top: 12px;
    padding: 12px 14px;

    border: 1px solid var(--error-color);
    border-radius: 8px;
    background: #111624;

    color: var(--error-color);
    font-size: 13px;
    line-height: 150%;
  }

  @media (max-width: 650px) {
    &__frame {
      min-height: 0;
    }

    &__head {
      display: flex;
      justify-content: flex-end;

      > span {
        display: none;
      }
    }

    .cart-item {
      column-gap: 10px;
      grid-template-columns: minmax(0, 1fr) auto;
    }
  }
}

.cart-item {
  @include adaptiveValue('padding-left', 19, 10);
  @include adaptiveValue('padding-right', 19, 10);
  @include adaptiveValue('padding-top', 15, 10);
  @include adaptiveValue('padding-bottom', 15, 10);
  position: relative;

  min-width: 0;

  border-bottom: 1px solid var(--border-priamry-color);

  transition: opacity 0.3s ease;

  &:last-child {
    border-bottom: 0;
  }

  &_loading {
    opacity: 0.5;

    pointer-events: none;
  }

  &__product {
    display: flex;
    align-items: center;
    gap: 12px;

    min-width: 0;
  }

  &__preview {
    display: flex;
    overflow: hidden;
    flex: 0 0 42px;
    align-items: center;
    justify-content: center;

    width: 42px;
    height: 56px;

    padding: 2px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    background: var(--bg-primary-color);

    cursor: pointer;

    transition: all 0.3s ease 0s;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);

        transform: translateY(-2px);
      }
    }
  }

  &__placeholder {
    color: var(--fifth-color);
    font-size: 24px;
  }

  &__information {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;

    min-width: 0;
  }

  &__name {
    display: block;

    max-width: 100%;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 600;
    line-height: 150%;
    text-align: left;

    cursor: pointer;

    transition: color 0.3s ease;

    overflow-wrap: anywhere;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__meta {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    font-weight: 600;
    line-height: 100%;
  }

  &__quantity-cell {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;
  }

  &__quantity {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100px;
    height: 36px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    background: var(--bg-primary-color);
  }

  &__quantity-button {
    display: flex;
    flex: 0 0 30px;
    align-items: center;
    justify-content: center;

    height: 34px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--fourth-color);
    font-size: 19px;
    font-weight: 400;

    cursor: pointer;

    transition: color 0.2s ease;

    &:disabled {
      opacity: 0.35;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__quantity-input {
    flex: 1 1 auto;

    width: 30px;
    min-width: 0;

    padding: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 13px;
    text-align: center;
  }

  &__rental-period {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    line-height: 145%;
    text-align: center;
  }

  &__price {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;

    color: var(--fourth-color);
    :deep(.price) {
      flex-direction: row-reverse;
      gap: 5px;
    }
  }

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    width: fit-content;
    height: fit-content;

    margin-left: auto;
    padding: 0;

    border: 0;
    background: transparent;

    color: var(--fifth-color);
    font-size: 12px;
    white-space: nowrap;

    cursor: pointer;

    transition: all 0.3s ease 0s;

    &:disabled {
      opacity: 5;

      cursor: not-allowed;
    }
    &-icon {
      min-width: 14px;
      height: 14px;
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
    line-height: 150%;
  }

  &__mobile-label {
    display: none;
  }

  @media (max-width: 650px) {
    row-gap: 14px;
    grid-template-rows: auto auto;

    &__product {
      grid-column: 1;
      grid-row: 1;
    }

    &__remove {
      align-self: start;
      justify-self: end;
      grid-column: 2;
      grid-row: 1;
    }

    &__quantity-cell {
      justify-content: flex-start;
      grid-column: 1;
      grid-row: 2;
    }

    &__price {
      justify-content: flex-end;
      grid-column: 2;
      grid-row: 2;
    }

    &__quantity-cell,
    &__price {
      gap: 8px;
    }

    &__mobile-label {
      display: block;

      color: var(--fifth-color);
      font-size: 11px;
    }

    &__error {
      grid-row: 3;
    }
  }

  @media (max-width: $md8) {
    &__product {
      gap: 9px;
    }

    &__preview {
      flex-basis: 36px;

      width: 36px;
      height: 49px;
    }

    &__quantity {
      width: 90px;
    }

    &__quantity-button {
      flex-basis: 27px;
    }
    &__mobile-label {
      @include hide-item;
    }

    &__price {
      flex-wrap: wrap;
    }
  }
}

.payment {
  @include adaptiveValue('padding-top', 40, 10);
  @include adaptiveValue('padding-left', 32, 10);
  @include adaptiveValue('padding-right', 23, 10);
  @include adaptiveValue('padding-bottom', 23, 10);
  @include adaptiveValue('border-radius', 22, 10);

  width: 100%;
  min-width: 0;

  background: linear-gradient(180deg, #111624 0%, #111624 100%);

  &__title {
    color: var(--fourth-color);
    text-align: center;
    text-transform: none;
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__summary {
    @include adaptiveValue('padding-top', 24, 10);
    @include adaptiveValue('padding-bottom', 24, 10);
    @include adaptiveValue('padding-left', 20, 10);
    @include adaptiveValue('padding-right', 20, 10);
    @include adaptiveValue('border-radius', 16, 10);

    background: var(--bg-primary-color);
  }

  &__total {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  &__total-label {
    padding-top: 4px;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    font-weight: 700;
  }

  &__total-prices {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;

    min-width: 0;

    color: var(--fourth-color);
    :deep(.price) {
      flex-direction: row-reverse;
      gap: 6px;
    }
  }

  &__old-price,
  &__fiat-old {
    opacity: 0.5;

    text-decoration: line-through;
  }

  &__fiat {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;

    margin-top: 6px;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    line-height: 145%;
  }

  &__rate {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;

    margin-top: 12px;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    :deep(.price) {
      flex-direction: row-reverse;
      gap: 4px;
    }

    :deep(.price__number) {
      color: var(--fourth-color);
      font-size: 12px;
    }
  }

  &__methods {
    @include adaptiveValue('margin-top', 32, 22);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__method {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    width: 100%;
    min-height: 50px;

    padding: 9px 14px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    background: transparent;

    color: var(--fourth-color);
    font-family: var(--font-audiowide);
    font-size: 11px;
    font-weight: 400;
    line-height: 145%;
    text-align: left;
    text-transform: uppercase;

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease;

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }

    &_balance {
      display: flex;
      justify-content: space-between;

      border-color: var(--hint-secondary-color) !important;
      background: transparent;

      color: var(--hint-primary-color);
      @media (any-hover: hover) {
        &:not(:disabled):hover {
          background: rgb(255 199 0 / 6%);
        }
      }
    }

    &_external {
      border-color: var(--fourth-color);

      @media (any-hover: hover) {
        &:not(:disabled):hover {
          border-color: var(--hint-primary-color);
          background: var(--bg-primary-color);
        }
      }
    }
  }

  &__method-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    width: 100%;
  }

  &__balance {
    display: flex;
    align-items: center;

    padding: 4px 6px;

    border-radius: 4px;
    background-color: var(--bg-third-color);

    :deep(.price) {
      flex-direction: row-reverse;
      gap: 4px;

      margin-left: auto;
    }

    :deep(.price__number) {
      color: var(--fourth-color);
      font-family: var(--font-open-sans);
      font-size: 12px;
    }
  }

  &__method-image {
    display: block;

    width: auto;
    max-width: 90px;
    max-height: 24px;

    object-fit: contain;
  }

  &__method-name {
    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 600;
    text-transform: none;
  }

  &__error {
    margin-top: 14px;
    padding: 12px;

    border: 1px solid var(--error-color);
    border-radius: 8px;
    background: rgb(255 50 50 / 5%);

    color: var(--error-color);
    font-size: 12px;
    line-height: 150%;
    text-align: center;
  }

  &__processing {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    margin-top: 16px;

    color: var(--fifth-color);
    font-size: 12px;
  }

  &__loader {
    width: 22px;
    height: 22px;
  }

  &__continue {
    @include hide-item;

    width: fit-content;

    margin: 16px auto 0;
    padding: 0;

    border: 0;
    background: transparent;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    text-decoration: underline;

    cursor: pointer;

    transition: color 0.3s ease;

    text-underline-offset: 3px;

    @media (any-hover: hover) {
      &:hover {
        color: var(--fourth-color);
      }
    }
  }

  @media (max-width: $md3) {
    max-width: 480px;

    margin: 0 auto;
  }

  @media (max-width: $md6) {
    max-width: 100%;
  }
}

.cart-state {
  @include adaptiveValue('padding', 40, 20);
  @include adaptiveValue('border-radius', 18, 10);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;

  width: 100%;
  max-width: 540px;
  min-height: 280px;

  margin: auto;

  border: 1px solid var(--border-priamry-color);
  background: #111624;

  text-align: center;

  &__loader {
    width: 48px;
    height: 48px;
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    text-transform: none;
  }

  &__text {
    max-width: 420px;

    margin: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    line-height: 160%;
  }

  &__button {
    width: fit-content;
    min-width: 170px;
    max-width: 300px;
  }
}
</style>
