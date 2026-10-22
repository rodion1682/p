<template>
  <main class="pack-page">
    <div class="pack-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="pack-page__container _cnt">
      <BaseButton
        type="button"
        variant="back"
        icon="arrow"
        class="pack-page__back"
        @click="goBack"
      >
        {{ $t('Back to packs') }}
      </BaseButton>

      <div v-if="loading" class="pack-page__state" role="status">
        <LoadingSpinner class="pack-page__loader" />
      </div>

      <div v-else-if="error || !currentPack" class="pack-page__state">
        <h1 class="pack-page__state-title _h4">
          {{ $t('Unable to load pack') }}
        </h1>
        <p v-if="error" class="pack-page__state-text">{{ error }}</p>
        <BaseButton
          type="button"
          variant="hint-bordered"
          class="pack-page__retry"
          @click="fetchPackDetails"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else class="pack-page__layout">
        <div class="pack-page__preview">
          <div
            class="pack-page__corner pack-page__corner_top"
            aria-hidden="true"
          >
            <img :src="leftDecoration" alt="" />
          </div>

          <img
            v-if="packImage"
            :src="packImage"
            :alt="currentPack.name"
            class="pack-page__image"
            draggable="false"
            @error="handleImageError"
          />

          <div
            class="pack-page__corner pack-page__corner_bottom"
            aria-hidden="true"
          >
            <img :src="rightDecoration" alt="" />
          </div>
        </div>

        <div class="pack-page__details" :aria-label="currentPack.name">
          <div class="pack-page__main">
            <h1 class="pack-page__title _h4">{{ currentPack.name }}</h1>

            <div
              v-if="currentPack.description"
              class="pack-page__description-section"
            >
              <h2 class="pack-page__label">{{ $t('Description') }}:</h2>
              <p class="pack-page__description">
                {{ currentPack.description }}
              </p>
            </div>

            <div v-if="hasContents" class="pack-page__section">
              <h2 class="pack-page__section-title">
                {{ $t('Pack contents') }}
              </h2>

              <div class="pack-page__stats">
                <div v-if="hasCardCount" class="pack-page__stat">
                  <span class="pack-page__stat-label">{{ $t('Cards') }}</span>
                  <strong class="pack-page__stat-value">{{
                    currentPack.card_count
                  }}</strong>
                </div>

                <div
                  v-for="item in rarityProbabilities"
                  :key="item.rarity"
                  class="pack-page__stat"
                >
                  <span class="pack-page__stat-label">{{
                    formatRarity(item.rarity)
                  }}</span>
                  <strong class="pack-page__stat-value">
                    {{ formatProbability(item.probability) }}
                  </strong>
                </div>
              </div>
            </div>

            <div v-if="guaranteedRarities.length" class="pack-page__section">
              <h2 class="pack-page__section-title">
                {{ $t('Guaranteed cards') }}
              </h2>
              <div class="pack-page__guarantees">
                <div
                  v-for="item in guaranteedRarities"
                  :key="item.rarity"
                  class="pack-page__stat"
                >
                  <span class="pack-page__stat-label">{{
                    formatRarity(item.rarity)
                  }}</span>
                  <strong class="pack-page__stat-value">
                    {{ item.quantity }} {{ $t('guaranteed') }}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div v-if="hasPrice" class="pack-page__purchase">
            <div class="pack-page__price">
              <span class="pack-page__control-label">{{ $t('Price') }}</span>
              <PriceFormatter
                :price="currentPack.price"
                size="size-20"
                class="pack-page__price-value"
              />
            </div>

            <div class="pack-page__quantity">
              <label for="pack-page-quantity" class="pack-page__control-label">
                {{ $t('Quantity') }}
              </label>
              <div class="pack-page__quantity-controls">
                <button
                  type="button"
                  class="pack-page__quantity-button"
                  :disabled="isInCart || isSubmitting || Number(quantity) <= 1"
                  :aria-label="$t('Decrease quantity')"
                  @click="decreaseQuantity"
                >
                  −
                </button>

                <input
                  id="pack-page-quantity"
                  v-model="quantity"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  class="pack-page__quantity-input"
                  :disabled="isInCart || isSubmitting"
                  @input="onQuantityInput"
                  @blur="normalizeQuantity"
                />

                <button
                  type="button"
                  class="pack-page__quantity-button"
                  :disabled="
                    isInCart || isSubmitting || Number(quantity) >= MAX_QUANTITY
                  "
                  :aria-label="$t('Increase quantity')"
                  @click="increaseQuantity"
                >
                  +
                </button>
              </div>
            </div>

            <BaseButton
              type="button"
              :variant="isInCart ? 'play' : 'play'"
              class="pack-page__buy"
              :disabled="isSubmitting"
              @click="handleCartAction"
            >
              {{
                isSubmitting
                  ? $t('Processing...')
                  : isInCart
                    ? $t('Remove')
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
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import blueLeftDecor from '@/assets/img/blue-left-decor.png'
import blueRightDecor from '@/assets/img/blue-right-decor.png'
import redLeftDecor from '@/assets/img/red-left-decor.png'
import redRightDecor from '@/assets/img/red-right-decor.png'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'
import { useCartStore } from '@/stores/cart'

const MAX_QUANTITY = 99

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const toast = useToast()
const cartStore = useCartStore()

const currentPack = ref(null)
const loading = ref(true)
const error = ref('')
const isSubmitting = ref(false)
const quantity = ref(1)
const imageState = ref('details')
let requestId = 0

const packId = computed(() => route.params.productId)

// All product information comes from GET /catalog/packs/:productId.
// The pack name only chooses the decorative PNG color, never product data.
const useRedDecor = computed(() => /elite/i.test(currentPack.value?.name || ''))
const leftDecoration = computed(() =>
  useRedDecor.value ? redLeftDecor : blueLeftDecor,
)
const rightDecoration = computed(() =>
  useRedDecor.value ? redRightDecor : blueRightDecor,
)

const packImage = computed(() => {
  if (imageState.value === 'none') return ''
  if (imageState.value === 'base') return currentPack.value?.image || ''
  return currentPack.value?.image_details || currentPack.value?.image || ''
})

const hasPrice = computed(
  () =>
    currentPack.value?.price != null &&
    Number.isFinite(Number(currentPack.value.price)),
)
const hasCardCount = computed(() => currentPack.value?.card_count != null)

const rarityProbabilities = computed(() => {
  const rarities = currentPack.value?.rarity_probabilities
  return Array.isArray(rarities)
    ? [...rarities].sort(
        (a, b) => Number(b.probability) - Number(a.probability),
      )
    : []
})
const guaranteedRarities = computed(() =>
  Array.isArray(currentPack.value?.guaranteed_rarities)
    ? currentPack.value.guaranteed_rarities
    : [],
)
const hasContents = computed(
  () => hasCardCount.value || rarityProbabilities.value.length > 0,
)
const isInCart = computed(
  () =>
    currentPack.value?.id != null &&
    cartStore.isItemInCart(currentPack.value.id, 'pack'),
)

function formatRarity(value) {
  const text = String(value ?? '')
    .replaceAll('_', ' ')
    .trim()
  return text ? text[0].toUpperCase() + text.slice(1).toLowerCase() : ''
}

function formatProbability(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'

  // API probabilities are fractions: 0.85 -> 85.00%.
  return `${new Intl.NumberFormat(locale.value || 'en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number * 100)}%`
}

function handleImageError() {
  if (
    imageState.value === 'details' &&
    currentPack.value?.image &&
    currentPack.value.image !== currentPack.value.image_details
  ) {
    imageState.value = 'base'
  } else {
    imageState.value = 'none'
  }
}

function normalizeQuantity() {
  const number = Number.parseInt(quantity.value, 10)
  quantity.value = Number.isFinite(number)
    ? Math.min(MAX_QUANTITY, Math.max(1, number))
    : 1
}

function onQuantityInput(event) {
  quantity.value = event.target.value.replace(/\D/g, '').slice(0, 2)
}

function increaseQuantity() {
  if (isInCart.value || isSubmitting.value) return
  normalizeQuantity()
  quantity.value = Math.min(MAX_QUANTITY, Number(quantity.value) + 1)
}

function decreaseQuantity() {
  if (isInCart.value || isSubmitting.value) return
  normalizeQuantity()
  quantity.value = Math.max(1, Number(quantity.value) - 1)
}

async function fetchPackDetails() {
  const activeRequest = ++requestId
  loading.value = true
  error.value = ''
  currentPack.value = null
  imageState.value = 'details'
  quantity.value = 1

  try {
    if (!packId.value) throw new Error(t('Pack ID is missing'))

    const response = await axios.get(`/catalog/packs/${packId.value}`)
    if (activeRequest !== requestId) return

    // Actual response shape supplied by the API: { data: { ...pack } }.
    const pack = response?.data?.data
    if (!pack || pack.id == null) {
      throw new Error(t('Unable to load pack'))
    }

    currentPack.value = pack
  } catch (requestError) {
    if (activeRequest !== requestId) return

    console.error('Failed to load pack:', requestError)
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      t('Unable to load pack')
  } finally {
    if (activeRequest === requestId) loading.value = false
  }
}

async function handleCartAction() {
  if (isSubmitting.value || currentPack.value?.id == null) return
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
      toast.success(result.message || t('Item removed from cart'))
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
        query: { form: 'signin', redirect: route.fullPath },
      })
      return
    }

    if (!result?.success) {
      if (result?.isAlreadyInCart) {
        toast.warning(result.message || t('Item is already in cart'))
        return
      }
      throw new Error(result?.message || t('Failed to add item to cart'))
    }

    toast.success(result.message || t('Item added to cart'))
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
  router.push({ name: 'PackListPage' })
}

