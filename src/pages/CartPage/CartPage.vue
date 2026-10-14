<template>
  <main class="cart-page">
    <div class="cart-page__bg _ibg">
      <img src="@/assets/img/cart-bg.jpg" />
    </div>
    <div class="cart-page__inner _cnt-home">
      <div v-if="cartStore.isLoading" class="cart-state">
        <LoadingSpinner class="cart-state__loader" />
      </div>

      <div
        v-else-if="cartStore.error && cartStore.error !== 'Cart is empty'"
        class="cart-state"
      >
        <div class="cart-state__title _h3">
          {{ $t('Something went wrong') }}
        </div>

        <div class="cart-state__text">
          {{ cartStore.error }}
        </div>

        <BaseButton
          type="button"
          variant="hint-bordered"
          class="cart-state__button"
          @click="refreshCart"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else-if="cartStore.isEmpty" class="cart-state">
        <div class="cart-state__title _h3">
          {{ $t('Your cart is empty') }}
        </div>

        <div class="cart-state__text">
          {{ $t('Add cards or packs to continue.') }}
        </div>

        <BaseButton
          type="button"
          variant="hint-bordered"
          class="cart-state__button"
          @click="goToStore"
        >
          {{ $t('Continue shopping') }}
        </BaseButton>
      </div>

      <div v-else class="cart-page__content">
        <section class="cart-page__cart cart">
          <h1 class="cart-page__title _h3">
            {{ $t('Your Cart') }}
          </h1>

          <div class="cart__frame">
            <div
              class="cart__decor cart__decor_top-left _ibg-contain"
              aria-hidden="true"
            >
              <img src="@/assets/img/modal-decor.png" alt="" />
            </div>

            <div
              class="cart__decor cart__decor_top-right _ibg-contain"
              aria-hidden="true"
            >
              <img src="@/assets/img/modal-decor.png" alt="" />
            </div>

            <div
              class="cart__decor cart__decor_bottom-left _ibg-contain"
              aria-hidden="true"
            >
              <img src="@/assets/img/modal-decor.png" alt="" />
            </div>

            <div
              class="cart__decor cart__decor_bottom-right _ibg-contain"
              aria-hidden="true"
            >
              <img src="@/assets/img/modal-decor.png" alt="" />
            </div>

            <div class="cart__box">
              <div class="cart__head">
                <div class="cart__head-item cart__head-item_product">
                  {{ $t('Item') }}
                </div>

                <div class="cart__head-item cart__head-item_quantity">
                  {{ $t('Quantity') }}
                </div>

                <div class="cart__head-item cart__head-item_price">
                  {{ $t('Price') }}
                </div>

                <div class="cart__head-item cart__head-item_remove" />
              </div>

              <div class="cart__items">
                <div
                  v-for="item in cartStore.items"
                  :key="getItemKey(item)"
                  class="cart__item cart-item"
                  :class="
                    cartStore.isItemLoading(item.purchasable_id)
                      ? 'cart-item_loading'
                      : ''
                  "
                >
                  <div class="cart-item__product">
                    <RouterLink
                      :to="productLink(item)"
                      class="cart-item__preview"
                      :aria-label="item.details?.name || $t('Item')"
                    >
                      <div
                        v-if="item.purchasable_type === 'card'"
                        class="cart-item__card"
                      >
                        <img
                          v-if="item.details?.image"
                          :src="item.details.image"
                          :alt="item.details?.name || ''"
                        />
                      </div>

                      <div v-else class="cart-item__pack">
                        <img
                          :src="getPackImage(item)"
                          :alt="item.details?.name || $t('Pack')"
                        />
                      </div>
                    </RouterLink>

                    <div class="cart-item__information">
                      <RouterLink
                        :to="productLink(item)"
                        class="cart-item__name"
                      >
                        {{ item.details?.name || $t('Item') }}
                      </RouterLink>

                      <div v-if="item.is_rental" class="cart-item__meta">
                        <span class="cart-item__meta-label">
                          {{ $t('Rental') }}:
                        </span>

                        <span class="cart-item__meta-value">
                          {{ item.rental_period?.label || '—' }}
                        </span>
                      </div>

                      <div
                        v-else-if="item.purchasable_type"
                        class="cart-item__meta"
                      >
                        {{ formatType(item.purchasable_type) }}
                      </div>
                    </div>
                  </div>

                  <div class="cart-item__quantity">
                    <template v-if="item.is_rental">
                      <div class="cart-item__rental-period">
                        {{ item.rental_period?.label || '—' }}
                      </div>
                    </template>

                    <template v-else>
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
                        class="cart-item__quantity-input"
                        type="text"
                        inputmode="numeric"
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
                    </template>
                  </div>

                  <div class="cart-item__price">
                    <PriceFormatter
                      :price="getItemTotal(item)"
                      size="size-24"
                    />
                  </div>

                  <button
                    type="button"
                    class="cart-item__remove"
                    :aria-label="$t('Remove item')"
                    :disabled="cartStore.isItemLoading(item.purchasable_id)"
                    @click="
                      removeItem(
                        item.purchasable_id,
                        item.purchasable_type,
                        item.rental_period?.id,
                      )
                    "
                  >
                    <span class="cart-item__remove-circle"> × </span>
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
        </section>

        <aside class="cart-page__payment payment">
          <h2 class="payment__title _h4">
            {{ $t('Payment') }}
          </h2>

          <div class="payment__summary">
            <div class="payment__total">
              <div class="payment__total-label">{{ $t('Total') }}:</div>

              <div class="payment__total-price">
                <PriceFormatter
                  v-if="promoCodeStore.hasActivePromo"
                  class="payment__old-price"
                  :price="cartStore.cartTotal"
                  size="size-20"
                />

                <PriceFormatter
                  :price="cartTotalInternalCurrency"
                  size="size-32"
                />
              </div>
            </div>

            <div class="payment__divider" />

            <div class="payment__rate">
              <div class="payment__rate-value">
                <span> {{ $t('Rate') }}: 1 </span>

                <PriceFormatter size="size-12" />

                <span>
                  =
                  {{ currencyStore.currentCurrencySymbol }}
                  {{ currentCurrencyRate }}
                </span>
              </div>

              <div class="payment__fiat">
                <span
                  v-if="promoCodeStore.hasActivePromo"
                  class="payment__fiat-old"
                >
                  =
                  {{ currencyStore.currentCurrencySymbol }}
                  {{ originalAmountInFiatCurrency }}
                </span>

                <span>
                  =
                  {{ currencyStore.currentCurrencySymbol }}
                  {{ amountInFiatCurrency }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="errorMessage || paymentMethodError" class="payment__error">
            {{ errorMessage || paymentMethodError }}
          </div>

          <div class="payment__methods">
            <BaseButton
              type="button"
              class="payment__method"
              :disabled="isSubmitting"
              @click="handleSubmit('balance')"
            >
              {{ $t('Pay with balance') }}
            </BaseButton>

            <BaseButton
              v-if="cardPaymentMethod"
              type="button"
              class="payment__method"
              variant="hint-bordered"
              :disabled="isSubmitting"
              @click="handleSubmit(cardPaymentMethod.code)"
            >
              <span class="payment__method-title">
                {{ cardPaymentMethod.title || $t('Pay by card') }}
              </span>

              <span class="payment__cards">
                <img
                  src="@/assets/images/magiculus/methods/mc.svg"
                  alt="Mastercard"
                />

                <img
                  src="@/assets/images/magiculus/methods/visa.svg"
                  alt="Visa"
                />
              </span>
            </BaseButton>

            <BaseButton
              v-for="method in otherPaymentMethods"
              :key="method.code"
              type="button"
              class="payment__method"
              variant="hint-bordered"
              :disabled="isSubmitting"
              @click="handleSubmit(method.code)"
            >
              <img
                v-if="method.image"
                :src="method.image"
                :alt="method.title"
                class="payment__method-image"
              />

              <span v-else class="payment__method-title">
                {{ method.title }}
              </span>
            </BaseButton>
          </div>

          <div v-if="isSubmitting" class="payment__processing">
            <LoadingSpinner class="payment__loader" />

            <span>
              {{ $t('Processing payment') }}
            </span>
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
const isCheckoutModalOpen = ref(false)

const errorMessage = ref('')
const paymentMethodError = ref('')

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
  const originalTotal = Number(cartStore.cartTotal || 0)

  const totalInEuro = originalTotal * internalCurrencyEuroRate.value

  return (totalInEuro * currentCurrencyRate.value).toFixed(2)
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

const getItemTotal = item => {
  if (item?.total !== null && item?.total !== undefined) {
    return Number(item.total)
  }

  const quantity = Math.max(1, Number(item?.quantity) || 1)

  return priceDetails(item) * quantity
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
  if (!value) {
    return ''
  }

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const productLink = item => {
  if (item.purchasable_type === 'pack') {
    return {
      name: 'PackDetailsPage',
      params: {
        productId: item.purchasable_id,
      },
    }
  }

  return {
    name: 'ProductDetailsPage',
    params: {
      productId: item.purchasable_id,
    },
  }
}

const goToStore = () => {
  router.push({
    name: 'ProductListPage',
  })
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
  if (cartStore.isItemLoading(id)) {
    return
  }

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

const updateItemQuantity = async (item, quantity) => {
  if (!item?.id) {
    return
  }

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
  errorMessage.value = ''

  try {
    await cartStore.updateQuantity(itemId, quantity)
  } catch (error) {
    console.error('Failed to update quantity:', error)

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to update quantity'

    await refreshCart()
  }
}

const decreaseQuantity = async item => {
  if (item?.is_rental || Number(item?.quantity) <= 1) {
    return
  }

  await updateItemQuantity(item, Number(item.quantity) - 1)
}

const increaseQuantity = async item => {
  if (item?.is_rental) {
    return
  }

  await updateItemQuantity(item, Number(item.quantity) + 1)
}

const handleSubmit = async methodCode => {
  if (isSubmitting.value || !methodCode) {
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
  @include adaptiveValue('padding-top', 120, 75);
  @include adaptiveValue('padding-bottom', 80, 25);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }
  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
  }

  &__content {
    display: flex;
    align-items: flex-start;
    gap: clamp(18px, 2vw, 32px);

    width: 100%;
  }

  &__cart {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__payment {
    flex: 0 0 305px;
  }

  &__title {
    color: var(--primary-color);
    text-align: left;

    &:not(:last-child) {
      margin-bottom: 18px;
    }
  }

  @media (max-width: $md3) {
    &__content {
      flex-direction: column;
    }

    &__cart,
    &__payment {
      width: 100%;
    }

    &__payment {
      flex: none;
    }
  }
}

.cart {
  &__frame {
    position: relative;

    width: 100%;

    padding: 5px;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-secondary-color);
    box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
  }

  &__box {
    @include adaptiveValue('padding-top', 28, 16);
    @include adaptiveValue('padding-bottom', 28, 16);
    @include adaptiveValue('padding-left', 54, 12);
    @include adaptiveValue('padding-right', 54, 12);

    min-height: 325px;

    border: 1px solid var(--border-fourth-color);
    background-color: var(--bg-primary-color);
  }

  &__decor {
    @include adaptiveValue('width', 58, 38);
    @include adaptiveValue('height', 48, 38);

    position: absolute;
    z-index: 3;

    pointer-events: none;

    &_top-left {
      top: -6px;
      left: -6px;

      transform: rotate(-90deg);
    }

    &_top-right {
      top: -6px;
      right: -6px;
    }

    &_bottom-left {
      bottom: -6px;
      left: -6px;

      transform: rotate(-180deg);
    }

    &_bottom-right {
      right: -6px;
      bottom: -6px;

      transform: rotate(90deg);
    }
  }

  &__head,
  &__item {
    display: grid;
    align-items: center;
    gap: 20px;
    grid-template-columns:
      minmax(220px, 1fr)
      150px
      180px
      34px;
  }

  &__head {
    min-height: 44px;

    border-bottom: 1px solid var(--border-secondary-color);

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
  }

  &__head-item {
    &_quantity {
      text-align: center;
    }
  }

  &__items {
    display: flex;
    flex-direction: column;
  }

  @media (max-width: $md2) {
    &__head,
    &__item {
      grid-template-columns:
        minmax(180px, 1fr)
        130px
        140px
        34px;
    }
  }

  @media (max-width: $md4) {
    &__head {
      display: none;
    }
  }
}

.cart-item {
  position: relative;

  min-height: 88px;

  padding: 12px 0;

  border-bottom: 1px solid var(--border-fourth-color);

  transition:
    opacity 0.3s ease,
    background-color 0.3s ease;

  &:last-child {
    border-bottom: 0;
  }

  &_loading {
    opacity: 0.45;

    pointer-events: none;
  }

  @media (any-hover: hover) {
    &:hover {
      background-color: rgb(255 255 255 / 2%);
    }
  }

  &__product {
    display: flex;
    align-items: center;
    gap: 12px;

    min-width: 0;
  }

  &__preview {
    display: flex;
    flex: 0 0 42px;
    align-items: center;
    justify-content: center;

    width: 42px;
    height: 58px;

    transition: transform 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        transform: translateY(-2px);
      }
    }
  }

  &__card,
  &__pack {
    width: 100%;
    height: 100%;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__information {
    display: flex;
    flex-direction: column;
    gap: 5px;

    min-width: 0;
  }

  &__name {
    overflow: hidden;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 130%;
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }
  }

  &__meta {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 11px;
    line-height: 130%;
  }

  &__meta-label {
    margin-right: 4px;
  }

  &__meta-value {
    color: var(--hint-third-color);
  }

  &__quantity {
    display: flex;
    align-items: stretch;
    justify-self: center;

    width: fit-content;
    min-height: 34px;

    border: 1px solid var(--border-secondary-color);
  }

  &__quantity-button {
    display: flex;
    flex: 0 0 34px;
    align-items: center;
    justify-content: center;

    width: 34px;

    padding: 0;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--hint-secondary-color);
    font-family: var(--font-inter);
    font-size: 20px;
    font-weight: 300;
    line-height: 1;

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease,
      opacity 0.3s ease;

    &:disabled {
      opacity: 0.3;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        background-color: var(--bg-fifth-color);

        color: var(--primary-color);
      }
    }
  }

  &__quantity-input {
    width: 42px;

    padding: 0 4px;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-align: center;
  }

  &__rental-period {
    padding: 8px 10px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 12px;
  }

  &__price {
    white-space: nowrap;
  }

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 28px;
    height: 28px;

    padding: 0;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--hint-primary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      opacity 0.3s ease,
      transform 0.3s ease;

    &:disabled {
      opacity: 0.35;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--error-color);

        transform: scale(1.08);
      }
    }
  }

  &__remove-circle {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;

    border: 1px solid currentColor;
    border-radius: 50%;

    font-family: var(--font-inter);
    font-size: 17px;
    font-weight: 300;
    line-height: 1;
  }

  &__error {
    grid-column: 1 / -1;

    color: var(--error-color);
    font-size: 12px;
  }

  @media (max-width: $md4) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    padding: 15px 0;

    &__product {
      flex: 1 1 calc(100% - 50px);
    }

    &__remove {
      margin-left: auto;
    }

    &__price {
      display: flex;
      align-items: center;

      margin-left: auto;
    }

    &__error {
      flex: 1 1 100%;
    }
  }
}

