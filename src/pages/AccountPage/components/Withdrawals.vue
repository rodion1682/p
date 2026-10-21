<template>
  <div class="withdrawals-history">
    <div class="withdrawals-history__heading">
      <div class="withdrawals-history__heading-text">
        <h2 class="withdrawals-history__subtitle _h4">
          {{ $t('Withdrawals') }}
        </h2>

      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="withdrawals-history__box withdrawals-history__loading"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        v-for="item in itemsPerPage"
        :key="item"
        class="withdrawals-history__skeleton"
      >
        <span class="withdrawals-history__skeleton-line" />
        <span class="withdrawals-history__skeleton-line" />
        <span class="withdrawals-history__skeleton-line" />
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="withdrawals-history__box withdrawals-history__empty"
    >
      <div class="withdrawals-history__empty-title _h3">
        {{ $t('Unable to load withdrawals') }}
      </div>

      <p class="withdrawals-history__empty-text">
        {{ error }}
      </p>

      <BaseButton
        type="button"
        variant="bordered"
        class="withdrawals-history__empty-button"
        @click="fetchWithdrawals"
      >
        {{ $t('Try again') }}
      </BaseButton>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!withdrawalsList.length"
      class="withdrawals-history__box withdrawals-history__empty"
    >
      <div class="withdrawals-history__empty-title _h3">
        {{ $t('No withdrawals found') }}
      </div>

      <p class="withdrawals-history__empty-text">
        {{ $t('Your withdrawal requests will appear here.') }}
      </p>

      <BaseButton
        v-if="withdrawalsEnabled && hasAvailablePayoutMethod"
        type="button"
        class="withdrawals-history__empty-button"
        @click="openWithdrawalRequest"
      >
        {{ $t('Request withdrawal') }}
      </BaseButton>
    </div>

    <!-- Withdrawals -->
    <div v-else class="withdrawals-history__box">
      <table class="withdrawals-history__table">
        <colgroup>
          <col
            class="withdrawals-history__column withdrawals-history__column_id"
          />
          <col
            class="withdrawals-history__column withdrawals-history__column_date"
          />
          <col
            class="withdrawals-history__column withdrawals-history__column_amount"
          />
          <col
            class="withdrawals-history__column withdrawals-history__column_status"
          />
          <col
            class="withdrawals-history__column withdrawals-history__column_action"
          />
        </colgroup>

        <thead class="withdrawals-history__head">
          <tr class="withdrawals-history__row withdrawals-history__row_head">
            <th class="withdrawals-history__header">
              {{ $t('ID') }}
            </th>

            <th class="withdrawals-history__header">
              {{ $t('Date') }}
            </th>

            <th
              class="withdrawals-history__header withdrawals-history__header_amount"
            >
              {{ $t('Amount') }}
            </th>

            <th
              class="withdrawals-history__header withdrawals-history__header_status"
            >
              {{ $t('Status') }}
            </th>

            <th
              class="withdrawals-history__header withdrawals-history__header_action"
            >
              <span class="withdrawals-history__visually-hidden">
                {{ $t('Actions') }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="withdrawals-history__body">
          <tr
            v-for="(withdrawal, index) in paginatedWithdrawals"
            :key="`${withdrawal.id}-${index}`"
            class="withdrawals-history__row"
          >
            <td
              class="withdrawals-history__cell withdrawals-history__cell_id"
              :data-label="$t('ID')"
            >
              <span class="withdrawals-history__value">
                #{{ withdrawal.id }}
              </span>
            </td>

            <td
              class="withdrawals-history__cell withdrawals-history__cell_date"
              :data-label="$t('Date')"
            >
              <div class="withdrawals-history__date">
                <span class="withdrawals-history__date-day">
                  {{ formatDate(withdrawal.created_at, 'DD.MM.YYYY') }}
                </span>

                <span class="withdrawals-history__date-time">
                  {{ formatDate(withdrawal.created_at, 'HH:mm') }}
                </span>
              </div>
            </td>

            <td
              class="withdrawals-history__cell withdrawals-history__cell_amount"
              :data-label="$t('Amount')"
            >
              <PriceFormatter
                :price="getWithdrawalAmount(withdrawal)"
                class="withdrawals-history__price"
              />
            </td>

            <td
              class="withdrawals-history__cell withdrawals-history__cell_status"
              :data-label="$t('Status')"
            >
              <span
                class="withdrawals-history__status"
                :class="statusClass(withdrawal.status)"
              >
                {{ formatStatus(withdrawal.status) }}
              </span>
            </td>

            <td
              class="withdrawals-history__cell withdrawals-history__cell_action"
              :data-label="$t('Actions')"
            >
              <div class="withdrawals-history__actions">
                <BaseButton
                  v-if="canCancelWithdrawal(withdrawal)"
                  type="button"
                  variant="bordered"
                  class="withdrawals-history__action-button"
                  :disabled="isWithdrawalCanceling(withdrawal.id)"
                  @click="cancelWithdrawal(withdrawal.id)"
                >
                  <span
                    v-if="isWithdrawalCanceling(withdrawal.id)"
                    class="withdrawals-history__button-loader"
                    aria-hidden="true"
                  />

                  <template v-else>{{ $t('Cancel') }}</template>
                </BaseButton>

                <BaseButton
                  v-if="canContinuePayout(withdrawal)"
                  type="button"
                  class="withdrawals-history__action-button withdrawals-history__action-button_primary"
                  :disabled="!hasAvailablePayoutMethod"
                  @click="openPayoutInformation(withdrawal)"
                >
                  {{ $t('Add payout details') }}
                </BaseButton>

                <BaseButton
                  type="button"
                  variant="bordered"
                  class="withdrawals-history__action-button"
                  :disabled="isWithdrawalCanceling(withdrawal.id)"
                  @click="openWithdrawalDetails(withdrawal)"
                >
                  {{ $t('Details') }}
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="withdrawals-history__pagination">
        <PaginationComponent
          v-model:current-page="currentPage"
          :total-pages="totalPages"
        />
      </div>
    </div>

    <!-- Reuse the existing, validated request form from My Wallet. -->
    <ContactInfoModal
      v-if="withdrawalsEnabled"
      :show="modalStore.isOpen('contactInfo')"
      @created="handleWithdrawalCreated"
      @close="closeWithdrawalRequest"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import ContactInfoModal from '@/components/modals/sellSkins/ContactInfoModal.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/formatters'

const offerFlowStore = useOfferFlowStore()
const modalStore = useModalStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const toast = useToast()

const isLoading = ref(false)
const error = ref('')
const currentPage = ref(1)
const cancelingWithdrawalId = ref(null)

const itemsPerPage = 8

const payouts = computed(() => settingsStore.settings?.payouts || {})

const withdrawalsEnabled = computed(() => Boolean(payouts.value.offer_enabled))

const hasAvailablePayoutMethod = computed(() => {
  return Boolean(
    payouts.value.payout_sepa_enabled || payouts.value.payout_card_enabled,
  )
})

const withdrawalsList = computed(() => {
  const withdrawals = offerFlowStore.getWithdrawals

  return Array.isArray(withdrawals) ? withdrawals : []
})

const sortedWithdrawals = computed(() => {
  return [...withdrawalsList.value].sort(
    (firstWithdrawal, secondWithdrawal) => {
      return (
        getTimestamp(secondWithdrawal.created_at) -
        getTimestamp(firstWithdrawal.created_at)
      )
    },
  )
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedWithdrawals.value.length / itemsPerPage))
})

