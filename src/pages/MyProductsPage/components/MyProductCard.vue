<template>
  <article
    v-if="product"
    class="product-card"
    :class="[
      props.className,
      {
        'product-card_hovered': isCardHovered,
        'product-card_carousel': props.type === 'carousel',
        'product-card_rent': props.rented,
      },
    ]"
    @mouseenter="isCardHovered = true"
    @mouseleave="isCardHovered = false"
  >
    <div class="product-card__body">
      <div class="product-card__content">
        <div class="product-card__heading">
          <h3 class="product-card__title" :title="cardName">
            {{ cardName }}
          </h3>

          <span class="product-card__quantity">
            {{ $t('Q-ty') }}:
            <span>{{ displayQuantity }}</span>
          </span>
        </div>

        <button
          type="button"
          class="product-card__card"
          :aria-label="`${$t('View')} ${cardName}`"
          @click="openCardDetails"
        >
          <div class="product-card__background">
            <img
              :src="cardFrame"
              alt=""
              class="product-card__background-image"
              @error="handleImageError"
            />
          </div>

          <div class="product-card__image-wrapper">
            <img
              :src="cardImage"
              :alt="cardName"
              class="product-card__image"
              @error="handleImageError"
            />
          </div>

          <div v-if="cardName" class="product-card__card-name">
            {{ cardName }}
          </div>

          <div v-if="cardDescription" class="product-card__description">
            <span v-html="cardDescription" />
          </div>

          <div
            v-if="hasValue(cardData.mana_cost)"
            class="product-card__stat product-card__stat_mana"
          >
            {{ cardData.mana_cost }}
          </div>

          <div
            v-if="hasValue(cardData.attack)"
            class="product-card__stat product-card__stat_attack"
          >
            {{ cardData.attack }}
          </div>

          <div
            v-if="hasValue(cardData.health)"
            class="product-card__stat product-card__stat_health"
          >
            {{ cardData.health }}
          </div>

          <span class="product-card__view" aria-hidden="true">
            <SvgIcon class="product-card__view-icon" :icon="EyeIcon" />
          </span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'

import defaultImage from '@/assets/img/default-image.png'
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
    validator: value => ['default', 'carousel'].includes(value),
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
    props.product?.product?.card ??
    props.product?.product ??
    props.product?.item?.card ??
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
    null
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

  return 1
}

function extractMarkdownUrl(value) {
  const match = value.match(/^\[[^\]]+\]\(([^)]+)\)$/)
  return match?.[1] || value
}

function resolveImage(imageValue) {
  if (!imageValue) return defaultImage

  const image = extractMarkdownUrl(String(imageValue).trim())

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
  return {
    ...props.product,
    ...cardData.value,

    id: cardId.value,
    card_id: props.product?.card_id ?? cardId.value,

    name: cardName.value,
    description: cardDescription.value,

    image: cardImage.value,
    image_2: cardFrame.value,

    mana_cost: cardData.value?.mana_cost ?? props.product?.mana_cost ?? null,

    attack: cardData.value?.attack ?? props.product?.attack ?? null,

    health: cardData.value?.health ?? props.product?.health ?? null,

    quantity: displayQuantity.value,

    original: props.product,
  }
}

function openCardDetails() {
  if (!cardId.value) return

  emit('open', getDetailsProduct())
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

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    width: 100%;

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__title {
    overflow: hidden;
    flex: 1 1 auto;

    min-width: 0;

    margin: 0;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 16px;
    font-weight: 600;
    line-height: 100%;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.3s ease;
  }

  &__quantity {
    flex: 0 0 auto;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    font-weight: 600;
    line-height: 100%;
    white-space: nowrap;
    span {
      color: var(--fourth-color);
      font-weight: 700;
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

    cursor: pointer;

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
        0 0 5px rgb(0 25 25 / 50%),
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

    color: var(--fourth-color);

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

    color: var(--fourth-color);

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
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

    .product-card__view {
      visibility: visible;

      opacity: 1;

      transform: translate(-50%, -50%) scale(1);
    }
  }

  &_carousel {
    width: 100%;
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
