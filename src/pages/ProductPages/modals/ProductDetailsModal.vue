<template>
  <BaseModal
    :show="props.show"
    class="product-details-modal"
    content-class="product-details-modal__content"
    size="product"
    :labelledby="titleId"
    @close="handleClose"
    @update:show="handleShowUpdate"
  >
    <div v-if="loading" class="product-details product-details_loading">
      <LoadingSpinner class="product-details__loader" />
    </div>

    <div v-else-if="error" class="product-details product-details_error">
      <div class="product-details__state">
        <div class="product-details__state-title _h3">
          {{ $t('Unable to load product') }}
        </div>

        <div class="product-details__state-message">
          {{ error }}
        </div>

        <BaseButton
          type="button"
          variant="hint-bordered"
          class="product-details__state-button"
          @click="fetchProductData"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>
    </div>

    <div v-else-if="currentProduct" class="product-details">
      <div class="product-details__preview">
        <div class="product-details__back">
          <img :src="cardBackImage" :alt="cardBackAlt" />
        </div>

        <div class="product-details__card">
          <img
            v-if="currentProduct.image_2"
            :src="currentProduct.image_2"
            :alt="currentProduct.name"
            class="product-details__card-frame"
          />

          <img
            v-if="currentProduct.image"
            :src="currentProduct.image"
            alt=""
            class="product-details__card-image"
          />

          <div v-if="cardName" class="product-details__card-name">
            {{ cardName }}
          </div>

          <div
            v-if="currentProduct.description"
            class="product-details__card-description"
            v-html="currentProduct.description"
          />

          <span
            v-if="hasValue(currentProduct.mana_cost)"
            class="product-details__card-stat product-details__card-stat_mana"
          >
            {{ currentProduct.mana_cost }}
          </span>

          <span
            v-if="hasValue(currentProduct.attack)"
            class="product-details__card-stat product-details__card-stat_attack"
          >
            {{ currentProduct.attack }}
          </span>

          <span
            v-if="hasValue(currentProduct.health)"
            class="product-details__card-stat product-details__card-stat_health"
          >
            {{ currentProduct.health }}
          </span>
        </div>
      </div>

      <div class="product-details__content">
        <div class="product-details__main">
          <h2 :id="titleId" class="product-details__title _h4">
            {{ currentProduct.name }}
          </h2>

          <div class="product-details__stats">
            <div
              class="product-details__stats-row product-details__stats-row_head"
            >
              <div class="product-details__stats-cell">
                {{ $t('Hero') }}
              </div>

              <div class="product-details__stats-cell">
                {{ $t('Type') }}
              </div>

              <div class="product-details__stats-cell">
                {{ $t('Rarity') }}
              </div>
              <div class="product-details__stats-cell">
                {{ $t('Mana') }}
              </div>

              <div class="product-details__stats-cell">
                {{ $t('Attack') }}
              </div>

              <div class="product-details__stats-cell">
                {{ $t('Health') }}
              </div>
            </div>

            <div class="product-details__stats-row">
              <div class="product-details__stats-cell">
                {{ currentProduct.hero?.name || '' }}
              </div>

              <div class="product-details__stats-cell">
                {{ formatValue(currentProduct.type) }}
              </div>

              <div class="product-details__stats-cell">
                {{ formatValue(currentProduct.rarity) }}
              </div>
              <div class="product-details__stats-cell">
                {{ displayValue(currentProduct.mana_cost) }}
              </div>

              <div class="product-details__stats-cell">
                {{ displayValue(currentProduct.attack) }}
              </div>

              <div class="product-details__stats-cell">
                {{ displayValue(currentProduct.health) }}
              </div>
            </div>
          </div>

          <div class="product-details__description">
            <div class="product-details__description-label">
              {{ $t('Description:') }}
            </div>

            <div
              class="product-details__description-content"
              v-html="currentProduct.description || '—'"
            />
          </div>

          <div
            class="product-details__switcher"
            role="group"
            :aria-label="$t('Purchase mode')"
          >
            <BaseButton
              type="button"
              class="product-details__switch product-details__switch_first"
              :variant="purchaseMode === 'buy' ? 'primary' : 'hint-bordered'"
              :aria-pressed="purchaseMode === 'buy'"
              @click="setPurchaseMode('buy')"
            >
              {{ $t('Buy') }}
            </BaseButton>

            <BaseButton
              type="button"
              class="product-details__switch product-details__switch_last"
              :variant="purchaseMode === 'rent' ? 'primary' : 'hint-bordered'"
              :aria-pressed="purchaseMode === 'rent'"
              :disabled="!canRent"
              @click="setPurchaseMode('rent')"
            >
              {{ $t('Rent') }}
            </BaseButton>
          </div>
        </div>

        <div class="product-details__bottom">
          <div class="product-details__price">
            <div class="product-details__control-label">
              {{ $t('Price:') }}
            </div>

            <div class="product-details__price-value">
              <PriceFormatter
                v-if="hasOldPrice"
                class="product-details__old-price"
                :price="oldPrice"
                size="size-20"
              />

              <PriceFormatter
                v-if="hasValue(displayPrice)"
                :price="displayPrice"
                size="size-32"
              />
            </div>
          </div>

          <div v-if="purchaseMode === 'buy'" class="product-details__quantity">
            <div class="product-details__control-label">
              {{ $t('Q-ty:') }}
            </div>

            <div class="product-details__quantity-controls">
              <button
                type="button"
                class="product-details__quantity-button"
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
                class="product-details__quantity-input"
                :disabled="isSubmitting"
                :aria-label="$t('Quantity')"
                @blur="normalizeQuantity"
                @keydown.enter="normalizeQuantity"
              />

              <button
                type="button"
                class="product-details__quantity-button"
                :disabled="isSubmitting"
                :aria-label="$t('Increase quantity')"
                @click="increaseQuantity"
              >
                +
              </button>
            </div>
          </div>

          <div v-else class="product-details__rental">
            <div class="product-details__control-label">
              {{ $t('Rent Period:') }}
            </div>

            <BaseDropdown
              class="product-details__rental-dropdown"
              :label="$t(selectedRentalPrice?.label || 'Select period')"
              :placeholder="!selectedRentalPrice"
              variant="aside"
              bordered
            >
              <template #default="{ close }">
                <button
                  v-for="period in rentalOptions"
                  :key="period.rental_period_id"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected':
                      String(period.rental_period_id) ===
                      String(rentalPeriodId),
                  }"
                  :aria-selected="
                    String(period.rental_period_id) === String(rentalPeriodId)
                  "
                  role="option"
                  @click="selectRentalPeriod(period.rental_period_id, close)"
                >
                  <span class="dropdown-option__label">
                    {{ $t(period.label) }}
                  </span>
                </button>
              </template>
            </BaseDropdown>
          </div>

          <BaseButton
            type="button"
            class="product-details__button"
            :variant="isInCart ? 'hint-bordered' : 'primary'"
            :disabled="
              isSubmitting ||
              !currentProduct.id ||
              !hasValue(displayPrice) ||
              (purchaseMode === 'rent' && !rentalPeriodId)
            "
            @click="handleCartAction"
          >
            <span
              v-if="isSubmitting"
              class="product-details__button-loader"
              aria-hidden="true"
            />

            <template v-else>
              {{
                isInCart
                  ? $t('Remove from cart')
                  : purchaseMode === 'rent'
                    ? $t('Rent')
                    : $t('Buy')
              }}
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

