<template>
  <main class="product-page">
    <div class="product-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="product-page__back-row _cnt">
      <BaseButton
        type="button"
        class="product-page__back"
        @click="goBack"
        variant="back"
        icon="arrow"
      >
        {{ isFromCollection ? $t('Back to collections') : $t('Back to store') }}
      </BaseButton>
    </div>

    <div class="product-page__inner _cnt">
      <div v-if="loading" class="product-page__state">
        <LoadingSpinner />
      </div>

      <div v-else-if="error" class="product-page__state">
        <h1 class="_h4">{{ $t('Unable to load product') }}</h1>
        <p>{{ error }}</p>

        <BaseButton variant="bordered" @click="fetchProductData">
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else-if="currentProduct" class="product-details-page">
        <div class="product-details-page__preview">
          <img
            class="product-details-page__decor product-details-page__decor_top"
            src="@/assets/img/blue-left-decor.png"
            alt=""
            aria-hidden="true"
          />

          <img
            class="product-details-page__decor product-details-page__decor_bottom"
            src="@/assets/img/blue-left-decor.png"
            alt=""
            aria-hidden="true"
          />

          <div class="product-details-page__card">
            <div class="product-details-page__card-background">
              <img
                :src="currentProduct.image_2 || defaultImage"
                alt=""
                class="product-details-page__card-background-image"
                @error="handleImageError"
              />
            </div>

            <div class="product-details-page__card-image-wrapper">
              <img
                :src="currentProduct.image || defaultImage"
                :alt="cardName"
                class="product-details-page__card-image"
                @error="handleImageError"
              />
            </div>

            <div v-if="cardName" class="product-details-page__card-name">
              {{ cardName }}
            </div>

            <div
              v-if="currentProduct.description"
              class="product-details-page__card-description"
            >
              <span v-html="currentProduct.description" />
            </div>

            <div
              v-if="hasValue(currentProduct.mana_cost)"
              class="product-details-page__card-stat product-details-page__card-stat_mana"
            >
              {{ currentProduct.mana_cost }}
            </div>

            <div
              v-if="hasValue(currentProduct.attack)"
              class="product-details-page__card-stat product-details-page__card-stat_attack"
            >
              {{ currentProduct.attack }}
            </div>

            <div
              v-if="hasValue(currentProduct.health)"
              class="product-details-page__card-stat product-details-page__card-stat_health"
            >
              {{ currentProduct.health }}
            </div>
          </div>
        </div>

        <div class="product-details-page__content" :aria-label="cardName">
          <div class="product-details-page__main">
            <div class="product-details-page__title _h6">
              {{ cardName }}
            </div>

            <div class="product-details-page__description">
              <div class="product-details-page__label">
                {{ $t('Description:') }}
              </div>

              <div
                class="product-details-page__description-text"
                v-html="currentProduct.description || '—'"
              />
            </div>

            <div class="product-details-page__stats">
              <div
                v-for="stat in productStats"
                :key="stat.label"
                class="product-details-page__stat"
              >
                <span>{{ $t(stat.label) }}</span>
                <strong>{{ stat.value }}</strong>
              </div>
            </div>
          </div>

          <div class="product-details-page__actions">
            <div
              class="product-details-page__tabs"
              role="group"
              :aria-label="$t('Purchase mode')"
            >
              <button
                v-if="showSellTab"
                type="button"
                class="product-details-page__tab"
                :class="{
                  'product-details-page__tab_active': purchaseMode === 'sell',
                }"
                :aria-pressed="purchaseMode === 'sell'"
                @click="setPurchaseMode('sell')"
              >
                {{ $t('Sell card') }}
              </button>

              <button
                type="button"
                class="product-details-page__tab"
                :class="{
                  'product-details-page__tab_active': purchaseMode === 'buy',
                }"
                :aria-pressed="purchaseMode === 'buy'"
                @click="setPurchaseMode('buy')"
              >
                {{ $t('Buy card') }}
              </button>

              <button
                v-if="canRent"
                type="button"
                class="product-details-page__tab"
                :class="{
                  'product-details-page__tab_active': purchaseMode === 'rent',
                }"
                :aria-pressed="purchaseMode === 'rent'"
                @click="setPurchaseMode('rent')"
              >
                {{ $t('Rent card') }}
              </button>
            </div>

            <div class="product-details-page__purchase">
              <div class="product-details-page__price">
                <PriceFormatter
                  v-if="hasOldPrice"
                  class="product-details-page__old-price"
                  :price="currentProduct.price"
                  size="size-14"
                />

                <PriceFormatter
                  v-if="hasValue(totalPrice)"
                  class="product-details-page__price-value"
                  :price="totalPrice"
                  size="size-20"
                />

                <span v-else>—</span>
              </div>

              <div
                v-if="purchaseMode !== 'rent'"
                class="product-details-page__quantity"
                :class="{
                  'product-details-page__quantity_disabled': isInCart,
                }"
              >
                <button
                  type="button"
                  :aria-label="$t('Decrease quantity')"
                  :disabled="isSubmitting || Number(quantity) <= 1"
                  @click="decreaseQuantity"
                >
                  −
                </button>

                <input
                  v-model="quantity"
                  type="text"
                  inputmode="numeric"
                  :aria-label="$t('Quantity')"
                  :disabled="isSubmitting"
                  @blur="normalizeQuantity"
                  @keydown.enter="normalizeQuantity"
                />

                <button
                  type="button"
                  :aria-label="$t('Increase quantity')"
                  :disabled="
                    isSubmitting ||
                    (purchaseMode === 'sell' &&
                      Number(quantity) >= availableForSale)
                  "
                  @click="increaseQuantity"
                >
                  +
                </button>
              </div>

              <BaseDropdown
                v-else
                class="product-details-page__rental"
                :label="$t(selectedRentalPrice?.label || 'Select period')"
                :disabled="isSubmitting || isInCart"
                :placeholder="!selectedRentalPrice"
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
                    @click="selectRentalPeriod(period.rental_period_id, close)"
                  >
                    {{ $t(period.label) }}
                  </button>
                </template>
              </BaseDropdown>

              <button
                type="button"
                class="product-details-page__action"
                :class="{
                  'product-details-page__action_buy': purchaseMode === 'buy',
                }"
                :disabled="actionDisabled"
                @click="handleAction"
              >
                <span
                  v-if="isSubmitting"
                  class="product-details-page__spinner"
                  aria-hidden="true"
                />

                <span v-else>{{ $t(actionLabel) }}</span>
              </button>
            </div>

            <div
              v-if="purchaseMode === 'sell'"
              class="product-details-page__sale-note"
            >
              <template v-if="availabilityLoading">
                {{ $t('Checking availability...') }}
              </template>

              <template v-else>
                {{ $t('Available for sale') }}: {{ availableForSale }}
              </template>
            </div>
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
import BaseDropdown from '@/components/base/BaseDropdown.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'
import { useCartStore } from '@/stores/cart'
import { useHeroesStore } from '@/stores/heroes'
import { useProductStore } from '@/stores/product'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const cartStore = useCartStore()
const heroesStore = useHeroesStore()
const productStore = useProductStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const loading = ref(true)
const error = ref('')
const quantity = ref(1)
const purchaseMode = ref('buy')
const rentalPeriodId = ref(null)
const isSubmitting = ref(false)
const availabilityLoading = ref(false)
const availableForSale = ref(0)

