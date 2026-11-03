<template>
  <BaseModal
    :show="show"
    wrapper-classes="product-modal__inner"
    @close="handleClose"
  >
    <div v-if="product" class="product-modal">
      <div class="product-modal__visual">
        <div v-if="productImage" class="product-modal__image _ibg-contain">
          <img :src="productImage" :alt="product.name || $t('Product')" />
        </div>
      </div>

      <div class="product-modal__content">
        <div class="product-modal__details">
          <div v-if="product.category" class="product-modal__category">
            {{ product.category }}
          </div>

          <h2 class="product-modal__name">
            {{ product.name }}
          </h2>

          <p class="product-modal__availability">
            {{ $t('Product available on all servers') }}
          </p>
        </div>

        <div class="product-modal__purchase">
          <PriceFormatter
            class="product-modal__price"
            :price="priceInternal"
            size="size-12"
          />

          <BaseButton
            class="product-modal__button"
            :variant="isInCart ? 'trash' : 'primary'"
            :disabled="isLoading"
            :aria-label="isInCart ? t('Remove') : t('Add to cart')"
            @click="handleCartAction"
          >
            <span v-if="isLoading">...</span>

            <template v-else>
              <SvgIcon
                :icon="isInCart ? TrashIcon : CartIcon"
                class="product-modal__button-icon"
              />
              <span>
                {{ isInCart ? $t('Remove') : $t('Add to cart') }}
              </span>
            </template>
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>

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
import { CartIcon, TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import SteamLoginModal from '@/components/modals/SteamLoginModal.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'

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
const toast = useToast()
const { t } = useI18n()

const isSteamLoginModalOpen = ref(false)

const productId = computed(() => props.product?.id)

const priceInternal = computed(() =>
  Number(props.product?.price_internal ?? props.product?.price ?? 0),
)

const isInCart = computed(() =>
  productId.value != null ? cartStore.isItemInCart(productId.value) : false,
)

const isLoading = computed(() =>
  productId.value != null ? cartStore.isItemLoading(productId.value) : false,
)

const productImage = computed(() => {
  const image = String(props.product?.img || '').trim()

  if (!image) return ''

  if (/^(https?:\/\/|data:|blob:)/i.test(image)) {
    return image
  }

  const staticDomain = String(import.meta.env.VITE_STATIC_DOMAIN || '').replace(
    /\/+$/,
    '',
  )

  const normalizedImage = image.replace(/^\/+/, '')

  const hasExtension = /\.(jpe?g|png|webp|svg|gif|avif)(\?.*)?$/i.test(
    normalizedImage,
  )

  return `${staticDomain}/${normalizedImage}${hasExtension ? '' : '.png'}`
})

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const openSteamLoginModal = () => {
  handleClose()
  isSteamLoginModalOpen.value = true
}

const closeSteamLoginModal = () => {
  isSteamLoginModalOpen.value = false
}

const handleCartAction = async () => {
  if (productId.value == null || isLoading.value) {
    return
  }

  try {
    if (isInCart.value) {
      const { success, error } = await cartStore.removeFromCart(productId.value)

      if (success) {
        toast.success(t('Item removed from cart'))
      } else {
        toast.error(error || t('Failed to remove item'))
      }

      return
    }

    const { success, isAlreadyInCart, message, isUnauthorized } =
      await cartStore.addToCart(productId.value)

    if (success) {
      toast.success(t('Item added to cart'))
    } else if (isUnauthorized) {
      openSteamLoginModal()
    } else if (isAlreadyInCart) {
      toast.warning(message || t('Item is already in cart'))
    } else {
      toast.error(message || t('Failed to add item to cart'))
    }
  } catch (error) {
    console.error(error)
    toast.error(t('Failed to add item to cart'))
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

// Override BaseModal only for this product modal.
// BaseModal teleports its content to body.
:global(.product-modal__inner) {
  max-width: 630px;
  width: calc(100% - 32px);
  border-radius: 6px;
  background: var(--bg-third-color);
}

:global(.product-modal__inner .modal__content) {
  background: var(--bg-third-color);
  border-radius: 6px;

  @include adaptiveValue('padding-top', 25, 18);
  @include adaptiveValue('padding-bottom', 25, 18);
  @include adaptiveValue('padding-left', 24, 15);
  @include adaptiveValue('padding-right', 24, 15);
}

:global(.product-modal__inner .modal__close) {
  right: 9px;
  top: 7px;
  color: var(--primary-color);
}

.product-modal {
  display: grid;
  grid-template-columns: minmax(0, 40%) minmax(0, 60%);
  align-items: stretch;
  min-width: 0;

  @include adaptiveValue('gap', 20, 12, 1430, 768, 1);

  &__visual {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;
    min-height: 216px;
  }

  &__image {
    width: 100%;
    max-width: 220px;
    aspect-ratio: 1;

    img {
      object-fit: contain;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    min-width: 0;
    padding-top: 18px;

    @include adaptiveValue('gap', 38, 20);
  }

  &__details {
    min-width: 0;
  }

  &__category {
    font-family: var(--font-inter);
    font-size: 12px;
    color: var(--hint-third-color);
    line-height: 1.4;
    margin-bottom: 8px;
  }

  &__name {
    font-family: var(--font-inter);

    @include adaptiveValue('font-size', 30, 23);

    font-weight: 700;
    line-height: 1.15;
    overflow-wrap: anywhere;
    color: var(--primary-color);

    margin-bottom: 22px;
  }

  &__availability {
    color: var(--success-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 1.4;
  }

  &__purchase {
    display: flex;
    align-items: center;
    justify-content: space-between;

    min-width: 0;
    gap: 10px;

    padding: 4px 5px 4px 14px;
    border-radius: 5px;

    background-color: var(--bg-primary-color);
  }

  &__price {
    min-width: 0;
    gap: 8px;
    color: var(--primary-color);

    :deep(.price__icon) {
      width: 23px;
      min-width: 23px;
      height: 23px;
    }

    :deep(.price__value) {
      font-size: 20px;
      line-height: 1.2;
      font-weight: 500;
    }
  }

  &__button {
    width: auto;
    flex: 0 0 auto;
    min-height: 38px;

    padding: 8px 13px;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;

    border-radius: 5px;
    white-space: nowrap;
    gap: 9px;

    &-icon {
      width: 16px;
      min-width: 16px;
      height: 16px;
    }
  }

  @media (max-width: $md6) {
    grid-template-columns: 1fr;

    &__visual {
      min-height: 0;
    }

    &__image {
      max-width: 190px;
    }

    &__content {
      padding-top: 0;
      gap: 20px;
    }

    &__name {
      margin-bottom: 12px;
    }
  }

  @media (max-width: 380px) {
    &__purchase {
      padding-left: 8px;
      gap: 6px;
    }

    &__button {
      padding: 8px;
      font-size: 11px;
      gap: 5px;
    }
  }
}
</style>
