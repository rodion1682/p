<template>
  <div class="offers-history">
    <h2 class="offers-history__title">
      {{ $t('My Offers') }}
    </h2>

    <div class="offers-history__panel">
      <div
        v-if="isLoading && !offersList.length"
        class="offers-history__state"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingSpinner />
      </div>

      <div
        v-else-if="error && !offersList.length"
        class="offers-history__state"
        role="alert"
      >
        <h3 class="offers-history__state-title">
          {{ $t('Unable to load offers') }}
        </h3>

        <p class="offers-history__state-text">
          {{ error }}
        </p>

        <BaseButton
          type="button"
          variant="hint-bordered"
          :disabled="isLoading"
          @click="fetchOffers"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else-if="!offersList.length" class="offers-history__state">
        <h3 class="offers-history__state-title">
          {{ $t('No offers found') }}
        </h3>

        <p class="offers-history__state-text">
          {{ $t('Offers created for your cards will appear here.') }}
        </p>
      </div>

      <template v-else>
        <div v-if="error" class="offers-history__notice" role="status">
          <span class="offers-history__notice-text">
            {{ error }}
          </span>

          <button
            type="button"
            class="offers-history__notice-retry"
            :disabled="isLoading"
            @click="fetchOffers"
          >
            {{ isLoading ? $t('Loading...') : $t('Refresh') }}
          </button>
        </div>

        <table class="offers-history__table">
          <colgroup>
            <col class="offers-history__col-id" />
            <col class="offers-history__col-date" />
            <col class="offers-history__col-item" />
            <col class="offers-history__col-amount" />
            <col class="offers-history__col-status" />
            <col class="offers-history__col-action" />
          </colgroup>

          <thead class="offers-history__head">
            <tr>
              <th scope="col">{{ $t('ID') }}</th>
              <th scope="col">{{ $t('Date') }}</th>
              <th scope="col">{{ $t('Item') }}</th>
              <th scope="col">{{ $t('Amount') }}</th>
              <th scope="col">{{ $t('Status') }}</th>
              <th scope="col">
                <span class="offers-history__visually-hidden">
                  {{ $t('Actions') }}
                </span>
              </th>
            </tr>
          </thead>

          <tbody class="offers-history__body">
            <tr
              v-for="(offer, index) in paginatedOffers"
              :key="`${offer.id}-${index}`"
              class="offers-history__row"
            >
              <td
                class="offers-history__cell offers-history__cell_id"
                :data-label="$t('ID')"
              >
                <span class="offers-history__id"> #{{ offer.id }} </span>
              </td>

              <td
                class="offers-history__cell offers-history__cell_date"
                :data-label="$t('Date')"
              >
                <div class="offers-history__date">
                  <span class="offers-history__date-day">
                    {{ formatDate(offer.created_at, 'DD.MM.YYYY') }}
                  </span>

                  <span class="offers-history__date-time">
                    {{ formatDate(offer.created_at, 'HH:mm') }}
                  </span>
                </div>
              </td>

              <td
                class="offers-history__cell offers-history__cell_item"
                :data-label="$t('Item')"
              >
                <div class="offers-history__item">
                  <div
                    v-if="getOfferImage(offer)"
                    class="offers-history__item-image"
                  >
                    <img
                      :src="getOfferImage(offer)"
                      :alt="getOfferName(offer)"
                      loading="lazy"
                    />
                  </div>

                  <div class="offers-history__item-info">
                    <span class="offers-history__item-title">
                      {{ getOfferName(offer) }}
                    </span>

                    <span
                      v-if="getOfferMeta(offer)"
                      class="offers-history__item-meta"
                    >
                      {{ getOfferMeta(offer) }}
                    </span>
                  </div>
                </div>
              </td>

              <td
                class="offers-history__cell offers-history__cell_amount"
                :data-label="$t('Amount')"
              >
                <PriceFormatter
                  :price="getOfferPrice(offer)"
                  class="offers-history__price"
                />
              </td>

              <td
                class="offers-history__cell offers-history__cell_status"
                :data-label="$t('Status')"
              >
                <span
                  class="offers-history__status"
                  :class="statusClass(offer.status)"
                >
                  {{ formatStatus(offer.status) }}
                </span>
              </td>

              <td
                class="offers-history__cell offers-history__cell_action"
                :data-label="$t('Actions')"
              >
                <BaseButton
                  v-if="canCancelOffer(offer)"
                  type="button"
                  variant="hint-bordered"
                  class="offers-history__cancel"
                  :disabled="isOfferCanceling(offer.id)"
                  @click="cancelOffer(offer.id)"
                >
                  <span
                    v-if="isOfferCanceling(offer.id)"
                    class="offers-history__button-loader"
                    aria-hidden="true"
                  />

                  <template v-else>
                    {{ $t('Cancel') }}
                  </template>
                </BaseButton>

                <span
                  v-else
                  class="offers-history__no-action"
                  aria-hidden="true"
                >
                  —
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="totalPages > 1" class="offers-history__pagination">
          <PaginationComponent
            v-model:current-page="currentPage"
            :total-pages="totalPages"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { formatDate } from '@/utils/formatters'

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const offerFlowStore = useOfferFlowStore()
const toast = useToast()

