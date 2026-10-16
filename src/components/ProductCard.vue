<template>
  <article
    v-if="product"
    class="product-card"
    :class="[
      props.className,
      {
        'product-card_hovered': isCardHovered,
        'product-card_carousel': props.type === 'carousel',
        'product-card_new': props.new,
        'product-card_sale': props.sale,
        'product-card_owned': props.my,
        'product-card_rent': props.rent,
      },
    ]"
    @mouseenter="isCardHovered = true"
    @mouseleave="isCardHovered = false"
  >
    <div class="product-card__body">
      <div class="product-card__content">
        <h3 class="product-card__title">
          {{ product.name }}
        </h3>

        <button
          class="product-card__card"
          :aria-label="`${$t('View')} ${product.name}`"
          @click="openProductDetails"
        >
          <div class="product-card__background">
            <img
              :src="product.image_2"
              alt=""
              class="product-card__background-image"
              @error="handleBackgroundImageError"
            />
          </div>

          <div class="product-card__image-wrapper">
            <img
              :src="product.image"
              :alt="product.name"
              class="product-card__image"
              @error="handleProductImageError"
            />
          </div>
          <div v-if="cardName" class="product-card__card-name">
            {{ cardName }}
          </div>
          <div v-if="product.description" class="product-card__description">
            <span v-html="product.description" />
          </div>

          <div
            v-if="hasValue(product.mana_cost)"
            class="product-card__stat product-card__stat_mana"
          >
            {{ product.mana_cost }}
          </div>

          <div
            v-if="hasValue(product.attack)"
            class="product-card__stat product-card__stat_attack"
          >
            {{ product.attack }}
          </div>

          <div
            v-if="hasValue(product.health)"
            class="product-card__stat product-card__stat_health"
          >
            {{ product.health }}
          </div>

          <span class="product-card__view" aria-hidden="true">
            <SvgIcon class="product-card__view-icon" :icon="EyeIcon" />
          </span>
        </button>

        <div class="product-card__footer">
          <div class="product-card__price">
            <PriceFormatter size="size-28" :price="getPrice" />
          </div>

          <BaseButton
            v-if="!props.my"
            type="button"
            class="product-card__cart-button"
            :class="{
              'product-card__cart-button_remove': isInCart,
            }"
            :disabled="isLoading"
            :aria-label="cartButtonLabel"
            @click.stop="handleCartAction"
          >
            <span
              v-if="isLoading"
              class="product-card__loader"
              aria-hidden="true"
            />

            <span v-else class="product-card__cart-text">
              {{ cartButtonLabel }}
            </span>
          </BaseButton>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import defaultImage from '@/assets/images/default-image.png'

import BaseButton from '@/components/base/BaseButton.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { EyeIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useToast } from '@/composables/useToast'

import { useCartStore } from '@/stores/cart'

const emit = defineEmits(['open'])

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
    validator: value => ['default', 'carousel'].includes(value),
  },

  new: {
    type: Boolean,
    default: false,
  },

  sale: {
    type: Boolean,
    default: false,
  },

  my: {
    type: Boolean,
    default: false,
  },

  rent: {
    type: Boolean,
    default: false,
  },
})

const cartStore = useCartStore()

const toast = useToast()
const router = useRouter()

const { t } = useI18n()

const instance = getCurrentInstance()

const isLoading = ref(false)
const isCardHovered = ref(false)

const cardName = computed(() => {
  return (
    props.product?.name ??
    props.product?.card_name ??
    props.product?.title ??
    ''
  )
})

const cardNamePathId = computed(() => {
  const componentId = instance?.uid ?? 'card'

  const productId =
    props.product?.id ?? props.product?.card_id ?? props.product?.external_id

  return `product-card-name-${componentId}-${productId ?? 'unknown'}`
})

const cardNamePath = computed(() => {
  if (String(props.product?.type).toLowerCase() === 'spell') {
    return 'M 10 -10 Q 150 75 300 40'
  }

  return 'M 20 60 Q 150 25 280 60'
})

