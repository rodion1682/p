<template>
  <main class="product-page">
    <div class="product-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="product-page__back-row _cnt">
      <button type="button" class="product-page__back" @click="goBack">
        <span aria-hidden="true">←</span>
        {{ isFromCollection ? $t('Back to collections') : $t('Back to store') }}
      </button>
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
            <img
              v-if="currentProduct.image"
              class="product-details-page__card-art"
              :src="currentProduct.image"
              :alt="currentProduct.name"
            />
            <img
              v-if="currentProduct.image_2"
              class="product-details-page__card-frame"
              :src="currentProduct.image_2"
              alt=""
            />
            <div class="product-details-page__card-name">{{ cardName }}</div>
            <div
              v-if="currentProduct.description"
              class="product-details-page__card-description"
              v-html="currentProduct.description"
            />
            <span
              v-if="hasValue(currentProduct.mana_cost)"
              class="product-details-page__card-stat product-details-page__card-stat_mana"
            >
              {{ currentProduct.mana_cost }}
            </span>
            <span
              v-if="hasValue(currentProduct.attack)"
              class="product-details-page__card-stat product-details-page__card-stat_attack"
            >
              {{ currentProduct.attack }}
            </span>
            <span
              v-if="hasValue(currentProduct.health)"
              class="product-details-page__card-stat product-details-page__card-stat_health"
            >
              {{ currentProduct.health }}
            </span>
          </div>
        </div>

        <section
          class="product-details-page__content"
          :aria-label="currentProduct.name"
        >
          <div class="product-details-page__main">
            <h1 class="product-details-page__title _h4">
              {{ currentProduct.name }}
            </h1>

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
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

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
  if (purchaseMode.value === 'rent')
    return selectedRentalPrice.value?.price ?? null
  const unitPrice =
    purchaseMode.value === 'sell' ? saleUnitPrice.value : buyPrice.value
  return unitPrice === null
    ? null
    : Number((unitPrice * Math.max(1, Number(quantity.value) || 1)).toFixed(2))
})
const isInCart = computed(() => {
  if (!currentProduct.value?.id || purchaseMode.value === 'sell') return false
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
const hasValue = value => value !== null && value !== undefined && value !== ''
const displayValue = value => (hasValue(value) ? value : '—')
const formatValue = value => {
  if (!hasValue(value)) return '—'
  const text = String(value).replaceAll('_', ' ').trim()
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
const productStats = computed(() => [
  { label: 'Hero', value: currentProduct.value?.hero?.name || '—' },
  { label: 'Type', value: formatValue(currentProduct.value?.type) },
  { label: 'Rarity', value: formatValue(currentProduct.value?.rarity) },
  { label: 'Mana', value: displayValue(currentProduct.value?.mana_cost) },
  { label: 'Attack', value: displayValue(currentProduct.value?.attack) },
  { label: 'Health', value: displayValue(currentProduct.value?.health) },
])
const actionLabel = computed(() => {
  if (purchaseMode.value === 'sell') return 'Sell card'
  if (isInCart.value) return 'Remove from cart'
  return purchaseMode.value === 'rent' ? 'Rent card' : 'Buy card'
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
  if (purchaseMode.value === 'sell' && quantity.value >= availableForSale.value)
    return
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
  if (!selectedRentalPrice.value)
    rentalPeriodId.value = rentalOptions.value[0].rental_period_id
}
function setPurchaseMode(mode) {
  if (mode === 'rent' && !canRent.value) return
  if (mode === 'sell' && !showSellTab.value) return
  purchaseMode.value = mode
  quantity.value = 1
  if (mode === 'rent') setInitialRentalPeriod()
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
    if (purchaseMode.value === 'sell') normalizeQuantity()
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
    if (showSellTab.value) await fetchAvailability()
  } catch (fetchError) {
    if (requestId !== activeRequestId) return
    error.value =
      fetchError?.response?.data?.message ||
      fetchError?.message ||
      'Unable to load product details'
  } finally {
    if (requestId === activeRequestId) loading.value = false
  }
}
function goBack() {
  router.push(
    isFromCollection.value
      ? {
          name: 'MyCardsPage',
          query: { collection: isRentedCollection.value ? 'rented' : 'bought' },
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
    query: { form: 'signin', redirect: route.fullPath || '/' },
  })
}
async function handleSell() {
  normalizeQuantity()
  if (!showSellTab.value || availableForSale.value < Number(quantity.value))
    return
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
    if (!result?.success)
      throw new Error(
        result?.error || result?.message || t('Failed to remove item'),
      )
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
      if (succeeded) await userStore.fetchProfile().catch(() => null)
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
    if (!loading.value && currentProduct.value) setInitialMode()
  },
)
</script>

<style lang="scss" scoped>
.product-page {
  @include adaptiveValue('padding-top', 92, 68);
  @include adaptiveValue('padding-bottom', 100, 40);
  position: relative;

  min-height: 100dvh;

  &__bg {
    position: fixed;
    inset: 0;
    z-index: 0;

    pointer-events: none;

    img {
      object-position: center top;
    }
  }

  &__back-row {
    position: relative;
    z-index: 1;

    width: 100%;
  }

  &__back {
    @include adaptiveValue('margin-bottom', 44, 24);
    display: inline-flex;
    align-items: center;
    gap: 10px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--seventh-color);
    font-size: 13px;

    cursor: pointer;

    transition: color 0.3s ease;

    span {
      color: var(--fourth-color);
      font-size: 22px;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
    max-width: 960px;
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
  @include adaptiveValue('gap', 24, 16);
  display: grid;
  align-items: stretch;
  grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);

  &__preview,
  &__content {
    position: relative;

    min-width: 0;

    border-radius: 18px;
    background: linear-gradient(135deg, #111624, #101523);
  }

  &__preview {
    @include adaptiveValue('padding-top', 36, 24);
    @include adaptiveValue('padding-bottom', 36, 24);
    display: flex;
    align-items: center;
    justify-content: center;

    isolation: isolate;
  }

  &__decor {
    position: absolute;
    z-index: 3;

    width: 165px;
    max-width: 46%;

    pointer-events: none;

    &_top {
      top: -14px;
      left: -17px;
    }
    &_bottom {
      right: -17px;
      bottom: -15px;

      transform: rotate(180deg);
    }
  }

  &__card {
    position: relative;

    width: min(80%, 270px);
    aspect-ratio: 0.69;

    container-type: inline-size;
    filter: drop-shadow(0 12px 14px rgb(0 0 0 / 35%));
  }

  &__card-art {
    position: absolute;
    top: 14%;
    left: 11%;
    z-index: 1;

    width: 78%;
    height: 48%;

    object-fit: cover;
  }

  &__card-frame {
    position: absolute;
    inset: 0;
    z-index: 2;

    width: 100%;
    height: 100%;

    object-fit: contain;
  }

  &__card-name {
    position: absolute;
    top: 58%;
    left: 12%;
    z-index: 3;

    overflow: hidden;

    width: 76%;

    color: var(--fourth-color);
    font-family: var(--font-audiowide);
    font-size: clamp(8px, 4.6cqi, 16px);
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__card-description {
    position: absolute;
    top: 77%;
    left: 50%;
    z-index: 3;

    display: -webkit-box;
    overflow: hidden;

    width: 64%;
    max-height: 15%;

    color: var(--secondary-color);
    font-size: clamp(7px, 3.4cqi, 12px);
    line-height: 1.2;
    text-align: center;

    transform: translateX(-50%);

    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
    :deep(p) {
      margin: 0;
    }
  }

  &__card-stat {
    position: absolute;
    z-index: 4;

    display: grid;
    place-items: center;

    width: 11%;
    aspect-ratio: 1;

    border-radius: 50%;

    color: var(--fourth-color);
    font-family: var(--font-audiowide);
    font-size: clamp(10px, 7cqi, 22px);
    text-shadow: 0 1px 3px rgb(0 0 0 / 80%);

    &_mana {
      top: 4%;
      left: 43%;
    }
    &_attack {
      bottom: 3%;
      left: 5%;
    }
    &_health {
      right: 5%;
      bottom: 3%;
    }
  }

  &__content {
    display: flex;
    overflow: visible;
    flex-direction: column;
  }

  &__main {
    @include adaptiveValue('padding-top', 32, 22);
    @include adaptiveValue('padding-left', 28, 16);
    @include adaptiveValue('padding-right', 28, 16);
    @include adaptiveValue('padding-bottom', 26, 20);
    flex: 1 1 auto;
  }

  &__title {
    @include adaptiveValue('font-size', 27, 22);
    @include adaptiveValue('margin-bottom', 22, 15);
    color: var(--fourth-color);
    font-family: var(--font-audiowide);
    font-weight: 400;
    line-height: 1.25;
    text-transform: none;
  }

  &__label {
    margin-bottom: 7px;

    color: var(--seventh-color);
    font-size: 12px;
  }

  &__description {
    @include adaptiveValue('margin-bottom', 22, 16);
  }

  &__description-text {
    color: var(--secondary-color);
    font-size: 13px;
    line-height: 1.5;
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
    @include adaptiveValue('padding', 15, 10);
    display: flex;
    flex-direction: column;
    gap: 6px;

    min-width: 0;
    min-height: 70px;

    border-radius: 10px;
    background: var(--bg-primary-color);

    font-size: 13px;

    span {
      color: var(--seventh-color);
    }
    strong {
      color: var(--fourth-color);
      font-size: 14px;
      font-weight: 700;

      overflow-wrap: anywhere;
    }
  }

  &__actions {
    border-radius: 0 0 18px 18px;
    background: var(--bg-primary-color);
  }

  &__tabs {
    @include adaptiveValue('padding-left', 28, 16);
    @include adaptiveValue('padding-right', 28, 16);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  &__tab {
    position: relative;

    min-height: 40px;

    padding: 8px 18px;

    border: 0;
    background: transparent;

    color: var(--seventh-color);
    font-size: 13px;
    font-weight: 700;
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
    @include adaptiveValue('padding', 25, 16);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;

    min-height: 95px;

    border-radius: 0 0 18px 18px;
    background: var(--bg-fifth-color);
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

    width: 190px;
    height: 54px;

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
      gap: 12px;
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
