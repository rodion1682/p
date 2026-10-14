<template>
  <article
    v-if="product"
    class="my-product-card"
    :class="[
      props.className,
      {
        'my-product-card_hovered': isCardHovered,
        'my-product-card_carousel': props.type === 'carousel',
        'my-product-card_rented': props.rented,
      },
    ]"
    @mouseenter="isCardHovered = true"
    @mouseleave="isCardHovered = false"
  >
    <div class="my-product-card__body">
      <div class="my-product-card__content">
        <h3 class="my-product-card__title" :title="cardName">
          {{ cardName }}
        </h3>

        <button
          type="button"
          class="my-product-card__card"
          :aria-label="`${$t('View')} ${cardName}`"
          @click="openCardDetails"
        >
          <!-- Card frame -->
          <div class="my-product-card__frame">
            <img
              :src="cardFrame"
              alt=""
              class="my-product-card__frame-image"
              @error="handleImageError"
            />
          </div>

          <!-- Card artwork -->
          <div class="my-product-card__artwork">
            <img
              :src="cardImage"
              :alt="cardName"
              class="my-product-card__artwork-image"
              @error="handleImageError"
            />
          </div>

          <div v-if="cardName" class="my-product-card__card-name">
            {{ cardName }}
          </div>

          <!-- Card description -->
          <div v-if="cardDescription" class="my-product-card__description">
            <span v-html="cardDescription" />
          </div>

          <!-- Mana -->
          <span
            v-if="hasValue(cardData.mana_cost)"
            class="my-product-card__stat my-product-card__stat_mana"
          >
            {{ cardData.mana_cost }}
          </span>

          <!-- Attack -->
          <span
            v-if="hasValue(cardData.attack)"
            class="my-product-card__stat my-product-card__stat_attack"
          >
            {{ cardData.attack }}
          </span>

          <!-- Health -->
          <span
            v-if="hasValue(cardData.health)"
            class="my-product-card__stat my-product-card__stat_health"
          >
            {{ cardData.health }}
          </span>

          <!-- View overlay -->
          <span class="my-product-card__view" aria-hidden="true">
            <SvgIcon class="my-product-card__view-icon" :icon="EyeIcon" />
          </span>
        </button>

        <!-- Quantity instead of price/cart -->
        <div class="my-product-card__quantity">
          <span class="my-product-card__quantity-label">
            {{ $t('Quantity') }}
          </span>

          <strong class="my-product-card__quantity-value">
            {{ displayQuantity }}
          </strong>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'

import defaultImage from '@/assets/images/default-image.png'
import { EyeIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

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

  rented: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open'])

const isCardHovered = ref(false)

const cardData = computed(() => {
  return (
    props.product?.card ??
    props.product?.product ??
    props.product?.item ??
    props.product ??
    {}
  )
})

const cardId = computed(() => {
  return (
    cardData.value?.id ??
    props.product?.card_id ??
    props.product?.product_id ??
    props.product?.id ??
    'card'
  )
})

const cardName = computed(() => {
  return (
    cardData.value?.name ??
    cardData.value?.title ??
    props.product?.card_name ??
    props.product?.name ??
    props.product?.title ??
    ''
  )
})

const cardDescription = computed(() => {
  return (
    cardData.value?.description ||
    cardData.value?.card_description ||
    cardData.value?.text_effect ||
    props.product?.description ||
    props.product?.card_description ||
    props.product?.text_effect ||
    ''
  )
})

const cardImage = computed(() => {
  const image =
    cardData.value?.image ||
    cardData.value?.card_image ||
    cardData.value?.img_url ||
    props.product?.image ||
    props.product?.card_image ||
    props.product?.img_url

  return resolveImage(image)
})

const cardFrame = computed(() => {
  const image =
    cardData.value?.image_2 ||
    cardData.value?.card_image_2 ||
    cardData.value?.frame_image ||
    props.product?.image_2 ||
    props.product?.card_image_2 ||
    props.product?.frame_image

  return resolveImage(image)
})

const displayQuantity = computed(() => {
  const quantity =
    props.product?.quantity ??
    props.product?.owned_quantity ??
    props.product?.available_quantity ??
    props.product?.total_quantity ??
    props.product?.count ??
    props.product?.pivot?.quantity ??
    cardData.value?.quantity ??
    cardData.value?.owned_quantity ??
    getInstancesQuantity()

  const normalizedQuantity = Number.parseInt(quantity, 10)

  return Number.isFinite(normalizedQuantity)
    ? Math.max(0, normalizedQuantity)
    : 1
})

function getInstancesQuantity() {
  if (Array.isArray(props.product?.instances)) {
    return props.product.instances.length
  }

  if (Array.isArray(props.product?.cards)) {
    return props.product.cards.length
  }

  /*
   * Every rented-card response item represents
   * one rented card unless the API provides quantity.
   */
  if (
    props.rented ||
    props.product?.card_id ||
    props.product?.rental_period ||
    props.product?.rented_at
  ) {
    return 1
  }

  /*
   * Every individual owned-card instance also
   * represents one card.
   */
  if (props.product?.instance_uuid || props.product?.card_instance_id) {
    return 1
  }

  return 1
}

function extractMarkdownUrl(value) {
  const match = value.match(/^\[[^\]]+\]\(([^)]+)\)$/)

  return match?.[1] || value
}

