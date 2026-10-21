<template>
  <article
    v-if="product"
    class="pack-card"
    :class="[
      props.className,
      {
        'pack-card_hovered': isCardHovered,
        'pack-card_carousel': props.type === 'carousel',
        'pack-card_owned': props.my,
        'pack-card_in-cart': isInCart,
      },
    ]"
    @mouseenter="isCardHovered = true"
    @mouseleave="isCardHovered = false"
  >
    <div class="pack-card__body">
      <div class="pack-card__title _h4" :title="packName">
        {{ packName }}
      </div>

      <button
        type="button"
        class="pack-card__preview"
        :disabled="!packId"
        :aria-label="`${$t('View')} ${packName}`"
        @click="openPackDetails"
      >
        <div class="pack-card__image">
          <img :src="packImage" :alt="packName" @error="handleImageError" />
        </div>

        <div class="pack-card__view" aria-hidden="true">
          <SvgIcon :icon="EyeIcon" class="pack-card__view-icon" />
        </div>
      </button>

      <div v-if="!props.my" class="pack-card__footer">
        <div class="pack-card__price">
          <PriceFormatter :price="packPrice" size="size-32" />
        </div>

        <BaseButton
          type="button"
          variant="hint-bordered"
          class="pack-card__cart"
          :class="{
            'pack-card__cart_remove': isInCart,
          }"
          :disabled="isLoading || !packId"
          :aria-label="cartButtonLabel"
          @click.stop="handleCartAction"
        >
          <span v-if="isLoading" class="pack-card__loader" aria-hidden="true" />

          <template v-else>
            <SvgIcon
              :icon="isInCart ? CloseIcon : CartIcon"
              class="pack-card__cart-icon"
            />

            <span class="pack-card__cart-text">
              {{ cartButtonLabel }}
            </span>
          </template>
        </BaseButton>
      </div>

      <div v-else class="pack-card__owned">
        <div class="pack-card__owned-label">
          {{ $t('Quantity') }}
        </div>

        <div class="pack-card__owned-value">
          {{ ownedQuantity }}
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import defaultImage from '@/assets/img/default-image.png'

import BaseButton from '@/components/base/BaseButton.vue'
import { CartIcon, CloseIcon, EyeIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'

import axios from '@/plugins/axios'

import { useCartStore } from '@/stores/cart'

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },

  className: {
    type: [String, Array, Object],
    default: '',
  },

  type: {
    type: String,
    default: 'default',
    validator: value => {
      return ['default', 'carousel'].includes(value)
    },
  },

  my: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open'])

const cartStore = useCartStore()
const router = useRouter()
const toast = useToast()

const { t } = useI18n()

const isLoading = ref(false)
const isCardHovered = ref(false)
const imageHasFailed = ref(false)
const detailsImage = ref('')

let imageRequestId = 0

const packId = computed(() => {
  return (
    props.product?.pack_id ??
    props.product?.product_id ??
    props.product?.pack?.id ??
    props.product?.product?.id ??
    props.product?.id ??
    null
  )
})

const packName = computed(() => {
  return (
    props.product?.pack?.name ??
    props.product?.product?.name ??
    props.product?.name ??
    props.product?.title ??
    t('Card Pack')
  )
})

const existingDetailsImage = computed(() => {
  return (
    props.product?.image_details ??
    props.product?.pack?.image_details ??
    props.product?.product?.image_details ??
    ''
  )
})

const regularPackImage = computed(() => {
  return (
    props.product?.image ??
    props.product?.pack?.image ??
    props.product?.product?.image ??
    props.product?.image_2 ??
    props.product?.pack?.image_2 ??
    props.product?.product?.image_2 ??
    props.product?.img_url ??
    ''
  )
})

const rawPackImage = computed(() => {
  return (
    detailsImage.value ||
    existingDetailsImage.value ||
    regularPackImage.value ||
    ''
  )
})

const resolveImageUrl = value => {
  if (!value) {
    return defaultImage
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value
  }

  if (!STATIC_DOMAIN) {
    return value
  }

  const domain = STATIC_DOMAIN.replace(/\/$/, '')
  const path = value.startsWith('/') ? value : `/${value}`

  return `${domain}${path}`
}

const packImage = computed(() => {
  if (imageHasFailed.value) {
    return defaultImage
  }

  return resolveImageUrl(rawPackImage.value)
})

const packPrice = computed(() => {
  const value =
    props.product?.pack?.price ??
    props.product?.product?.price ??
    props.product?.price ??
    props.product?.base_price ??
    0

  const number = Number(value)

  return Number.isFinite(number) ? number : 0
})