import BaseButton from '@/components/base/BaseButton.vue'
import BaseDropdown from '@/components/base/BaseDropdown.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'

import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useUserStore } from '@/stores/user'

import commonCardBack from '@/assets/img/cards-01.png'
import rareCardBack from '@/assets/img/cards-02.png'
import goldCardBack from '@/assets/img/cards-03.png'
import legendaryCardBack from '@/assets/img/cards-04.png'
import obsidianCardBack from '@/assets/img/cards-05.png'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  productId: {
    type: [String, Number],
    default: null,
  },

  rent: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'update:show'])

const router = useRouter()
const toast = useToast()

const cartStore = useCartStore()
const productStore = useProductStore()
const userStore = useUserStore()

const loading = ref(false)
const error = ref('')

const quantity = ref(1)
const rentalPeriodId = ref(null)

const purchaseMode = ref('buy')

const isSubmitting = ref(false)

const activeRequestId = ref(0)

const currentProduct = computed(() => {
  return productStore.currentProduct
})

const cardName = computed(() => {
  return (
    currentProduct.value?.name ??
    currentProduct.value?.card_name ??
    currentProduct.value?.title ??
    ''
  )
})

const titleId = computed(() => {
  return props.productId
    ? `product-details-title-${props.productId}`
    : 'product-details-title'
})

