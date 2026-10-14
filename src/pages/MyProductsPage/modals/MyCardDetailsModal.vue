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
      <div class="my-card-details__state-title _h3">
        {{ $t('Unable to load card') }}
      </div>

      <div class="my-card-details__state-text">
        {{ error }}
      </div>

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
            v-if="card.image_2"
            :src="card.image_2"
            :alt="card.name"
            class="my-card-details__card-frame"
          />

          <img
            v-if="card.image"
            :src="card.image"
            alt=""
            class="my-card-details__card-image"
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
          <h2 :id="titleId" class="my-card-details__title _h4">
            {{ card.name }}
          </h2>

          <div class="my-card-details__stats">
            <div
              class="my-card-details__stats-row my-card-details__stats-row_head"
            >
              <div class="my-card-details__stats-cell">
                {{ $t('Hero') }}
              </div>

              <div class="my-card-details__stats-cell">
                {{ $t('Type') }}
              </div>

              <div class="my-card-details__stats-cell">
                {{ $t('Rarity') }}
              </div>

              <div class="my-card-details__stats-cell">
                {{ $t('Mana') }}
              </div>

              <div class="my-card-details__stats-cell">
                {{ $t('Attack') }}
              </div>

              <div class="my-card-details__stats-cell">
                {{ $t('Health') }}
              </div>
            </div>

            <div class="my-card-details__stats-row">
              <div class="my-card-details__stats-cell">
                {{ card.hero?.name || '—' }}
              </div>

              <div class="my-card-details__stats-cell">
                {{ formatValue(card.type) }}
              </div>

              <div class="my-card-details__stats-cell">
                {{ formatValue(card.rarity) }}
              </div>

              <div class="my-card-details__stats-cell">
                {{ displayValue(card.mana_cost) }}
              </div>

              <div class="my-card-details__stats-cell">
                {{ displayValue(card.attack) }}
              </div>

              <div class="my-card-details__stats-cell">
                {{ displayValue(card.health) }}
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
          <div class="my-card-details__sale-top">
            <div
              v-if="commissionPercent > 0"
              class="my-card-details__commission"
            >
              <div class="my-card-details__control-label">
                {{ $t('Commission') }}
              </div>

              <div class="my-card-details__commission-value">
                {{ commissionPercent }}%
              </div>
            </div>

            <div class="my-card-details__quantity-box">
              <div class="my-card-details__control-label">
                {{ $t('Q-ty:') }}
              </div>

              <div class="my-card-details__quantity">
                <button
                  type="button"
                  class="my-card-details__quantity-button"
                  :disabled="
                    quantity <= 1 ||
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
                    quantity >= availableForSale ||
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
              <div class="my-card-details__control-label">
                {{ $t('You receive per card') }}
              </div>

              <PriceFormatter
                :price="saleUnitPrice"
                size="size-32"
                class="my-card-details__price-value"
              />
            </div>

            <div class="my-card-details__total-box">
              <div class="my-card-details__control-label">
                {{ $t('Total') }}
              </div>

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

const card = computed(() => {
  return productStore.currentProduct
})

const cardName = computed(() => {
  return card.value?.name ?? card.value?.title ?? card.value?.card_name ?? ''
})

const titleId = computed(() => {
  return props.productId ? `my-card-title-${props.productId}` : 'my-card-title'
})

const frameTypeName = computed(() => {
  const name = card.value?.frame_type?.name

  if (!name) {
    return '—'
  }

  return String(name).toUpperCase()
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

  if (cardRarity.value === 'common') {
    return commonCardBack
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
    Number(quantity.value) >= 1 &&
    Number(quantity.value) <= availableForSale.value
  )
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

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const normalizeQuantity = () => {
  const parsedQuantity = Number.parseInt(String(quantity.value), 10) || 1

  if (!sellFeatureEnabled.value || availableForSale.value <= 0) {
    quantity.value = 1

    return
  }

  quantity.value = Math.min(Math.max(1, parsedQuantity), availableForSale.value)
}

const decreaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Math.max(1, Number(quantity.value) - 1)
}

const increaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Math.min(availableForSale.value, Number(quantity.value) + 1)
}

const fetchAvailability = async () => {
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

const loadSettings = async () => {
  if (settingsStore.settings) {
    return
  }

  await settingsStore.fetchSettings()
}

const loadCard = async () => {
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

const sellCard = async () => {
  if (!canSell.value || !card.value?.id || submitting.value) {
    return
  }

  normalizeQuantity()

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

const closeModal = () => {
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

    await loadCard()
  },

  {
    immediate: true,
  },
)

watch(
  sellFeatureEnabled,

  async enabled => {
    if (!props.show || props.rented || !card.value?.id) {
      return
    }

    if (!enabled) {
      availableForSale.value = 0
      quantity.value = 1

      return
    }

    await fetchAvailability()
  },
)
</script>

<style lang="scss" scoped>
.my-card-details {
  position: relative;

  display: flex;
  align-items: center;
  gap: 20px;

  width: 100%;
  max-width: 1000px;
  min-height: 520px;

  margin: 0 auto;

  &_state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;

    min-height: 480px;

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

    width: 77%;
    height: 47%;

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
    align-items: center;
    justify-content: center;

    aspect-ratio: 1;

    border-radius: 50%;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: clamp(14px, 12cqi, 30px);
    font-weight: 700;
    line-height: 1;

    pointer-events: none;

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

  &__stock {
    position: absolute;
    bottom: -30px;
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
      margin-left: 6px;

      color: var(--primary-color);
      font-weight: 600;
    }
  }

  &__content {
    position: relative;
    z-index: 5;

    display: flex;
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

      .my-card-details__stats-cell {
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

  &__sale {
    display: flex;
    flex-direction: column;
    gap: 24px;

    width: 100%;

    padding-top: 20px;

    border-top: 1px solid var(--border-secondary-color);
  }

  &__sale-top,
  &__sale-bottom {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 30px;

    width: 100%;
  }

  &__commission,
  &__quantity-box,
  &__price-box,
  &__total-box {
    display: flex;
    flex-direction: column;
    gap: 12px;

    min-width: 0;
  }

  &__commission {
    flex: 0 0 auto;
  }

  &__quantity-box {
    flex: 0 0 auto;
  }

  &__price-box {
    flex: 1 1 150px;
  }

  &__total-box {
    flex: 1 1 130px;
  }

  &__commission-value {
    display: flex;
    align-items: center;

    min-height: 36px;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 500;
    line-height: 1;
  }

  &__quantity {
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

  &__price-value,
  &__total-value {
    display: flex;
    align-items: center;

    min-height: 36px;
  }

  &__sell-button {
    @include adaptiveValue('min-height', 48, 40);

    flex: 0 1 180px;

    width: 180px;
    min-width: 160px;

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

    animation: my-card-details-spin 0.8s linear infinite;

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

    &__sale-top,
    &__sale-bottom {
      gap: 15px;
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

    &__stock {
      bottom: -30px;
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

    &__sale-top,
    &__sale-bottom {
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
    }

    &__commission,
    &__quantity-box,
    &__price-box,
    &__total-box {
      flex: none;
      align-items: center;

      width: 100%;
    }

    &__sell-button {
      flex: none;

      width: 100%;
      min-width: 0;
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