const ownedQuantity = computed(() => {
  const value =
    props.product?.quantity ??
    props.product?.owned_quantity ??
    props.product?.count ??
    props.product?.amount ??
    props.product?.pivot?.quantity ??
    1

  const number = Number(value)

  if (!Number.isFinite(number)) {
    return 0
  }

  return Math.max(0, number)
})

const isInCart = computed(() => {
  if (!packId.value || props.my) {
    return false
  }

  return cartStore.isItemInCart(packId.value, 'pack')
})

const cartButtonLabel = computed(() => {
  return isInCart.value ? t('Remove from cart') : t('Add to cart')
})

const getResponsePack = response => {
  return (
    response?.data?.data ?? response?.data?.payload ?? response?.data ?? null
  )
}

const fetchDetailsImage = async () => {
  const currentPackId = packId.value

  if (!currentPackId) {
    detailsImage.value = ''
    return
  }

  if (existingDetailsImage.value) {
    detailsImage.value = existingDetailsImage.value

    return
  }

  const currentRequestId = ++imageRequestId

  try {
    const response = await axios.get(`/catalog/packs/${currentPackId}`)

    if (currentRequestId !== imageRequestId) {
      return
    }

    if (String(currentPackId) !== String(packId.value)) {
      return
    }

    const packDetails = getResponsePack(response)

    detailsImage.value = packDetails?.image_details || packDetails?.image || ''
  } catch (error) {
    if (currentRequestId !== imageRequestId) {
      return
    }

    console.error('Unable to load pack details image:', error)

    detailsImage.value = ''
  }
}

const handleImageError = event => {
  const image = event.currentTarget

  if (!image) {
    return
  }

  if (detailsImage.value && regularPackImage.value) {
    detailsImage.value = ''

    image.src = resolveImageUrl(regularPackImage.value)

    return
  }

  if (image.dataset.fallbackApplied === 'true') {
    return
  }

  image.dataset.fallbackApplied = 'true'

  imageHasFailed.value = true
  image.src = defaultImage
}

const openPackDetails = () => {
  if (!packId.value) {
    console.error('Cannot open pack details: pack ID is missing', props.product)

    return
  }

  emit('open', props.product)
}

const redirectToLogin = async () => {
  await router.push({
    name: 'Auth',
    query: {
      form: 'signin',
      redirect: router.currentRoute.value.fullPath || '/',
    },
  })
}

const removeFromCart = async () => {
  isLoading.value = true

  try {
    const result = await cartStore.removeFromCart(packId.value, 'pack')

    if (!result?.success) {
      throw new Error(
        result?.error || result?.message || t('Failed to remove item'),
      )
    }

    toast.success(result.message || t('Item removed from cart'))
  } catch (error) {
    console.error('Unable to remove pack from cart:', error)

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        t('Failed to remove item'),
    )
  } finally {
    isLoading.value = false
  }
}

const addToCart = async () => {
  isLoading.value = true

  try {
    const result = await cartStore.addToCart(packId.value, 1, 'pack')

    if (result?.isUnauthorized) {
      toast.warning(t('Please login to add items to cart'))

      await redirectToLogin()

      return
    }

    if (result?.isAlreadyInCart) {
      toast.warning(result.message || t('Item is already in cart'))

      return
    }

    if (!result?.success) {
      throw new Error(result?.message || t('Failed to add item to cart'))
    }

    toast.success(result.message || t('Item added to cart'))
  } catch (error) {
    console.error('Unable to add pack to cart:', error)

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        t('Failed to add item to cart'),
    )
  } finally {
    isLoading.value = false
  }
}

const handleCartAction = async () => {
  if (isLoading.value || !packId.value || props.my) {
    return
  }

  if (isInCart.value) {
    await removeFromCart()
    return
  }

  await addToCart()
}

const resetPackImage = () => {
  imageRequestId += 1

  detailsImage.value = ''
  imageHasFailed.value = false
}

onMounted(() => {
  fetchDetailsImage()
})

watch(packId, (newPackId, previousPackId) => {
  if (!newPackId || String(newPackId) === String(previousPackId)) {
    return
  }

  resetPackImage()
  fetchDetailsImage()
})
</script>