const isLoading = ref(false)
const error = ref('')
const currentPage = ref(1)
const cancelingOfferId = ref(null)

const itemsPerPage = 7

const offersList = computed(() => {
  const offers = offerFlowStore.getOffers

  return Array.isArray(offers) ? offers : []
})

const getTimestamp = value => {
  if (!value) {
    return 0
  }

  if (typeof value === 'number') {
    return value < 1000000000000 ? value * 1000 : value
  }

  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}

const sortedOffers = computed(() => {
  return [...offersList.value].sort((firstOffer, secondOffer) => {
    return (
      getTimestamp(secondOffer.created_at) - getTimestamp(firstOffer.created_at)
    )
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedOffers.value.length / itemsPerPage))
})

const paginatedOffers = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage

  return sortedOffers.value.slice(startIndex, startIndex + itemsPerPage)
})

const resolveImageUrl = image => {
  if (!image || typeof image !== 'string') {
    return ''
  }

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image
  }

  if (!STATIC_DOMAIN) {
    return image
  }

  const domain = STATIC_DOMAIN.replace(/\/$/, '')
  const path = image.startsWith('/') ? image : `/${image}`

  return `${domain}${path}`
}

const getOfferImage = offer => {
  const image =
    offer?.card?.image ??
    offer?.item?.image ??
    offer?.item?.img ??
    offer?.image ??
    offer?.img_url ??
    ''

  return resolveImageUrl(image)
}

const getOfferName = offer => {
  return (
    offer?.card_name ??
    offer?.card?.name ??
    offer?.item?.name ??
    offer?.item?.title ??
    offer?.title ??
    'Unknown Card'
  )
}

const formatValue = value => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return String(value)
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

const getOfferMeta = offer => {
  const card = offer?.card ?? offer?.item ?? {}

  return [
    card?.rarity ?? offer?.rarity,
    card?.type ?? offer?.card_type ?? offer?.item_type,
  ]
    .filter(Boolean)
    .map(formatValue)
    .join(' · ')
}

const getOfferPrice = offer => {
  const price = offer?.sale_price ?? offer?.price ?? offer?.amount ?? 0

  const number = Number(price)

  return Number.isFinite(number) ? number : 0
}

