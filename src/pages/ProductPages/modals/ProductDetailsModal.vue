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
        <h2 class="product-details__state-title _h4">
          {{ $t('Unable to load product') }}
        </h2>

        <p class="product-details__state-message">
          {{ error }}
        </p>

        <BaseButton
          type="button"
          variant="hint-bordered"
          @click="fetchProductData"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>
    </div>

    <div v-else-if="currentProduct" class="product-details">
      <div class="product-details__preview">
        <div v-if="heroImage" class="product-details__hero" aria-hidden="true">
          <img :src="heroImage" alt="" />
        </div>

        <div class="product-details__card">
          <img
            v-if="currentProduct.image"
            :src="currentProduct.image"
            :alt="currentProduct.name"
            class="product-details__card-image"
          />

          <img
            v-if="currentProduct.image_2"
            :src="currentProduct.image_2"
            alt=""
            class="product-details__card-frame"
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
            <div class="product-details__stats-column">
              <div class="product-details__stat">
                <span>{{ $t('Hero') }}:</span>
                <strong>{{ currentProduct.hero?.name || '—' }}</strong>
              </div>

              <div class="product-details__stat">
                <span>{{ $t('Type') }}:</span>
                <strong>{{ formatValue(currentProduct.type) }}</strong>
              </div>

              <div class="product-details__stat">
                <span>{{ $t('Rarity') }}:</span>
                <strong>{{ formatValue(currentProduct.rarity) }}</strong>
              </div>
            </div>

            <div class="product-details__stats-column">
              <div class="product-details__stat">
                <span>{{ $t('Mana') }}:</span>
                <strong>{{ displayValue(currentProduct.mana_cost) }}</strong>
              </div>

              <div class="product-details__stat">
                <span>{{ $t('Attack') }}:</span>
                <strong>{{ displayValue(currentProduct.attack) }}</strong>
              </div>

              <div class="product-details__stat">
                <span>{{ $t('Health') }}:</span>
                <strong>{{ displayValue(currentProduct.health) }}</strong>
              </div>
            </div>
          </div>

          <div class="product-details__description">
            <div class="product-details__section-label">
              {{ $t('Description:') }}
            </div>

            <div
              class="product-details__description-content"
              v-html="currentProduct.description || '—'"
            />
          </div>

          <div class="product-details__switcher-wrap">
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
                {{ $t('Buy card') }}
              </BaseButton>

              <BaseButton
                type="button"
                class="product-details__switch product-details__switch_last"
                :variant="purchaseMode === 'rent' ? 'primary' : 'hint-bordered'"
                :aria-pressed="purchaseMode === 'rent'"
                :disabled="!canRent"
                @click="setPurchaseMode('rent')"
              >
                {{ $t('Rent card') }}
              </BaseButton>
            </div>
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
                :disabled="Number(quantity) <= 1 || isSubmitting"
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
              absolute
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
                  {{ $t(period.label) }}
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
import { useHeroesStore } from '@/stores/heroes'
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

const heroesStore = useHeroesStore()
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

const productHero = computed(() => {
  const hero = currentProduct.value?.hero
  if (!hero) return null
  return (
    heroesStore.getHeroById(hero.id) ||
    heroesStore.heroes.find(
      item =>
        item.slug === hero.slug ||
        item.name?.toLowerCase() === hero.name?.toLowerCase(),
    ) ||
    hero
  )
})

