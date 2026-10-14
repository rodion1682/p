<template>
  <div class="offers-history">
    <div class="offers-history__heading">
      <div class="offers-history__subtitle _h4">
        {{ $t('My Offers') }}
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="offers-history__box offers-history__loading"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        v-for="item in itemsPerPage"
        :key="item"
        class="offers-history__skeleton"
      >
        <span class="offers-history__skeleton-line" />
        <span class="offers-history__skeleton-line" />
        <span class="offers-history__skeleton-line" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="offers-history__box offers-history__empty">
      <div class="offers-history__empty-title _h3">
        {{ $t('Unable to load offers') }}
      </div>

      <p class="offers-history__empty-text">
        {{ error }}
      </p>

      <BaseButton
        type="button"
        variant="bordered"
        class="offers-history__empty-button"
        @click="fetchOffers"
      >
        {{ $t('Try again') }}
      </BaseButton>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!offersList.length"
      class="offers-history__box offers-history__empty"
    >
      <div class="offers-history__empty-title _h3">
        {{ $t('No offers found') }}
      </div>

      <p class="offers-history__empty-text">
        {{ $t('Offers created for your cards will appear here.') }}
      </p>
    </div>

    <!-- Offers table -->
    <div v-else class="offers-history__box">
      <table class="offers-history__table">
        <colgroup>
          <col class="offers-history__column offers-history__column_id" />
          <col class="offers-history__column offers-history__column_date" />
          <col class="offers-history__column offers-history__column_item" />
          <col class="offers-history__column offers-history__column_amount" />
          <col class="offers-history__column offers-history__column_status" />
          <col class="offers-history__column offers-history__column_action" />
        </colgroup>

        <thead class="offers-history__head">
          <tr class="offers-history__row offers-history__row_head">
            <th class="offers-history__header">
              {{ $t('ID') }}
            </th>

            <th class="offers-history__header">
              {{ $t('Date') }}
            </th>

            <th class="offers-history__header">
              {{ $t('Item') }}
            </th>

            <th class="offers-history__header offers-history__header_amount">
              {{ $t('Amount') }}
            </th>

            <th class="offers-history__header offers-history__header_status">
              {{ $t('Status') }}
            </th>

            <th class="offers-history__header offers-history__header_action">
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
              <span class="offers-history__value"> #{{ offer.id }} </span>
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
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
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

const itemsPerPage = 8

const offersList = computed(() => {
  const offers = offerFlowStore.getOffers

  return Array.isArray(offers) ? offers : []
})

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
  const endIndex = startIndex + itemsPerPage

  return sortedOffers.value.slice(startIndex, endIndex)
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