const frameTypeName = computed(() => {
  const name = currentProduct.value?.frame_type?.name

  if (!name) {
    return '—'
  }

  return String(name).toUpperCase()
})

const cardRarity = computed(() => {
  return String(currentProduct.value?.rarity || '').toLowerCase()
})

const cardBackImage = computed(() => {
  const frameType = String(
    currentProduct.value?.frame_type?.name || '',
  ).toUpperCase()

  if (frameType === 'GOLD') {
    return goldCardBack
  }

  if (frameType === 'OBSIDIAN') {
    return obsidianCardBack
  }

  if (cardRarity.value === 'legendary') {
    return legendaryCardBack
  }

  if (cardRarity.value === 'rare') {
    return rareCardBack
  }

  if (cardRarity.value === 'common') {
    return commonCardBack
  }

  return commonCardBack
})

const cardBackAlt = computed(() => {
  const frameType = String(
    currentProduct.value?.frame_type?.name || '',
  ).toUpperCase()

  if (frameType === 'GOLD') {
    return 'Gold card'
  }

  if (frameType === 'OBSIDIAN') {
    return 'Obsidian card'
  }

  if (cardRarity.value === 'legendary') {
    return 'Legendary card'
  }

  if (cardRarity.value === 'rare') {
    return 'Rare card'
  }

  return 'Common card'
})

const buyPrice = computed(() => {
  const salePrice = Number(currentProduct.value?.sale_price)

  const price = Number(currentProduct.value?.price)

  if (
    Number.isFinite(salePrice) &&
    salePrice > 0 &&
    Number.isFinite(price) &&
    salePrice < price
  ) {
    return salePrice
  }

  return Number.isFinite(price) ? price : null
})

const rentalOptions = computed(() => {
  const prices = currentProduct.value?.rental_prices

  return Array.isArray(prices) ? prices : []
})

const canRent = computed(() => {
  return rentalOptions.value.length > 0
})

const selectedRentalPrice = computed(() => {
  return rentalOptions.value.find(period => {
    return String(period.rental_period_id) === String(rentalPeriodId.value)
  })
})

const rentalPrice = computed(() => {
  return selectedRentalPrice.value?.price ?? null
})

const oldPrice = computed(() => {
  return currentProduct.value?.price ?? null
})

const displayPrice = computed(() => {
  if (purchaseMode.value === 'rent') {
    return rentalPrice.value
  }

  return buyPrice.value
})

const hasOldPrice = computed(() => {
  if (purchaseMode.value !== 'buy') {
    return false
  }

  const regularPrice = Number(currentProduct.value?.price)

  const salePrice = Number(currentProduct.value?.sale_price)

  return (
    Number.isFinite(regularPrice) &&
    Number.isFinite(salePrice) &&
    salePrice > 0 &&
    salePrice < regularPrice
  )
})