const heroImage = computed(() => productHero.value?.image_plain || null)

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
    await Promise.all([
      productStore.fetchProductDetails(props.productId),
      heroesStore.ensureHeroes().catch(() => []),
    ])

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
  @include adaptiveValue('gap', 42, 18);
  @include adaptiveValue('padding-top', 22, 10);
  @include adaptiveValue('padding-bottom', 22, 10);

  position: relative;

  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);

  width: 100%;
  min-height: 510px;

  margin: 0 auto;

  &_loading,
  &_error {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 400px;
  }

  &__loader {
    width: 50px;
    height: 50px;
  }

  &__state {
    max-width: 450px;

    text-align: center;
  }

  &__state-title {
    margin-bottom: 18px;

    color: var(--secondary-color);
  }

  &__state-message {
    margin-bottom: 24px;

    color: var(--error-color);
  }

  &__preview {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    width: 100%;
    min-width: 0;
    min-height: 500px;
  }

  &__hero {
    position: absolute;
    bottom: -8%;
    left: -32%;
    z-index: 1;

    width: 88%;
    height: 96%;

    pointer-events: none;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
      object-position: center bottom;

      filter: drop-shadow(0 15px 22px rgb(0 0 0 / 35%));
    }
  }

  &__card {
    position: relative;
    z-index: 2;

    width: min(76%, 345px);
    aspect-ratio: 0.69;

    margin-right: 0;

    container-type: inline-size;

    filter: drop-shadow(0 15px 24px rgb(0 0 0 / 25%));
  }

  &__card-image {
    position: absolute;
    top: 14%;
    left: 11%;
    z-index: 3;

    width: 78%;
    height: 48%;

    object-fit: cover;
  }

  &__card-frame {
    position: absolute;
    inset: 0;
    z-index: 2;

    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;
  }

  &__card-name {
    position: absolute;
    top: 8.1%;
    left: 55%;
    z-index: 3;

    overflow: hidden;

    width: 65%;

    padding: 0 5%;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: clamp(10px, 4.5cqi, 16px);
    line-height: 1.1;
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
    font-size: clamp(9px, 3.8cqi, 14px);
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
    align-items: center;
    justify-content: center;

    width: 12%;
    aspect-ratio: 1;

    border-radius: 50%;

    color: #fff;
    font-family: var(--font-spectral);
    font-size: clamp(14px, 9cqi, 30px);
    font-weight: 700;
    line-height: 1;
    text-shadow: 0 1px 3px rgb(0 0 0 / 60%);

    &_mana {
      top: 5%;
      left: 7%;

      width: 14%;

      border: 2px solid #87c8ef;
      background: radial-gradient(circle at 40% 25%, #55b6ed, #00528d 75%);
    }

    &_attack {
      right: 6%;
      bottom: 4%;

      border: 2px solid #d779a2;
      background: radial-gradient(circle at 40% 25%, #e05a81, #650c3b 75%);
    }

    &_health {
      bottom: 4%;
      left: 6%;

      border: 2px solid #80d9c0;
      background: radial-gradient(circle at 40% 25%, #65d2a5, #07584c 75%);
    }
  }

  &__content {
    position: relative;
    z-index: 3;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    width: 100%;
    min-width: 0;
    min-height: 475px;
  }

  &__main {
    flex: 1 1 auto;
  }

  &__title {
    @include adaptiveValue('font-size', 32, 24);
    @include adaptiveValue('margin-bottom', 32, 20);

    margin-top: 0;

    color: var(--secondary-color);
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 120%;
    text-align: left;
    text-transform: none;
  }

  &__stats {
    @include adaptiveValue('column-gap', 45, 16);
    @include adaptiveValue('margin-bottom', 32, 22);

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    width: 100%;
  }

  &__stats-column {
    @include adaptiveValue('gap', 20, 14);

    display: flex;
    flex-direction: column;

    min-width: 0;
  }

  &__stat {
    @include adaptiveValue('column-gap', 16, 8);

    display: grid;
    align-items: start;
    grid-template-columns: minmax(50px, 0.5fr) minmax(0, 1fr);

    min-width: 0;

    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 140%;

    span {
      color: var(--seventh-color);
      font-weight: 400;
    }

    strong {
      color: var(--primary-color);
      font-weight: 500;

      overflow-wrap: anywhere;
    }
  }

  &__description {
    @include adaptiveValue('margin-bottom', 28, 20);

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;
  }

  &__section-label,
  &__control-label {
    color: var(--seventh-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    line-height: 140%;
  }

  &__section-label {
    margin-bottom: 12px;
  }

  &__description-content {
    max-width: 100%;

    color: var(--primary-color);

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__switcher-wrap {
    @include adaptiveValue('padding-top', 26, 18);
    @include adaptiveValue('margin-bottom', 36, 22);

    border-top: 1px solid var(--border-fourth-color);
  }

  &__switcher {
    display: flex;

    width: fit-content;
    max-width: 100%;
  }

  &__switch {
    @include adaptiveValue('min-height', 40, 36);

    min-width: 115px;

    padding-right: 16px;
    padding-left: 16px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;

    &_first {
      border-bottom-right-radius: 0;
      border-top-right-radius: 0;
    }

    &_last {
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
    }
  }

  &__bottom {
    @include adaptiveValue('gap', 22, 12);

    display: grid;
    align-items: end;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.75fr) minmax(0, 1fr);

    width: 100%;
  }

  &__price,
  &__quantity,
  &__rental {
    display: flex;
    flex-direction: column;
    gap: 12px;

    min-width: 0;
  }

  &__price-value {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;

    min-height: 42px;
  }

  &__old-price {
    opacity: 0.5;

    text-decoration: line-through;
  }

  &__quantity-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: fit-content;
    height: 40px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    background-color: var(--bg-secondary-color);
  }

  &__quantity-button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 100%;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--secondary-color);
    font-size: 22px;
    line-height: 1;

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease;

    &:disabled {
      opacity: 0.35;

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
    width: 30px;
    height: 100%;

    padding: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;

    appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      appearance: none;
    }
  }

  &__rental {
    position: relative;
    z-index: 10;
  }

  &__rental-dropdown {
    width: 100%;
    min-width: 0;
  }

  &__button {
    @include adaptiveValue('min-height', 44, 40);

    width: 100%;
    min-width: 0;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__button-loader {
    display: inline-block;

    width: 20px;
    height: 20px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: product-details-spin 0.8s linear infinite;

    border-right-color: transparent;
  }

  @media (max-width: $md2) {
    &__hero {
      left: -22%;

      width: 80%;
    }

    &__card {
      width: min(78%, 325px);
    }
  }

  @media (max-width: $md3) {
    gap: 20px;

    min-height: 0;

    &__preview {
      min-height: 400px;
    }

    &__hero {
      left: -12%;

      width: 75%;
      height: 90%;
    }

    &__card {
      width: min(80%, 285px);
    }

    &__content {
      min-height: 410px;
    }

    &__stats {
      column-gap: 14px;
    }

    &__stat {
      gap: 4px;
      grid-template-columns: minmax(0, 1fr);
    }

    &__bottom {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    &__button {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: $md4) {
    gap: 28px;
    grid-template-columns: minmax(0, 1fr);

    &__preview {
      justify-content: center;

      height: min(80vw, 470px);
      min-height: 0;
    }

    &__hero {
      bottom: -4%;
      left: 4%;

      width: 55%;
      height: 100%;
    }

    &__card {
      width: min(62%, 300px);

      margin-left: 22%;
    }

    &__content {
      min-height: 0;
    }

    &__title {
      text-align: center;
    }

    &__stats {
      column-gap: 24px;
    }

    &__stat {
      grid-template-columns: minmax(65px, 0.5fr) minmax(0, 1fr);
    }

    &__bottom {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
  }

  @media (max-width: $md6) {
    &__preview {
      height: min(95vw, 400px);
    }

    &__hero {
      left: -5%;

      width: 65%;
    }

    &__card {
      width: min(65%, 255px);

      margin-left: 24%;
    }

    &__stats {
      gap: 15px;
    }

    &__stat {
      gap: 5px;
      grid-template-columns: minmax(0, 1fr);
    }

    &__switcher {
      width: 100%;
    }

    &__switch {
      flex: 1 1 50%;

      min-width: 0;
    }
  }

  @media (max-width: $md7) {
    &__preview {
      height: min(100vw, 350px);
    }

    &__hero {
      left: -8%;

      width: 70%;
    }

    &__card {
      width: min(66%, 225px);
    }

    &__bottom {
      gap: 18px 12px;
    }

    &__price-value {
      min-height: 40px;
    }

    &__button {
      grid-column: 1 / -1;
    }
  }
}

.dropdown-option {
  display: flex;
  align-items: center;

  width: 100%;
  min-height: 40px;

  padding: 10px 14px;

  border: 0;
  border-radius: 5px;
  background-color: transparent;

  color: var(--secondary-color);
  font-family: var(--font-inter);
  font-size: 14px;
  text-align: left;

  cursor: pointer;

  &_selected {
    background-color: var(--bg-secondary-color);

    color: var(--primary-color);

    pointer-events: none;
  }

  @media (any-hover: hover) {
    &:not(&_selected):hover {
      background-color: var(--bg-fourth-color);

      color: var(--primary-color);
    }
  }
}

@keyframes product-details-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
