<template>
  <BaseModal
    :show="show"
    :wrapperClasses="['product-modal__inner']"
    @close="handleClose"
  >
    <div v-if="product" class="product-modal">
      <div class="product-modal__image-wrapper">
        <div v-if="productImage" class="product-modal__image _ibg-contain">
          <img :src="productImage" :alt="product.name" />
        </div>
      </div>

      <div class="product-modal__content">
        <div class="product-modal__top">
          <span class="product-modal__category">
            {{ product.category }}
          </span>
          <div class="product-modal__name">
            {{ product.name }}
          </div>
          <div class="product-modal__info">
            {{ $t('Product available on all servers') }}
          </div>
        </div>
        <div class="product-modal__bottom">
          <PriceFormatter
            class="product-modal__price"
            :price="priceInternal"
            size="size-32"
          />
          <BaseButton
            class="product-modal__button"
            :variant="!isInCart ? 'bordered' : 'trash'"
            :disabled="isLoading"
            @click="handleCartAction"
          >
            <template v-if="isLoading"> ... </template>

            <template v-else>
              <SvgIcon
                :icon="!isInCart ? CartIcon : TrashIcon"
                class="product-modal__button-icon"
              />

              <span>
                {{ !isInCart ? $t('Add') : $t('Remove') }}
              </span>
            </template>
          </BaseButton>
        </div>
        <PriceFormatter
          v-if="!showInternalPrice && price && false"
          class="product-modal__price"
          :price="price"
          size="size-46"
        />

        <PriceFormatter
          v-if="oldPrice && false"
          class="product-modal__old-price"
          :price="oldPrice"
          reverse
          :is-currency="!showInternalPrice"
          isOld
        />
      </div>
    </div>
  </BaseModal>

  <!-- LOGIN MODAL -->
  <SteamLoginModal
    :show="isSteamLoginModalOpen"
    @close="closeSteamLoginModal"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import SteamLoginModal from '@/components/modals/SteamLoginModal.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'
import { CartIcon, TrashIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  product: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'update:show'])

const cartStore = useCartStore()
const currencyStore = useCurrencyStore()

const toast = useToast()
const { t } = useI18n()

const isSteamLoginModalOpen = ref(false)

const productId = computed(() => {
  return props.product?.id
})

const showInternalPrice = computed(() => {
  return currencyStore.isInternalCurrencyEnabled
})

const isInCart = computed(() => {
  if (!productId.value) {
    return false
  }

  return cartStore.isItemInCart(productId.value)
})

const isLoading = computed(() => {
  if (!productId.value) {
    return false
  }

  return cartStore.isItemLoading(productId.value)
})

const productImage = computed(() => {
  const image = props.product?.img || ''

  if (!image) {
    return ''
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  const normalizedImage = image.replace(/^\/+/, '')

  const hasExtension = /\.(jpg|jpeg|png|webp|svg)$/i.test(normalizedImage)

  const staticDomain = String(VITE_STATIC_DOMAIN || '').replace(/\/+$/, '')

  return `${staticDomain}/${normalizedImage}${hasExtension ? '' : '.png'}`
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

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const openSteamLoginModal = () => {
  /*
   * Close the product details modal first,
   * then show the Steam login modal.
   */
  handleClose()

  isSteamLoginModalOpen.value = true
}

const closeSteamLoginModal = () => {
  isSteamLoginModalOpen.value = false
}

const handleCartAction = async () => {
  if (!productId.value || isLoading.value) {
    return
  }

  /*
   * REMOVE FROM CART
   */
  if (isInCart.value) {
    const { success, error } = await cartStore.removeFromCart(productId.value)

    if (success) {
      toast.success(t('Item removed from cart'))

      return
    }

    toast.error(error || t('Failed to remove item'))

    return
  }

  /*
   * ADD TO CART
   */
  const { success, isAlreadyInCart, message, isUnauthorized } =
    await cartStore.addToCart(productId.value)

  if (success) {
    toast.success(t('Item added to cart'))

    return
  }

  /*
   * NOT LOGGED IN:
   * open Steam login modal instead
   * of redirecting to LoginPage.
   */
  if (isUnauthorized) {
    openSteamLoginModal()

    return
  }

  if (isAlreadyInCart) {
    toast.warning(message || t('Item is already in cart'))

    return
  }

  toast.error(message || t('Failed to add item to cart'))
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.product-modal {
  @media (min-width: $md6) {
    display: flex;
    @include adaptiveValue('gap', 32, 20, 1400, 768, 1);
  }
  &__image-wrapper {
    flex: 0 1 50%;
    @include adaptiveValue('padding-top', 44, 10);
    padding-left: 10px;
    padding-right: 10px;
    @include adaptiveValue('padding-bottom', 44, 10);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-primary-color);
    @include adaptiveValue('border-radius', 10, 6);
    @media (max-width: $md6) {
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }

  &__image {
    max-width: 194px;
    width: 100%;
    aspect-ratio: 1;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__top {
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__category {
    color: var(--seconday-color);
    text-transform: capitalize;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 15);
    }
  }

  &__name {
    font-size: 20px;
    font-weight: 700;
    line-height: 120%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 15);
    }
  }

  &__info {
    color: var(--success-color);
  }
  &__bottom {
  }
  &__price {
    justify-content: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__button {
    display: flex;
    align-items: center;
    @media (max-width: $md5) {
      max-width: 300px;
      margin: 0 auto;
    }
    span {
      line-height: 14px;
      font-weight: 700;
      text-transform: uppercase;
      font-family: var(--font-condensed);
    }
    &-icon {
      min-width: 16px;
      height: 16px;
    }
  }
}
</style>