const isInCart = computed(() => {
  if (!currentProduct.value?.id) {
    return false
  }

  if (purchaseMode.value === 'rent') {
    if (!rentalPeriodId.value) {
      return false
    }

    return cartStore.isItemInCart(
      currentProduct.value.id,
      'card',
      rentalPeriodId.value,
    )
  }

  return cartStore.isItemInCart(currentProduct.value.id, 'card')
})

const hasValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const displayValue = value => {
  return hasValue(value) ? value : '—'
}

const formatValue = value => {
  if (!hasValue(value)) {
    return '—'
  }

  const normalizedValue = String(value).replaceAll('_', ' ').trim()

  return (
    normalizedValue.charAt(0).toUpperCase() +
    normalizedValue.slice(1).toLowerCase()
  )
}

const normalizeQuantity = () => {
  const value = Number.parseInt(quantity.value, 10)

  quantity.value = Math.max(1, Number.isFinite(value) ? value : 1)
}

const increaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Number(quantity.value) + 1
}

const decreaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Math.max(1, Number(quantity.value) - 1)
}

const setInitialRentalPeriod = () => {
  const periods = rentalOptions.value

  if (!periods.length) {
    rentalPeriodId.value = null
    return
  }

  const currentPeriodExists = periods.some(period => {
    return String(period.rental_period_id) === String(rentalPeriodId.value)
  })

  if (!currentPeriodExists) {
    rentalPeriodId.value = periods[0].rental_period_id
  }
}

const setPurchaseMode = mode => {
  if (mode === 'rent' && !canRent.value) {
    return
  }

  purchaseMode.value = mode

  if (mode === 'rent') {
    setInitialRentalPeriod()
  }
}

const selectRentalPeriod = (periodId, close) => {
  const period = rentalOptions.value.find(item => {
    return String(item.rental_period_id) === String(periodId)
  })

  if (!period) {
    return
  }

  rentalPeriodId.value = period.rental_period_id

  if (typeof close === 'function') {
    close()
  }
}

const fetchProductData = async () => {
  if (!props.productId) {
    error.value = 'Product ID is missing'
    return
  }

  const requestId = ++activeRequestId.value

  loading.value = true
  error.value = ''

  try {
    await productStore.fetchProductDetails(props.productId)

    if (requestId !== activeRequestId.value) {
      return
    }

    quantity.value = 1
    rentalPeriodId.value = null

    if (props.rent && canRent.value) {
      purchaseMode.value = 'rent'
      setInitialRentalPeriod()
    } else {
      purchaseMode.value = 'buy'
    }
  } catch (fetchError) {
    if (requestId !== activeRequestId.value) {
      return
    }

    console.error('Unable to load product details:', fetchError)

    error.value =
      fetchError?.response?.data?.message ||
      fetchError?.message ||
      'Unable to load product details'
  } finally {
    if (requestId === activeRequestId.value) {
      loading.value = false
    }
  }
}
const redirectToLogin = () => {
  emit('update:show', false)

  emit('close')

  router.push({
    name: 'Auth',

    query: {
      form: 'signin',

      redirect: router.currentRoute.value.fullPath || '/',
    },
  })
}

const addPurchaseToCart = async () => {
  normalizeQuantity()

  const result = await cartStore.addToCart(
    currentProduct.value.id,
    Number(quantity.value),
    'card',
  )

  if (result?.isUnauthorized) {
    toast.warning('Please login to add items to cart')

    redirectToLogin()

    return false
  }

  if (!result?.success) {
    if (result?.isAlreadyInCart) {
      toast.warning(result.message || 'Item is already in cart')

      return false
    }

    throw new Error(result?.message || 'Failed to add item to cart')
  }

  toast.success(result.message || 'Item added to cart')

  return true
}

