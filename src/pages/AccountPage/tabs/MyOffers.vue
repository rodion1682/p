<template>
  <div class="offers">
    <ProfileTableLayout
      :rows="allRows"
      :is-loading="isLoading"
      :empty-text="$t('No offers found')"
      :total-pages="totalPages"
      :current-page="currentPage"
      :expanded-row-key="openedDetailsKey"
      row-key="_key"
      total-label="Total Price"
      :show-id-column="hasIdData"
      show-status-after-id
      quantity-label="Q-ty"
      :show-skin-name="hasItemData"
      :show-quantity="hasQuantityData"
      :show-action="hasAvailableActions"
      :show-order-image="false"
      :total-as-currency="true"
      @update:current-page="onPageChange"
    >
      <template #action="{ row }">
        <BaseButton
          v-if="row.statusKey === 'counter_offer'"
          class="offers__button"
          variant="primary"
          :disabled="isSubmitting"
          :aria-expanded="openedDetailsKey === row._key"
          @click="toggleDetails(row)"
        >
          {{ $t('Offer') }}

          <SvgIcon
            :icon="ChevronDownIcon"
            class="offers__button-icon"
            :class="{
              'is-open': openedDetailsKey === row._key,
            }"
          />
        </BaseButton>

        <BaseButton
          v-else-if="row.statusKey === 'ready_for_payout'"
          class="offers__button"
          variant="primary"
          :disabled="isSubmitting"
          @click="openPayout(row)"
        >
          {{ $t('Payout') }}
        </BaseButton>
      </template>

      <template #expanded="{ row }">
        <OfferDetailsInline
          :row="row"
          :offer="openedDetailsKey === row._key ? selectedOffer : null"
          :is-loading="isDetailsLoading && openedDetailsKey === row._key"
          :is-submitting="isSubmitting"
          @accept="handleOfferAccept"
          @decline="handleOfferDecline"
        />
      </template>
    </ProfileTableLayout>

    <template v-if="isOfferEnabled">
      <ContactInfoModal
        :show="modalStore.isOpen('contactInfo')"
        @close="modalStore.close('contactInfo')"
      />

      <PaymentModal
        :show="modalStore.isOpen('payment')"
        :payment-method="modalStore.getData('payment')?.paymentMethod"
        @close="modalStore.close('payment')"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import OfferDetailsInline from '@/pages/AccountPage/components/OfferDetailsInline.vue'
import ProfileTableLayout from '@/pages/AccountPage/components/ProfileTableLayout.vue'

import ContactInfoModal from '@/components/modals/sellSkins/ContactInfoModal.vue'
import PaymentModal from '@/components/modals/sellSkins/PaymentModal.vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useToast } from '@/composables/useToast'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const toast = useToast()

const offerFlowStore = useOfferFlowStore()
const modalStore = useModalStore()
const settingsStore = useSettingsStore()

const isLoading = ref(true)
const isDetailsLoading = ref(false)
const isSubmitting = ref(false)

const currentPage = ref(1)
const openedDetailsKey = ref(null)

const isOfferEnabled = computed(() => {
  const enabled = settingsStore.settings?.offer_enabled

  return enabled === undefined ? true : Boolean(enabled)
})

const offerMeta = computed(() => offerFlowStore.offersMeta || {})

const offersList = computed(() => {
  return Array.isArray(offerFlowStore.getOffers) ? offerFlowStore.getOffers : []
})

const selectedOffer = computed(() => {
  return offerFlowStore.getSelectedOffer || null
})

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
  counter_offer: 'Offer',
  user_declined: 'Declined',
  declined_by_user: 'Declined',
  declined_by_service: 'Declined',
  awaiting_item: 'Awaiting Item',
  ready_for_payout: 'Ready for Payout',
  payout_processing: 'Payout Processing',
}

const normalizeStatus = value => {
  const status = String(value ?? '')
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  if (status === 'counteroffer') {
    return 'counter_offer'
  }

  if (status === 'offer') {
    return 'counter_offer'
  }

  if (status === 'declined') {
    return 'user_declined'
  }

  return status || 'pending'
}

