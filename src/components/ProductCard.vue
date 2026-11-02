<template>
  <div
    v-if="product"
    class="card"
    v-bind="$attrs"
    :class="{ 'in-cart': isInCart }"
    :style="{ '--quality-color': qualityColor }"
    @click="handleProductClick"
  >
    <div class="card__top">
      <div v-if="product.category" class="card__category">
        {{ product.category }}
      </div>
      <PriceFormatter
        v-if="product.price_internal"
        :price="product.price_internal"
        size="size-14"
        class="card__price"
      />
    </div>
    <div v-if="product.name" class="card__name">
      {{ product.name }}
    </div>

    <div v-if="product.img" class="card__image _ibg-contain">
      <img :src="productImage" :alt="product.name" />
    </div>

    <div class="card__bottom">
      <BaseButton
        class="card__add"
        :variant="!isInCart ? 'bordered' : 'trash'"
        :disabled="isLoading"
        @click="handleCartClick"
      >
        <template v-if="isLoading"> ... </template>

        <template v-else>
          <SvgIcon
            :icon="!isInCart ? CartIcon : TrashIcon"
            class="card__add-icon"
          />
          <span>
            {{ !isInCart ? $t('Add') : $t('Remove') }}
          </span>
        </template>
      </BaseButton>
    </div>
  </div>

  <ProductDetailsModal
    :show="showModal"
    :product="product"
    @close="showModal = false"
  />

  <SteamLoginModal
    :show="isSteamLoginModalOpen"
    @close="closeSteamLoginModal"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ProductDetailsModal from '@/components/modals/ProductDetailsModal.vue'
import SteamLoginModal from '@/components/modals/SteamLoginModal.vue'

import { CartIcon, TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN

const qualityColorMap = {
  Weapon: '#EB4B4B',
  Ammunition: '#EB4B4B',
  Ammo: '#EB4B4B',
  Tools: '#EB4B4B',
  Attachments: '#EB4B4B',
  Turels: '#EB4B4B',
  Apparel: '#6CCB5F',
  Medicine: '#6CCB5F',
  Food: '#6CCB5F',
  Resources: '#4B69FF',
  Transportation: '#4B69FF',
  Other: '#4B69FF',
  Festive: '#D32CE6',
}

const cartStore = useCartStore()
const currencyStore = useCurrencyStore()

const toast = useToast()
const { t } = useI18n()

const showModal = ref(false)
const isSteamLoginModalOpen = ref(false)

const showInternalPrice = computed(() => {
  return currencyStore.isInternalCurrencyEnabled
})

const isInCart = computed(() => {
  return cartStore.isItemInCart(props.product.id)
})

const isLoading = computed(() => {
  return cartStore.isItemLoading(props.product.id)
})

const productImage = computed(() => {
  const image = props.product?.img || ''

  const normalizedImage = image.replace(/^\/+/, '')

  const hasExtension = /\.(jpg|jpeg|png|webp|svg)$/i.test(normalizedImage)

  return `${VITE_STATIC_DOMAIN}/${normalizedImage}${hasExtension ? '' : '.png'}`
})

const price = computed(() => {
  return Number(props.product?.price || 0)
})

const priceInternal = computed(() => {
  return Number(props.product?.price_internal || 0)
})

const oldPriceInternal = computed(() => {
  return Number(props.product?.old_price_internal || 0)
})

const oldPrice = computed(() => {
  if (showInternalPrice.value) {
    return oldPriceInternal.value
  }

  return Number(props.product?.old_price || 0)
})

const qualityColor = computed(() => {
  return qualityColorMap[props.product?.category] || '#8E96AD'
})

const openSteamLoginModal = () => {
  showModal.value = false

  isSteamLoginModalOpen.value = true
}

const closeSteamLoginModal = () => {
  isSteamLoginModalOpen.value = false
}

const handleProductClick = () => {
  showModal.value = true
}

const handleCartClick = event => {
  event.stopPropagation()

  handleCartAction()
}

const handleCartAction = async () => {
  if (isLoading.value) {
    return
  }

  if (isInCart.value) {
    const { success, error } = await cartStore.removeFromCart(props.product.id)

    if (success) {
      toast.success(t('Item removed from cart'))

      return
    }

    toast.error(error || t('Failed to remove item'))

    return
  }

  const { success, isAlreadyInCart, message, isUnauthorized } =
    await cartStore.addToCart(props.product.id)

  if (success) {
    toast.success(t('Item added to cart'))

    return
  }

  if (isUnauthorized) {
    openSteamLoginModal()

    return
  }

  if (isAlreadyInCart) {
    toast.warning(message)

    return
  }

  toast.error(message || t('Failed to add item to cart'))
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.card {
  @include adaptiveValue('padding', 14, 10);

  background-color: #12181c;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: border 0.3s ease 0s;
  cursor: pointer;
  @media (any-hover: hover) {
    &:hover {
      border: 1px solid var(--bg-sixth-color);
    }
  }
  &.in-cart {
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 20px;
    justify-content: space-between;
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__category {
    line-height: 14px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
    color: var(--seconday-color);
  }

  &__price {
  }

  &__name {
    line-height: 120%;
    font-weight: 700;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__image {
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
    min-width: 90px;
    height: 90px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__bottom {
  }

  &__add {
    display: flex;
    align-items: center;
    border-radius: 10px;
    span {
      line-height: 14px;
      font-weight: 700;
      font-family: var(--font-condensed);
    }
    &-icon {
      min-width: 16px;
      height: 16px;
    }
  }
}
</style>
