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
    <template v-if="heroImage && card && !loading" #hero>
      <img :src="heroImage" :alt="heroName" />
    </template>
    <div v-if="loading" class="my-card-details my-card-details_state">
      <LoadingSpinner class="my-card-details__loader" />
    </div>

    <div v-else-if="error" class="my-card-details my-card-details_state">
      <h2 :id="titleId" class="my-card-details__state-title _h3">
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
        <div class="my-card-details__card">
          <img
            v-if="card.image"
            :src="card.image"
            :alt="cardName"
            class="my-card-details__card-image"
          />

          <img
            v-if="card.image_2"
            :src="card.image_2"
            alt=""
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
      </div>

      <div class="my-card-details__content">
        <div class="my-card-details__main">
          <h2 :id="titleId" class="my-card-details__title _h4">
            {{ cardName }}
          </h2>

          <div class="my-card-details__stats">
            <div class="my-card-details__stats-column">
              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Hero') }}:
                </span>

                <span class="my-card-details__stats-value">
                  {{ heroName }}
                </span>
              </div>

              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Type') }}:
                </span>

                <span class="my-card-details__stats-value">
                  {{ formatValue(card.type) }}
                </span>
              </div>

              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Rarity') }}:
                </span>

                <span class="my-card-details__stats-value">
                  {{ formatValue(card.rarity) }}
                </span>
              </div>
            </div>

            <div class="my-card-details__stats-column">
              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Mana') }}:
                </span>

                <span class="my-card-details__stats-value">
                  {{ displayValue(card.mana_cost) }}
                </span>
              </div>

              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Attack') }}:
                </span>

                <span class="my-card-details__stats-value">
                  {{ displayValue(card.attack) }}
                </span>
              </div>

              <div class="my-card-details__stats-item">
                <span class="my-card-details__stats-label">
                  {{ $t('Health') }}:
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
          <div class="my-card-details__tabs">
            <button
              type="button"
              class="my-card-details__tab my-card-details__tab_active"
              :aria-pressed="true"
            >
              {{ $t('Sell card') }}
            </button>
          </div>

          <div class="my-card-details__sale-controls">
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

            <div class="my-card-details__quantity-box">
              <div class="my-card-details__control-label">
                {{ $t('Q-ty:') }}
              </div>

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
                    submitting || availabilityLoading || !availableForSale
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

          <div class="my-card-details__sale-info">
            <div class="my-card-details__availability">
              <template v-if="availabilityLoading">
                {{ $t('Checking availability...') }}
              </template>

              <template v-else>
                {{ $t('Available for sale') }}:
                <strong>{{ availableForSale }}</strong>
              </template>
            </div>

            <div
              v-if="commissionPercent > 0"
              class="my-card-details__commission"
            >
              {{ $t('Commission') }}:
              <strong>{{ commissionPercent }}%</strong>
            </div>

            <div class="my-card-details__total">
              <span>{{ $t('Total') }}:</span>

              <PriceFormatter
                :price="saleTotal"
                size="size-28"
                class="my-card-details__total-value"
              />
            </div>
          </div>
        </div>

        <div v-else-if="rented" class="my-card-details__rented">
          {{ $t('Rented card') }}
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

import { useHeroesStore } from '@/stores/heroes'
import { useProductStore } from '@/stores/product'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

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
const heroesStore = useHeroesStore()
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

const titleId = computed(() => {
  return props.productId ? `my-card-title-${props.productId}` : 'my-card-title'
})

const productHero = computed(() => {
  const hero = card.value?.hero

  if (!hero) return null

  const heroes = heroesStore.heroes || []

  const matchedHero = heroes.find(item => {
    return (
      String(item.id) === String(hero.id) ||
      (item.slug && item.slug === hero.slug) ||
      (item.name &&
        hero.name &&
        item.name.toLowerCase() === hero.name.toLowerCase())
    )
  })

  return matchedHero || hero
})

const heroName = computed(() => {
  return productHero.value?.name || card.value?.hero?.name || '—'
})