<style lang="scss" scoped>
.pack-card {
  position: relative;

  display: flex;

  width: 100%;
  min-width: 0;
  height: 100%;

  text-align: center;

  container-type: inline-size;

  &__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: center;

    width: 100%;
    min-width: 0;
  }

  &__title {
    overflow: hidden;

    width: 100%;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-weight: 600;
    line-height: 120%;
    text-align: center;
    text-overflow: ellipsis;
    text-transform: none;
    white-space: nowrap;

    transition: color 0.3s ease;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__preview {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 310px;
    aspect-ratio: 0.68;

    margin: 0;
    padding: 0;

    border: 0;
    outline: none;
    background-color: transparent;

    cursor: pointer;

    transition: transform 0.3s ease;

    &:disabled {
      cursor: default;
    }

    &:focus-visible {
      outline: 1px solid var(--hint-secondary-color);
      outline-offset: 5px;
    }
  }

  &__image {
    position: relative;

    width: 100%;
    height: 100%;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;

      transition:
        transform 0.35s ease,
        filter 0.35s ease;
    }
  }

  &__view {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;

    display: flex;
    visibility: hidden;
    align-items: center;
    justify-content: center;

    width: 45%;
    aspect-ratio: 1 / 1;

    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgb(0 0 0 / 48%) 0%,
      rgb(0 0 0 / 15%) 45%,
      rgb(0 0 0 / 0%) 72%
    );
    opacity: 0;

    color: var(--primary-color);

    pointer-events: none;

    transform: translate(-50%, -50%) scale(0.7);
    transition:
      visibility 0.3s ease,
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  &__view-icon {
    width: 30px;
    min-width: 30px;
    height: 30px;

    filter: drop-shadow(0 2px 5px rgb(0 0 0 / 50%));
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
    min-height: 92px;

    margin-top: 15px;
  }

  &__price {
    position: relative;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;

    transition:
      color 0.3s ease,
      transform 0.3s ease;

    :deep(.price) {
      justify-content: center;
    }

    :deep(.price__number) {
      font-family: var(--font-spectral);
      font-weight: 700;
    }
  }

  &__cart {
    @include adaptiveValue('min-height', 40, 36);

    visibility: hidden;

    width: 100%;
    max-width: 200px;

    margin-top: 12px;

    opacity: 0;

    pointer-events: none;

    transform: translateY(-6px);
    transition:
      visibility 0.3s ease,
      opacity 0.3s ease,
      transform 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease;

    &_remove {
      border-color: var(--error-color);

      color: var(--error-color);
    }

    &:disabled {
      cursor: wait;
    }
  }

  &__cart-icon {
    width: 18px;
    min-width: 18px;
    height: 18px;
  }

  &__cart-text {
    overflow: hidden;

    min-width: 0;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__loader {
    width: 18px;
    height: 18px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: pack-card-spin 0.8s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  &__owned {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    width: 100%;

    margin-top: 15px;
  }

  &__owned-label {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
  }

  &__owned-value {
    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: 18px;
    font-weight: 700;
  }

  &_hovered {
    .pack-card__title {
      color: var(--hint-secondary-color);
    }

    .pack-card__preview {
      transform: translateY(-4px);
    }

    .pack-card__image {
      img {
        transform: scale(1.025);

        filter: brightness(0.8);
      }
    }

    .pack-card__view {
      visibility: visible;

      opacity: 1;

      transform: translate(-50%, -50%) scale(1);
    }

    .pack-card__price {
      color: var(--hint-secondary-color);

      transform: translateY(-2px);
    }

    .pack-card__cart {
      visibility: visible;

      opacity: 1;

      pointer-events: auto;

      transform: translateY(0);
    }
  }

  &_in-cart {
    .pack-card__price {
      color: var(--hint-secondary-color);
    }
  }

  &_carousel {
    width: 100%;
  }

  @media (any-hover: hover) {
    &__cart {
      &:hover {
        border-color: var(--hint-secondary-color);
        background-color: var(--hint-primary-color);

        color: var(--bg-primary-color);
      }

      &_remove {
        &:hover {
          border-color: var(--error-color);
          background-color: var(--error-color);

          color: var(--primary-color);
        }
      }
    }
  }

  @media (max-width: $md4) {
    &__preview {
      max-width: 280px;
    }
  }

  @media (max-width: $md6) {
    max-width: 328px;

    margin-right: auto;
    margin-left: auto;
  }
}

@media (any-hover: none) {
  .pack-card {
    &__footer {
      min-height: 0;
    }

    &__cart {
      visibility: visible;

      max-width: 200px;

      opacity: 1;

      pointer-events: auto;

      transform: none;
    }

    &__view {
      top: 15px;
      right: 15px;
      left: auto;

      visibility: visible;

      width: 42px;

      opacity: 1;

      transform: none;
    }

    &__view-icon {
      width: 20px;
      min-width: 20px;
      height: 20px;
    }
  }
}

@keyframes pack-card-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