const resolveImageUrl = image => {
  if (!image) {
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

  if (!normalized) {
    return '—'
  }

  return normalized
    .split('_')
    .filter(Boolean)
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
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
  if (!offerId || cancelingOfferId.value !== null) {
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

watch(offersList, () => {
  if (currentPage.value < 1) {
    currentPage.value = 1
  }
})

onMounted(() => {
  fetchOffers()
})
</script>

<style lang="scss" scoped>
.offers-history {
  width: 100%;
  min-width: 0;

  &__heading {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__subtitle {
    font-weight: 400;
    text-transform: capitalize;
  }

  &__box {
    overflow: hidden;

    width: 100%;
    min-width: 0;

    @media (min-width: $md4) {
      @include adaptiveValue('padding-top', 30, 0);
      @include adaptiveValue('padding-bottom', 30, 0);
      @include adaptiveValue('padding-left', 60, 0);
      @include adaptiveValue('padding-right', 60, 0);

      border: 1px solid var(--border-sixth-color);
      background-color: var(--bg-primary-color);
    }

    @media (max-width: $md5) {
      width: auto;

      margin-right: -10px;
      margin-left: -10px;
    }
  }

  &__table {
    width: 100%;

    border-collapse: collapse;
    border-spacing: 0;

    table-layout: fixed;
  }

  &__column {
    &_id {
      width: 8%;
    }

    &_date {
      width: 16%;
    }

    &_item {
      width: 27%;
    }

    &_amount {
      width: 18%;
    }

    &_status {
      width: 17%;
    }

    &_action {
      width: 14%;
    }
  }

  &__header,
  &__cell {
    min-width: 0;

    padding: 16px clamp(8px, 1.25vw, 18px);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 120%;
    text-align: left;

    overflow-wrap: anywhere;
  }

  &__header {
    border-bottom: 1px solid var(--border-seventh-color);

    color: var(--hint-third-color);
    font-size: 12px;

    &_amount {
      text-align: left;
    }

    &_status,
    &_action {
      text-align: right;
    }
  }

  &__body {
    .offers-history__row {
      transition: background-color 0.3s ease;

      &:last-child {
        .offers-history__cell {
          border-bottom: 0;
        }
      }

      @media (any-hover: hover) {
        &:hover {
          background-color: var(--bg-fourth-color);
        }
      }
    }
  }

  &__row {
    &:not(:last-child) {
      border-bottom: 1px dashed var(--border-sixth-color);
    }
  }

  &__cell {
    color: var(--secondary-color);

    &_amount {
      text-align: left;
    }

    &_status,
    &_action {
      text-align: right;
    }
  }

  &__value {
    display: block;

    min-width: 0;

    color: var(--secondary-color);

    overflow-wrap: anywhere;
  }

  &__date {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  &__date-day {
    color: var(--primary-color);
  }

  &__date-time {
    color: var(--secondary-color);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;

    min-width: 0;
  }

  &__item-image {
    overflow: hidden;
    flex: 0 0 42px;

    width: 42px;
    aspect-ratio: 1;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-primary-color);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__item-info {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    gap: 3px;

    min-width: 0;
  }

  &__item-title {
    overflow: hidden;

    color: var(--secondary-color);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-meta {
    overflow: hidden;

    opacity: 0.6;

    color: var(--secondary-color);
    font-size: 11px;
    text-overflow: ellipsis;
    text-transform: capitalize;
    white-space: nowrap;
  }

  &__price {
    display: inline-flex;
    flex-direction: row-reverse;
    justify-content: flex-end;

    max-width: 100%;

    color: var(--primary-color);

    :deep(.price) {
      color: var(--primary-color);
    }
  }

  &__status {
    display: inline-block;

    max-width: 100%;

    font-weight: 500;
    text-transform: capitalize;

    overflow-wrap: anywhere;

    &_success {
      color: var(--success-color);
    }

    &_error {
      color: var(--error-color);
    }

    &_pending {
      color: var(--pending-color);
    }

    &_default {
      color: var(--pending-color);
    }
  }

  &__cancel {
    display: inline-flex;

    width: auto;
    min-width: 90px;
    min-height: 34px;

    margin-left: auto;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
  }

  &__button-loader {
    width: 16px;
    height: 16px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: offers-history-spin 0.7s linear infinite;

    border-top-color: transparent;
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;

    padding: 24px clamp(14px, 2vw, 30px);
  }

  &__loading {
    padding: clamp(12px, 2vw, 24px);
  }

  &__skeleton {
    display: grid;
    align-items: center;
    gap: 18px;
    grid-template-columns: 15% minmax(0, 1fr) 25%;

    min-height: 64px;

    padding: 12px;

    border-bottom: 1px dashed var(--border-secondary-color);

    &:last-child {
      border-bottom: 0;
    }
  }

  &__skeleton-line {
    height: 12px;

    background: linear-gradient(
      90deg,
      var(--bg-secondary-color) 25%,
      var(--border-fourth-color) 50%,
      var(--bg-secondary-color) 75%
    );
    background-size: 200% 100%;

    animation: offers-history-skeleton 1.5s infinite linear;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 280px;

    padding: 30px;

    text-align: center;
  }

  &__empty-title {
    color: var(--hint-primary-color);

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__empty-text {
    max-width: 440px;

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 22px;
    }
  }

  &__empty-button {
    width: min(100%, 180px);
    min-height: 40px;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
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
    &__header,
    &__cell {
      padding-right: 10px;
      padding-left: 10px;
    }

    &__column {
      &_id {
        width: 8%;
      }

      &_date {
        width: 17%;
      }

      &_item {
        width: 25%;
      }

      &_amount {
        width: 18%;
      }

      &_status {
        width: 18%;
      }

      &_action {
        width: 14%;
      }
    }
  }

  @media (max-width: $md4) {
    &__box {
      overflow: visible;

      background-color: transparent;
      box-shadow: none;
    }

    &__table,
    &__body,
    &__row,
    &__cell {
      display: block;

      width: 100%;
    }

    &__table {
      table-layout: auto;
    }

    &__head,
    &__column {
      display: none;
    }

    &__body {
      display: grid;
      gap: 12px;
    }

    &__body &__row {
      overflow: hidden;

      border: 1px solid var(--border-fourth-color);
      background-color: var(--bg-primary-color);
    }

    &__cell {
      display: grid;
      align-items: center;
      gap: 15px;
      grid-template-columns: minmax(90px, 36%) minmax(0, 1fr);

      min-height: 48px;

      padding: 12px 14px;

      border-bottom: 1px dashed var(--border-secondary-color);

      text-align: right;

      &::before {
        color: var(--hint-primary-color);
        font-size: 12px;
        font-weight: 500;
        text-align: left;
        text-transform: uppercase;

        content: attr(data-label);
      }

      &:last-child {
        border-bottom: 0;
      }
    }

    &__cell_item {
      align-items: start;
    }

    &__date {
      justify-content: flex-end;
    }

    &__item {
      justify-content: flex-end;
    }

    &__item-info {
      text-align: right;
    }

    &__item-title {
      white-space: normal;
    }

    &__price {
      justify-content: flex-end;

      margin-left: auto;
    }

    &__cancel {
      margin-left: auto;
    }

    &__pagination {
      justify-content: center;

      margin-top: 18px;
      padding: 12px 0;
    }

    &__loading,
    &__empty {
      background-color: var(--bg-third-color);
    }
  }

  @media (max-width: $md7) {
    &__heading {
      padding-right: 10px;
      padding-left: 10px;
    }

    &__cell {
      gap: 10px;
      grid-template-columns: minmax(82px, 34%) minmax(0, 1fr);

      padding: 11px 12px;
    }

    &__item-image {
      flex-basis: 36px;

      width: 36px;
    }

    &__cancel {
      width: min(100%, 140px);
      min-width: 0;
    }

    &__skeleton {
      gap: 10px;
      grid-template-columns: 20% 45% 25%;
    }

    &__empty {
      min-height: 220px;

      padding: 25px 15px;
    }

    &__empty-button {
      width: 100%;
    }
  }
}

@keyframes offers-history-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes offers-history-skeleton {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