.payment {
  align-self: center;

  &__title {
    color: var(--primary-color);
    font-weight: 500;
    text-transform: none;

    &:not(:last-child) {
      margin-bottom: 18px;
    }
  }

  &__summary {
    padding: 28px;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-primary-color);
    box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  &__total-label {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
  }

  &__total-price {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__old-price,
  &__fiat-old {
    opacity: 0.5;

    text-decoration: line-through;
  }

  &__divider {
    width: 100%;
    height: 1px;

    margin: 20px 0;

    background-color: var(--border-secondary-color);
  }

  &__rate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 12px;
  }

  &__rate-value,
  &__fiat {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__fiat {
    color: var(--hint-third-color);
    white-space: nowrap;
  }

  &__methods {
    display: flex;
    flex-direction: column;
    gap: 10px;

    margin-top: 22px;
  }

  &__method {
    @include adaptiveValue('min-height', 46, 40);

    width: 100%;

    font-family: var(--font-spectral);
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__method-title {
    position: relative;
    z-index: 1;
  }

  &__cards {
    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    gap: 7px;

    margin-left: auto;

    img {
      width: auto;
      max-width: 36px;
      height: 20px;
    }
  }

  &__method-image {
    position: relative;
    z-index: 1;

    width: auto;
    max-width: 90px;
    max-height: 24px;

    object-fit: contain;
  }

  &__error {
    margin-top: 15px;
    padding: 10px;

    border: 1px solid rgb(192 67 113 / 35%);
    background-color: rgb(192 67 113 / 8%);

    color: var(--error-color);
    font-size: 12px;
    text-align: center;
  }

  &__processing {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    margin-top: 15px;

    color: var(--secondary-color);
    font-size: 12px;
  }

  &__loader {
    width: 22px;
    height: 22px;
  }

  &__continue {
    display: block;

    width: fit-content;

    margin: 20px auto 0;
    padding: 5px 0;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    text-decoration: underline;

    cursor: pointer;

    transition: color 0.3s ease;

    text-underline-offset: 3px;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }
  }

  @media (max-width: $md3) {
    position: relative;
    top: auto;

    width: 100%;
  }

  @media (max-width: $md6) {
    &__summary {
      padding: 18px;
    }

    &__rate {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}

.cart-state {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 450px;

  text-align: center;

  &__loader {
    width: 48px;
    height: 48px;
  }

  &__title {
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__text {
    max-width: 450px;

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  &__button {
    width: 100%;
    max-width: 220px;
  }
}
</style>
