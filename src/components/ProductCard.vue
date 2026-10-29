<template>
  <template v-if="product">
    <article
      class="card"
      v-bind="$attrs"
      :class="{
        'card_in-cart': isInCart,
        card_dota: isDota2,
      }"
      :style="{
        '--card-color': cardColor,
        '--rarity-color': rarityColor,
      }"
    >
      <button
        type="button"
        class="card__view"
        :aria-label="`View ${productName}`"
        @click="openDetails"
      >
        <div class="card__media">
          <div v-if="productImage" class="card__image">
            <img
              :src="productImage"
              :alt="productName"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div v-else class="card__placeholder">
            <span>{{ gameLabel }}</span>
          </div>
        </div>

        <div class="card__info">
          <div class="card__name" :title="productName">
            {{ productName }}
          </div>

          <div v-if="gameLabel || productRarity" class="card__details">
            <span v-if="gameLabel" class="card__game">
              {{ gameLabel }}
            </span>

            <span v-if="gameLabel && productRarity" class="card__separator">
              •
            </span>

            <span v-if="productRarity" class="card__rarity">
              {{ productRarity }}
            </span>
          </div>

          <PriceFormatter
            v-if="price !== null"
            :price="price"
            skip-conversion
            size="size-16"
            class="card__price"
          />
        </div>
      </button>

      <div class="card__actions">
        <BaseButton
          type="button"
          variant="bordered"
          class="card__button card__button_view"
          @click.stop="openDetails"
        >
          {{ $t('View Item') }}
        </BaseButton>

        <BaseButton
          type="button"
          class="card__button card__button_buy"
          :class="{
            card__button_remove: forceCartMode,
          }"
          :disabled="isLoading"
          @click.stop="handlePrimaryAction"
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
    </article>

    <ProductDetailsModal
      v-if="SHOW_DETAILS_MODAL && isDetailsOpen"
      :show="isDetailsOpen"
      :product="product"
      :cart-item-id="cartActionId"
      :force-cart-mode="forceCartMode"
      :accent-color="cardColor"
      @close="closeDetails"
    />
  </template>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ProductDetailsModal from '@/components/modals/ProductDetailsModal.vue'

import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'

defineOptions({
  inheritAttrs: false,
})

const SHOW_DETAILS_MODAL = true

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const CARD_COLORS = [
  '#3F9088',
  '#CAA327',
  '#B5442F',
  '#7B4C8D',
  '#F0EAE0',
  '#C1587B',
]

const RARITY_COLORS = {
  'consumer grade': '#AEB8C8',
  'industrial grade': '#7CB6E8',
  'mil-spec grade': '#4B8DFF',
  restricted: '#8847FF',
  classified: '#D32CE6',
  covert: '#EB4B4B',
  contraband: '#E4AE39',
  'base grade': '#AEB8C8',
  'high grade': '#4B8DFF',
  remarkable: '#8847FF',
  exotic: '#D32CE6',
  extraordinary: '#EB4B4B',
  common: '#AEB8C8',
  uncommon: '#7CB6E8',
  rare: '#368DFF',
  mythical: '#A66AFF',
  legendary: '#DD4AA6',
  immortal: '#E7CD37',
  arcana: '#80D67A',
}

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  accentColor: {
    type: String,
    default: '',
  },
  forceCartMode: {
    type: Boolean,
    default: false,
  },
  cartItemId: {
    type: [Number, String],
    default: null,
  },
})

const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()
const { t } = useI18n()

const isLoading = ref(false)
const isDetailsOpen = ref(false)

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
  return String(
    props.product?.category ||
      props.product?.game_code ||
      props.product?.gameCode ||
      '',
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '')
})

const isDota2 = computed(() => productGame.value === 'dota2')