const paginatedWithdrawals = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage

  const endIndex = startIndex + itemsPerPage

  return sortedWithdrawals.value.slice(startIndex, endIndex)
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

const getWithdrawalAmount = withdrawal => {
  const amount =
    withdrawal?.amount ??
    withdrawal?.sum ??
    withdrawal?.total ??
    withdrawal?.sale_price ??
    0

  const normalizedAmount = Number(amount)

  return Number.isFinite(normalizedAmount) ? normalizedAmount : 0
}

const normalizeStatus = status => {
  return String(status ?? '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll('-', '_')
}

const formatStatus = status => {
  const normalizedStatus = normalizeStatus(status)

  if (!normalizedStatus) {
    return '—'
  }

  return normalizedStatus
    .split('_')
    .filter(Boolean)
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

const statusClass = status => {
  const normalizedStatus = normalizeStatus(status)

  if (
    ['completed', 'success', 'successful', 'paid', 'withdrawn'].includes(
      normalizedStatus,
    )
  ) {
    return 'withdrawals-history__status_success'
  }

  if (['approved', 'accepted'].includes(normalizedStatus)) {
    return 'withdrawals-history__status_approved'
  }

  if (
    ['pending', 'offer', 'processing', 'in_process', 'created'].includes(
      normalizedStatus,
    )
  ) {
    return 'withdrawals-history__status_pending'
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
    ].includes(normalizedStatus)
  ) {
    return 'withdrawals-history__status_error'
  }

  return 'withdrawals-history__status_default'
}

const canCancelWithdrawal = withdrawal => {
  return normalizeStatus(withdrawal?.status) === 'pending'
}

const canContinuePayout = withdrawal => {
  return normalizeStatus(withdrawal?.status) === 'approved'
}

const isWithdrawalCanceling = withdrawalId => {
  return String(cancelingWithdrawalId.value) === String(withdrawalId)
}

const fetchWithdrawals = async () => {
  isLoading.value = true
  error.value = ''

  try {
    await offerFlowStore.fetchWithdrawals()
  } catch (requestError) {
    console.error('Failed to fetch withdrawals:', requestError)

    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Failed to load withdrawals'
  } finally {
    isLoading.value = false
  }
}

const cancelWithdrawal = async withdrawalId => {
  if (!withdrawalId || cancelingWithdrawalId.value !== null) {
    return
  }

  cancelingWithdrawalId.value = withdrawalId

  try {
    const response = await offerFlowStore.cancelWithdraw(withdrawalId)

    if (!response) {
      throw new Error('Failed to cancel withdrawal')
    }

    toast.success('Withdrawal canceled successfully')

    await Promise.all([
      offerFlowStore.fetchWithdrawals(),
      userStore.fetchProfile(),
    ])
  } catch (requestError) {
    console.error('Failed to cancel withdrawal:', requestError)

    toast.error(
      requestError?.response?.data?.message ||
        requestError?.message ||
        'Failed to cancel withdrawal',
    )
  } finally {
    cancelingWithdrawalId.value = null
  }
}

const openWithdrawalRequest = () => {
  if (!withdrawalsEnabled.value || !hasAvailablePayoutMethod.value) {
    toast.error('Withdrawals are currently unavailable')
    return
  }

  // The request form saves amount/contact information and submits
  // POST /withdrawals; it does not send money immediately.
  modalStore.open('contactInfo')
}

const closeWithdrawalRequest = () => {
  modalStore.close('contactInfo')
}

const handleWithdrawalCreated = async () => {
  // ContactInfoModal already refreshes the user's balance.
  // Update the history here once the backend confirms creation.
  currentPage.value = 1
  await fetchWithdrawals()
}

const openPayoutInformation = withdrawal => {
  if (!canContinuePayout(withdrawal)) {
    return
  }

  if (!hasAvailablePayoutMethod.value) {
    toast.error('No payout methods are currently available')
    return
  }

  const fixedMethod = String(withdrawal.payment_method || '')
    .trim()
    .toLowerCase()

  // The backend does not allow switching a payout method
  // that was specified when the withdrawal was created.
  if (fixedMethod === 'sepa' || fixedMethod === 'card') {
    const methodEnabled =
      fixedMethod === 'sepa'
        ? Boolean(payouts.value.payout_sepa_enabled)
        : Boolean(payouts.value.payout_card_enabled)

    if (!methodEnabled) {
      toast.error('The selected payout method is currently disabled')
      return
    }

    offerFlowStore.setSelectedOffer(withdrawal)
    offerFlowStore.setPaymentMethod(fixedMethod)
    offerFlowStore.setStep('payment')

    modalStore.open('payment', {
      paymentMethod: fixedMethod,
      offer: withdrawal,
      withdrawal,
    })
    return
  }

  // For requests without a fixed method, the existing method modal
  // offers only payout methods enabled by the server's settings.
  offerFlowStore.setSelectedOffer(withdrawal)
  offerFlowStore.setPaymentMethod(null)

  modalStore.open('paymentMethod', {
    offer: withdrawal,
    withdrawal,
  })
}

const openWithdrawalDetails = withdrawal => {
  if (!withdrawal) {
    return
  }

  offerFlowStore.setSelectedOffer(withdrawal)

  modalStore.open('offerDetails', {
    withdrawal,
    type: 'withdrawal',
  })
}

watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

watch(withdrawalsList, () => {
  if (currentPage.value < 1) {
    currentPage.value = 1
  }
})

onMounted(() => {
  fetchWithdrawals()
})
</script>
<style lang="scss" scoped>
.withdrawals-history {
  width: 100%;
  min-width: 0;

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__heading-text {
    min-width: 0;
  }

  &__hint {
    max-width: 550px;

    margin: 9px 0 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 155%;
  }

  &__request-button {
    flex: 0 0 auto;

    min-height: 42px;

    padding: 8px 18px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
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
      width: 9%;
    }

    &_date {
      width: 20%;
    }

    &_amount {
      width: 18%;
    }

    &_status {
      width: 18%;
    }

    &_action {
      width: 35%;
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
    .withdrawals-history__row {
      transition: background-color 0.3s ease;

      &:last-child {
        .withdrawals-history__cell {
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

  &__price {
    display: inline-flex;
    flex-direction: row-reverse;
    justify-content: flex-start;

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

    &_approved {
      color: var(--secondary-color);
    }

    &_default {
      color: var(--pending-color);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  &__action-button {
    display: inline-flex;

    width: auto;
    min-width: 90px;
    min-height: 34px;

    margin-left: 0;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;

    &_primary {
      min-width: 130px;
    }
  }

  &__button-loader {
    width: 16px;
    height: 16px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: withdrawals-history-spin 0.7s linear infinite;

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
    grid-template-columns: 15% 55% 25%;

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

    animation: withdrawals-history-skeleton 1.5s infinite linear;
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

    &__date {
      justify-content: flex-end;
    }

    &__price {
      justify-content: flex-end;

      margin-left: auto;
    }

    &__actions {
      justify-content: flex-end;
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

    &__heading {
      flex-direction: column;
      align-items: stretch;
    }

    &__request-button {
      width: 100%;
    }

    &__actions {
      flex-wrap: wrap;
    }

    &__action-button {
      flex: 0 1 auto;

      width: auto;
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

@keyframes withdrawals-history-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes withdrawals-history-skeleton {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
