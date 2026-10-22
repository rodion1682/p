<template>
  <main class="pack-page">
    <div class="pack-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.png" alt="" />
    </div>

    <div class="pack-page__container _cnt">
      <BaseButton
        variant="back"
        icon="arrow"
        class="pack-page__back"
        @click="goBack"
      >
        {{ $t('Back') }}
      </BaseButton>

      <div v-if="loading" class="pack-page__state">
        <LoadingSpinner class="pack-page__loader" />
      </div>

      <div v-else-if="error || !currentPack" class="pack-page__state">
        <h1 class="pack-page__state-title _h4">
          {{ $t('Unable to load pack') }}
        </h1>

        <p class="pack-page__state-text">
          {{ error }}
        </p>

        <BaseButton
          type="button"
          variant="hint-bordered"
          @click="fetchPackDetails"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else class="pack-page__layout">
        <div class="pack-page__preview">
          <div class="pack-page__preview-inner">
            <div class="pack-page__stack">
              <img
                v-for="index in PACK_STACK_COUNT"
                :key="index"
                :src="packImage"
                :alt="index === 1 ? packName : ''"
                :aria-hidden="index !== 1"
                class="pack-page__image"
                :class="`pack-page__image_${index}`"
                draggable="false"
                @error="imageHasFailed = true"
              />
            </div>
          </div>
        </div>

        <div class="pack-page__details">
          <div class="pack-page__header">
            <h1 class="pack-page__title _h4">
              {{ packName }}
            </h1>
          </div>

          <div
            v-if="cardCount || rarityProbabilities.length"
            class="pack-page__section"
          >
            <h2 class="pack-page__section-title">
              {{ $t('Pack contents') }}
            </h2>

            <div class="pack-page__stats">
              <div v-if="cardCount" class="pack-page__stat">
                <span class="pack-page__stat-label">
                  {{ $t('Cards') }}
                </span>

                <span class="pack-page__stat-value">
                  {{ cardCount }}
                </span>
              </div>

              <div
                v-for="item in rarityProbabilities"
                :key="item.rarity"
                class="pack-page__stat"
              >
                <span class="pack-page__stat-label">
                  {{ formatRarity(item.rarity) }}
                </span>

                <span class="pack-page__stat-value">
                  {{ formatProbability(item.probability) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="guaranteedRarities.length" class="pack-page__section">
            <h2 class="pack-page__section-title">
              {{ $t('Guaranteed cards') }}
            </h2>

            <div class="pack-page__stats">
              <div
                v-for="item in guaranteedRarities"
                :key="item.rarity"
                class="pack-page__stat"
              >
                <span class="pack-page__stat-label">
                  {{ formatRarity(item.rarity) }}
                </span>

                <span class="pack-page__stat-value">
                  {{ item.quantity }}
                  {{ $t('guaranteed') }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="currentPack.description" class="pack-page__section">
            <h2 class="pack-page__section-title">
              {{ $t('Description') }}
            </h2>

            <div
              class="pack-page__description"
              v-html="currentPack.description"
            />
          </div>

          <div class="pack-page__purchase">
            <div class="pack-page__purchase-top">
              <div class="pack-page__price">
                <span class="pack-page__control-label">
                  {{ $t('Price') }}
                </span>

                <PriceFormatter
                  v-if="hasDiscount"
                  :price="oldPrice"
                  size="size-14"
                  class="pack-page__old-price"
                />

                <PriceFormatter
                  :price="packPrice"
                  size="size-28"
                  class="pack-page__price-value"
                />
              </div>

              <div class="pack-page__quantity">
                <span class="pack-page__control-label">
                  {{ $t('Quantity') }}
                </span>

                <div class="pack-page__quantity-controls">
                  <button
                    type="button"
                    class="pack-page__quantity-button"
                    :disabled="
                      isInCart || isSubmitting || Number(quantity) <= 1
                    "
                    :aria-label="$t('Decrease quantity')"
                    @click="decreaseQuantity"
                  >
                    −
                  </button>

                  <input
                    v-model="quantity"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="pack-page__quantity-input"
                    :disabled="isInCart || isSubmitting"
                    :aria-label="$t('Quantity')"
                    @input="onQuantityInput"
                    @blur="normalizeQuantity"
                    @keydown.enter="normalizeQuantity"
                  />

                  <button
                    type="button"
                    class="pack-page__quantity-button"
                    :disabled="
                      isInCart ||
                      isSubmitting ||
                      Number(quantity) >= MAX_QUANTITY
                    "
                    :aria-label="$t('Increase quantity')"
                    @click="increaseQuantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <BaseButton
              type="button"
              class="pack-page__action"
              :variant="isInCart ? 'hint-bordered' : 'primary'"
              :disabled="isSubmitting || !currentPack.id"
              @click="handleCartAction"
            >
              {{
                isSubmitting
                  ? $t('Processing...')
                  : isInCart
                    ? $t('Remove from cart')
                    : $t('Buy pack')
              }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import defaultImage from '@/assets/img/default-image.png'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'

import axios from '@/plugins/axios'
import { useCartStore } from '@/stores/cart'

const MAX_QUANTITY = 99
const PACK_STACK_COUNT = 6

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const toast = useToast()
const cartStore = useCartStore()

const currentPack = ref(null)
const loading = ref(true)
const error = ref('')
const isSubmitting = ref(false)
const imageHasFailed = ref(false)
const quantity = ref(1)

let requestId = 0

const packId = computed(() => route.params.productId)

const packName = computed(() => {
  return currentPack.value?.name || currentPack.value?.title || t('Card Pack')
})

const packImage = computed(() => {
  if (imageHasFailed.value) {
    return defaultImage
  }

  return (
    currentPack.value?.image_details || currentPack.value?.image || defaultImage
  )
})

const packPrice = computed(() => {
  const price = Number(
    currentPack.value?.price ?? currentPack.value?.base_price ?? 0,
  )

  return Number.isFinite(price) ? price : 0
})

const oldPrice = computed(() => {
  return Number(currentPack.value?.old_price || 0)
})

const hasDiscount = computed(() => {
  return oldPrice.value > packPrice.value
})

const cardCount = computed(() => {
  return Number(currentPack.value?.card_count || 0)
})

const rarityProbabilities = computed(() => {
  const items = currentPack.value?.rarity_probabilities

  return Array.isArray(items) ? items : []
})

const guaranteedRarities = computed(() => {
  const items = currentPack.value?.guaranteed_rarities

  return Array.isArray(items) ? items : []
})

const isInCart = computed(() => {
  if (!currentPack.value?.id) return false

  return cartStore.isItemInCart(currentPack.value.id, 'pack')
})

function formatRarity(value) {
  if (!value) return ''

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

function formatProbability(probability) {
  const number = Number(probability)

  if (!Number.isFinite(number)) {
    return '0%'
  }

  const percentage = number <= 1 ? number * 100 : number

  return `${percentage.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
}

function normalizeQuantity() {
  const value = Number.parseInt(quantity.value, 10)

  quantity.value = Number.isFinite(value)
    ? Math.min(MAX_QUANTITY, Math.max(1, value))
    : 1
}

function onQuantityInput(event) {
  const value = String(event.target.value).replace(/\D/g, '').slice(0, 2)

  quantity.value = value

  if (Number(value) > MAX_QUANTITY) {
    quantity.value = MAX_QUANTITY
  }
}

function increaseQuantity() {
  if (isSubmitting.value || isInCart.value) return

  normalizeQuantity()

  quantity.value = Math.min(MAX_QUANTITY, Number(quantity.value) + 1)
}

function decreaseQuantity() {
  if (isSubmitting.value || isInCart.value) return

  normalizeQuantity()

  quantity.value = Math.max(1, Number(quantity.value) - 1)
}

async function fetchPackDetails() {
  const currentRequestId = ++requestId

  currentPack.value = null
  error.value = ''
  loading.value = true
  imageHasFailed.value = false
  quantity.value = 1

  try {
    if (!packId.value) {
      throw new Error('Pack ID is missing')
    }

    const response = await axios.get(`/catalog/packs/${packId.value}`)

    if (currentRequestId !== requestId) return

    const data =
      response?.data?.data ?? response?.data?.payload ?? response?.data

    if (!data?.id) {
      throw new Error('Unable to load pack details')
    }

    currentPack.value = data
  } catch (requestError) {
    if (currentRequestId !== requestId) return

    console.error('Failed to load pack:', requestError)

    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      t('Unable to load pack')
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

async function handleCartAction() {
  if (isSubmitting.value || !currentPack.value?.id) {
    return
  }

  isSubmitting.value = true

  try {
    if (isInCart.value) {
      const result = await cartStore.removeFromCart(
        currentPack.value.id,
        'pack',
      )

      if (!result?.success) {
        throw new Error(
          result?.error || result?.message || t('Failed to remove item'),
        )
      }

      toast.success(t('Item removed from cart'))
      return
    }

    normalizeQuantity()

    const result = await cartStore.addToCart(
      currentPack.value.id,
      Number(quantity.value),
      'pack',
    )

    if (result?.isUnauthorized) {
      toast.warning(t('Please login to add items to cart'))

      await router.push({
        name: 'Auth',
        query: {
          form: 'signin',
          redirect: route.fullPath,
        },
      })

      return
    }

    if (!result?.success) {
      if (result?.isAlreadyInCart) {
        toast.warning(result.message)
        return
      }

      throw new Error(result?.message || t('Failed to add item to cart'))
    }

    toast.success(result?.message || t('Item added to cart'))
  } catch (cartError) {
    console.error('Pack cart action failed:', cartError)

    toast.error(
      cartError?.response?.data?.message ||
        cartError?.message ||
        t('Failed to add item to cart'),
    )
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push({ name: 'PackListPage' })
}

watch(() => route.params.productId, fetchPackDetails, { immediate: true })
</script>

<style lang="scss" scoped>
.pack-page {
  @include adaptiveValue('padding-top', 120, 80);
  @include adaptiveValue('padding-bottom', 90, 35);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 100%;

  &__bg {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__container {
    position: relative;
    z-index: 1;

    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__back {
    width: fit-content;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__layout {
    @include adaptiveValue('gap', 48, 20);
    @include adaptiveValue('padding', 36, 16);
    @include adaptiveValue('border-radius', 18, 10);

    display: grid;
    align-items: center;
    grid-template-columns:
      minmax(0, 0.85fr)
      minmax(0, 1.15fr);

    width: 100%;
    min-width: 0;
    max-width: 1192px;

    margin: 0 auto;

    border: 1px solid var(--border-priamry-color);
    background: #111624;
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;
  }

  &__preview-inner {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 420px;
    min-height: 440px;
  }

  &__stack {
    position: relative;

    width: min(75%, 280px);
    aspect-ratio: 0.65;
  }

  &__image {
    position: absolute;
    inset: 0;

    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;

    filter: drop-shadow(0 12px 24px rgb(0 0 0 / 30%));

    &_1 {
      z-index: 6;
    }

    &_2 {
      z-index: 5;

      transform: translate(5px, -4px);
    }

    &_3 {
      z-index: 4;

      transform: translate(10px, -8px);
    }

    &_4 {
      z-index: 3;

      transform: translate(15px, -12px);
    }

    &_5 {
      z-index: 2;

      transform: translate(20px, -16px);
    }

    &_6 {
      z-index: 1;

      transform: translate(25px, -20px);
    }
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 24px;

    width: 100%;
    min-width: 0;
  }

  &__header {
    padding-bottom: 20px;

    border-bottom: 1px solid var(--border-priamry-color);
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    text-transform: none;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 14px;

    min-width: 0;
  }

  &__section-title {
    margin: 0;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 15px;
    font-weight: 600;
    line-height: 150%;
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__stat {
    display: flex;
    flex: 1 1 100px;
    flex-direction: column;
    gap: 8px;

    min-width: 0;

    padding: 12px 14px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 8px;
    background: var(--bg-primary-color);
  }

  &__stat-label {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    line-height: 145%;
  }

  &__stat-value {
    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 15px;
    font-weight: 600;
    line-height: 145%;
  }

  &__description {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 170%;

    overflow-wrap: anywhere;

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }

    :deep(strong),
    :deep(b) {
      color: var(--fourth-color);
      font-weight: 600;
    }

    :deep(a) {
      color: var(--hint-primary-color);
    }
  }

  &__purchase {
    @include adaptiveValue('padding', 22, 14);

    display: flex;
    flex-direction: column;
    gap: 20px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 10px;
    background: var(--bg-primary-color);
  }

  &__purchase-top {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
  }

  &__price,
  &__quantity {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  &__control-label {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    line-height: 140%;
  }

  &__old-price {
    opacity: 0.55;

    text-decoration: line-through;
  }

  &__price-value {
    :deep(.price) {
      flex-direction: row-reverse;
      gap: 8px;
    }
  }

  &__quantity-controls {
    display: flex;
    align-items: center;

    height: 42px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    background: #111624;
  }

  &__quantity-button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 38px;
    height: 40px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--fourth-color);
    font-size: 20px;

    cursor: pointer;

    &:disabled {
      opacity: 0.35;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__quantity-input {
    width: 36px;
    min-width: 0;

    padding: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    text-align: center;
  }

  &__action {
    width: 100%;
    min-height: 44px;
  }

  &__state {
    @include adaptiveValue('padding', 40, 20);

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;

    width: 100%;
    max-width: 600px;
    min-height: 320px;

    margin: auto;

    border: 1px solid var(--border-priamry-color);
    border-radius: 12px;
    background: #111624;

    text-align: center;
  }

  &__state-title {
    margin: 0;

    color: var(--fourth-color);
  }

  &__state-text {
    margin: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    line-height: 150%;
  }

  &__loader {
    width: 48px;
    height: 48px;
  }

  @media (max-width: $md3) {
    &__layout {
      grid-template-columns: minmax(0, 1fr);

      max-width: 680px;
    }

    &__preview-inner {
      min-height: 320px;
    }

    &__stack {
      width: min(56%, 220px);
    }

    &__details {
      gap: 20px;
    }
  }

  @media (max-width: $md6) {
    &__preview-inner {
      min-height: 260px;
    }

    &__stack {
      width: min(58%, 180px);
    }

    &__stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__purchase-top {
      align-items: flex-start;
    }
  }
}
</style>
