<template>
  <div class="list" v-bind="attrs">
    <BaseButton
      class="list__clear"
      :disabled="cartStore.isLoading || cartStore.isEmpty"
      variant="trash"
      @click="clearCart"
    >
      {{ $t('Clear cart') }}
    </BaseButton>

    <div class="list__list">
      <div
        v-for="item in cartStore.items"
        :key="item?.item_id"
        class="list__item"
      >
        <!-- PRODUCT -->
        <div class="list__about">
          <div v-if="getCartItemImage(item)" class="list__img _ibg-contain">
            <img :src="getCartItemImage(item)" :alt="getCartItemName(item)" />
          </div>

          <div class="list__product">
            <div v-if="getCartItemCategory(item)" class="list__category">
              {{ getCartItemCategory(item) }}
            </div>

            <div class="list__name">
              {{ getCartItemName(item) }}
            </div>
          </div>
        </div>
        <CartItemQuantity
          class="list__quantity"
          :model-value="getCartItemQuantity(item)"
          :loading="cartStore.isItemLoading(item?.item_id)"
          @change="quantity => updateQuantity(item?.item_id, quantity)"
        />

        <div class="list__prices">
          <PriceFormatter
            v-if="getCartItemBasePrice(item)"
            class="list__coin"
            :price="getCartItemTotalBasePrice(item)"
            skip-conversion
          />

          <PriceFormatter
            v-if="getCartItemFiatPrice(item) && false"
            class="list__fiat"
            :price="getCartItemTotalFiatPrice(item)"
            :currency-code="currencyStore.currentCurrencyCode"
            size="size-24"
            is-currency
            raw-fiat
            skip-conversion
          />
        </div>
        <BaseButton
          class="list__remove"
          :disabled="cartStore.isItemLoading(item?.item_id)"
          icon="trash"
          variant="trash"
          @click="removeItem(item?.item_id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAttrs } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import CartItemQuantity from '@/pages/CartPage/components/CartItemQuantity.vue'

import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const cartStore = useCartStore()
const currencyStore = useCurrencyStore()

const STATIC_DOMAIN =
  import.meta.env.VITE_STATIC_DOMAIN?.replace(/\/+$/, '') || ''

const resolveImageUrl = image => {
  if (!image) {
    return ''
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  const normalizedImage = String(image).replace(/^\/+/, '')

  const hasExtension = /\.(jpg|jpeg|png|webp|svg)$/i.test(normalizedImage)

  return `${STATIC_DOMAIN}/${normalizedImage}${hasExtension ? '' : '.png'}`
}

const getCartItemImage = item => {
  return resolveImageUrl(item?.img || item?.item?.img || item?.item?.img_url)
}

const getCartItemName = item => {
  return item?.title || item?.item?.name || item?.name || ''
}

const getCartItemCategory = item => {
  return item?.category || item?.item?.category || ''
}

const getCartItemQuantity = item => {
  const quantity = Number(item?.count)

  return Number.isFinite(quantity) && quantity >= 1 ? quantity : 1
}

const getCartItemBasePrice = item => {
  return Number(item?.price_internal || 0)
}

const getCartItemFiatPrice = item => {
  return Number(item?.item?.price ?? item?.price ?? 0)
}

const getCartItemTotalBasePrice = item => {
  return Number(
    (getCartItemBasePrice(item) * getCartItemQuantity(item)).toFixed(2),
  )
}

const getCartItemTotalFiatPrice = item => {
  return getCartItemFiatPrice(item) * getCartItemQuantity(item)
}

const updateQuantity = async (itemId, quantity) => {
  if (!itemId) {
    return
  }

  await cartStore.updateQuantity(itemId, quantity)
}

const removeItem = async itemId => {
  if (!itemId) {
    return
  }

  await cartStore.removeFromCart(itemId)
}

const clearCart = async () => {
  await cartStore.clearCart()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.list {
  &__clear {
    width: fit-content;
    margin-left: auto;
    text-transform: capitalize;
    min-height: fit-content;
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__list {
  }

  &__item {
    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 32, 12);

    padding-top: 8px;
    padding-bottom: 8px;

    @include adaptiveValue('padding-left', 20, 10);

    @include adaptiveValue('padding-right', 20, 10);

    border: 1px solid var(--border-secondary-color);

    border-radius: 6px;

    background-color: #12181c;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 4);
    }
    @media (max-width: $md6) {
      flex-wrap: wrap;
      column-gap: 20px;
      row-gap: 15px;
    }
  }
  &__about {
    flex: 1 1 auto;

    min-width: 0;

    display: flex;
    align-items: center;

    overflow: hidden;

    @include adaptiveValue('gap', 23, 13);
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__img {
    width: fit-content;

    min-width: 46px;
    height: 46px;
  }

  &__product {
    min-width: 0;
    align-self: center;
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 12, 10);
  }

  &__category {
    color: var(--secondary-color);

    font-family: var(--font-open-sans);

    font-size: 12px;
    font-weight: 600;
    line-height: 14px;

    text-transform: capitalize;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__name {
    min-width: 0;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    color: var(--primary-color);

    font-size: 14px;

    font-weight: 700;
    line-height: 120%;

    text-transform: none;
  }

  &__quantity {
    flex: 0 0 auto;
    @media (max-width: $md6) {
      margin-right: auto;
    }
    @media (max-width: 374.98px) {
      margin-right: 0px;
      flex: 1 1 100%;
    }
  }

  &__prices {
    flex: 0 0 auto;

    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 32, 10);
  }

  &__coin {
    min-width: 70px;
    @media (max-width: $md6) {
      min-width: 100px;
    }
  }

  &__fiat {
  }

  &__remove {
    width: fit-content;

    @include adaptiveValue('min-width', 44, 40);

    @include adaptiveValue('height', 44, 40);
    @media (max-width: $md6) {
      margin-left: auto;
    }
  }
}
</style>