const cardNameFontSize = computed(() => {
  const length = cardName.value.trim().length

  if (length > 34) return 12
  if (length > 28) return 14

  return 16
})

const rentalOptions = computed(() => {
  const prices = props.product?.rental_prices

  return Array.isArray(prices) ? prices : []
})

const defaultRentalPeriod = computed(() => {
  if (!props.rent) {
    return null
  }

  return rentalOptions.value[0] ?? null
})

const defaultRentalPeriodId = computed(() => {
  return defaultRentalPeriod.value?.rental_period_id ?? null
})

const productLink = computed(() => ({
  name: 'ProductDetailsPage',

  params: {
    productId: props.product.id,
  },

  query: {
    rent: props.rent ? '1' : undefined,
  },
}))

const getPrice = computed(() => {
  if (props.rent && defaultRentalPeriod.value) {
    return Number(defaultRentalPeriod.value.price ?? 0).toFixed(2)
  }

  const salePrice = Number(props.product?.sale_price)
  const price = Number(props.product?.price ?? 0)

  if (Number.isFinite(salePrice) && salePrice > 0 && salePrice < price) {
    return salePrice.toFixed(2)
  }

  return price.toFixed(2)
})

const isInCart = computed(() => {
  if (!props.product?.id) {
    return false
  }

  if (props.rent) {
    if (!defaultRentalPeriodId.value) {
      return false
    }

    return cartStore.isItemInCart(
      props.product.id,
      'card',
      defaultRentalPeriodId.value,
    )
  }

  return cartStore.isItemInCart(props.product.id, 'card')
})

const cartButtonLabel = computed(() => {
  return isInCart.value ? t('Remove from cart') : t('Add to cart')
})

const hasValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const openProductDetails = () => {
  emit('open', props.product)
}

const handleBackgroundImageError = event => {
  event.currentTarget.src = defaultImage
}

const handleProductImageError = event => {
  event.currentTarget.src = defaultImage
}

const redirectToLogin = () => {
  toast.warning(t('Please login to add items to cart'))

  router.push({
    name: 'Auth',

    query: {
      form: 'signin',

      redirect: router.currentRoute.value.fullPath || '/',
    },
  })
}

const addToCart = async () => {
  try {
    isLoading.value = true

    let result

    if (props.rent) {
      const rentalPeriodId = defaultRentalPeriodId.value

      if (!rentalPeriodId) {
        toast.error(t('Rental period is unavailable'))

        return
      }

      result = await cartStore.rentCard(props.product.id, rentalPeriodId)
    } else {
      result = await cartStore.addToCart(props.product.id, 1, 'card')
    }

    if (result?.success) {
      toast.success(result.message || t('Item added to cart'))

      return
    }

    if (result?.isUnauthorized) {
      redirectToLogin()

      return
    }

    if (result?.isAlreadyInCart) {
      toast.warning(result.message || t('Item is already in cart'))

      return
    }

    toast.error(result?.message || t('Failed to add item to cart'))
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        t('Failed to add item to cart'),
    )
  } finally {
    isLoading.value = false
  }
}

const removeFromCart = async () => {
  try {
    isLoading.value = true

    const rentalPeriodId = props.rent ? defaultRentalPeriodId.value : null

    const result = await cartStore.removeFromCart(
      props.product.id,
      'card',
      rentalPeriodId,
    )

    if (result?.success) {
      toast.success(t('Item removed from cart'))

      return
    }

    toast.error(result?.error || result?.message || t('Failed to remove item'))
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        t('Failed to remove item'),
    )
  } finally {
    isLoading.value = false
  }
}

const handleCartAction = async () => {
  if (isLoading.value) {
    return
  }

  if (isInCart.value) {
    await removeFromCart()

    return
  }

  await addToCart()
}
</script>

