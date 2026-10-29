<template>
  <BaseModal
    :show="show"
    :wrapper-classes="
      isImagePreviewOpen ? 'product-image__dialog' : 'product-details__dialog'
    "
    @close="handleClose"
  >
    <div
      v-if="product"
      class="product-details"
      :class="{ 'product-details_preview': isImagePreviewOpen }"
    >
      <template v-if="!isImagePreviewOpen">
        <div class="product-details__main">
          <button
            type="button"
            class="product-details__media"
            :disabled="!productImage"
            :aria-label="$t('View Item')"
            @click="openImagePreview"
          >
            <img
              v-if="productImage"
              :src="productImage"
              :alt="productName"
              class="product-details__image"
            />

            <span v-else class="product-details__placeholder">
              {{ gameLabel }}
            </span>
          </button>

          <div class="product-details__content">
            <h2 class="product-details__title">
              {{ productName }}
            </h2>

            <div class="product-details__information">
              <div v-if="gameLabel" class="product-details__row">
                <span class="product-details__label"> {{ $t('Game') }}: </span>

                <span
                  class="product-details__value product-details__value_blue"
                >
                  {{ gameLabel }}
                </span>
              </div>

              <div v-if="productType" class="product-details__row">
                <span class="product-details__label">
                  {{ $t('Item type') }}:
                </span>

                <span
                  class="product-details__value product-details__value_blue"
                >
                  {{ productType }}
                </span>
              </div>

              <div v-if="productRarity" class="product-details__row">
                <span class="product-details__label">
                  {{ $t('Rarity') }}:
                </span>

                <span
                  class="product-details__value product-details__value_rarity"
                  :style="{ color: rarityColor }"
                >
                  {{ productRarity }}
                </span>
              </div>
            </div>

            <PriceFormatter
              v-if="price !== null"
              :price="price"
              skip-conversion
              size="size-32"
              class="product-details__price"
            />
          </div>
        </div>

        <div class="product-details__actions">
          <BaseButton
            type="button"
            variant="bordered"
            class="product-details__button product-details__button_view"
            :disabled="!productImage"
            @click="openImagePreview"
          >
            {{ $t('View Item') }}
          </BaseButton>

          <BaseButton
            type="button"
            class="product-details__button product-details__button_buy"
            :disabled="isLoading"
            @click="handleCartAction"
          >
            <span v-if="isLoading"> {{ $t('Loading') }}... </span>

            <span v-else-if="forceCartMode">
              {{ $t('Remove') }}
            </span>

            <span v-else-if="isInCart">
              {{ $t('Go to Cart') }}
            </span>

            <span v-else>
              {{ $t('Buy Now') }}
            </span>
          </BaseButton>
        </div>
      </template>

      <div v-else class="product-details__preview">
        <img
          v-if="productImage"
          :src="productImage"
          :alt="productName"
          class="product-details__preview-image"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const RARITY_COLORS = {
  'consumer grade': '#B0C3D9',
  'industrial grade': '#5E98D9',
  'mil-spec grade': '#4B69FF',
  restricted: '#8847FF',
  classified: '#D32CE6',
  covert: '#EB4B4B',
  contraband: '#E4AE39',
  'base grade': '#B0C3D9',
  'high grade': '#4B69FF',
  remarkable: '#8847FF',
  exotic: '#D32CE6',
  extraordinary: '#EB4B4B',
  common: '#B0C3D9',
  uncommon: '#5E98D9',
  rare: '#368DFF',
  mythical: '#A66AFF',
  legendary: '#DD4AA6',
  immortal: '#F2DA00',
  arcana: '#7AD76E',
}

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  product: {
    type: Object,
    default: null,
  },
  cartItemId: {
    type: [Number, String],
    default: null,
  },
  forceCartMode: {
    type: Boolean,
    default: false,
  },
  accentColor: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'update:show'])

const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()
const { t } = useI18n()

const isLoading = ref(false)
const isImagePreviewOpen = ref(false)