const normalizeStatus = status => {
  return String(status || '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll('-', '_')
}

const formatStatus = status => {
  const normalized = normalizeStatus(status)

  return normalized ? formatValue(normalized) : '—'
}

const statusClass = status => {
  const normalized = normalizeStatus(status)

  if (
    [
      'approved',
      'accepted',
      'completed',
      'success',
      'successful',
      'sold',
      'paid',
    ].includes(normalized)
  ) {
    return 'offers-history__status_success'
  }

  if (
    ['pending', 'offer', 'processing', 'in_process', 'created'].includes(
      normalized,
    )
  ) {
    return 'offers-history__status_pending'
  }

  if (
    [
      'error',
      'failed',
      'rejected',
      'declined',
      'cancelled',
      'canceled',
      'expired',
    ].includes(normalized)
  ) {
    return 'offers-history__status_error'
  }

  return 'offers-history__status_default'
}

const canCancelOffer = offer => {
  return normalizeStatus(offer?.status) === 'pending'
}

const isOfferCanceling = offerId => {
  return String(cancelingOfferId.value) === String(offerId)
}

const fetchOffers = async () => {
  isLoading.value = true
  error.value = ''

  try {
    await offerFlowStore.fetchOffers()
  } catch (requestError) {
    console.error('Failed to fetch offers:', requestError)

    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Failed to load offers'
  } finally {
    isLoading.value = false
  }
}

const cancelOffer = async offerId => {
  if (
    offerId === null ||
    offerId === undefined ||
    cancelingOfferId.value !== null
  ) {
    return
  }

  cancelingOfferId.value = offerId

  try {
    const response = await offerFlowStore.cancelOffer(offerId)

    if (!response) {
      throw new Error('Failed to cancel offer')
    }

    toast.success('Offer canceled successfully')

    await fetchOffers()
  } catch (requestError) {
    console.error('Failed to cancel offer:', requestError)

    toast.error(
      requestError?.response?.data?.message ||
        requestError?.message ||
        'Failed to cancel offer',
    )
  } finally {
    cancelingOfferId.value = null
  }
}

watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

onMounted(fetchOffers)
</script>

<style lang="scss" scoped>
.offers-history {
  width: 100%;
  min-width: 0;

  &__title {
    @include adaptiveValue('font-size', 24, 20);
    @include adaptiveValue('margin-bottom', 24, 18);

    margin-top: 0;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 1.25;
    text-transform: none;
  }

  &__panel {
    width: 100%;
    min-width: 0;

    @media (min-width: $md5) {
      @include adaptiveValue('padding-top', 18, 12);
      @include adaptiveValue('padding-right', 38, 14);
      @include adaptiveValue('padding-bottom', 20, 14);
      @include adaptiveValue('padding-left', 38, 14);

      border: 1px solid var(--border-fourth-color);
      border-radius: 10px;
      background: rgb(25 22 60 / 35%);
    }
  }

  &__table {
    width: 100%;
    min-width: 0;

    border-collapse: collapse;
    table-layout: fixed;
  }

  &__col-id {
    width: 9%;
  }

  &__col-date {
    width: 19%;
  }

  &__col-item {
    width: 29%;
  }

  &__col-amount {
    width: 15%;
  }

  &__col-status {
    width: 15%;
  }

  &__col-action {
    width: 13%;
  }

  &__head {
    th {
      @include adaptiveValue('padding-bottom', 14, 10);

      padding-right: 8px;
      padding-left: 0;

      border-bottom: 1px solid var(--border-priamry-color);

      color: var(--secondary-color);
      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.4;
      text-align: left;

      &:nth-last-child(-n + 2) {
        text-align: right;
      }

      &:last-child {
        padding-right: 0;
      }
    }
  }

  &__row {
    border-bottom: 1px dashed var(--border-priamry-color);

    transition: background-color 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: rgb(143 110 226 / 6%);
      }
    }
  }

  &__cell {
    @include adaptiveValue('padding-top', 14, 11);
    @include adaptiveValue('padding-bottom', 14, 11);

    min-width: 0;

    padding-right: 8px;
    padding-left: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.45;
    text-align: left;

    overflow-wrap: anywhere;
    vertical-align: middle;

    &_status,
    &_action {
      text-align: right;
    }

    &_action {
      padding-right: 0;
    }
  }

  &__id {
    color: #f4d8c5;
    font-weight: 400;
  }

  &__date {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px;
  }

  &__date-day {
    color: var(--primary-color);
    white-space: nowrap;
  }

  &__date-time {
    color: var(--secondary-color);
    font-size: 12px;
    white-space: nowrap;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;

    min-width: 0;
  }

  &__item-image {
    @include adaptiveValue('width', 42, 34);

    overflow: hidden;
    flex: 0 0 auto;

    aspect-ratio: 1;

    border: 1px solid var(--border-fourth-color);
    border-radius: 5px;
    background: var(--bg-nineth-color);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__item-info {
    display: flex;
    flex-direction: column;
    gap: 3px;

    min-width: 0;
  }

  &__item-title {
    color: var(--primary-color);
    font-size: 12px;
    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  &__item-meta {
    color: var(--secondary-color);
    font-size: 10px;
    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  &__price {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    max-width: 100%;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.45;

    overflow-wrap: anywhere;
  }

  &__status {
    display: inline-block;

    max-width: 100%;

    color: var(--primary-color);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
    text-align: right;

    overflow-wrap: anywhere;

    &_success {
      color: var(--primary-color);
    }

    &_error {
      color: var(--error-color);
    }

    &_pending {
      color: var(--pending-color);
    }

    &_default {
      color: var(--secondary-color);
    }
  }

  &__cancel {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;
    min-height: 32px;

    margin-left: auto;

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;
  }

  &__no-action {
    color: var(--secondary-color);
  }

  &__button-loader {
    width: 15px;
    height: 15px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: offers-history-spin 0.7s linear infinite;

    border-top-color: transparent;
  }

  &__pagination {
    @include adaptiveValue('padding-top', 20, 16);

    display: flex;
    justify-content: flex-end;

    width: 100%;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    min-height: 340px;

    padding: 20px;

    text-align: center;
  }

  &__state-title {
    margin: 0;

    color: #f4d8c5;
    font-family: var(--font-spectral);
    font-size: 22px;
    font-weight: 500;
    line-height: 1.3;
  }

  &__state-text {
    max-width: 420px;

    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 1.5;
  }

  &__notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;

    margin-bottom: 16px;
    padding: 12px 14px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 8px;
    background: var(--bg-nineth-color);
  }

  &__notice-text {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
  }

  &__notice-retry {
    flex: 0 0 auto;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--hint-secondary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;

    cursor: pointer;

    transition: opacity 0.2s ease;

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        opacity: 0.7;
      }
    }
  }

  &__visually-hidden {
    position: absolute;

    overflow: hidden;

    width: 1px;
    height: 1px;

    margin: -1px;
    padding: 0;

    border: 0;

    white-space: nowrap;

    clip: rect(0 0 0 0);
    clip-path: inset(50%);
  }

  @media (max-width: $md3) {
    &__col-id {
      width: 9%;
    }

    &__col-date {
      width: 21%;
    }

    &__col-item {
      width: 25%;
    }

    &__col-amount {
      width: 16%;
    }

    &__col-status {
      width: 16%;
    }

    &__col-action {
      width: 13%;
    }

    &__head th,
    &__cell {
      padding-right: 5px;

      font-size: 11px;
    }

    &__item {
      gap: 6px;
    }

    &__cancel {
      font-size: 10px;
    }
  }

  @media (max-width: $md4) {
    &__table,
    &__body,
    &__row {
      display: block;

      width: 100%;
      min-width: 0;
    }

    &__head,
    &__table colgroup {
      display: none;
    }

    &__body {
      display: grid;
      gap: 12px;
    }

    &__row {
      display: grid;
      gap: 14px 12px;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      padding: 16px;

      border: 1px solid var(--border-fourth-color);
      border-radius: 8px;
      background: var(--bg-nineth-color);
    }

    &__cell {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;

      width: 100%;
      min-width: 0;

      padding: 0;

      font-size: 12px;
      text-align: left;

      &::before {
        display: block;

        color: var(--secondary-color);
        font-family: var(--font-inter);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.4;

        content: attr(data-label);
      }

      &_item {
        grid-column: 1 / -1;
      }

      &_status,
      &_action {
        text-align: left;
      }
    }

    &__date {
      gap: 5px;
    }

    &__item-title {
      font-size: 13px;
    }

    &__status {
      text-align: left;
    }

    &__cancel {
      width: min(100%, 140px);
      min-height: 34px;

      margin-left: 0;

      font-size: 11px;
    }

    &__pagination {
      justify-content: center;
    }

    &__state {
      min-height: 260px;
    }

    &__notice {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: $md6) {
    &__row {
      gap: 12px 10px;

      padding: 12px;
    }

    &__date {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }

    &__item-image {
      width: 36px;
    }

    &__cell {
      font-size: 11px;
    }

    &__state {
      min-height: 220px;

      padding: 15px;
    }
  }
}

@keyframes offers-history-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