<style lang="scss" scoped>
.product-card {
  position: relative;

  width: 100%;
  min-width: 0;

  text-align: center;

  transition: transform 0.3s ease;

  container-type: inline-size;

  &__body {
    position: relative;

    overflow: hidden;

    width: 100%;

    border: 1px solid var(--border-secondary-color);
    border-radius: 12px;
    background-color: var(--bg-primary-color);

    transition: all 0.3s ease 0s;
  }

  &__content {
    @include adaptiveValue('padding-top', 17, 15);
    @include adaptiveValue('padding-bottom', 17, 15);
    position: relative;

    width: 100%;

    padding-right: 10px;
    padding-left: 10px;
  }

  &__title {
    overflow: hidden;

    width: 100%;

    color: var(--seventh-colo);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.3s ease;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 31, 18);
    }
  }

  &__card {
    position: relative;

    display: block;

    width: 100%;
    aspect-ratio: 2 / 3;

    outline: none;

    color: inherit;

    transition: transform 0.3s ease;

    &:focus-visible {
      .product-card__view {
        visibility: visible;

        opacity: 1;

        transform: translate(-50%, -50%) scale(1);
      }
    }
  }

  &__background {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;
  }

  &__background-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;

    transition:
      filter 0.3s ease,
      transform 0.3s ease;
  }

  &__image-wrapper {
    position: absolute;
    top: 15.3%;
    left: 50%;

    width: 77%;
    height: 45.5%;

    transform: translateX(-50%);
    transition: transform 0.3s ease;
  }

  &__image {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    object-fit: cover;
  }
  &__card-name {
    position: absolute;
    top: 9.25%;
    left: 55%;
    z-index: 3;

    overflow: hidden;

    width: 65%;
    height: fit-content;

    padding: 0 5%;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: clamp(6px, 5cqi, 14px);
    font-weight: 400;
    line-height: 1;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;

    pointer-events: none;

    transform: translateX(-50%);
  }
  &__description {
    position: absolute;
    bottom: 11%;
    left: 50%;

    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;

    width: 56%;
    height: 22%;

    padding: 2%;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: clamp(5px, 3.8cqi, 9px);
    line-height: 1.2;
    text-align: center;

    transform: translateX(-50%);

    :deep(p) {
      margin: 0;
    }
  }

  &__stat {
    position: absolute;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 14%;
    aspect-ratio: 1;

    border-radius: 50%;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: clamp(14px, 10cqi, 28px);
    font-weight: 700;
    line-height: 135%;

    paint-order: stroke fill;

    -webkit-text-fill-color: var(--primary-color);
    -webkit-text-stroke-width: clamp(1px, 0.8cqi, 2px);

    &_mana {
      top: 6.4%;
      left: 7.5%;

      background: radial-gradient(
        circle at 50% 42%,
        #4fa9df 0%,
        #2c8bc4 28%,
        #176fa8 48%,
        #07578b 68%,
        #003b66 86%,
        #002a4b 100%
      );
      box-shadow:
        inset 0 0 4px rgb(0 10 25 / 35%),
        inset 0 3px 5px rgb(0 15 30 / 45%),
        inset 0 -5px 8px rgb(0 8 20 / 75%),
        inset 4px 0 6px rgb(0 12 28 / 40%),
        inset -4px 0 6px rgb(0 12 28 / 40%),
        0 1px 3px rgb(0 0 0 / 60%),
        0 0 5px rgb(0 20 40 / 50%);

      -webkit-text-stroke-color: #01588a;
    }

    &_attack {
      right: 5.85%;
      bottom: 5.5%;

      width: 12%;

      background: radial-gradient(
        circle at 50% 42%,
        #c44976 0%,
        #a92e5d 28%,
        #8c1e4b 48%,
        #70123c 68%,
        #52092e 86%,
        #35051f 100%
      );
      box-shadow:
        inset 0 0 4px rgb(45 0 20 / 35%),
        inset 0 3px 5px rgb(55 0 25 / 45%),
        inset 0 -5px 8px rgb(35 0 18 / 75%),
        inset 4px 0 6px rgb(45 0 22 / 40%),
        inset -4px 0 6px rgb(45 0 22 / 40%),
        0 1px 3px rgb(0 0 0 / 60%),
        0 0 5px rgb(40 0 20 / 50%);

      line-height: 110%;

      -webkit-text-stroke-color: #72153e;
    }

    &_health {
      bottom: 5.5%;
      left: 5.85%;

      width: 12%;

      background: radial-gradient(
        circle at 50% 42%,
        #42a995 0%,
        #268878 28%,
        #146d62 48%,
        #09564f 68%,
        #03413e 86%,
        #022d2d 100%
      );
      box-shadow:
        inset 0 0 4px rgb(0 25 23 / 35%),
        inset 0 3px 5px rgb(0 35 30 / 45%),
        inset 0 -5px 8px rgb(0 18 20 / 75%),
        inset 4px 0 6px rgb(0 25 25 / 40%),
        inset -4px 0 6px rgb(0 25 25 / 40%),
        0 1px 3px rgb(0 0 0 / 60%),
        0 0 5px rgb(0 25 25 / 50%);

      line-height: 110%;

      -webkit-text-stroke-color: #07584f;
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

    width: 70%;
    aspect-ratio: 1;

    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgb(0 0 0 / 25%) 0%,
      rgb(0 0 0 / 0%) 100%
    );
    opacity: 0;

    color: var(--primary-color);

    pointer-events: none;

    transform: translate(-50%, -50%) scale(0.75);
    transition:
      visibility 0.3s ease,
      opacity 0.3s ease,
      color 0.3s ease,
      transform 0.3s ease;
  }

  &__view-icon {
    display: block;

    width: 32px;
    height: 32px;

    color: var(--primary-color);

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__footer {
    @include adaptiveValue('margin-top', 28, 18);
    position: relative;
  }

  &__price {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;

    white-space: nowrap;
    :deep(.price) {
      flex-direction: row-reverse;
    }
  }

  &__cart-button {
    &_remove {
      background-color: var(--error-color) !important;
      @media (any-hover: hover) {
        &:hover {
          background-color: var(--third-color) !important;
        }
      }
    }
    @media (any-hover: hover) {
      position: absolute;
      bottom: 0;
      left: 50%;
      z-index: 1;

      width: 100%;

      opacity: 0;

      transform: translate(-50%, 0px);
    }
    @media (any-hover: none) {
      margin-top: 8px;
    }
  }

  &__cart-text {
    overflow: hidden;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__loader {
    display: block;
    flex: 0 0 auto;

    width: clamp(14px, 8cqi, 20px);
    aspect-ratio: 1;

    border: clamp(1px, 1cqi, 2px) solid currentColor;
    border-radius: 50%;

    animation: product-card-spin 1s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  &_hovered {
    .product-card__body {
      border-color: var(--border-secondary-color);
      box-shadow: 0 8px 24px rgb(0 0 0 / 25%);

      transform: translateY(-1%);
    }

    .product-card__title {
      color: var(--primary-color);
    }

    .product-card__card {
      transform: scale(1.02);
    }
    .product-card__image-wrapper {
      transform: scale(0.998) translateX(-50%);
    }

    .product-card__background-image {
      filter: brightness(0.8);
    }

    .product-card__cart-button {
      opacity: 1;

      pointer-events: auto;
    }

    .product-card__view {
      visibility: visible;

      opacity: 1;

      transform: translate(-50%, -50%) scale(1);
    }
  }

  &_carousel {
    width: 100%;
  }

  &_sale {
    .product-card__body {
      box-shadow: 0 0 20px rgb(238 57 85 / 15%);
    }
  }

  &_new {
    .product-card__body {
      box-shadow: 0 0 20px rgb(46 207 196 / 15%);
    }
  }
}

@keyframes product-card-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (any-hover: none) {
  .product-card {
    &__view {
      top: 8%;
      right: 8%;
      left: auto;

      visibility: visible;

      width: clamp(34px, 20cqi, 48px);

      opacity: 1;

      transform: none;
    }
  }
}
</style>