const addRentalToCart = async () => {
  setInitialRentalPeriod()

  const period = selectedRentalPrice.value

  if (!period) {
    throw new Error('Please select a rental period')
  }

  const result = await cartStore.rentCard(
    currentProduct.value.id,
    period.rental_period_id,
  )

  if (result?.isUnauthorized) {
    toast.warning('Please login to rent a card')

    redirectToLogin()

    return false
  }

  if (!result?.success) {
    if (result?.isAlreadyInCart) {
      toast.warning(result.message || 'Rental is already in cart')

      return false
    }

    throw new Error(result?.message || 'Failed to add rental to cart')
  }

  toast.success(result.message || 'Rental added to cart')

  return true
}

const removeFromCart = async () => {
  const periodId = purchaseMode.value === 'rent' ? rentalPeriodId.value : null

  const result = await cartStore.removeFromCart(
    currentProduct.value.id,
    'card',
    periodId,
  )

  if (!result?.success) {
    throw new Error(result?.error || result?.message || 'Failed to remove item')
  }

  toast.success(result.message || 'Item removed from cart')

  return true
}

const handleCartAction = async () => {
  if (isSubmitting.value || !currentProduct.value?.id) {
    return
  }

  if (purchaseMode.value === 'rent') {
    setInitialRentalPeriod()

    if (!selectedRentalPrice.value) {
      toast.warning('Please select a rental period')

      return
    }
  }

  isSubmitting.value = true

  try {
    let success = false

    if (isInCart.value) {
      success = await removeFromCart()
    } else if (purchaseMode.value === 'rent') {
      success = await addRentalToCart()
    } else {
      success = await addPurchaseToCart()
    }

    if (success) {
      await userStore.fetchProfile()
    }
  } catch (cartError) {
    console.error('Cart action failed:', cartError)

    toast.error(
      cartError?.response?.data?.message ||
        cartError?.message ||
        'Cart action failed',
    )
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  activeRequestId.value += 1

  emit('update:show', false)

  emit('close')
}

const handleShowUpdate = value => {
  emit('update:show', value)
}

watch(
  [() => props.show, () => props.productId],
  async ([isOpen, productId], previous = []) => {
    const [wasOpen, previousProductId] = previous

    if (!isOpen || !productId) {
      return
    }

    const justOpened = isOpen && !wasOpen
    const productChanged = String(productId) !== String(previousProductId)

    if (!justOpened && !productChanged) {
      return
    }

    await fetchProductData()
  },
  {
    immediate: true,
  },
)
watch(
  () => props.rent,
  rent => {
    if (!props.show) {
      return
    }

    if (rent) {
      if (canRent.value) {
        purchaseMode.value = 'rent'
        setInitialRentalPeriod()
      }
    } else {
      purchaseMode.value = 'buy'
    }
  },
)

watch(
  rentalOptions,

  () => {
    if (purchaseMode.value === 'rent') {
      setInitialRentalPeriod()
    }
  },

  {
    deep: true,
  },
)
</script>

<style lang="scss" scoped>
.product-details {
  position: relative;

  display: flex;
  overflow: visible;
  align-items: center;
  gap: 20px;

  width: 100%;
  max-width: 1000px;
  min-height: 520px;

  margin: 0 auto;

  &_loading,
  &_error {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 480px;
  }

  &__loader {
    width: 50px;
    height: 50px;
  }

  &__state {
    width: min(100%, 500px);

    margin: auto;

    text-align: center;
  }

  &__state-title {
    &:not(:last-child) {
      margin-bottom: 18px;
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
    max-width: 260px;

    margin-right: auto;
    margin-left: auto;
  }

  &__preview {
    position: relative;

    display: flex;
    flex: 0 1 43%;
    align-items: center;
    justify-content: center;

    min-width: 330px;
    min-height: 500px;
  }

  &__back {
    position: absolute;
    top: 50%;
    left: 0;
    z-index: 1;

    width: 75%;
    aspect-ratio: 1;

    transform: translateY(-50%) translateX(-4%);

    img {
      display: block;

      width: 100%;
      height: auto;

      object-fit: contain;
    }
  }

  &__card {
    position: relative;
    z-index: 2;

    width: min(100%, 355px);
    aspect-ratio: 0.69;

    margin-left: auto;

    container-type: inline-size;
  }

  &__card-frame {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;

    width: 100%;
    height: 100%;

    object-fit: contain;

    transform: translate(-50%, -50%);
  }

  &__card-image {
    position: absolute;
    top: 14%;
    left: 50%;
    z-index: 2;

    width: 78%;
    height: 48%;

    object-fit: cover;

    transform: translateX(-50%);
  }

  &__card-name {
    position: absolute;
    top: 8.1%;
    left: 55%;
    z-index: 3;

    overflow: hidden;

    width: 65%;
    height: fit-content;

    padding: 0 5%;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 1;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;

    pointer-events: none;

    transform: translateX(-50%);
  }

  &__card-description {
    position: absolute;
    bottom: 15%;
    left: 50%;
    z-index: 3;

    display: -webkit-box;
    overflow: hidden;

    width: 48%;
    max-height: 17%;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 120%;
    text-align: center;

    pointer-events: none;

    transform: translateX(-50%);

    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;

    :deep(p) {
      margin: 0;
    }

    :deep(br) {
      display: none;
    }
  }

  &__card-stat {
    position: absolute;
    z-index: 4;

    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;

    aspect-ratio: 1;

    border-radius: 50%;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: clamp(14px, 12cqi, 30px);
    font-weight: 700;
    line-height: 1;

    paint-order: stroke fill;

    -webkit-text-fill-color: var(--primary-color);
    -webkit-text-stroke-width: clamp(1px, 0.8cqi, 2px);

    &_mana {
      top: 5.1%;
      left: 7.5%;

      width: 14%;

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
      right: 6%;
      bottom: 4%;

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

      -webkit-text-stroke-color: #72153e;
    }

    &_health {
      bottom: 4%;
      left: 6%;

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

  &__content {
    position: relative;
    z-index: 5;

    display: flex;
    overflow: visible;
    flex: 1 1 57%;
    flex-direction: column;

    min-width: 0;
    min-height: 480px;
  }

  &__main {
    flex: 1 1 auto;
  }

  &__title {
    color: var(--primary-color);
    text-align: left;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 44, 25);
    }
  }

  &__stats {
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 25);
    }
  }

  &__stats-row {
    display: flex;
    align-items: center;

    &_head {
      border-bottom: 1px solid var(--border-secondary-color);

      .product-details__stats-cell {
        padding-top: 0;
        padding-bottom: 14px;

        color: var(--hint-third-color);
        font-size: 13px;
      }
    }
  }

  &__stats-cell {
    flex: 1 1 0;

    min-width: 0;

    padding-top: 16px;
    padding-right: 10px;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-align: left;

    &:nth-child(1) {
      flex-grow: 1.15;
    }

    &:nth-child(3) {
      flex-grow: 1.35;
    }

    &:nth-child(4),
    &:nth-child(5),
    &:nth-child(6) {
      flex-grow: 0.7;
    }

    &:last-child {
      padding-right: 0;

      text-align: right;
    }
  }

  &__description {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 36, 24);
    }
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
      margin-bottom: 15px;
    }
  }

  &__description-content {
    max-width: 580px;

    color: var(--primary-color);

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }

  &__switcher {
    display: flex;

    width: 100%;
    max-width: 212px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 60, 30);
    }
  }

  &__switch {
    @include adaptiveValue('min-height', 36, 40);

    font-family: var(--font-spectral);
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;

    &_first {
      border-right: 0;
    }
  }

  &__bottom {
    position: relative;
    z-index: 10;

    display: flex;
    overflow: visible;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 30px;

    width: 100%;

    padding-top: 20px;
  }

  &__price,
  &__quantity,
  &__rental {
    display: flex;
    flex: 1 1 130px;
    flex-direction: column;
    gap: 12px;

    min-width: 0;
  }

  &__price {
    flex-basis: 145px;
  }

  &__quantity {
    flex-grow: 0;
  }

  &__rental {
    position: relative;
    z-index: 50;

    overflow: visible;
    flex-grow: 0;
  }

  &__price-value {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__old-price {
    opacity: 0.45;

    text-decoration: line-through;
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
  }

  &__rental-dropdown {
    position: relative;
    z-index: 60;

    overflow: visible;

    :deep(.dropdown) {
      position: relative;
      z-index: 60;

      overflow: visible;
    }

    :deep(.dropdown__content) {
      z-index: 1000;

      overflow: visible;

      width: 100%;
      min-width: 190px;
    }

    :deep(.dropdown__menu) {
      z-index: 1001;

      overflow: visible;

      min-width: 190px;
    }
  }

  &__button {
    @include adaptiveValue('min-height', 48, 40);

    flex: 1 1 160px;

    width: auto;
    min-width: 160px;
    max-width: 180px;

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

    animation: product-details-spin 0.8s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  @media (max-width: $md3) {
    gap: 30px;

    &__preview {
      flex: 0 1 38%;

      min-width: 250px;
    }

    &__content {
      flex: 1 1 62%;
    }

    &__back {
      width: 75%;
    }

    &__bottom {
      gap: 15px;
    }

    &__price,
    &__quantity,
    &__rental {
      flex: 1 1 calc(50% - 8px);
    }

    &__button {
      flex: 1 1 100%;

      width: 100%;
      max-width: none;
    }
  }

  @media (max-width: $md4) {
    flex-direction: column;
    align-items: stretch;

    &__preview {
      flex: none;

      width: 100%;
      min-width: 0;
      min-height: 0;

      &:not(:last-child) {
        margin-bottom: 35px;
      }
    }

    &__back {
      left: 10%;

      width: min(62vw, 280px);
    }

    &__card {
      width: min(72vw, 340px);

      margin-right: auto;
      margin-left: auto;

      transform: translateX(8%);
    }

    &__content {
      flex: none;

      width: 100%;
      min-height: 0;
    }

    &__title {
      text-align: center;
    }
  }

  @media (max-width: $md6) {
    &__stats {
      overflow-x: auto;

      scrollbar-width: thin;
    }

    &__stats-row {
      width: 500px;
      min-width: 500px;
    }

    &__switcher {
      max-width: none;
    }

    &__bottom {
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
    }

    &__price,
    &__quantity,
    &__rental {
      flex: none;
      align-items: center;

      width: 100%;
    }

    &__price-value {
      justify-content: center;
    }

    &__rental-dropdown {
      :deep(.dropdown__content),
      :deep(.dropdown__menu) {
        width: 100%;
        min-width: 100%;
      }
    }

    &__button {
      flex: none;

      width: 100%;
      min-width: 0;
      max-width: none;
    }
  }
}

.dropdown-option {
  position: relative;
  z-index: 1002;

  display: flex;
  align-items: center;

  width: 100%;
  min-width: 190px;
  min-height: 44px;

  padding: 10px 14px;

  border: 0;
  outline: none;
  background-color: transparent;

  color: var(--secondary-color);
  font-family: var(--font-inter);
  font-size: 14px;
  font-weight: 500;
  text-align: left;

  cursor: pointer;

  transition:
    color 0.3s ease,
    background-color 0.3s ease;

  &_selected {
    background-color: var(--hint-gradient-color);

    color: var(--primary-color);

    pointer-events: none;
  }

  &__label {
    overflow: hidden;

    width: 100%;
    min-width: 0;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (any-hover: hover) {
    &:not(&_selected):hover {
      background-color: var(--border-fourth-color);

      color: var(--hint-secondary-color);
    }
  }
}

@keyframes product-details-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.product-details-modal__content) {
  overflow: visible;

  width: 100%;
}
</style>