let activeRequestId = 0

const currentProduct = computed(() => productStore.currentProduct)

const cardName = computed(
  () =>
    currentProduct.value?.name ??
    currentProduct.value?.card_name ??
    currentProduct.value?.title ??
    '',
)

const isFromCollection = computed(() => route.query.from === 'collection')

const isRentedCollection = computed(() => route.query.collection === 'rented')

const sellEnabled = computed(
  () => settingsStore.settings?.payouts?.offer_enabled === true,
)

const showSellTab = computed(
  () =>
    isFromCollection.value && !isRentedCollection.value && sellEnabled.value,
)

const rentalOptions = computed(() =>
  Array.isArray(currentProduct.value?.rental_prices)
    ? currentProduct.value.rental_prices
    : [],
)

const canRent = computed(() => rentalOptions.value.length > 0)

const selectedRentalPrice = computed(() =>
  rentalOptions.value.find(
    period => String(period.rental_period_id) === String(rentalPeriodId.value),
  ),
)

const hasValue = value => value !== null && value !== undefined && value !== ''

const displayValue = value => (hasValue(value) ? value : '—')

const formatValue = value => {
  if (!hasValue(value)) return '—'

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const productStats = computed(() => [
  {
    label: 'Hero',
    value: currentProduct.value?.hero?.name || '—',
  },
  {
    label: 'Type',
    value: formatValue(currentProduct.value?.type),
  },
  {
    label: 'Rarity',
    value: formatValue(currentProduct.value?.rarity),
  },
  {
    label: 'Mana',
    value: displayValue(currentProduct.value?.mana_cost),
  },
  {
    label: 'Attack',
    value: displayValue(currentProduct.value?.attack),
  },
  {
    label: 'Health',
    value: displayValue(currentProduct.value?.health),
  },
])

const buyPrice = computed(() => {
  if (!hasValue(currentProduct.value?.price)) return null

  const regular = Number(currentProduct.value.price)
  const sale = Number(currentProduct.value?.sale_price)

  if (
    Number.isFinite(sale) &&
    sale > 0 &&
    Number.isFinite(regular) &&
    sale < regular
  ) {
    return sale
  }

  return Number.isFinite(regular) ? regular : null
})

const saleUnitPrice = computed(() => {
  const sale = Number(currentProduct.value?.sale_price)

  if (
    Number.isFinite(sale) &&
    sale >= 0 &&
    currentProduct.value?.sale_price != null
  ) {
    return sale
  }

  const regular = Number(currentProduct.value?.price ?? 0)
  const commission = Number(
    settingsStore.settings?.payouts?.card_sale_commission_percent ?? 0,
  )

  return Number((regular * (1 - commission / 100)).toFixed(2))
})

const hasOldPrice = computed(
  () =>
    purchaseMode.value === 'buy' &&
    Number.isFinite(Number(currentProduct.value?.price)) &&
    Number.isFinite(Number(currentProduct.value?.sale_price)) &&
    Number(currentProduct.value?.sale_price) > 0 &&
    Number(currentProduct.value?.sale_price) <
      Number(currentProduct.value?.price),
)

const totalPrice = computed(() => {
  if (purchaseMode.value === 'rent') {
    return selectedRentalPrice.value?.price ?? null
  }

  const unitPrice =
    purchaseMode.value === 'sell' ? saleUnitPrice.value : buyPrice.value

  return unitPrice === null
    ? null
    : Number((unitPrice * Math.max(1, Number(quantity.value) || 1)).toFixed(2))
})

const isInCart = computed(() => {
  if (!currentProduct.value?.id || purchaseMode.value === 'sell') {
    return false
  }

  if (purchaseMode.value === 'rent') {
    return rentalPeriodId.value
      ? cartStore.isItemInCart(
          currentProduct.value.id,
          'card',
          rentalPeriodId.value,
        )
      : false
  }

  return cartStore.isItemInCart(currentProduct.value.id, 'card')
})

const actionLabel = computed(() => {
  if (purchaseMode.value === 'sell') return t('Sell card')
  if (isInCart.value) return t('Remove')

  return purchaseMode.value === 'rent' ? t('Rent card') : t('Buy card')
})
const actionDisabled = computed(
  () =>
    isSubmitting.value ||
    !currentProduct.value?.id ||
    (purchaseMode.value === 'sell' &&
      (availabilityLoading.value || availableForSale.value < 1)) ||
    (purchaseMode.value === 'rent' && !selectedRentalPrice.value) ||
    !hasValue(totalPrice.value),
)

function handleImageError(event) {
  const image = event.currentTarget

  if (!image.src.endsWith('/default-image.png')) {
    image.src = defaultImage
  }
}

function normalizeQuantity() {
  const parsed = Number.parseInt(String(quantity.value), 10)

  const value = Math.max(1, Number.isFinite(parsed) ? parsed : 1)

  quantity.value =
    purchaseMode.value === 'sell'
      ? Math.min(value, Math.max(1, availableForSale.value))
      : value
}

function increaseQuantity() {
  normalizeQuantity()

  if (
    purchaseMode.value === 'sell' &&
    quantity.value >= availableForSale.value
  ) {
    return
  }

  quantity.value = Number(quantity.value) + 1
}

function decreaseQuantity() {
  normalizeQuantity()
  quantity.value = Math.max(1, Number(quantity.value) - 1)
}

function setInitialRentalPeriod() {
  if (!canRent.value) {
    rentalPeriodId.value = null
    return
  }

  if (!selectedRentalPrice.value) {
    rentalPeriodId.value = rentalOptions.value[0].rental_period_id
  }
}

function setPurchaseMode(mode) {
  if (mode === 'rent' && !canRent.value) return
  if (mode === 'sell' && !showSellTab.value) return

  purchaseMode.value = mode
  quantity.value = 1

  if (mode === 'rent') {
    setInitialRentalPeriod()
  }
}

function selectRentalPeriod(periodId, close) {
  const period = rentalOptions.value.find(
    item => String(item.rental_period_id) === String(periodId),
  )

  if (!period) return

  rentalPeriodId.value = period.rental_period_id
  close?.()
}

function setInitialMode() {
  if (
    isFromCollection.value &&
    !isRentedCollection.value &&
    showSellTab.value
  ) {
    setPurchaseMode('sell')
  } else if (
    (route.query.rent === '1' || isRentedCollection.value) &&
    canRent.value
  ) {
    setPurchaseMode('rent')
  } else {
    setPurchaseMode('buy')
  }
}

async function fetchAvailability() {
  if (!showSellTab.value || !currentProduct.value?.id) {
    availableForSale.value = 0
    return
  }

  availabilityLoading.value = true

  try {
    const { data } = await axios.get(
      `/players/me/cards/${currentProduct.value.id}/available-for-sale`,
    )

    availableForSale.value = Math.max(
      0,
      Number(
        data?.available_count ??
          data?.data?.available_count ??
          data?.payload?.available_count ??
          0,
      ),
    )

    if (purchaseMode.value === 'sell') {
      normalizeQuantity()
    }
  } catch (availabilityError) {
    availableForSale.value = 0

    if (availabilityError?.response?.status !== 401) {
      toast.error(
        availabilityError?.response?.data?.message ||
          availabilityError?.message ||
          t('Unable to check card availability'),
      )
    }
  } finally {
    availabilityLoading.value = false
  }
}

async function fetchProductData() {
  const productId = route.params.productId
  const requestId = ++activeRequestId

  loading.value = true
  error.value = ''
  availableForSale.value = 0

  if (!productId) {
    error.value = 'Product ID is missing'
    loading.value = false
    return
  }

  try {
    await Promise.all([
      productStore.fetchProductDetails(productId),
      heroesStore.ensureHeroes().catch(() => []),
      settingsStore.settings
        ? Promise.resolve()
        : settingsStore.fetchSettings().catch(() => null),
    ])

    if (requestId !== activeRequestId) return

    quantity.value = 1
    rentalPeriodId.value = null

    setInitialMode()

    if (showSellTab.value) {
      await fetchAvailability()
    }
  } catch (fetchError) {
    if (requestId !== activeRequestId) return

    error.value =
      fetchError?.response?.data?.message ||
      fetchError?.message ||
      'Unable to load product details'
  } finally {
    if (requestId === activeRequestId) {
      loading.value = false
    }
  }
}

function goBack() {
  router.push(
    isFromCollection.value
      ? {
          name: 'MyCardsPage',
          query: {
            collection: isRentedCollection.value ? 'rented' : 'bought',
          },
        }
      : {
          name: 'ProductListPage',
          query: route.query.rent === '1' ? { mode: 'rent' } : {},
        },
  )
}

function redirectToLogin(message) {
  toast.warning(t(message))

  router.push({
    name: 'Auth',
    query: {
      form: 'signin',
      redirect: route.fullPath || '/',
    },
  })
}

async function handleSell() {
  normalizeQuantity()

  if (!showSellTab.value || availableForSale.value < Number(quantity.value)) {
    return
  }

  try {
    const { data } = await axios.post('/offers/cards', {
      id: currentProduct.value.id,
      quantity: Number(quantity.value),
    })

    toast.success(data?.message || t('Sale offer created'))

    quantity.value = 1

    await Promise.all([
      fetchAvailability(),
      userStore.fetchProfile().catch(() => null),
    ])
  } catch (sellError) {
    const response = sellError?.response?.data

    if (response?.error_type === 'not_enough_cards') {
      availableForSale.value = Math.max(0, Number(response.available || 0))

      normalizeQuantity()
    }

    toast.error(
      response?.message || sellError?.message || t('Unable to sell card'),
    )
  }
}

async function handleCartAction() {
  if (isInCart.value) {
    const result = await cartStore.removeFromCart(
      currentProduct.value.id,
      'card',
      purchaseMode.value === 'rent' ? rentalPeriodId.value : null,
    )

    if (!result?.success) {
      throw new Error(
        result?.error || result?.message || t('Failed to remove item'),
      )
    }

    toast.success(result.message || t('Item removed from cart'))

    return true
  }

  normalizeQuantity()

  const result =
    purchaseMode.value === 'rent'
      ? await cartStore.rentCard(currentProduct.value.id, rentalPeriodId.value)
      : await cartStore.addToCart(
          currentProduct.value.id,
          Number(quantity.value),
          'card',
        )

  if (result?.isUnauthorized) {
    redirectToLogin(
      purchaseMode.value === 'rent'
        ? 'Please login to rent a card'
        : 'Please login to add items to cart',
    )

    return false
  }

  if (!result?.success) {
    if (result?.isAlreadyInCart) {
      toast.warning(result.message || t('Item is already in cart'))

      return false
    }

    throw new Error(result?.message || t('Failed to add item to cart'))
  }

  toast.success(result.message || t('Item added to cart'))

  return true
}

async function handleAction() {
  if (actionDisabled.value) return

  isSubmitting.value = true

  try {
    if (purchaseMode.value === 'sell') {
      await handleSell()
    } else {
      const succeeded = await handleCartAction()

      if (succeeded) {
        await userStore.fetchProfile().catch(() => null)
      }
    }
  } catch (actionError) {
    toast.error(
      actionError?.response?.data?.message ||
        actionError?.message ||
        t('Cart action failed'),
    )
  } finally {
    isSubmitting.value = false
  }
}

watch(() => route.params.productId, fetchProductData, { immediate: true })

watch(
  () => [route.query.rent, route.query.from, route.query.collection],
  () => {
    if (!loading.value && currentProduct.value) {
      setInitialMode()
    }
  },
)
</script>

<style lang="scss" scoped>
.product-page {
  @include adaptiveValue('padding-top', 100, 80);
  @include adaptiveValue('padding-bottom', 80, 30);

  position: relative;

  display: flex;
  flex: 1 1 100%;
  flex-direction: column;

  min-height: 100%;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__back-row {
    position: relative;
    z-index: 1;

    width: 100%;
    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }
  }

  &__back {
    width: fit-content;
  }

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
    max-width: 1040px;

    margin: auto;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;

    min-height: 420px;

    color: var(--fourth-color);
    text-align: center;

    .btn {
      max-width: 180px;
    }
  }
}

