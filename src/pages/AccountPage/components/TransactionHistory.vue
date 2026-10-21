<template>
  <div class="transaction-history">
    <h2 class="transaction-history__title">
      {{ $t('Transaction History') }}
    </h2>

    <div
      v-if="isUsingCachedData"
      class="transaction-history__notice"
      role="status"
    >
      <span class="transaction-history__notice-text">
        {{
          $t(
            'The latest transaction data is unavailable. Previously loaded data is displayed.',
          )
        }}
      </span>

      <button
        type="button"
        class="transaction-history__notice-retry"
        :disabled="isLoading"
        @click="fetchTransactions"
      >
        {{ isLoading ? $t('Loading...') : $t('Refresh') }}
      </button>
    </div>

    <div class="transaction-history__panel">
      <div
        v-if="isLoading && !transactions.length"
        class="transaction-history__state"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingSpinner />
      </div>

      <div
        v-else-if="error && !transactions.length"
        class="transaction-history__state"
        role="alert"
      >
        <h3 class="transaction-history__state-title">
          {{ $t('Unable to load transactions') }}
        </h3>

        <p class="transaction-history__state-text">
          {{ error }}
        </p>

        <BaseButton
          type="button"
          variant="hint-bordered"
          :disabled="isLoading"
          @click="fetchTransactions"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else-if="!transactions.length" class="transaction-history__state">
        <h3 class="transaction-history__state-title">
          {{ $t('No transactions found') }}
        </h3>

        <p class="transaction-history__state-text">
          {{ $t('Your transactions will appear here.') }}
        </p>
      </div>

      <template v-else>
        <table class="transaction-history__table">
          <colgroup>
            <col class="transaction-history__col-id" />
            <col class="transaction-history__col-date" />
            <col class="transaction-history__col-type" />
            <col class="transaction-history__col-total" />
            <col class="transaction-history__col-status" />
          </colgroup>

          <thead class="transaction-history__head">
            <tr>
              <th scope="col">{{ $t('ID') }}</th>
              <th scope="col">{{ $t('Date') }}</th>
              <th scope="col">{{ $t('Type') }}</th>
              <th scope="col">{{ $t('Total') }}</th>
              <th scope="col">{{ $t('Status') }}</th>
            </tr>
          </thead>

          <tbody class="transaction-history__body">
            <tr
              v-for="(transaction, index) in paginatedTransactions"
              :key="`${transaction.id}-${index}`"
              class="transaction-history__row"
            >
              <td
                class="transaction-history__cell transaction-history__cell_id"
                :data-label="$t('ID')"
              >
                <span class="transaction-history__id">
                  #{{ transaction.id }}
                </span>
              </td>

              <td
                class="transaction-history__cell transaction-history__cell_date"
                :data-label="$t('Date')"
              >
                <div class="transaction-history__date">
                  <span class="transaction-history__date-day">
                    {{ formatDate(transaction.created_at, 'DD.MM.YYYY') }}
                  </span>

                  <span class="transaction-history__date-time">
                    {{ formatDate(transaction.created_at, 'HH:mm') }}
                  </span>
                </div>
              </td>

              <td
                class="transaction-history__cell transaction-history__cell_type"
                :data-label="$t('Type')"
              >
                <div class="transaction-history__type">
                  <span class="transaction-history__type-name">
                    {{ formatText(transaction.description) }}
                  </span>

                  <span
                    v-if="transaction.paymentType"
                    class="transaction-history__type-method"
                  >
                    {{ formatText(transaction.paymentType) }}
                  </span>
                </div>
              </td>

              <td
                class="transaction-history__cell transaction-history__cell_total"
                :data-label="$t('Total')"
              >
                <span class="transaction-history__amount">
                  {{ formatTransactionAmount(transaction) }}
                </span>
              </td>

              <td
                class="transaction-history__cell transaction-history__cell_status"
                :data-label="$t('Status')"
              >
                <span
                  class="transaction-history__status"
                  :class="statusClass(transaction.status)"
                >
                  {{ formatStatus(transaction.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="totalPages > 1" class="transaction-history__pagination">
          <Pagination
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
import Pagination from '@/components/PaginationComponent.vue'
import axios from '@/plugins/axios'
import { useCurrencyStore } from '@/stores/currency'
import { formatDate } from '@/utils/formatters'

const currencyStore = useCurrencyStore()

const transactions = ref([])
const isLoading = ref(false)
const isUsingCachedData = ref(false)
const error = ref(null)
const currentPage = ref(1)

const itemsPerPage = 7

let latestRequestId = 0

const cacheKey = computed(() => {
  return `transaction-history:${currencyStore.currentCurrencyCode}`
})

const isObject = value => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const getCurrencyCode = transaction => {
  if (isObject(transaction.currency)) {
    return transaction.currency.code || currencyStore.currentCurrencyCode
  }

  return (
    transaction.currency_code ||
    transaction.currency ||
    currencyStore.currentCurrencyCode
  )
}

const getCurrencySymbol = transaction => {
  if (isObject(transaction.currency)) {
    return transaction.currency.symbol || currencyStore.currentCurrencySymbol
  }

  return transaction.currency_symbol || currencyStore.currentCurrencySymbol
}

const normalizeTransaction = transaction => {
  return {
    id:
      transaction.id ??
      transaction.transaction_id ??
      transaction.provider_transaction_id ??
      crypto.randomUUID(),

    created_at: transaction.created_at ?? transaction.completed_at ?? null,

    description:
      transaction.operation || transaction.description || 'Top up balance',

    price: Number(
      transaction.price ??
        transaction.internal_currency_sum ??
        transaction.amount_in_game_currency ??
        transaction.amount ??
        0,
    ),

    paymentType:
      transaction.payment_type ||
      transaction.payment_method ||
      transaction.payment_provider ||
      '',

    currencyCode: getCurrencyCode(transaction),
    currencySymbol: getCurrencySymbol(transaction),

    status: transaction.status || '',
  }
}

const saveTransactionsToCache = value => {
  try {
    localStorage.setItem(cacheKey.value, JSON.stringify(value))
  } catch (cacheError) {
    console.warn('Unable to cache transactions:', cacheError)
  }
}

const loadTransactionsFromCache = () => {
  try {
    const cachedValue = localStorage.getItem(cacheKey.value)

    if (!cachedValue) {
      return []
    }

    const parsedValue = JSON.parse(cachedValue)

    return Array.isArray(parsedValue) ? parsedValue : []
  } catch (cacheError) {
    console.warn('Unable to read cached transactions:', cacheError)

    return []
  }
}

const getRequestErrorMessage = requestError => {
  const serverMessage = requestError.response?.data?.message

  if (
    typeof serverMessage === 'string' &&
    serverMessage.includes('Attempt to read property "code" on string')
  ) {
    return 'Transaction history is temporarily unavailable because the server returned invalid currency data.'
  }

  return (
    serverMessage ||
    requestError.message ||
    'Unable to load transaction history.'
  )
}

const fetchTransactions = async () => {
  const requestId = ++latestRequestId

  isLoading.value = true
  error.value = null
  isUsingCachedData.value = false

  try {
    const response = await axios.get('/transactions')

    if (requestId !== latestRequestId) {
      return
    }

    const responseData = response.data?.data

    if (!Array.isArray(responseData)) {
      throw new Error('Invalid transactions response')
    }

    const normalizedTransactions = responseData.map(normalizeTransaction)

    transactions.value = normalizedTransactions
    currentPage.value = 1
    isUsingCachedData.value = false

    saveTransactionsToCache(normalizedTransactions)
  } catch (requestError) {
    if (requestId !== latestRequestId) {
      return
    }

    console.error('Error fetching transactions:', requestError)

    error.value = getRequestErrorMessage(requestError)

    const cachedTransactions = loadTransactionsFromCache()

    if (cachedTransactions.length) {
      transactions.value = cachedTransactions
      isUsingCachedData.value = true
      error.value = null
    } else {
      transactions.value = []
      isUsingCachedData.value = false
    }
  } finally {
    if (requestId === latestRequestId) {
      isLoading.value = false
    }
  }
}

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

const sortedTransactions = computed(() => {
  return [...transactions.value].sort((firstTransaction, secondTransaction) => {
    return (
      getTimestamp(secondTransaction.created_at) -
      getTimestamp(firstTransaction.created_at)
    )
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedTransactions.value.length / itemsPerPage))
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage

  return sortedTransactions.value.slice(start, start + itemsPerPage)
})

const formatTransactionAmount = transaction => {
  const amount = Number(transaction.price)

  if (!Number.isFinite(amount)) {
    return currencyStore.formatPrice(0)
  }

  const currencyCode =
    transaction.currencyCode || currencyStore.currentCurrencyCode

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (formatError) {
    const currencySymbol =
      transaction.currencySymbol || currencyStore.currentCurrencySymbol

    return `${currencySymbol}${amount.toFixed(2)}`
  }
}

const normalizeStatus = status => {
  return String(status ?? '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll('-', '_')
}

const statusClass = status => {
  const normalizedStatus = normalizeStatus(status)

  if (
    [
      'success',
      'successful',
      'completed',
      'accepted',
      'paid',
      'approved',
    ].includes(normalizedStatus)
  ) {
    return 'transaction-history__status_success'
  }

  if (
    [
      'error',
      'failed',
      'rejected',
      'cancelled',
      'canceled',
      'declined',
    ].includes(normalizedStatus)
  ) {
    return 'transaction-history__status_error'
  }

  if (
    ['pending', 'processing', 'in_process', 'created'].includes(
      normalizedStatus,
    )
  ) {
    return 'transaction-history__status_pending'
  }

  return 'transaction-history__status_default'
}

const formatText = value => {
  if (!value) {
    return ''
  }

  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

const formatStatus = status => {
  return formatText(status) || '—'
}

watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

watch(
  () => currencyStore.currentCurrencyCode,
  (newCurrencyCode, oldCurrencyCode) => {
    if (oldCurrencyCode && newCurrencyCode !== oldCurrencyCode) {
      currentPage.value = 1
      transactions.value = []
      fetchTransactions()
    }
  },
)

onMounted(fetchTransactions)
</script>

<style lang="scss" scoped>
.transaction-history {
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
    width: 12%;
  }

  &__col-date {
    width: 22%;
  }

  &__col-type {
    width: 33%;
  }

  &__col-total {
    width: 16%;
  }

  &__col-status {
    width: 17%;
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

      &:last-child {
        padding-right: 0;

        text-align: right;
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

    &_status {
      padding-right: 0;

      text-align: right;
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

  &__type {
    display: flex;
    flex-direction: column;
    gap: 3px;

    min-width: 0;
  }

  &__type-name {
    color: var(--primary-color);
    font-size: 12px;
    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  &__type-method {
    color: var(--secondary-color);
    font-size: 10px;
    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  &__amount {
    display: inline-block;

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
    background: rgb(25 22 60 / 35%);
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

  @media (max-width: $md3) {
    &__col-id {
      width: 11%;
    }

    &__col-date {
      width: 24%;
    }

    &__col-type {
      width: 30%;
    }

    &__col-total {
      width: 17%;
    }

    &__col-status {
      width: 18%;
    }

    &__head th,
    &__cell {
      padding-right: 5px;

      font-size: 11px;
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

    &__head {
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

      &_type {
        grid-column: 1 / -1;
      }

      &_status {
        text-align: left;
      }
    }

    &__date {
      gap: 5px;
    }

    &__type-name {
      font-size: 13px;
    }

    &__status {
      text-align: left;
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

    &__cell {
      font-size: 11px;
    }

    &__state {
      min-height: 220px;

      padding: 15px;
    }
  }
}
</style>