const gameLabel = computed(() => {
  if (productGame.value === 'cs2' || productGame.value === 'csgo') {
    return 'CS2'
  }

  if (isDota2.value) {
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

const productRarity = computed(() => {
  const quality =
    props.product?.quality ||
    props.product?.rarity ||
    props.product?.exterior_name ||
    props.product?.exterior ||
    ''

  return formatText(quality)
})

const rarityColor = computed(() => {
  return RARITY_COLORS[productRarity.value.toLowerCase()] || '#99A1B0'
})

const productImage = computed(() => {
  const imageUrl = props.product?.img_url || ''

  if (!imageUrl) return ''

  if (/^(https?:)?\/\//i.test(imageUrl) || imageUrl.startsWith('data:')) {
    return imageUrl
  }

  const base = VITE_STATIC_DOMAIN.replace(/\/+$/, '')
  const path = String(imageUrl).replace(/^\/+/, '')

  return base ? `${base}/${path}` : `/${path}`
})

const price = computed(() => {
  const rawPrice = props.product?.internal_price ?? props.product?.price

  if (rawPrice == null || rawPrice === '') {
    return null
  }

  const value = Number(rawPrice)

  return Number.isFinite(value) ? value : null
})

const fallbackColor = computed(() => {
  const source = String(
    props.product?.title || props.product?.name || props.product?.id || '',
  )

  let hash = 0

  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0
  }

  return CARD_COLORS[hash % CARD_COLORS.length]
})

const cardColor = computed(() => props.accentColor || fallbackColor.value)

const cartActionId = computed(
  () => props.cartItemId ?? props.product?.id ?? null,
)

const isInCart = computed(() => {
  if (props.product?.id == null) return false

  return cartStore.isItemInCart(props.product.id)
})

const openDetails = () => {
  if (SHOW_DETAILS_MODAL) {
    isDetailsOpen.value = true
    return
  }

  router.push({
    name: 'ProductDetailsPage',
    params: {
      productId: props.product.id,
    },
    query: {
      from: router.currentRoute.value.fullPath,
    },
  })
}

const closeDetails = () => {
  isDetailsOpen.value = false
}

const removeFromCart = async () => {
  if (cartActionId.value == null) return

  isLoading.value = true

  try {
    const { success, error: errorMessage } = await cartStore.removeFromCart(
      cartActionId.value,
    )

    if (success) {
      toast.success(t('Item removed from cart'))
      return
    }

    toast.error(errorMessage || t('Failed to remove item'))
  } catch (err) {
    toast.error(err?.message || t('Failed to remove item'))
  } finally {
    isLoading.value = false
  }
}

const addToCart = async () => {
  if (props.product?.id == null) return

  isLoading.value = true

  try {
    const { success, isAlreadyInCart, message, isUnauthorized } =
      await cartStore.addToCart(props.product.id)

    if (success) {
      toast.success(t('Item added to cart'))

      await router.push({
        name: 'CartPage',
      })

      return
    }

    if (isUnauthorized) {
      toast.warning(t('Please login to add items to cart'))

      await router.push({
        name: 'LoginPage',
        query: {
          redirect: router.currentRoute.value.fullPath || '/',
        },
      })

      return
    }

    if (isAlreadyInCart) {
      await router.push({
        name: 'CartPage',
      })

      return
    }

    toast.error(message || t('Failed to add item'))
  } catch (err) {
    toast.error(err?.message || t('Failed to add item to cart'))
  } finally {
    isLoading.value = false
  }
}

const handlePrimaryAction = async () => {
  if (isLoading.value) return

  if (props.forceCartMode) {
    await removeFromCart()
    return
  }

  if (isInCart.value) {
    await router.push({
      name: 'CartPage',
    })
    return
  }

  await addToCart()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.card {
  --card-surface: #10161F;

  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 290px;
  padding: 12px 12px 16px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--card-surface);
  color: var(--third-color);
  overflow: visible;

  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover,
    &:focus-within {
      --card-surface: #18222f;

      z-index: 10;
      border-color: rgba(153, 161, 176, 0.14);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
    }
  }

  &__view {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 3px;
      border-radius: 5px;
    }
  }

  &__media {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: clamp(125px, 11vw, 170px);
    margin-bottom: 16px;
    border-radius: 4px;
    overflow: hidden;
    transition: background-color 0.25s ease;

    .card_dota & {
      background-color: rgba(255, 255, 255, 0.08);
    }
  }

  &__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    img {
      display: block;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;

      transition: transform 0.3s ease;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover &__image img {
      transform: scale(1.04);
    }
  }

  &__placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: var(--fifth-color);
    font-size: 13px;
  }

  &__info {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    display: -webkit-box;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    color: #f3f5f8;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    overflow-wrap: anywhere;

    min-height: 36px;
  }

  &__details {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    min-width: 0;
    margin-top: 6px;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
  }

  &__game {
    color: #85bfff;
  }

  &__separator {
    color: #8995a7;
  }

  &__rarity {
    color: var(--rarity-color);
  }

  &__price {
    width: fit-content;
    margin-top: auto;
    padding-top: 15px;

    :deep(.price__value) {
      color: #f4f6fb;
      font-family: var(--font-orbitron);
      font-size: 15px;
      font-weight: 700;
      line-height: 1.2;
    }

    :deep(.price__icon) {
      width: 15px;
      min-width: 15px;
      height: 15px;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin-top: 14px;
  }

  &__button {
    width: 100%;
    min-height: 34px !important;
    height: 34px;
    padding: 5px 10px;
    border-radius: 5px;
    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.3;

    &_view {
      background: transparent !important;
      border: 1px solid #8794a6 !important;
      color: #f3f5f8 !important;

      @media (any-hover: hover) {
        &:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: #f3f5f8 !important;
        }
      }
    }

    &_buy {
      background: #1a73ff !important;
      border: 1px solid #1a73ff !important;
      color: #ffffff !important;

      @media (any-hover: hover) {
        &:hover {
          background: #005fe8 !important;
          border-color: #005fe8 !important;
        }
      }
    }

    &_remove {
      background: #293446 !important;
      border-color: #3d4a5e !important;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &__actions {
      position: absolute;
      top: calc(100% - 1px);
      left: -1px;
      right: -1px;
      width: calc(100% + 2px);
      margin-top: 0;
      padding: 0 12px 12px;
      border: 1px solid rgba(153, 161, 176, 0.14);
      border-top: 0;
      border-radius: 0 0 10px 10px;
      background: var(--card-surface);
      box-shadow: 0 14px 24px rgba(0, 0, 0, 0.22);

      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateY(-8px);

      transition:
        opacity 0.2s ease,
        visibility 0.2s ease,
        transform 0.2s ease,
        background-color 0.25s ease;
    }

    &:hover &__actions,
    &:focus-within &__actions {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateY(0);
    }
  }

  @media (hover: none), (pointer: coarse) {
    min-height: 0;

    &__actions {
      position: static;
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: none;
    }
  }

  @media (max-width: $md4) {
    padding: 10px;
    border-radius: 8px;

    &__media {
      height: 130px;
      margin-bottom: 12px;
    }

    &__name {
      font-size: 12px;
      min-height: 34px;
    }

    &__details {
      font-size: 11px;
    }

    &__price {
      padding-top: 12px;

      :deep(.price__value) {
        font-size: 13px;
      }
    }

    &__button {
      min-height: 32px !important;
      height: 32px;
      font-size: 10px;
    }
  }
}
</style>