.product-details-page {
  @include adaptiveValue('gap', 28, 10);

  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 0.74fr) minmax(0, 1.18fr);

  &__preview,
  &__content {
    @include adaptiveValue('border-radius', 22, 10);
    position: relative;

    min-width: 0;

    background: linear-gradient(180deg, #111624 0%, #111624 100%);
  }

  &__preview {
    height: fit-content;
  }

  &__preview {
    @include adaptiveValue('padding-top', 40, 30);
    @include adaptiveValue('padding-bottom', 40, 30);

    display: flex;
    align-items: center;
    justify-content: center;

    isolation: isolate;
  }

  &__decor {
    @include adaptiveValue('width', 133, 105);
    position: absolute;
    z-index: 3;

    aspect-ratio: 1 / 0.82;

    pointer-events: none;

    &_top {
      top: 0;
      left: 0;

      transform: translate(-10%, -20%);
    }

    &_bottom {
      right: 0;
      bottom: 0px;

      transform: translate(10%, 20%) rotate(180deg);
    }
  }

  &__card {
    position: relative;

    width: min(80%, 278px);
    aspect-ratio: 2 / 3;

    container-type: inline-size;

    filter: drop-shadow(0 12px 14px rgb(0 0 0 / 35%));
  }

  &__card-background {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;
  }

  &__card-background-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;
  }

  &__card-image-wrapper {
    position: absolute;
    top: 15.3%;
    left: 50%;

    width: 77%;
    height: 45.5%;

    transform: translateX(-50%);
  }

  &__card-image {
    position: absolute;
    inset: 0;

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

    color: var(--fourth-color);
    font-family: var(--font-audiowide);
    font-size: clamp(6px, 5cqi, 14px);
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
    bottom: 11%;
    left: 50%;
    z-index: 2;

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

  &__card-stat {
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

  &__content {
    display: flex;
    overflow: visible;
    flex-direction: column;
  }

  &__main {
    @include adaptiveValue('padding-top', 40, 10);
    @include adaptiveValue('padding-left', 32, 10);
    @include adaptiveValue('padding-right', 32, 10);
    @include adaptiveValue('padding-bottom', 40, 10);
    flex: 1 1 auto;

    border-bottom-left-radius: 0px;

    border-bottom-right-radius: 0px;
  }

  &__title {
    color: var(--fourth-color);
    text-transform: none;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 18);
    }
  }

  &__label {
    margin-bottom: 6px;

    color: var(--fifth-color);
    font-size: 12px;
    font-weight: 600;
  }

  &__description {
    @include adaptiveValue('margin-bottom', 20, 18);
  }

  &__description-text {
    color: var(--fourth-color);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;

    :deep(p) {
      margin: 0;
    }
  }

  &__stats {
    display: grid;
    gap: 4px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  &__stat {
    @include adaptiveValue('padding-top', 16, 10);
    @include adaptiveValue('padding-left', 20, 10);
    @include adaptiveValue('padding-right', 20, 10);
    @include adaptiveValue('padding-bottom', 16, 10);

    @include adaptiveValue('border-radius', 12, 10);

    display: flex;
    flex-direction: column;
    gap: 11px;

    min-width: 0;

    background: var(--bg-primary-color);

    font-size: 14px;

    span {
      color: var(--fifth-color);
      font-weight: 500;
    }

    strong {
      color: var(--fourth-color);
      font-size: 16px;
      font-weight: 700;

      overflow-wrap: anywhere;
    }
  }

  &__actions {
    background: var(--bg-primary-color);
  }

  &__tabs {
    @include adaptiveValue('padding-left', 32, 10);
    @include adaptiveValue('padding-right', 32, 10);

    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  &__tab {
    @include adaptiveValue('padding-left', 24, 10);
    @include adaptiveValue('padding-right', 24, 10);
    position: relative;

    min-height: 40px;

    padding-top: 5px;
    padding-bottom: 5px;

    border: 0;
    background: transparent;

    color: var(--fifth-color);
    font-size: 14px;
    font-weight: 700;
    line-height: 100%;
    text-transform: uppercase;

    cursor: pointer;

    transition: color 0.3s ease;

    &_active {
      color: var(--hint-primary-color);

      &::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;

        height: 2px;

        background-color: var(--hint-primary-color);

        content: '';
      }
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__purchase {
    @include adaptiveValue('padding', 32, 10);

    @include adaptiveValue('border-radius', 22, 10);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;

    background: linear-gradient(180deg, #111624 0%, #111624 100%);

    border-bottom-right-radius: 0px;
    border-top-left-radius: 0px;
  }

  &__price {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;

    min-width: 0;

    color: var(--fourth-color);
  }

  &__price-value {
    :deep(.price__number) {
      @include adaptiveValue('font-size', 22, 17);
    }

    :deep(.price__image) {
      order: -1;
    }
  }

  &__old-price {
    opacity: 0.6;

    color: var(--seventh-color);
    text-decoration: line-through;
  }

  &__quantity {
    display: flex;
    align-items: center;

    min-width: 100px;
    height: 40px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    background: var(--bg-primary-color);
    &_disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }
    button {
      flex: 0 0 32px;

      height: 100%;

      border: 0;
      background: transparent;

      color: var(--fourth-color);

      cursor: pointer;

      &:disabled {
        opacity: 0.35;

        cursor: not-allowed;
      }
    }

    input {
      width: 34px;
      min-width: 0;
      height: 100%;

      padding: 0;

      border: 0;
      outline: none;
      background: transparent;

      color: var(--fourth-color);
      text-align: center;
    }
  }

  &__rental {
    min-width: 155px;
    max-width: 180px;
  }

  &__action {
    position: relative;

    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    width: 208px;
    height: 56px;

    padding: 5px 20px;

    border: 0;
    background: url('@/assets/img/discover-button-bg.png') center / 100% 100%
      no-repeat;

    color: var(--fourth-color);
    font-family: var(--font-audiowide);
    font-size: 13px;
    text-transform: uppercase;

    cursor: pointer;

    transition: filter 0.3s ease;

    &_buy {
      background-image: url('@/assets/img/play-button-bg.png');
    }

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        filter: brightness(1.25);
      }
    }
  }

  &__sale-note {
    padding: 0 24px 16px;

    color: var(--seventh-color);
    font-size: 12px;
  }

  &__spinner {
    width: 19px;
    height: 19px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: product-page-spin 0.8s linear infinite;

    border-right-color: transparent;
  }

  @media (max-width: $md3) {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);

    &__decor {
      width: 120px;
    }

    &__card {
      width: min(83%, 260px);
    }

    &__purchase {
      flex-wrap: wrap;
    }
  }

  @media (max-width: $md4) {
    grid-template-columns: minmax(0, 1fr);

    max-width: 520px;

    margin: 0 auto;

    &__preview {
      min-height: 470px;
    }

    &__card {
      width: min(62%, 270px);
    }
  }

  @media (max-width: $md6) {
    &__preview {
      min-height: 390px;
    }

    &__card {
      width: min(68%, 245px);
    }

    &__decor {
      width: 100px;
    }

    &__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__purchase {
      gap: 18px;
    }

    &__rental {
      flex: 1 1 140px;

      min-width: 0;
    }

    &__action {
      flex: 1 1 100%;

      width: 100%;
      max-width: 280px;

      margin: 0 auto;
    }

    &__tab {
      flex: 1 1 auto;

      padding-right: 8px;
      padding-left: 8px;
    }
  }
}

.dropdown-option {
  width: 100%;

  padding: 10px 14px;

  border: 0;
  background: transparent;

  color: var(--fourth-color);
  text-align: left;

  cursor: pointer;

  &_selected {
    color: var(--hint-primary-color);

    pointer-events: none;
  }

  @media (any-hover: hover) {
    &:not(&_selected):hover {
      color: var(--hint-primary-color);
    }
  }
}

@keyframes product-page-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
