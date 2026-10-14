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
        <div class="pack-details__state-title _h3">
          {{ $t('Unable to load pack') }}
        </div>

        <div class="pack-details__state-message">
          {{ error }}
        </div>

        <BaseButton
          type="button"
          variant="hint-bordered"
          class="pack-details__state-button"
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
          <h2 :id="titleId" class="pack-details__title _h4">
            {{ packName }}
          </h2>

          <div v-if="hasPackStats" class="pack-details__stats">
            <div class="pack-details__stats-row pack-details__stats-row_head">
              <div class="pack-details__stats-cell">
                {{ $t('Cards') }}
              </div>

              <div
                v-for="item in rarityProbabilities"
                :key="`head-${item.rarity}`"
                class="pack-details__stats-cell"
              >
                {{ formatRarity(item.rarity) }}
              </div>
            </div>

            <div class="pack-details__stats-row">
              <div class="pack-details__stats-cell">
                {{ cardCount }}
              </div>

              <div
                v-for="item in rarityProbabilities"
                :key="`value-${item.rarity}`"
                class="pack-details__stats-cell"
              >
                {{ formatProbability(item.probability) }}
              </div>
            </div>
          </div>

          <div
            v-if="guaranteedRarities.length"
            class="pack-details__guaranteed"
          >
            <div
              v-for="item in guaranteedRarities"
              :key="item.rarity"
              class="pack-details__guaranteed-item"
            >
              <span class="pack-details__guaranteed-label">
                {{ formatRarity(item.rarity) }}
              </span>

              <span class="pack-details__guaranteed-value">
                {{ item.quantity }}
                {{ $t('guaranteed') }}
              </span>
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
            <div class="pack-details__control-label">
              {{ $t('Price:') }}
            </div>

            <PriceFormatter
              :price="packPrice"
              size="size-32"
              class="pack-details__price-value"
            />
          </div>

          <div v-if="!isInCart" class="pack-details__quantity">
            <div class="pack-details__control-label">
              {{ $t('Q-ty:') }}
            </div>

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
                aria-label="Quantity"
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
              {{ isInCart ? $t('Remove from cart') : $t('Buy') }}
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
  display: grid;
  align-items: stretch;
  gap: 20px;
  grid-template-columns:
    minmax(330px, 44%)
    minmax(0, 1fr);

  width: 100%;
  max-width: 1000px;
  min-height: 530px;

  margin: 0 auto;

  &_loading,
  &_error {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 500px;
  }

  &__loader {
    width: 50px;
    height: 50px;
  }

  &__state {
    width: min(100%, 480px);

    margin: auto;

    text-align: center;
  }

  &__state-title {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__state-message {
    color: var(--error-color);

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  &__state-button {
    width: 100%;
    max-width: 220px;

    margin-right: auto;
    margin-left: auto;
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;
  }

  &__image {
    display: block;

    width: 100%;
    max-width: 430px;
    max-height: 545px;

    object-fit: contain;

    filter: drop-shadow(0 20px 35px rgb(0 0 0 / 30%));
  }

  &__content {
    display: flex;
    flex-direction: column;

    min-width: 0;
  }

  &__main {
    flex: 1 1 auto;
  }

  &__title {
    color: var(--primary-color);
    text-align: left;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 48, 25);
    }
  }

  &__stats {
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 48, 25);
    }
  }

  &__stats-row {
    display: grid;
    align-items: center;
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));

    &_head {
      border-bottom: 1px solid var(--border-secondary-color);

      .pack-details__stats-cell {
        padding-top: 0;
        padding-bottom: 14px;

        color: var(--hint-third-color);
        font-size: 13px;
      }
    }
  }

  &__stats-cell {
    min-width: 0;

    padding-top: 16px;
    padding-right: 10px;
    padding-bottom: 5px;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-align: left;

    &:last-child {
      padding-right: 0;

      text-align: right;
    }
  }

  &__guaranteed {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 24px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__guaranteed-item {
    display: flex;
    align-items: center;
    gap: 5px;

    font-family: var(--font-inter);
    font-size: 13px;
  }

  &__guaranteed-label {
    color: var(--hint-third-color);
  }

  &__guaranteed-value {
    color: var(--primary-color);
  }

  &__description {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;
  }

  &__description-label,
  &__control-label {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
  }

  &__description-label {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__description-content {
    overflow-y: auto;

    max-height: 170px;

    padding-right: 10px;

    color: var(--primary-color);

    scrollbar-color: var(--hint-primary-color) transparent;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: var(--hint-primary-color);
    }

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }

    :deep(ul),
    :deep(ol) {
      margin: 15px 0;
      padding-left: 20px;
    }
  }

  &__bottom {
    @include adaptiveValue('gap', 45, 20);

    display: grid;
    align-items: end;
    grid-template-columns:
      minmax(150px, 1fr)
      minmax(120px, auto)
      minmax(170px, 190px);

    padding-top: 25px;
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
    align-items: stretch;

    width: fit-content;
    min-height: 36px;

    border: 1px solid var(--border-secondary-color);
    background-color: transparent;
  }

  &__quantity-button {
    display: flex;
    flex: 0 0 36px;
    align-items: center;
    justify-content: center;

    width: 36px;
    min-width: 36px;

    padding: 0;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--hint-secondary-color);
    font-family: var(--font-inter);
    font-size: 22px;
    font-weight: 300;
    line-height: 1;

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease,
      opacity 0.3s ease;

    &:disabled {
      opacity: 0.3;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        background-color: var(--bg-fourth-color);

        color: var(--primary-color);
      }
    }
  }

  &__quantity-input {
    width: 44px;

    padding: 0 4px;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-align: center;

    appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      margin: 0;

      appearance: none;
    }

    &:disabled {
      opacity: 0.5;
    }
  }

  &__button {
    @include adaptiveValue('min-height', 48, 40);

    width: 100%;

    font-family: var(--font-spectral);
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__button-loader {
    width: 20px;
    height: 20px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: pack-details-spin 0.8s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  @media (max-width: $md3) {
    gap: 30px;
    grid-template-columns:
      minmax(260px, 38%)
      minmax(0, 1fr);

    &__bottom {
      gap: 15px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__button {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: $md4) {
    display: block;

    &__preview {
      &:not(:last-child) {
        margin-bottom: 30px;
      }
    }

    &__image {
      width: min(72vw, 380px);
      max-height: 420px;
    }

    &__title {
      text-align: center;
    }
  }

  @media (max-width: $md6) {
    &__stats {
      overflow-x: auto;
    }

    &__stats-row {
      min-width: 390px;
    }

    &__bottom {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    &__price,
    &__quantity {
      align-items: center;
    }

    &__price-value {
      margin-right: auto;
      margin-left: auto;
    }

    &__button {
      width: 100%;
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
}
</style>
