<template>
  <BaseModal
    :show="show"
    wrapper-classes="cart-modal__inner"
    @close="handleClose"
  >
    <div class="cart-modal">
      <div class="cart-modal__header">
        <h2 class="cart-modal__title _h2">{{ $t('My Cart') }}</h2>

        <BaseButton
          v-if="!cartStore.isEmpty"
          class="cart-modal__clear"
          variant="trash"
          :disabled="cartStore.isLoading"
          @click="clearCart"
        >
          <SvgIcon :icon="TrashIcon" class="cart-modal__clear-icon" />
          {{ $t('Clear cart') }}
        </BaseButton>
      </div>

      <LoadingSpinner v-if="cartStore.isLoading" class="cart-modal__loading" />

      <div v-else-if="!cartStore.isEmpty" class="cart-modal__content">
        <div class="cart-modal__summary">
          <div class="cart-modal__summary-top">
            <h3 class="cart-modal__summary-title _h4">{{ $t('Checkout') }}</h3>
            <span class="cart-modal__count">
              ({{ cartItemsCount }}
              {{ cartItemsCount === 1 ? $t('item') : $t('items') }})
            </span>
          </div>

          <div class="cart-modal__total">
            <span class="cart-modal__total-label">{{
              $t('Total to pay:')
            }}</span>
            <div class="cart-modal__total-values">
              <PriceFormatter
                class="cart-modal__coins"
                :price="totalCoins"
                size="size-12"
              />
              <PriceFormatter
                class="cart-modal__fiat"
                :price="totalFiat"
                size="size-12"
                is-currency
              />
            </div>
          </div>

          <BaseButton
            class="cart-modal__buy"
            variant="primary"
            :disabled="
              cartStore.isEmpty || cartStore.isLoading || hasLoadingItems
            "
            @click="openCheckout"
          >
            {{ $t('Buy') }}
          </BaseButton>
        </div>

        <div class="cart-modal__items">
          <div
            v-for="item in cartStore.items"
            :key="item.item_id"
            class="cart-modal__item"
          >
            <div class="cart-modal__product">
              <div class="cart-modal__image _ibg-contain">
                <img
                  v-if="getImage(item)"
                  :src="getImage(item)"
                  :alt="item.title || item.name || $t('Product')"
                  loading="lazy"
                />
              </div>
              <div class="cart-modal__product-info">
                <div class="cart-modal__product-name">
                  {{ item.title || item.name }}
                </div>
                <div v-if="item.category" class="cart-modal__category">
                  {{ item.category }}
                </div>
              </div>
            </div>

            <CartItemQuantity
              class="cart-modal__quantity"
              :model-value="getCount(item)"
              :loading="cartStore.isItemLoading(item.item_id)"
              @change="quantity => updateQuantity(item.item_id, quantity)"
            />

            <PriceFormatter
              class="cart-modal__item-price"
              :price="getLineTotal(item)"
              size="size-12"
            />

            <BaseButton
              class="cart-modal__remove"
              variant="trash"
              :disabled="cartStore.isItemLoading(item.item_id)"
              :aria-label="$t('Remove')"
              @click="removeItem(item.item_id)"
            >
              <SvgIcon :icon="TrashIcon" class="cart-modal__remove-icon" />
            </BaseButton>
          </div>
        </div>
      </div>

      <div v-else class="cart-modal__empty">
        <div class="cart-modal__empty-title _h3">
          {{ $t('Your Cart is Empty') }}
        </div>
        <p class="cart-modal__empty-text">
          {{ $t("Looks like you haven't added any items yet.") }}
        </p>
        <BaseButton
          class="cart-modal__shop"
          variant="primary"
          @click="goToShop"
        >
          {{ $t('Go back to Shop') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>

  <CartCheckoutModal
    v-if="isCheckoutOpen"
    :show="isCheckoutOpen"
    :total-coins="totalCoins"
    :total-fiat="totalFiat"
    @close="isCheckoutOpen = false"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'
import CartItemQuantity from '@/pages/CartPage/components/CartItemQuantity.vue'
import CartCheckoutModal from '@/pages/CartPage/modals/CartCheckoutModal.vue'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close', 'update:show'])
const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()
const { cartItemsCount } = storeToRefs(cartStore)

const isCheckoutOpen = ref(false)
const totalCoins = computed(() => Number(cartStore.totalAmountInternal || 0))
const totalFiat = computed(() =>
  Number(cartStore.totalAmount || cartStore.cartTotal || 0),
)
const hasLoadingItems = computed(() =>
  cartStore.items.some(item => cartStore.isItemLoading(item.item_id)),
)

const staticDomain = (import.meta.env.VITE_STATIC_DOMAIN || '').replace(
  /\/+$/,
  '',
)

const getImage = item => {
  const image = String(item?.img || item?.item?.img || '').trim()
  if (!image) return ''
  if (/^(https?:\/\/|data:|blob:)/i.test(image)) return image
  const path = image.replace(/^\/+/, '')
  return `${staticDomain}/${path}${/\.(jpe?g|png|webp|svg|gif|avif)(\?.*)?$/i.test(path) ? '' : '.png'}`
}

const getCount = item => Math.max(1, Number(item.count) || 1)
const getLineTotal = item =>
  Number((Number(item.price_internal || 0) * getCount(item)).toFixed(2))

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const updateQuantity = async (id, quantity) => {
  if (id == null) return
  const result = await cartStore.updateQuantity(id, quantity)
  if (!result?.success)
    toast.error(result?.error || 'Failed to update quantity')
}

const removeItem = async id => {
  if (id == null) return
  const result = await cartStore.removeFromCart(id)
  if (!result?.success) toast.error(result?.error || 'Failed to remove item')
}

const clearCart = async () => {
  const result = await cartStore.clearCart()
  if (!result?.success) toast.error(result?.error || 'Failed to clear cart')
}

const openCheckout = () => {
  if (!cartStore.isEmpty && !cartStore.isLoading && !hasLoadingItems.value) {
    isCheckoutOpen.value = true
  }
}

const goToShop = async () => {
  handleClose()
  await router.push({ name: 'ProductListPage' })
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

// BaseModal teleports into body; these overrides must be global.
:global(.cart-modal__inner) {
  width: calc(100% - 32px);
  max-width: 1074px;
  max-height: min(85vh, 850px);
  border-radius: 6px;
  background: var(--bg-third-color);
}

:global(.cart-modal__inner .modal__content) {
  background: var(--bg-third-color);
  border-radius: 6px;
  @include adaptiveValue('padding-top', 32, 18);
  @include adaptiveValue('padding-bottom', 34, 18);
  @include adaptiveValue('padding-left', 34, 15);
  @include adaptiveValue('padding-right', 34, 15);
}

:global(.cart-modal__inner .modal__close) {
  top: 7px;
  right: 7px;
  color: var(--primary-color);
}

.cart-modal {
  color: var(--primary-color);
  font-family: var(--font-inter);
  min-width: 0;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    padding-right: 0;
    @include adaptiveValue('margin-bottom', 20, 16);
  }

  &__title {
    text-transform: uppercase;
    margin: 0;
  }

  &__clear {
    width: fit-content;
    flex-shrink: 0;
    min-height: 34px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 400;
    text-transform: none;
    background-color: var(--bg-primary-color);
    border: 1px solid var(--border-primary-color);
    color: var(--error-color);
    border-radius: 5px;

    &-icon {
      width: 15px;
      height: 15px;
    }
  }

  &__content {
    display: grid;
    grid-template-columns: minmax(0, 40%) minmax(0, 1fr);
    align-items: start;
    @include adaptiveValue('gap', 20, 12);
  }

  &__summary {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 244px;
    @include adaptiveValue('padding', 24, 15);
    border: 1px solid var(--border-primary-color);
    border-radius: 5px;
    background: var(--bg-third-color);
  }

  &__summary-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    @include adaptiveValue('margin-bottom', 28, 20);
  }

  &__summary-title {
    text-transform: uppercase;
    margin: 0;
  }
  &__count {
    color: var(--hint-third-color);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  &__total {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  &__total-label {
    color: var(--hint-third-color);
    font-size: 14px;
    white-space: nowrap;
  }

  &__total-values {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
  }

  &__coins {
    color: var(--primary-color);
    gap: 8px;
    :deep(.price__icon) {
      width: 22px;
      min-width: 22px;
      height: 22px;
    }
    :deep(.price__value) {
      font-size: 20px;
      line-height: 1.2;
    }
  }

  &__fiat {
    color: var(--hint-third-color);
  }

  &__buy {
    margin-top: auto;
    @include adaptiveValue('min-height', 42, 38);
    background: var(--hint-primary-color);
    color: var(--secondary-color);
    text-transform: none;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(65px, auto) auto;
    align-items: center;
    @include adaptiveValue('gap', 20, 10);
    @include adaptiveValue('padding', 16, 10);
    border-radius: 5px;
    background: var(--bg-primary-color);
  }

  &__product {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 12px;
  }

  &__image {
    width: 60px;
    min-width: 60px;
    height: 60px;
    img {
      object-fit: contain;
    }
  }

  &__product-info {
    min-width: 0;
  }

  &__product-name {
    font-size: 14px;
    line-height: 1.4;
    font-weight: 700;
    overflow-wrap: anywhere;
    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }

  &__category {
    font-size: 12px;
    color: var(--hint-third-color);
  }

  &__quantity {
    min-width: 105px;
    background: var(--bg-third-color);
    border-color: var(--border-primary-color);
    :deep(.cart-quantity__button) {
      min-width: 30px;
      height: 38px;
      background: var(--bg-third-color);
      color: var(--primary-color);
    }
    :deep(.cart-quantity__input) {
      width: 38px;
      height: 38px;
      color: var(--primary-color);
    }
  }

  &__item-price {
    color: var(--primary-color);
    white-space: nowrap;
    :deep(.price__icon) {
      display: none;
    }
  }

  &__remove {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 38px;
    min-width: 38px;
    min-height: 38px;
    padding: 0;
    border: 1px solid var(--border-primary-color);
    border-radius: 5px;
    background: var(--bg-primary-color);
    color: var(--primary-color);
    &-icon {
      width: 17px;
      height: 17px;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--error-color);
        border-color: var(--error-color);
      }
    }
  }

  &__loading {
    margin: 40px auto;
  }

  &__empty {
    text-align: center;
    @include adaptiveValue('padding-top', 50, 20);
    @include adaptiveValue('padding-bottom', 50, 20);
  }

  &__empty-title {
    margin-bottom: 12px;
  }
  &__empty-text {
    color: var(--hint-third-color);
    margin-bottom: 24px;
  }
  &__shop {
    max-width: 250px;
    margin: 0 auto;
  }

  @media (max-width: 991px) {
    &__content {
      grid-template-columns: minmax(0, 1fr);
    }
    &__summary {
      min-height: 0;
    }
    &__buy {
      margin-top: 24px;
    }
  }

  @media (max-width: 600px) {
    &__header {
      align-items: center;
      padding-right: 25px;
    }
    &__clear {
      font-size: 11px;
    }
    &__item {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
    }
    &__product {
      grid-column: 1;
      grid-row: 1;
    }
    &__quantity {
      grid-column: 1;
      justify-self: start;
    }
    &__item-price {
      grid-column: 2;
      grid-row: 2;
      justify-self: end;
    }
    &__remove {
      grid-column: 2;
      grid-row: 1;
      justify-self: end;
    }
    &__image {
      width: 52px;
      min-width: 52px;
      height: 52px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .cart-modal * {
    transition: none !important;
  }
}
</style>