const formatText = value => {
  return String(value || '')
    .trim()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

const cleanProductTitle = value => {
  return String(value || '')
    .replace(/StatTrak™\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/★\s*/g, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const productGame = computed(() => {
  const category =
    props.product?.category?.url_code ||
    props.product?.category ||
    props.product?.game_code ||
    props.product?.gameCode ||
    ''

  return String(category)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '')
})

const gameLabel = computed(() => {
  if (productGame.value === 'cs2' || productGame.value === 'csgo') {
    return 'CS2'
  }

  if (productGame.value === 'dota2') {
    return 'Dota 2'
  }

  return formatText(productGame.value)
})

const productName = computed(() => {
  const title = cleanProductTitle(props.product?.title || props.product?.name)

  if (!title) return ''

  const parts = title.split('|').map(part => part.trim())

  return parts.length > 1 ? parts.slice(1).join(' | ') : title
})

const productType = computed(() => {
  return formatText(
    props.product?.type ||
      props.product?.item_type ||
      props.product?.itemType ||
      '',
  )
})

const productRarity = computed(() => {
  return formatText(
    props.product?.quality ||
      props.product?.rarity ||
      props.product?.exterior_name ||
      props.product?.exterior ||
      '',
  )
})

const rarityColor = computed(() => {
  return RARITY_COLORS[productRarity.value.toLowerCase()] || '#B0C3D9'
})

const productImage = computed(() => {
  const image = String(props.product?.img_url || '').trim()

  if (!image) return ''

  if (
    /^(https?:)?\/\//i.test(image) ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image
  }

  const domain = VITE_STATIC_DOMAIN.replace(/\/+$/, '')
  const path = image.replace(/^\/+/, '')

  return domain ? `${domain}/${path}` : `/${path}`
})

const price = computed(() => {
  const rawPrice = props.product?.internal_price ?? props.product?.price

  if (rawPrice === null || rawPrice === undefined || rawPrice === '') {
    return null
  }

  const value = Number(rawPrice)

  return Number.isFinite(value) ? value : null
})

const cartActionId = computed(() => {
  return props.cartItemId ?? props.product?.id ?? null
})

const isInCart = computed(() => {
  if (props.forceCartMode) return true

  const id = props.product?.id

  if (id == null) return false

  return cartStore.isItemInCart(id)
})

const openImagePreview = () => {
  if (!productImage.value) return

  isImagePreviewOpen.value = true
}

const closeImagePreview = () => {
  isImagePreviewOpen.value = false
}

const handleClose = () => {
  if (isImagePreviewOpen.value) {
    closeImagePreview()
    return
  }

  emit('close')
  emit('update:show', false)
}

const closeModal = () => {
  isImagePreviewOpen.value = false
  emit('close')
  emit('update:show', false)
}

const handleRemoveFromCart = async () => {
  const itemId = cartActionId.value

  if (itemId == null) {
    toast.error(t('Failed to remove item'))
    return
  }

  isLoading.value = true

  try {
    const { success, error } = await cartStore.removeFromCart(itemId)

    if (!success) {
      toast.error(error || t('Failed to remove item'))
      return
    }

    toast.success(t('Item removed from cart'))
    closeModal()
  } catch (error) {
    toast.error(error?.message || t('Failed to remove item'))
  } finally {
    isLoading.value = false
  }
}

const handleBuyNow = async () => {
  const productId = props.product?.id

  if (productId == null) {
    toast.error(t('Failed to add item'))
    return
  }

  isLoading.value = true

  try {
    const { success, isAlreadyInCart, isUnauthorized, message } =
      await cartStore.addToCart(productId)

    if (success || isAlreadyInCart) {
      if (success) {
        toast.success(t('Item added to cart'))
      }

      closeModal()

      await router.push({
        name: 'CartPage',
      })

      return
    }

    if (isUnauthorized) {
      toast.warning(t('Please login to add items to cart'))

      closeModal()

      await router.push({
        name: 'LoginPage',
        query: {
          redirect: router.currentRoute.value.fullPath || '/',
        },
      })

      return
    }

    toast.error(message || t('Failed to add item'))
  } catch (error) {
    toast.error(error?.message || t('Failed to add item to cart'))
  } finally {
    isLoading.value = false
  }
}

const handleCartAction = async () => {
  if (isLoading.value) return

  if (props.forceCartMode) {
    await handleRemoveFromCart()
    return
  }

  if (isInCart.value) {
    closeModal()

    await router.push({
      name: 'CartPage',
    })

    return
  }

  await handleBuyNow()
}

watch(
  () => props.show,
  value => {
    if (!value) {
      isImagePreviewOpen.value = false
    }
  },
)

watch(
  () => props.product?.id,
  () => {
    isImagePreviewOpen.value = false
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

:global(.modal .modal__inner.product-details__dialog) {
  width: min(700px, calc(100% - 32px));
  max-width: 700px;
  padding: 56px 45px 58px;
  border: 1px solid #343d4d;
  border-radius: 16px;
  background-color: #121820;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
}

:global(.modal .modal__inner.product-image__dialog) {
  width: min(885px, calc(100% - 32px));
  max-width: 885px;
  padding: 32px;
  border: 1px solid #343d4d;
  border-radius: 16px;
  background-color: #121820;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
}

.product-details {
  width: 100%;
  min-width: 0;

  &__main {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 36px;
    align-items: start;
  }

  &__media {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-width: 0;
    height: 305px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: zoom-in;

    &:disabled {
      cursor: default;
    }

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 3px;
      border-radius: 8px;
    }
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    transition: transform 0.3s ease;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        transform: scale(1.035);
      }
    }
  }

  &__placeholder {
    color: var(--fifth-color);
    font-family: var(--font-inter);
    font-size: 16px;
  }

  &__content {
    min-width: 0;
  }

  &__title {
    margin: 0 0 22px;
    padding: 0;
    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: clamp(18px, 2vw, 23px);
    line-height: 1.3;
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  &__information {
    width: 100%;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 59px;
    padding: 12px 0;

    &:not(:last-child) {
      border-bottom: 1px solid rgba(153, 161, 176, 0.09);
    }
  }

  &__label {
    flex: 0 0 auto;
    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.4;
  }

  &__value {
    min-width: 0;
    color: #b0c3d9;
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    text-align: right;
    overflow-wrap: anywhere;

    &_blue {
      color: #65a7ff;
    }

    &_rarity {
      font-weight: 600;
    }
  }

  &__price {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: fit-content;
    margin-top: 38px;
    color: #f4f6fb;

    :deep(.price__value) {
      color: #f4f6fb;
      font-family: var(--font-orbitron);
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
    }

    :deep(.price__icon) {
      width: 20px;
      min-width: 20px;
      height: 20px;
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    width: 100%;
    margin-top: 20px;
  }

  &__button {
    min-width: 0;
    min-height: 46px;
    height: 46px;
    padding: 8px 16px;
    border-radius: 6px;
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;
    transition:
      background-color 0.3s ease,
      border-color 0.3s ease,
      color 0.3s ease;

    &_view {
      background-color: transparent !important;
      color: #f4f6fb !important;
      border: 1px solid #8998ac !important;

      @media (any-hover: hover) {
        &:hover {
          background-color: rgba(255, 255, 255, 0.06) !important;
          border-color: #f4f6fb !important;
        }
      }
    }

    &_buy {
      background-color: #1a73ff !important;
      border: 1px solid #1a73ff !important;
      color: #ffffff !important;

      @media (any-hover: hover) {
        &:hover {
          background-color: #005fe8 !important;
          border-color: #005fe8 !important;
        }
      }
    }
  }

  &__preview {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 510px;
    padding: 25px 20px;
  }

  &__preview-image {
    display: block;
    width: 100%;
    max-width: 680px;
    height: auto;
    max-height: 460px;
    object-fit: contain;
    object-position: center;
  }

  @media (max-width: $md3) {
    &__main {
      gap: 22px;
    }

    &__media {
      height: 265px;
    }

    &__title {
      margin-bottom: 16px;
      font-size: 19px;
    }

    &__row {
      min-height: 52px;
      gap: 8px;
    }

    &__label,
    &__value {
      font-size: 12px;
    }

    &__price {
      margin-top: 24px;

      :deep(.price__value) {
        font-size: 21px;
      }
    }

    &__actions {
      margin-top: 25px;
      gap: 12px;
    }

    &__preview {
      min-height: 420px;
      padding: 20px 12px;
    }

    &__preview-image {
      max-height: 380px;
    }
  }

  @media (max-width: $md5) {
    &__main {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }

    &__media {
      height: 220px;
    }

    &__title {
      margin-bottom: 12px;
      text-align: center;
      font-size: 19px;
    }

    &__row {
      min-height: 44px;
      padding: 10px 0;
    }

    &__price {
      justify-content: center;
      margin: 22px auto 0;
    }

    &__actions {
      gap: 10px;
      margin-top: 26px;
    }

    &__button {
      min-height: 42px;
      height: 42px;
      padding: 7px 10px;
      font-size: 12px;
    }

    &__preview {
      min-height: 320px;
      padding: 30px 0;
    }

    &__preview-image {
      max-height: 320px;
    }
  }

  @media (max-width: $md7) {
    &__media {
      height: 175px;
    }

    &__title {
      font-size: 17px;
    }

    &__label,
    &__value {
      font-size: 12px;
    }
  }
}

@media (max-width: $md3) {
  :global(.modal .modal__inner.product-details__dialog) {
    padding: 48px 25px 30px;
  }

  :global(.modal .modal__inner.product-image__dialog) {
    padding: 35px 25px;
  }
}

@media (max-width: $md5) {
  :global(.modal .modal__inner.product-details__dialog) {
    width: 100%;
    max-width: 100%;
    padding: 45px 20px 24px;
    border-radius: 16px 16px 0 0;
  }

  :global(.modal .modal__inner.product-image__dialog) {
    width: 100%;
    max-width: 100%;
    padding: 45px 18px 20px;
    border-radius: 16px 16px 0 0;
  }
}
</style>
