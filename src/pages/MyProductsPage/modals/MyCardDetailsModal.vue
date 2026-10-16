<template>
  <BaseModal
    :show="show"
    class="my-card-modal"
    content-class="my-card-modal__content"
    size="product"
    :labelledby="titleId"
    @close="closeModal"
    @update:show="handleShowUpdate"
  >
    <div v-if="loading" class="my-card-details my-card-details_state">
      <LoadingSpinner class="my-card-details__loader" />
    </div>

    <div v-else-if="error" class="my-card-details my-card-details_state">
      <h2 class="my-card-details__state-title _h3">
        {{ $t('Unable to load card') }}
      </h2>

      <p class="my-card-details__state-text">
        {{ error }}
      </p>

      <BaseButton
        type="button"
        class="my-card-details__retry"
        variant="hint-bordered"
        @click="loadCard"
      >
        {{ $t('Try again') }}
      </BaseButton>
    </div>

    <div v-else-if="card" class="my-card-details">
      <div class="my-card-details__preview">
        <div class="my-card-details__back">
          <img :src="cardBackImage" :alt="cardBackAlt" />
        </div>

        <div class="my-card-details__card">
          <img
            v-if="card.image"
            :src="card.image"
            alt=""
            class="my-card-details__card-image"
          />

          <img
            v-if="card.image_2"
            :src="card.image_2"
            :alt="card.name"
            class="my-card-details__card-frame"
          />

          <div v-if="cardName" class="my-card-details__card-name">
            {{ cardName }}
          </div>

          <div
            v-if="card.description"
            class="my-card-details__card-description"
            v-html="card.description"
          />

          <span
            v-if="hasValue(card.mana_cost)"
            class="my-card-details__card-stat my-card-details__card-stat_mana"
          >
            {{ card.mana_cost }}
          </span>

          <span
            v-if="hasValue(card.attack)"
            class="my-card-details__card-stat my-card-details__card-stat_attack"
          >
            {{ card.attack }}
          </span>

          <span
            v-if="hasValue(card.health)"
            class="my-card-details__card-stat my-card-details__card-stat_health"
          >
            {{ card.health }}
          </span>
        </div>

        <div v-if="rented || sellFeatureEnabled" class="my-card-details__stock">
          <template v-if="rented">
            {{ $t('Rented card') }}
          </template>

          <template v-else-if="availabilityLoading">
            {{ $t('Checking availability...') }}
          </template>

          <template v-else>
            {{ $t('Available for sale') }}:
            <strong>{{ availableForSale }}</strong>
          </template>
        </div>
      </div>

      <div class="my-card-details__content">
        <div class="my-card-details__main">
          <h2 :id="titleId" class="my-card-details__title">
            {{ cardName }}
          </h2>

          <div class="my-card-details__stats">
            <div class="my-card-details__stats-column">
              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Hero') }}
                </span>
                <span class="my-card-details__stats-value">
                  {{ heroName }}
                </span>
              </div>

              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Type') }}
                </span>
                <span class="my-card-details__stats-value">
                  {{ formatValue(card.type) }}
                </span>
              </div>

              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Rarity') }}
                </span>
                <span class="my-card-details__stats-value">
                  {{ formatValue(card.rarity) }}
                </span>
              </div>
            </div>

            <div class="my-card-details__stats-column">
              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Mana') }}
                </span>
                <span class="my-card-details__stats-value">
                  {{ displayValue(card.mana_cost) }}
                </span>
              </div>

              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Attack') }}
                </span>
                <span class="my-card-details__stats-value">
                  {{ displayValue(card.attack) }}
                </span>
              </div>

              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Health') }}
                </span>
                <span class="my-card-details__stats-value">
                  {{ displayValue(card.health) }}
                </span>
              </div>
            </div>
          </div>

          <div class="my-card-details__description">
            <div class="my-card-details__description-label">
              {{ $t('Description:') }}
            </div>

            <div
              class="my-card-details__description-content"
              v-html="card.description || '—'"
            />
          </div>
        </div>

        <div v-if="sellFeatureEnabled && !rented" class="my-card-details__sale">
          <div class="my-card-details__sale-controls">
            <div
              v-if="commissionPercent > 0"
              class="my-card-details__commission"
            >
              <span class="my-card-details__control-label">
                {{ $t('Commission') }}
              </span>

              <strong class="my-card-details__commission-value">
                {{ commissionPercent }}%
              </strong>
            </div>

            <div class="my-card-details__quantity-box">
              <span class="my-card-details__control-label">
                {{ $t('Q-ty:') }}
              </span>

              <div class="my-card-details__quantity">
                <button
                  type="button"
                  class="my-card-details__quantity-button"
                  :disabled="
                    Number(quantity) <= 1 ||
                    submitting ||
                    availabilityLoading ||
                    !availableForSale
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
                  class="my-card-details__quantity-input"
                  :disabled="
                    !availableForSale || submitting || availabilityLoading
                  "
                  :aria-label="$t('Quantity')"
                  @blur="normalizeQuantity"
                  @keydown.enter="normalizeQuantity"
                />

                <button
                  type="button"
                  class="my-card-details__quantity-button"
                  :disabled="
                    Number(quantity) >= availableForSale ||
                    submitting ||
                    availabilityLoading ||
                    !availableForSale
                  "
                  :aria-label="$t('Increase quantity')"
                  @click="increaseQuantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div class="my-card-details__sale-bottom">
            <div class="my-card-details__price-box">
              <span class="my-card-details__control-label">
                {{ $t('You receive per card') }}
              </span>

              <PriceFormatter
                :price="saleUnitPrice"
                size="size-32"
                class="my-card-details__price-value"
              />
            </div>

            <div class="my-card-details__total-box">
              <span class="my-card-details__control-label">
                {{ $t('Total') }}
              </span>

              <PriceFormatter
                :price="saleTotal"
                size="size-32"
                class="my-card-details__total-value"
              />
            </div>

            <BaseButton
              type="button"
              class="my-card-details__sell-button"
              variant="primary"
              :disabled="!canSell"
              @click="sellCard"
            >
              <span
                v-if="submitting"
                class="my-card-details__button-loader"
                aria-hidden="true"
              />

              <template v-else-if="availabilityLoading">
                {{ $t('Checking...') }}
              </template>

              <template v-else-if="availableForSale">
                {{ $t('Sell card') }}
              </template>

              <template v-else>
                {{ $t('Unavailable') }}
              </template>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'