watch(() => route.params.productId, fetchPackDetails, { immediate: true })
onBeforeUnmount(() => {
  requestId += 1
})
</script>

<style lang="scss" scoped>
.pack-page {
  @include adaptiveValue('padding-top', 105, 75);
  @include adaptiveValue('padding-bottom', 90, 35);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 100%;

  background: var(--bg-primary-color);

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;

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
    align-self: flex-start;

    width: fit-content;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 36, 20);
    }
  }

  &__layout {
    @include adaptiveValue('column-gap', 20, 12);
    @include adaptiveValue('row-gap', 26, 16);

    display: grid;
    align-items: stretch;
    grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);

    width: 100%;
    min-width: 0;
    max-width: 1100px;

    margin: 0 auto;
  }

  &__preview,
  &__details {
    @include adaptiveValue('border-radius', 20, 12);
    position: relative;

    min-width: 0;

    background: #111624;
  }

  &__preview {
    @include adaptiveValue('min-height', 515, 330);
    display: flex;
    align-items: center;
    justify-content: center;

    isolation: isolate;
  }

  &__image {
    position: relative;
    z-index: 1;

    display: block;

    width: min(82%, 340px);
    height: auto;
    max-height: 82%;

    object-fit: contain;

    filter: drop-shadow(0 12px 24px rgb(0 0 0 / 32%));
  }

  &__corner {
    position: absolute;
    z-index: 2;

    width: clamp(90px, 12vw, 165px);

    pointer-events: none;

    img {
      display: block;

      width: 100%;
      height: auto;

      object-fit: contain;
    }

    &_top {
      top: -12px;
      left: -15px;
    }

    &_bottom {
      right: -14px;
      bottom: -12px;

      transform: scaleY(-1);
    }
  }

  &__details {
    @include adaptiveValue('padding-top', 36, 22);
    @include adaptiveValue('padding-bottom', 32, 18);
    @include adaptiveValue('padding-left', 34, 16);
    @include adaptiveValue('padding-right', 34, 16);

    display: flex;
    flex-direction: column;

    min-height: 0;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 20px;

    width: 100%;
    min-width: 0;
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    text-align: left;
    text-transform: none;
  }

  &__description-section,
  &__section {
    display: flex;
    flex-direction: column;
    gap: 10px;

    min-width: 0;
  }

  &__label,
  &__section-title {
    margin: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    font-weight: 500;
    line-height: 150%;
    text-align: left;
  }

  &__description {
    margin: 0;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 165%;
    text-align: left;
    white-space: pre-line;

    overflow-wrap: anywhere;
  }

  &__section-title {
    color: var(--fourth-color);
    font-weight: 600;
  }

  &__stats {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  &__guarantees {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: 7px;

    min-width: 0;

    padding: 12px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 10px;
    background: var(--bg-primary-color);
  }

  &__stat-label {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    font-weight: 400;
    line-height: 140%;

    overflow-wrap: anywhere;
  }

  &__stat-value {
    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 600;
    line-height: 145%;

    overflow-wrap: anywhere;
  }

  &__purchase {
    @include adaptiveValue('gap', 16, 10);
    display: grid;
    align-items: end;
    grid-template-columns: minmax(0, 1fr) auto minmax(130px, 0.85fr);

    width: 100%;
    min-width: 0;

    margin-top: auto;
    padding-top: 26px;
  }

  &__price,
  &__quantity {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    min-width: 0;
  }

  &__control-label {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    line-height: 140%;
  }

  &__price-value {
    flex-direction: row-reverse;

    color: var(--fourth-color);
    white-space: nowrap;
  }

  &__quantity-controls {
    display: flex;
    align-items: center;

    height: 42px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    background: var(--bg-primary-color);
  }

  &__quantity-button {
    display: flex;
    flex: 0 0 32px;
    align-items: center;
    justify-content: center;

    height: 40px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--fourth-color);
    font-size: 18px;

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
    width: 34px;
    min-width: 0;

    padding: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 13px;
    text-align: center;
  }

  &__buy {
    width: 100%;
    min-width: 209px;
    min-height: 56px;

    white-space: normal;
  }

  &__state {
    @include adaptiveValue('padding', 40, 20);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;

    width: 100%;
    max-width: 640px;
    min-height: 300px;

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

  &__retry {
    width: fit-content;
    min-width: 150px;
  }

  &__loader {
    width: 50px;
    height: 50px;
  }

  @media (max-width: $md3) {
    &__layout {
      grid-template-columns: minmax(0, 1fr);

      max-width: 650px;
    }

    &__preview {
      min-height: 380px;
    }

    &__image {
      width: min(65%, 280px);
    }
  }

  @media (max-width: $md5) {
    &__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__purchase {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    &__buy {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: $md6) {
    &__preview {
      min-height: 300px;
    }

    &__image {
      width: min(63%, 215px);
    }

    &__corner {
      width: 100px;
    }

    &__description {
      font-size: 13px;
    }
  }
}
</style>