const getStatusLabel = status => {
  const label = statusLabels[status]

  if (label) return t(label)

  return status
    .split('_')
    .filter(Boolean)
    .map(part => {
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}

const toTimestamp = value => {
  if (!value) return 0

  const numeric = Number(value)

  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric < 10_000_000_000 ? numeric * 1000 : numeric
  }

  const parsed = new Date(value).getTime()

  return Number.isFinite(parsed) ? parsed : 0
}

const mapOffer = (offer, index) => {
  const statusKey = normalizeStatus(offer.status)

  const items = Array.isArray(offer.items) ? offer.items : []

  const hasCounterOffer =
    offer.counter_offer_amount !== null &&
    offer.counter_offer_amount !== undefined

  const amount = hasCounterOffer
    ? offer.counter_offer_amount
    : offer.total_amount

  const numericAmount =
    amount === null || amount === undefined || amount === ''
      ? NaN
      : Number(amount)

  return {
    _key: `offer-${offer.id ?? index}`,

    id: offer.id ?? null,

    createdAt: toTimestamp(offer.created_at),

    skinItems: items.map(item => ({
      title: item.short_name || item.display_name || '',
      image: '',
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
    })),

    quantity: items.length
      ? items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
      : null,

    total: Number.isFinite(numericAmount) ? numericAmount : null,

    currency: offer.currency || 'EUR',
    currencyCode: offer.currency || 'EUR',

    status: getStatusLabel(statusKey),
    statusKey,

    _source: offer,
  }
}

const allRows = computed(() => {
  return offersList.value
    .map(mapOffer)
    .sort((a, b) => b.createdAt - a.createdAt)
})

const totalPages = computed(() => {
  return Math.max(1, Number(offerMeta.value.last_page) || 1)
})

const hasAvailableActions = computed(() => {
  return allRows.value.some(row =>
    ['counter_offer', 'ready_for_payout'].includes(row.statusKey),
  )
})

const hasIdData = computed(() => {
  return allRows.value.some(row => row.id !== null && row.id !== undefined)
})

const hasItemData = computed(() => {
  return allRows.value.some(row => row.skinItems.some(item => item.title))
})

const hasQuantityData = computed(() => {
  return allRows.value.some(
    row => row.quantity !== null && row.quantity !== undefined,
  )
})

const getTableTop = () => {
  return document.querySelector('.profile__sell-right')
}

const scrollToOffers = async () => {
  await nextTick()

  const element = getTableTop()

  if (!element) return

  const header = document.querySelector('.header')

  const headerHeight = header?.offsetHeight || 0

  const top =
    element.getBoundingClientRect().top + window.scrollY - headerHeight - 12

  window.scrollTo({
    top: Math.max(0, top),
    behavior: 'smooth',
  })
}

const setSelectedOffer = row => {
  const offer = row._source || row

  if (typeof offerFlowStore.setSelectedOffer === 'function') {
    offerFlowStore.setSelectedOffer(offer)
  } else {
    offerFlowStore.selectedOffer = offer
  }
}

const toggleDetails = async row => {
  if (isSubmitting.value) return

  if (openedDetailsKey.value === row._key) {
    openedDetailsKey.value = null
    return
  }

  openedDetailsKey.value = row._key
  setSelectedOffer(row)

  const offerId = row._source?.id

  if (offerId === null || offerId === undefined) {
    return
  }

  isDetailsLoading.value = true

  try {
    const result = await offerFlowStore.fetchOfferDetails(offerId)

    if (!result) {
      toast.error(t('Failed to fetch offer details'))
    }
  } catch (error) {
    console.error(error)
    toast.error(t('Failed to fetch offer details'))
  } finally {
    isDetailsLoading.value = false
  }
}

const openPayout = row => {
  if (isSubmitting.value) return

  openedDetailsKey.value = null

  setSelectedOffer(row)

  modalStore.open('contactInfo')
}

const refreshOffers = async () => {
  const result = await offerFlowStore.fetchOffers(currentPage.value)

  if (result?.success === false) {
    throw new Error(result.error || 'Failed to fetch offers')
  }
}

const handleOfferAccept = async () => {
  const offerId = selectedOffer.value?.id

  if (!offerId || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const success = await offerFlowStore.acceptOffer(offerId)

    if (!success) return

    openedDetailsKey.value = null

    toast.success(t('Offer accepted! Please provide your details for payout.'))

    await refreshOffers()
  } catch (error) {
    console.error(error)
    toast.error(t('Failed to accept offer'))
  } finally {
    isSubmitting.value = false
  }
}

const handleOfferDecline = async () => {
  const offerId = selectedOffer.value?.id

  if (!offerId || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const success = await offerFlowStore.declineOffer(offerId)

    if (!success) return

    openedDetailsKey.value = null

    toast.success(t('Offer declined successfully'))

    await refreshOffers()
  } catch (error) {
    console.error(error)
    toast.error(t('Failed to decline offer'))
  } finally {
    isSubmitting.value = false
  }
}

const onPageChange = async page => {
  const nextPage = Number(page)

  if (
    !Number.isInteger(nextPage) ||
    nextPage < 1 ||
    nextPage > totalPages.value
  ) {
    return
  }

  currentPage.value = nextPage
  openedDetailsKey.value = null
  isLoading.value = true

  try {
    await refreshOffers()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }

  await scrollToOffers()
}

watch(offersList, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }

  if (
    openedDetailsKey.value &&
    !allRows.value.some(row => row._key === openedDetailsKey.value)
  ) {
    openedDetailsKey.value = null
  }
})

onMounted(async () => {
  isLoading.value = true

  try {
    await refreshOffers()
  } catch (error) {
    console.error(error)
    toast.error(t('Failed to fetch offers'))
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.offers {
  width: 100%;
  min-width: 0;

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    flex: 0 1 auto;

    width: auto;
    max-width: 100%;
    min-width: 0;

    @include adaptiveValue('min-height', 32, 30);

    padding: 6px 9px;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;

    text-transform: uppercase;
    white-space: nowrap;

    gap: 6px;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--primary-color);
      }
    }
  }

  &__button-icon {
    width: 11px;
    min-width: 11px;
    height: 11px;

    transition: transform 0.3s ease;

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__action-empty {
    display: inline-block;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1;
  }

  :deep(.profile-layout__td_action) {
    min-width: 0;
    justify-content: flex-end;
  }

  :deep(.profile-layout__action) {
    min-width: 0;
    justify-content: flex-end;
  }

  @media (max-width: $md4) {
    &__button {
      min-height: 32px;
    }
  }

  @media (max-width: $md6) {
    &__button {
      padding: 7px 11px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .offers__button-icon {
    transition: none;
  }
}
</style>
