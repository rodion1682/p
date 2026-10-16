<template>
  <BaseModal
    :show="props.show"
    class="pack-details-modal"
    content-class="pack-details-modal__content"
    size="product"
    :labelledby="titleId"
    @close="handleClose"
    @update:show="handleShowUpdate"
  >
    <div
      v-if="loading && !currentPack"
      class="pack-details pack-details_loading"
    >
      <LoadingSpinner class="pack-details__loader" />
    </div>

    <div
      v-else-if="error && !currentPack"
      class="pack-details pack-details_error"
    >
      <div class="pack-details__state">
        <h2 class="_h4">{{ $t('Unable to load pack') }}</h2>
        <p>{{ error }}</p>
        <BaseButton
          type="button"
          variant="hint-bordered"
          @click="fetchPackDetails"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>
    </div>

    <div v-else-if="currentPack" class="pack-details">
      <div class="pack-details__preview">
        <img
          :src="packImage"
          :alt="packName"
          class="pack-details__image"
          @error="handleImageError"
        />
      </div>

      <div class="pack-details__content">
        <div class="pack-details__main">
          <h2 :id="titleId" class="pack-details__title _h4">{{ packName }}</h2>

          <div v-if="hasPackStats" class="pack-details__stats">
            <div v-if="cardCount" class="pack-details__stat">
              <span>{{ $t('Cards') }}:</span>
              <strong>{{ cardCount }}</strong>
            </div>
            <div
              v-for="item in rarityProbabilities"
              :key="item.rarity"
              class="pack-details__stat"
            >
              <span>{{ formatRarity(item.rarity) }}:</span>
              <strong>{{ formatProbability(item.probability) }}</strong>
            </div>
          </div>

          <div
            v-if="guaranteedRarities.length"
            class="pack-details__guaranteed"
          >
            <div
              v-for="item in guaranteedRarities"
              :key="item.rarity"
              class="pack-details__stat"
            >
              <span>{{ formatRarity(item.rarity) }}:</span>
              <strong>{{ item.quantity }} {{ $t('guaranteed') }}</strong>
            </div>
          </div>

          <div class="pack-details__description">
            <div class="pack-details__description-label">
              {{ $t('Description:') }}
            </div>
            <div
              v-if="currentPack.description"
              class="pack-details__description-content"
              v-html="currentPack.description"
            />
            <div v-else class="pack-details__description-content">—</div>
          </div>
        </div>

        <div class="pack-details__bottom">
          <div class="pack-details__price">
            <div class="pack-details__control-label">{{ $t('Price:') }}</div>
            <PriceFormatter
              :price="packPrice"
              size="size-32"
              class="pack-details__price-value"
            />
          </div>

          <div v-if="!isInCart" class="pack-details__quantity">
            <div class="pack-details__control-label">{{ $t('Q-ty:') }}</div>
            <div class="pack-details__quantity-controls">
              <button
                type="button"
                class="pack-details__quantity-button"
                :disabled="quantity <= 1 || isSubmitting"
                :aria-label="$t('Decrease quantity')"
                @click="decreaseQuantity"
              >
                −
              </button>
              <input
                v-model="quantity"
                type="text"
                inputmode="numeric"
                class="pack-details__quantity-input"
                :disabled="isSubmitting"
                :aria-label="$t('Quantity')"
                @blur="normalizeQuantity"
                @keydown.enter="normalizeQuantity"
              />
              <button
                type="button"
                class="pack-details__quantity-button"
                :disabled="quantity >= MAX_QUANTITY || isSubmitting"
                :aria-label="$t('Increase quantity')"
                @click="increaseQuantity"
              >
                +
              </button>
            </div>
          </div>

          <BaseButton
            type="button"
            class="pack-details__button"
            :variant="isInCart ? 'hint-bordered' : 'primary'"
            :disabled="isSubmitting || !currentPack.id"
            @click="handleCartAction"
          >
            <span
              v-if="isSubmitting"
              class="pack-details__button-loader"
              aria-hidden="true"
            />
            <template v-else>
              {{ isInCart ? $t('Remove from cart') : $t('Buy pack') }}
            </template>
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import defaultImage from '@/assets/images/default-image.png'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'

import axios from '@/plugins/axios'

import { useCartStore } from '@/stores/cart'

const MAX_QUANTITY = 99

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  packId: {
    type: [String, Number],
    default: null,
  },

  initialPack: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'update:show', 'cart-updated'])

const router = useRouter()
const toast = useToast()
const cartStore = useCartStore()