import axios from '@/plugins/axios'

import { useProductStore } from '@/stores/product'
import { useSettingsStore } from '@/stores/settings'
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
  collectionItem: {
    type: Object,
    default: null,
  },
  rented: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'update:show', 'sold'])

const productStore = useProductStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const toast = useToast()

const loading = ref(false)
const error = ref('')

const submitting = ref(false)
const availabilityLoading = ref(false)

const availableForSale = ref(0)
const quantity = ref(1)

const activeRequestId = ref(0)

const card = computed(() => productStore.currentProduct)

const cardName = computed(() => {
  return card.value?.name ?? card.value?.title ?? card.value?.card_name ?? ''
})

const heroName = computed(() => {
  const hero = card.value?.hero

  if (typeof hero === 'string') {
    return hero
  }

  return hero?.name || '—'
})

const titleId = computed(() => {
  return props.productId ? `my-card-title-${props.productId}` : 'my-card-title'
})

const cardRarity = computed(() => {
  return String(card.value?.rarity || '').toLowerCase()
})

const cardBackImage = computed(() => {
  const frameType = String(card.value?.frame_type?.name || '').toUpperCase()

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

  return commonCardBack
})

const cardBackAlt = computed(() => {
  const frameType = String(card.value?.frame_type?.name || '').toUpperCase()

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

const sellFeatureEnabled = computed(() => {
  return settingsStore.settings?.payouts?.offer_enabled === true
})

const commissionPercent = computed(() => {
  return Number(
    settingsStore.settings?.payouts?.card_sale_commission_percent ?? 0,
  )
})

const saleUnitPrice = computed(() => {
  const salePrice = Number(card.value?.sale_price)

  if (Number.isFinite(salePrice) && salePrice >= 0) {
    return salePrice
  }

  const cardPrice = Number(card.value?.price ?? 0)
  const commission = commissionPercent.value / 100

  return Number((cardPrice * (1 - commission)).toFixed(2))
})

const saleTotal = computed(() => {
  return Number((saleUnitPrice.value * Number(quantity.value || 0)).toFixed(2))
})

const canSell = computed(() => {
  return (
    sellFeatureEnabled.value &&
    !props.rented &&
    !availabilityLoading.value &&
    !submitting.value &&
    availableForSale.value > 0 &&
    Number.isInteger(Number(quantity.value)) &&
    Number(quantity.value) >= 1 &&
    Number(quantity.value) <= availableForSale.value
  )
})

function hasValue(value) {
  return value !== null && value !== undefined && value !== ''
}

function displayValue(value) {
  return hasValue(value) ? value : '—'
}

function formatValue(value) {
  if (!hasValue(value)) {
    return '—'
  }

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

function normalizeQuantity() {
  const parsedQuantity = Number.parseInt(String(quantity.value), 10) || 1

  if (!sellFeatureEnabled.value || availableForSale.value <= 0) {
    quantity.value = 1
    return
  }

  quantity.value = Math.min(Math.max(1, parsedQuantity), availableForSale.value)
}

function decreaseQuantity() {
  normalizeQuantity()
  quantity.value = Math.max(1, Number(quantity.value) - 1)
}

function increaseQuantity() {
  normalizeQuantity()

  quantity.value = Math.min(availableForSale.value, Number(quantity.value) + 1)
}

async function fetchAvailability() {
  if (props.rented || !sellFeatureEnabled.value || !card.value?.id) {
    availableForSale.value = 0
    return
  }

  availabilityLoading.value = true

  try {
    const { data } = await axios.get(
      `/players/me/cards/${card.value.id}/available-for-sale`,
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

    normalizeQuantity()
  } catch (availabilityError) {
    console.error('Unable to load sale availability:', availabilityError)

    availableForSale.value = 0

    if (availabilityError?.response?.status !== 401) {
      toast.error(
        availabilityError?.response?.data?.message ||
          availabilityError?.message ||
          'Unable to check card availability',
      )
    }
  } finally {
    availabilityLoading.value = false
  }
}

async function loadSettings() {
  if (settingsStore.settings) {
    return
  }

  await settingsStore.fetchSettings()
}

async function loadCard() {
  if (!props.productId) {
    error.value = 'Card ID is missing'
    return
  }

  const requestId = ++activeRequestId.value

  loading.value = true
  error.value = ''
  quantity.value = 1
  availableForSale.value = 0

  try {
    await Promise.all([
      productStore.fetchProductDetails(props.productId),
      loadSettings(),
    ])

    if (requestId !== activeRequestId.value) {
      return
    }

    if (sellFeatureEnabled.value && !props.rented) {
      await fetchAvailability()
    }
  } catch (loadError) {
    if (requestId !== activeRequestId.value) {
      return
    }

    console.error('Unable to load collection card:', loadError)

    error.value =
      loadError?.response?.data?.message ||
      loadError?.message ||
      'Unable to load card'
  } finally {
    if (requestId === activeRequestId.value) {
      loading.value = false
    }
  }
}

async function sellCard() {
  normalizeQuantity()

  if (!canSell.value || !card.value?.id || submitting.value) {
    return
  }

  submitting.value = true

  try {
    const requestedQuantity = Number(quantity.value)

    const { data } = await axios.post('/offers/cards', {
      id: card.value.id,
      quantity: requestedQuantity,
    })

    toast.success(data?.message || 'Sale offer created')

    emit('sold', {
      productId: card.value.id,
      collectionItem: props.collectionItem,
      quantity: Number(data?.quantity ?? requestedQuantity),
      offerId: data?.offer_id,
      status: data?.status,
      totalPrice: data?.total_price,
    })

    await Promise.all([fetchAvailability(), userStore.fetchProfile()])

    quantity.value = 1
  } catch (saleError) {
    console.error('Unable to sell card:', saleError)

    const response = saleError?.response?.data

    if (response?.error_type === 'not_enough_cards') {
      availableForSale.value = Math.max(0, Number(response.available || 0))

      normalizeQuantity()
    }

    toast.error(
      response?.message || saleError?.message || 'Unable to sell card',
    )
  } finally {
    submitting.value = false
  }
}

function closeModal() {
  activeRequestId.value += 1
  emit('update:show', false)
  emit('close')
}

function handleShowUpdate(value) {
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

    await loadCard()
  },
  { immediate: true },
)

watch(sellFeatureEnabled, async enabled => {
  if (!props.show || props.rented || !card.value?.id) {
    return
  }

  if (!enabled) {
    availableForSale.value = 0
    quantity.value = 1
    return
  }

  await fetchAvailability()
})
</script>

<style lang="scss" scoped>
.my-card-details {
  position: relative;

  display: grid;
  align-items: center;
  gap: clamp(24px, 3vw, 48px);
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);

  width: 100%;
  max-width: 1100px;
  min-height: 500px;

  margin: 0 auto;

  &_state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;

    min-height: 400px;

    text-align: center;
  }

  &__loader {
    width: 50px;
    height: 50px;
  }

  &__state-title {
    color: var(--primary-color);
  }

  &__state-text {
    color: var(--error-color);
  }

  &__retry {
    width: min(100%, 250px);
  }

  &__preview {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    width: 100%;
    min-width: 0;
    min-height: 490px;
  }

  &__back {
    position: absolute;
    top: 50%;
    left: -20%;
    z-index: 1;

    width: 90%;
    aspect-ratio: 1;

    pointer-events: none;

    transform: translateY(-50%);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__card {
    position: relative;
    z-index: 2;

    width: min(82%, 345px);
    aspect-ratio: 2 / 3;

    margin-left: auto;

    container-type: inline-size;
    filter: drop-shadow(0 12px 18px rgb(0 0 0 / 25%));
  }

  &__card-image {
    position: absolute;
    top: 15.3%;
    left: 50%;
    z-index: 1;

    width: 77%;
    height: 45.5%;

    object-fit: cover;

    transform: translateX(-50%);
  }

  &__card-frame {
    position: absolute;
    inset: 0;
    z-index: 2;

    width: 100%;
    height: 100%;

    pointer-events: none;

    object-fit: contain;
  }

  &__card-name {
    position: absolute;
    top: 9.25%;
    left: 55%;
    z-index: 3;

    overflow: hidden;

    width: 65%;

    padding: 0 5%;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: clamp(8px, 5cqi, 16px);
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
    font-size: clamp(8px, 3.8cqi, 13px);
    font-weight: 400;
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

  &__card-stat {
    position: absolute;
    z-index: 4;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 14%;
    aspect-ratio: 1;

    border-radius: 50%;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: clamp(14px, 10cqi, 30px);
    font-weight: 700;
    line-height: 1;

    pointer-events: none;

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

  &__stock {
    position: absolute;
    bottom: -15px;
    left: 50%;
    z-index: 5;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 150%;
    text-align: center;
    white-space: nowrap;

    transform: translateX(-50%);

    strong {
      margin-left: 5px;

      color: var(--primary-color);
      font-weight: 600;
    }
  }

  &__content {
    position: relative;
    z-index: 5;

    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
    min-height: 475px;
  }

  &__main {
    flex: 1 1 auto;
  }

  &__title {
    margin: 0 0 clamp(24px, 3vw, 36px);

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: clamp(25px, 2.8vw, 38px);
    font-weight: 500;
    line-height: 1.15;
    text-align: left;
  }

  &__stats {
    display: grid;
    gap: clamp(14px, 2vw, 28px);
    grid-template-columns: repeat(2, minmax(0, 1fr));

    width: 100%;

    margin-bottom: clamp(24px, 3vw, 36px);
  }

  &__stats-column {
    display: flex;
    flex-direction: column;
    gap: 17px;

    min-width: 0;
  }

  &__stats-item {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;

    min-width: 0;

    padding-bottom: 10px;

    border-bottom: 1px solid rgb(255 255 255 / 9%);
  }

  &__stats-label {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.4;
  }

  &__stats-value {
    overflow: hidden;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    text-align: right;
    text-overflow: ellipsis;

    overflow-wrap: anywhere;
  }

  &__description {
    margin-bottom: 24px;
  }

  &__description-label,
  &__control-label {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
  }

  &__description-label {
    margin-bottom: 12px;
  }

  &__description-content {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 1.65;

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
  }

  &__sale {
    display: flex;
    flex-direction: column;
    gap: 22px;

    width: 100%;

    padding-top: 22px;

    border-top: 1px solid rgb(255 255 255 / 12%);
  }

  &__sale-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 24px;
  }

  &__commission,
  &__quantity-box,
  &__price-box,
  &__total-box {
    display: flex;
    flex-direction: column;
    gap: 10px;

    min-width: 0;
  }

  &__commission-value {
    display: flex;
    align-items: center;

    min-height: 38px;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 500;
  }

  &__quantity {
    display: flex;
    align-items: stretch;

    width: fit-content;
    height: 40px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 5px;
    background-color: rgb(0 0 0 / 10%);
  }

  &__quantity-button {
    display: flex;
    flex: 0 0 38px;
    align-items: center;
    justify-content: center;

    width: 38px;

    padding: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 22px;
    font-weight: 300;

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
        background-color: rgb(255 255 255 / 8%);

        color: var(--primary-color);
      }
    }
  }

  &__quantity-input {
    width: 46px;
    min-width: 0;

    padding: 0 4px;

    border: 0;
    outline: none;
    background: transparent;

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

  &__sale-bottom {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 20px;

    width: 100%;
  }

  &__price-box,
  &__total-box {
    flex: 1 1 100px;
  }

  &__price-value,
  &__total-value {
    display: flex;
    align-items: center;

    min-height: 40px;
  }

  &__sell-button {
    flex: 0 0 160px;

    width: 160px;
    min-height: 44px;

    font-family: var(--font-spectral);
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__button-loader {
    display: block;

    width: 20px;
    height: 20px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: my-card-details-spin 0.8s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  @media (max-width: $md3) {
    gap: 20px;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);

    &__preview {
      min-height: 420px;
    }

    &__card {
      width: min(90%, 290px);
    }

    &__back {
      left: -12%;

      width: 85%;
    }

    &__content {
      min-height: 420px;
    }

    &__title {
      font-size: 28px;
    }

    &__stats {
      gap: 12px;
    }

    &__stats-item {
      gap: 6px;
    }

    &__stats-label {
      font-size: 12px;
    }

    &__stats-value {
      font-size: 13px;
    }
  }

  @media (max-width: $md4) {
    gap: 36px;
    grid-template-columns: minmax(0, 1fr);

    &__preview {
      justify-content: center;

      min-height: 0;
    }

    &__card {
      width: min(68vw, 310px);

      margin: 0;

      transform: translateX(8%);
    }

    &__back {
      top: 50%;
      left: 8%;

      width: min(65vw, 300px);
    }

    &__stock {
      bottom: -25px;
    }

    &__content {
      min-height: 0;
    }

    &__title {
      font-size: 28px;
      text-align: center;
    }
  }

  @media (max-width: $md6) {
    gap: 32px;

    &__card {
      width: min(75vw, 290px);
    }

    &__back {
      left: -4%;

      width: min(70vw, 270px);
    }

    &__title {
      font-size: 25px;
    }

    &__stats {
      gap: 12px;
    }

    &__stats-column {
      gap: 12px;
    }

    &__stats-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    &__stats-value {
      text-align: left;
    }

    &__sale-controls {
      gap: 20px;
    }

    &__sale-bottom {
      gap: 18px;
    }

    &__sell-button {
      flex: 1 1 100%;

      width: 100%;
    }
  }

  @media (max-width: $md7) {
    &__card {
      width: min(78vw, 270px);
    }

    &__back {
      width: 65vw;
    }

    &__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__sale-controls {
      justify-content: space-between;
    }
  }
}

@keyframes my-card-details-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.my-card-modal__content) {
  width: 100%;
}
</style>
