<template>
  <div
    v-if="product"
    class="card"
    v-bind="$attrs"
    :class="{ 'in-cart': isInCart }"
    @click="handleProductClick"
  >
    <div class="card__image _ibg-contain">
      <img
        v-if="product.img"
        :src="productImage"
        :alt="product.name"
        loading="lazy"
      />
    </div>

    <div class="card__details">
      <div class="card__name">
        {{ product.name }}
      </div>

      <div v-if="product.category" class="card__category">
        {{ product.category }}
      </div>
    </div>

    <div class="card__bottom">
      <PriceFormatter
        :price="product.price_internal ?? product.price ?? 0"
        size="size-12"
        class="card__price"
      />

      <BaseButton
        class="card__add"
        :variant="isInCart ? 'trash' : 'priamry'"
        :disabled="isLoading"
        :aria-label="isInCart ? t('Remove') : t('Add')"
        @click="handleCartClick"
      >
        <span v-if="isLoading">…</span>

        <SvgIcon
          v-else
          :icon="isInCart ? TrashIcon : CartIcon"
          class="card__add-icon"
        />
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

.card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;

  @include adaptiveValue('padding', 14, 10);

  background: var(--bg-third-color);
  border-radius: 5px;
  border: 1px solid transparent;
  cursor: pointer;

  transition: all 0.3s ease 0s;
  @media (any-hover: hover) {
    &:hover {
      transform: translateY(-2px);
      .card__image {
        background-color: var(--bg-seventh-color);
      }
    }
  }

  &__image {
    width: 100%;
    @include adaptiveValue('height', 166, 115);
    flex: 0 0 auto;
    margin-bottom: 12px;
    background-color: transparent;
    transition: background-color 0.3s ease 0s;
    border-radius: 6px;

    img {
      object-fit: contain;
    }
  }

  &__details {
    min-width: 0;
    margin-top: auto;
    margin-bottom: 12px;
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    color: var(--primary-color);

    margin-bottom: 4px;
  }

  &__category {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-size: 12px;
    color: var(--hint-third-color);
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    min-height: 39px;
    padding: 4px 5px 4px 10px;

    border-radius: 5px;
    background: var(--bg-primary-color);
  }

  &__price {
    min-width: 0;
    color: var(--primary-color);
  }

  &__add {
    flex: 0 0 31px;
    width: 31px;
    min-width: 31px;
    height: 31px;
    min-height: 31px;
    padding: 0 !important;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 4px;
    background: var(--hint-primary-color);
    color: var(--secondary-color);

    &-icon {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