const packDetails = ref(null)
const loading = ref(false)
const error = ref('')
const quantity = ref(1)
const isSubmitting = ref(false)
const imageHasFailed = ref(false)

const currentPack = computed(() => {
  return packDetails.value || props.initialPack
})

const titleId = computed(() => {
  return props.packId
    ? `pack-details-title-${props.packId}`
    : 'pack-details-title'
})

const packName = computed(() => {
  return currentPack.value?.name || currentPack.value?.title || 'Card Pack'
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
  const value = currentPack.value?.price ?? currentPack.value?.base_price ?? 0

  const number = Number(value)

  return Number.isFinite(number) ? number : 0
})

const cardCount = computed(() => {
  const value = currentPack.value?.card_count ?? 0

  return Number(value) || 0
})

const rarityProbabilities = computed(() => {
  const probabilities = currentPack.value?.rarity_probabilities || []

  return Array.isArray(probabilities) ? probabilities : []
})

const guaranteedRarities = computed(() => {
  const rarities = currentPack.value?.guaranteed_rarities || []

  return Array.isArray(rarities) ? rarities : []
})

const hasPackStats = computed(() => {
  return cardCount.value > 0 || rarityProbabilities.value.length > 0
})

const formatRarity = rarity => {
  if (!rarity) {
    return ''
  }

  const value = String(rarity).replaceAll('_', ' ').trim()

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

const formatProbability = probability => {
  const value = Number(probability)

  if (!Number.isFinite(value)) {
    return '0%'
  }

  const percentage = value <= 1 ? value * 100 : value

  return `${percentage.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
}

const isInCart = computed(() => {
  if (!currentPack.value?.id) {
    return false
  }

  return cartStore.isItemInCart(currentPack.value.id, 'pack')
})

const normalizeQuantity = () => {
  const parsedQuantity = Number.parseInt(quantity.value, 10)

  if (!Number.isFinite(parsedQuantity)) {
    quantity.value = 1
    return
  }

  quantity.value = Math.min(MAX_QUANTITY, Math.max(1, parsedQuantity))
}

const increaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Math.min(MAX_QUANTITY, Number(quantity.value) + 1)
}

const decreaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Math.max(1, Number(quantity.value) - 1)
}

const handleImageError = () => {
  imageHasFailed.value = true
}

const getResponsePack = response => {
  return (
    response?.data?.data ?? response?.data?.payload ?? response?.data ?? null
  )
}

const fetchPackDetails = async () => {
  if (!props.packId) {
    error.value = 'Pack ID is missing'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await axios.get(`/catalog/packs/${props.packId}`)

    const receivedPack = getResponsePack(response)

    if (!receivedPack || !receivedPack.id) {
      throw new Error('The server returned invalid pack details')
    }

    packDetails.value = receivedPack
  } catch (requestError) {
    console.error('Unable to load pack details:', requestError)

    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Unable to load pack details'
  } finally {
    loading.value = false
  }
}

const redirectToLogin = () => {
  handleClose()

  router.push({
    name: 'Auth',
    query: {
      form: 'signin',
      redirect: router.currentRoute.value.fullPath || '/',
    },
  })
}

const addToCart = async () => {
  normalizeQuantity()

  const result = await cartStore.addToCart(
    currentPack.value.id,
    Number(quantity.value),
    'pack',
  )

  if (result?.isUnauthorized) {
    toast.warning('Please login to add items to cart')

    redirectToLogin()

    return
  }

  if (!result?.success) {
    if (result?.isAlreadyInCart) {
      toast.warning(result.message || 'Item is already in cart')

      return
    }

    throw new Error(result?.message || 'Failed to add pack to cart')
  }

  toast.success(result.message || 'Pack added to cart')

  emit('cart-updated', {
    action: 'added',
    pack: currentPack.value,
    quantity: Number(quantity.value),
  })
}

const removeFromCart = async () => {
  const result = await cartStore.removeFromCart(currentPack.value.id, 'pack')

  if (!result?.success) {
    throw new Error(
      result?.error || result?.message || 'Failed to remove pack from cart',
    )
  }

  toast.success(result.message || 'Pack removed from cart')

  emit('cart-updated', {
    action: 'removed',
    pack: currentPack.value,
  })
}

const handleCartAction = async () => {
  if (isSubmitting.value || !currentPack.value?.id) {
    return
  }

  isSubmitting.value = true

  try {
    if (isInCart.value) {
      await removeFromCart()
    } else {
      await addToCart()
    }
  } catch (cartError) {
    console.error('Pack cart action failed:', cartError)

    toast.error(
      cartError?.response?.data?.message ||
        cartError?.message ||
        'Pack cart action failed',
    )
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

const handleShowUpdate = value => {
  emit('update:show', value)
}

const prepareModal = async () => {
  packDetails.value = null
  error.value = ''
  quantity.value = 1
  imageHasFailed.value = false

  await fetchPackDetails()
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      prepareModal()
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => props.packId,
  (packId, previousPackId) => {
    if (props.show && packId && packId !== previousPackId) {
      prepareModal()
    }
  },
)
</script>

<style lang="scss" scoped>
.pack-details {
  @include adaptiveValue('gap', 42, 18);
  @include adaptiveValue('padding-top', 10, 0);
  @include adaptiveValue('padding-bottom', 10, 0);

  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);

  width: 100%;
  min-height: 510px;

  &_loading,
  &_error {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 400px;
  }

  &__loader {
    width: 48px;
    height: 48px;
  }

  &__state {
    max-width: 450px;

    color: var(--secondary-color);
    text-align: center;

    p {
      margin: 16px 0 24px;

      color: var(--error-color);
    }
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;
    min-height: 480px;
  }

  &__image {
    display: block;

    width: 100%;
    max-width: 430px;
    max-height: 500px;

    object-fit: contain;

    filter: drop-shadow(0 18px 28px rgb(0 0 0 / 25%));
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    justify-content: space-between;

    min-width: 0;
  }

  &__main {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__title {
    @include adaptiveValue('margin-bottom', 34, 22);
    color: var(--primary-color);
    text-align: left;
    text-transform: none;
  }

  &__stats,
  &__guaranteed {
    @include adaptiveValue('margin-bottom', 26, 18);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__stat {
    display: grid;
    align-items: baseline;
    gap: 12px;
    grid-template-columns: 92px minmax(0, 1fr);

    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 1.35;

    span {
      color: var(--secondary-color);
    }

    strong {
      color: var(--primary-color);
      font-weight: 500;
    }
  }

  &__description {
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 1.5;
  }

  &__description-label,
  &__control-label {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
  }

  &__description-label {
    margin-bottom: 14px;
  }

  &__description-content {
    overflow-y: auto;

    max-height: 175px;

    padding-right: 8px;

    color: var(--primary-color);

    scrollbar-color: var(--border-secondary-color) transparent;
    scrollbar-width: thin;

    :deep(p) {
      margin: 0 0 14px;
    }

    :deep(p:last-child) {
      margin-bottom: 0;
    }
  }

  &__bottom {
    @include adaptiveValue('gap', 30, 12);
    display: grid;
    align-items: end;
    grid-template-columns: minmax(0, 1fr) auto minmax(130px, 155px);

    margin-top: 22px;
    padding-top: 26px;
  }

  &__price,
  &__quantity {
    display: flex;
    flex-direction: column;
    gap: 12px;

    min-width: 0;
  }

  &__price-value {
    width: fit-content;
  }

  &__quantity-controls {
    display: flex;
    align-items: center;

    width: fit-content;
    height: 38px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 5px;
    background: var(--bg-secondary-color);
  }

  &__quantity-button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 30px;
    height: 36px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--secondary-color);
    font-size: 22px;

    cursor: pointer;

    &:disabled {
      opacity: 0.4;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--primary-color);
      }
    }
  }

  &__quantity-input {
    width: 28px;
    height: 36px;

    padding: 0;

    border: 0;
    outline: 0;
    background: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;
  }

  &__button {
    width: 100%;
    min-height: 40px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__button-loader {
    display: inline-block;

    width: 18px;
    height: 18px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: pack-details-spin 0.8s linear infinite;

    border-right-color: transparent;
  }

  @media (max-width: $md3) {
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);

    min-height: 0;

    &__preview {
      min-height: 360px;
    }

    &__bottom {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    &__button {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: $md4) {
    gap: 24px;
    grid-template-columns: minmax(0, 1fr);

    &__preview {
      min-height: 0;
    }

    &__image {
      width: min(100%, 330px);
      max-height: 390px;
    }

    &__title {
      text-align: center;
    }

    &__bottom {
      grid-template-columns: minmax(0, 1fr) auto minmax(125px, 150px);
    }

    &__button {
      grid-column: auto;
    }
  }

  @media (max-width: $md6) {
    &__bottom {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    &__button {
      grid-column: 1 / -1;
    }
  }
}

@keyframes pack-details-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.pack-details-modal__content) {
  width: 100%;
  min-width: 0;
}
</style>