const heroImage = computed(() => {
  return productHero.value?.image_plain || card.value?.hero?.image_plain || null
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

const hasValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const displayValue = value => {
  return hasValue(value) ? value : '—'
}

const formatValue = value => {
  if (!hasValue(value)) return '—'

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
  if (settingsStore.settings) return

  await settingsStore.fetchSettings()
}

const loadHeroes = async () => {
  if (typeof heroesStore.ensureHeroes === 'function') {
    await heroesStore.ensureHeroes()
  }
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
      loadHeroes().catch(() => {}),
    ])

    if (requestId !== activeRequestId.value) return

    if (sellFeatureEnabled.value && !props.rented) {
      await fetchAvailability()
    }
  } catch (loadError) {
    if (requestId !== activeRequestId.value) return

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

    if (!isOpen || !productId) return

    const justOpened = isOpen && !wasOpen
    const productChanged = String(productId) !== String(previousProductId)

    if (!justOpened && !productChanged) return

    await loadCard()
  },
  { immediate: true },
)

watch(sellFeatureEnabled, async enabled => {
  if (!props.show || props.rented || !card.value?.id) return

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
  @include adaptiveValue('gap', 42, 18);
  @include adaptiveValue('padding-top', 10, 0);
  @include adaptiveValue('padding-bottom', 10, 0);

  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);

  width: 100%;
  max-width: none;
  min-height: 510px;

  margin: 0;

  &_state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;

    min-height: 450px;

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

    min-width: 0;
    min-height: 490px;
  }

  &__card {
    position: relative;
    z-index: 2;

    width: min(85%, 350px);
    aspect-ratio: 0.69;

    margin-left: 0;

    container-type: inline-size;

    filter: drop-shadow(0 14px 24px rgb(0 0 0 / 30%));
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
    font-size: clamp(10px, 4.8cqi, 16px);
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
    font-size: clamp(8px, 4cqi, 14px);
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
        inset 0 -5px 8px rgb(0 8 20 / 75%),
        0 1px 3px rgb(0 0 0 / 60%);

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
        inset 0 -5px 8px rgb(35 0 18 / 75%),
        0 1px 3px rgb(0 0 0 / 60%);

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
        inset 0 -5px 8px rgb(0 18 20 / 75%),
        0 1px 3px rgb(0 0 0 / 60%);

      -webkit-text-stroke-color: #07584f;
    }
  }

  &__content {
    position: relative;
    z-index: 3;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    min-width: 0;
    min-height: 470px;
  }

  &__main {
    flex: 1 1 auto;
  }

  &__title {
    @include adaptiveValue('font-size', 32, 24);
    @include adaptiveValue('margin-bottom', 34, 20);

    margin-top: 0;

    color: var(--secondary-color);
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 120%;
    text-align: left;
    text-transform: none;
  }
  &__stats {
    display: grid;
    gap: 35px;
    grid-template-columns: 1fr 1fr;

    margin-bottom: 25px;
  }

  &__stats-column {
    display: flex;
    flex-direction: column;
    gap: 18px;

    min-width: 0;
  }

  &__stats-item {
    display: grid;
    align-items: start;
    gap: 12px;
    grid-template-columns: 75px minmax(0, 1fr);

    min-width: 0;
  }

  &__stats-label {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    line-height: 150%;
  }

  &__stats-value {
    min-width: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 150%;

    overflow-wrap: anywhere;
  }

  &__description {
    padding-bottom: 26px;

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
    margin-bottom: 12px;
  }

  &__description-content {
    max-width: 580px;

    color: var(--primary-color);

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
    gap: 25px;

    padding-top: 25px;

    border-top: 1px solid var(--border-secondary-color);
  }

  &__tabs {
    display: flex;
    align-items: center;
  }

  &__tab {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 140px;
    min-height: 42px;

    padding: 10px 20px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 5px;
    background: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;

    &_active {
      border-color: #6752b5;
      background: #6752b5;
    }
  }

  &__sale-controls {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;

    width: 100%;
  }

  &__price-box,
  &__quantity-box {
    display: flex;
    flex-direction: column;
    gap: 12px;

    min-width: 0;
  }

  &__price-box {
    flex: 1 1 auto;
  }

  &__quantity-box {
    flex: 0 0 auto;
  }

  &__price-value {
    display: flex;
    align-items: center;

    min-height: 40px;
  }

  &__quantity {
    display: flex;
    align-items: stretch;

    width: fit-content;
    height: 40px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 5px;
    background: var(--bg-fourth-color);
  }

  &__quantity-button {
    display: flex;
    flex: 0 0 30px;
    align-items: center;
    justify-content: center;

    width: 30px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--hint-secondary-color);
    font-family: var(--font-inter);
    font-size: 21px;
    font-weight: 300;

    cursor: pointer;

    transition:
      color 0.2s ease,
      opacity 0.2s ease;

    &:disabled {
      opacity: 0.3;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--primary-color);
      }
    }
  }

  &__quantity-input {
    width: 30px;

    padding: 0;

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

  &__sell-button {
    flex: 0 0 170px;

    width: 170px;
    min-height: 42px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__sale-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 20px;

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 150%;

    strong {
      color: var(--primary-color);
      font-weight: 600;
    }
  }

  &__total {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__total-value {
    display: flex;
    align-items: center;
  }

  &__rented {
    padding-top: 20px;

    border-top: 1px solid var(--border-secondary-color);

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 14px;
  }

  &__button-loader {
    display: inline-block;

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

    min-height: 0;

    &__preview {
      min-height: 400px;
    }

    &__card {
      width: min(85%, 285px);
    }

    &__content {
      min-height: 410px;
    }

    &__stats {
      gap: 15px;
    }

    &__stats-item {
      gap: 8px;
      grid-template-columns: 65px minmax(0, 1fr);
    }

    &__sale-controls {
      flex-wrap: wrap;
    }

    &__sell-button {
      flex: 1 1 100%;

      width: 100%;
    }
  }

  @media (max-width: $md4) {
    gap: 25px;
    grid-template-columns: minmax(0, 1fr);

    &__preview {
      justify-content: center;

      height: min(80vw, 450px);
      min-height: 0;
    }

    &__card {
      width: min(65%, 300px);
    }

    &__content {
      min-height: 0;
    }

    &__title {
      text-align: center;
    }
  }

  @media (max-width: $md6) {
    &__preview {
      height: min(95vw, 380px);
    }

    &__card {
      width: min(75%, 255px);
    }

    &__stats {
      gap: 15px;
    }

    &__stats-column {
      gap: 14px;
    }

    &__stats-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    &__sale-controls {
      gap: 18px;
    }

    &__price-box {
      flex: 1 1 130px;
    }

    &__sell-button {
      flex: 1 1 100%;

      width: 100%;
    }

    &__sale-info {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: $md7) {
    &__preview {
      height: min(100vw, 330px);
    }

    &__card {
      width: min(78%, 225px);
    }
  }
  @media (max-width: $md4) {
    gap: 35px;
    grid-template-columns: minmax(0, 1fr);

    min-height: 0;

    &__preview {
      justify-content: center;

      width: 100%;
      min-height: 0;

      padding: 10px 0;
    }

    &__hero {
      top: 50%;
      right: 52%;

      width: min(48vw, 290px);
      height: 110%;
    }

    &__card {
      width: min(65vw, 320px);

      margin-right: auto;
      margin-left: auto;
    }

    &__content {
      min-height: 0;
    }

    &__title {
      text-align: center;
    }

    &__sale {
      gap: 20px;
    }
  }

  @media (max-width: $md6) {
    gap: 25px;

    &__hero {
      right: 55%;

      width: min(50vw, 220px);
    }

    &__card {
      width: min(70vw, 280px);
    }

    &__stats {
      gap: 15px;
    }

    &__stats-column {
      gap: 14px;
    }

    &__stats-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    &__sale-controls {
      gap: 18px;
    }

    &__price-box {
      flex: 1 1 130px;
    }

    &__quantity-box {
      flex: 0 0 auto;
    }

    &__sell-button {
      flex: 1 1 100%;

      width: 100%;
    }

    &__sale-info {
      flex-direction: column;
      align-items: flex-start;
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