function resolveImage(imageValue) {
  if (!imageValue) {
    return defaultImage
  }

  let image = String(imageValue).trim()

  /*
   * Supports a normal URL and an accidentally
   * returned Markdown-formatted URL:
   *
   * [https://example.com/image.png](https://example.com/image.png)
   */
  image = extractMarkdownUrl(image)

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image
  }

  const staticDomain = String(import.meta.env.VITE_STATIC_DOMAIN || '').replace(
    /\/+$/,
    '',
  )

  const normalizedPath = image.startsWith('/') ? image : `/${image}`

  return staticDomain ? `${staticDomain}${normalizedPath}` : normalizedPath
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== ''
}

function handleImageError(event) {
  const image = event.currentTarget

  if (!image || image.dataset.fallbackApplied === 'true') {
    return
  }

  image.dataset.fallbackApplied = 'true'
  image.src = defaultImage
}

function getDetailsProduct() {
  /*
   * Normalize rented-card fields before passing the card
   * to the details modal. The original response is kept
   * so rental information is not lost.
   */
  return {
    ...props.product,
    ...cardData.value,

    id: cardId.value,
    card_id: props.product?.card_id || cardId.value,

    name: cardName.value,
    description: cardDescription.value,

    image: cardImage.value,
    image_2: cardFrame.value,

    mana_cost: cardData.value?.mana_cost ?? props.product?.mana_cost ?? null,

    attack: cardData.value?.attack ?? props.product?.attack ?? null,

    health: cardData.value?.health ?? props.product?.health ?? null,

    quantity: displayQuantity.value,

    /*
     * Preserve the complete original API object.
     */
    original: props.product,
  }
}

function openCardDetails() {
  if (!cardId.value) {
    return
  }

  emit('open', getDetailsProduct())
}
</script>

<style lang="scss" scoped>
.my-product-card {
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

    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.3s ease;
  }

  &__content {
    position: relative;

    width: 100%;

    padding: clamp(8px, 5cqi, 16px) clamp(7px, 4cqi, 14px)
      clamp(10px, 5cqi, 18px);
  }

  &__title {
    overflow: hidden;

    width: 100%;

    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 500;
    line-height: 120%;
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.3s ease;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 0, 15);
    }
  }

  &__card {
    position: relative;

    display: block;

    width: 100%;
    aspect-ratio: 2 / 3;

    margin: 0;
    padding: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: inherit;

    appearance: none;
    cursor: pointer;

    transition: transform 0.3s ease;

    &:focus-visible {
      .my-product-card__view {
        visibility: visible;

        opacity: 1;

        transform: translate(-50%, -50%) scale(1);
      }
    }
  }

  &__frame {
    position: absolute;
    inset: 0;
    z-index: 2;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__frame-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;

    transition:
      filter 0.3s ease,
      transform 0.3s ease;
  }

  &__artwork {
    position: absolute;
    top: 15.7%;
    left: 50%;
    z-index: 2;

    overflow: hidden;

    width: 76%;
    height: 45%;

    transform: translate(-50%, 0px);
    transition: transform 0.3s ease;
  }

  &__artwork-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: cover;
    object-position: center;
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
    z-index: 3;

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

    pointer-events: none;

    transform: translateX(-50%);

    :deep(p) {
      margin: 0;
    }

    :deep(br) {
      display: none;
    }
  }

  &__stat {
    position: absolute;
    z-index: 4;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 14%;
    height: fit-content;
    aspect-ratio: 1;

    border-radius: 50%;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: clamp(14px, 10cqi, 28px);
    font-weight: 700;
    line-height: 111%;

    pointer-events: none;

    paint-order: stroke fill;

    -webkit-text-fill-color: var(--primary-color);
    -webkit-text-stroke-width: clamp(1px, 0.8cqi, 2px);

    &_mana {
      top: 7.4%;
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

      line-height: 110%;

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

      -webkit-text-stroke-color: #07584f;
    }
  }

  &__view {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 6;

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

    filter: drop-shadow(0 2px 8px rgb(0 0 0 / 60%));

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__quantity {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 3cqi, 10px);

    width: 100%;
    min-height: clamp(56px, 28cqi, 72px);

    margin-top: clamp(8px, 5cqi, 16px);
  }

  &__quantity-label {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: clamp(10px, 5.5cqi, 13px);
    font-weight: 500;
    line-height: 1.2;
    text-transform: uppercase;

    transition: color 0.3s ease;
  }

  &__quantity-value {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: clamp(14px, 8cqi, 20px);
    font-weight: 600;
    line-height: 1;
  }

  &_hovered {
    .my-product-card__body {
      border-color: var(--border-secondary-color);
      box-shadow: 0 8px 24px rgb(0 0 0 / 25%);

      transform: translateY(-1%);
    }

    .my-product-card__title {
      color: var(--primary-color);
    }

    .my-product-card__card {
      transform: scale(1.02);
    }
    .my-product-card__artwork {
      transform: scale(0.998) translateX(-50%);
    }

    .my-product-card__frame-image {
      filter: brightness(0.8);
    }

    .my-product-card__view {
      visibility: visible;

      opacity: 1;

      transform: translate(-50%, -50%) scale(1);
    }

    .my-product-card__quantity-label {
      color: var(--hint-secondary-color);
    }
  }

  &_carousel {
    width: 100%;
  }

  &_rented {
    .my-product-card__body {
      box-shadow: 0 0 20px rgb(46 207 196 / 10%);
    }
  }

  @media (any-hover: none) {
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
