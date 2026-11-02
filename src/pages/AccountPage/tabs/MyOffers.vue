<template>
  <div class="offers">
    <ProfileTableLayout
      show-skin-name
      show-id-column
      show-quantity
      show-action
      show-items-per-page
      :rows="paginatedRows"
      :is-loading="isLoading"
      :empty-text="$t('No offers found')"
      :loading-text="`${$t('Loading')}...`"
      total-label="Price"
      :total-as-currency="false"
      :total-pages="totalPages"
      :current-page="currentPage"
      :items-per-page="itemsPerPage"
      :per-page-options="PER_PAGE_OPTIONS"
      :expanded-row-key="openedDetailsKey"
      @update:current-page="onPageChange"
      @update:items-per-page="onItemsPerPageChange"
    >
      <template #expanded="{ row }">
        <OfferDetailsInline
          :row="row"
          :offer="selectedOffer"
          :is-loading="isDetailsLoading && openedDetailsKey === row._key"
          :is-submitting="isSubmitting"
          @accept="handleOfferAccept"
          @decline="handleOfferDecline"
        />
      </template>

      <template #action="{ row }">
        <BaseButton
          v-if="row.statusKey === 'counter_offer'"
          class="offers__button offers__button_offer"
          variant="primary"
          @click="toggleDetails(row)"
        >
          {{ $t('Offer') }}

          <SvgIcon
            class="offers__button-icon"
            :class="{
              'is-open': openedDetailsKey === row._key,
            }"
            :icon="ChevronDownIcon"
          />
        </BaseButton>

        <BaseButton
          v-else-if="row.statusKey === 'ready_for_payout'"
          class="offers__button offers__button_payout"
          variant="primary"
          @click="openPayout(row)"
        >
          {{ $t('Payout') }}

          <SvgIcon class="offers__button-icon" :icon="ChevronDownIcon" />
        </BaseButton>
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
import { useRoute } from 'vue-router'

import { useToast } from '@/composables/useToast'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useSettingsStore } from '@/stores/settings'

import BaseButton from '@/components/base/BaseButton.vue'

import ContactInfoModal from '@/components/modals/sellSkins/ContactInfoModal.vue'
import PaymentModal from '@/components/modals/sellSkins/PaymentModal.vue'

import {
  ChevronDownIcon,
  ErrorIcon,
  PendingIcon,
  SuccessIcon,
} from '@/components/icons'

import SvgIcon from '@/components/icons/SvgIcon.vue'

import OfferDetailsInline from '@/pages/AccountPage/components/OfferDetailsInline.vue'
import ProfileTableLayout from '@/pages/AccountPage/components/ProfileTableLayout.vue'

const PER_PAGE_OPTIONS = [6, 12, 18]

const { t } = useI18n()
const route = useRoute()
const toast = useToast()

const offerFlowStore = useOfferFlowStore()

const modalStore = useModalStore()

const settingsStore = useSettingsStore()

const isLoading = ref(true)

const isDetailsLoading = ref(false)

const isSubmitting = ref(false)

const isSellFormVisible = ref(false)

const sellSkinFormRef = ref(null)

const openedDetailsKey = ref(null)

const currentPage = ref(1)

const itemsPerPage = ref(5)

const isOfferEnabled = computed(() => {
  const value = settingsStore?.settings?.offer_enabled

  return value === undefined ? true : !!value
})

const offersList = computed(() => {
  return offerFlowStore.getOffers || []
})

const selectedOffer = computed(() => {
  return offerFlowStore.getSelectedOffer
})

const UI_STATUS = {
  pending: 'Pending',
  counter_offer: 'Offer',
  offer: 'Offer',
  awaiting_item: 'Awaiting Item',
  ready_for_payout: 'Ready for Payout',
  payout_processing: 'Payout Processing',
  approved: 'Approved',
  completed: 'Completed',
  rejected: 'Rejected',
  user_declined: 'Declined',
  declined_by_user: 'Declined',
  declined_by_service: 'Declined',
}

const normalizeStatusKey = raw => {
  const value = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')

  if (!value) {
    return 'pending'
  }

  if (value === 'declined') {
    return 'user_declined'
  }

  if (value === 'counteroffer') {
    return 'counter_offer'
  }

  if (value === 'counter_offer') {
    return 'counter_offer'
  }

  return value
}

const normalizeOfferStatus = statusKey => {
  return UI_STATUS[statusKey] || statusKey || UI_STATUS.pending
}

const statusClassByKey = statusKey => {
  const value = String(statusKey || '')
    .toLowerCase()
    .trim()

  if (
    value === 'approved' ||
    value === 'completed' ||
    value === 'ready_for_payout'
  ) {
    return 'is-success'
  }

  if (value.includes('declined') || value === 'rejected') {
    return 'is-danger'
  }

  return 'is-warn'
}

const statusIcon = statusKey => {
  const value = String(statusKey || '')
    .toLowerCase()
    .trim()

  if (
    value === 'approved' ||
    value === 'completed' ||
    value === 'ready_for_payout'
  ) {
    return SuccessIcon
  }

  if (value.includes('declined') || value === 'rejected') {
    return ErrorIcon
  }

  return PendingIcon
}

const toMs = value => {
  const number = Number(value ?? 0)

  if (!number) {
    return 0
  }

  return number < 10_000_000_000 ? number * 1000 : number
}

const mapOffer = (offer, index) => {
  const statusKey = normalizeStatusKey(offer.status)

  return {
    _key: `offer-${offer.id ?? index}`,

    id: String(offer.id ?? '—'),

    createdAt: toMs(offer.created_at),

    skinItems: (offer.items || []).map(item => ({
      title: item.short_name || '—',

      image: '',

      quality: '',
    })),

    quantity: (offer.items || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    ),

    total: Number(offer.counter_offer_amount ?? offer.total_amount ?? 0),

    currency: offer.currency ?? 'EUR',

    status: normalizeOfferStatus(statusKey),

    statusKey,

    statusClass: statusClassByKey(statusKey),

    statusIcon: statusIcon(statusKey),

    _source: offer,
  }
}

const allRows = computed(() => {
  return offersList.value
    .map(mapOffer)
    .sort((a, b) => b.createdAt - a.createdAt)
})

const totalPages = computed(() => {
  return Math.ceil(allRows.value.length / itemsPerPage.value) || 1
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value

  const end = start + itemsPerPage.value

  return allRows.value.slice(start, end)
})

const getHeaderHeight = () => {
  const header = document.querySelector('.header')

  return header?.offsetHeight || 0
}

const scrollToProfileContentTop = async () => {
  await nextTick()

  const profileContent = document.querySelector('.profile__content')

  if (!profileContent) {
    return
  }

  const headerHeight = getHeaderHeight()

  const top =
    profileContent.getBoundingClientRect().top +
    window.scrollY -
    headerHeight -
    10

  window.scrollTo({
    top,
    behavior: 'smooth',
  })
}

const focusSellFormTitle = async () => {
  await nextTick()

  sellSkinFormRef.value?.focusTitle?.()
}

const showSellForm = async () => {
  if (!isOfferEnabled.value) {
    return
  }

  openedDetailsKey.value = null

  isSellFormVisible.value = true

  await scrollToProfileContentTop()

  await focusSellFormTitle()
}

const hideSellForm = () => {
  sellSkinFormRef.value?.reset?.()

  isSellFormVisible.value = false
}

const submitSellForm = async () => {
  if (!sellSkinFormRef.value?.submit) {
    return
  }

  try {
    await sellSkinFormRef.value.submit()
  } catch (error) {
    console.error(error)
  }
}

const setSelectedOfferSafe = row => {
  const payload = row._source || row

  if (offerFlowStore.setSelectedOffer) {
    offerFlowStore.setSelectedOffer(payload)

    return
  }

  offerFlowStore.selectedOffer = payload
}

const toggleDetails = async row => {
  isSellFormVisible.value = false

  if (openedDetailsKey.value === row._key) {
    openedDetailsKey.value = null

    return
  }

  openedDetailsKey.value = row._key

  setSelectedOfferSafe(row)

  const offerId = row._source?.id

  if (!offerId || !offerFlowStore.fetchOfferDetails) {
    return
  }

  isDetailsLoading.value = true

  try {
    await offerFlowStore.fetchOfferDetails(offerId)
  } catch (error) {
    console.error('Failed to fetch offer details:', error)

    toast.error(t('Failed to fetch offer details'))
  } finally {
    isDetailsLoading.value = false
  }
}

const openPayout = row => {
  isSellFormVisible.value = false

  setSelectedOfferSafe(row)

  modalStore.open('contactInfo')
}

const handleOfferAccept = async () => {
  if (!selectedOffer.value?.id) {
    return
  }

  isSubmitting.value = true

  try {
    const success = await offerFlowStore.acceptOffer(selectedOffer.value.id)

    if (success) {
      toast.success(
        t('Offer accepted! Please provide your details for payout.'),
      )

      openedDetailsKey.value = null

      await offerFlowStore.fetchOffers()
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleOfferDecline = async () => {
  if (!selectedOffer.value?.id) {
    return
  }

  isSubmitting.value = true

  try {
    const success = await offerFlowStore.declineOffer(selectedOffer.value.id)

    if (success) {
      toast.success(t('Offer declined successfully'))

      openedDetailsKey.value = null

      await offerFlowStore.fetchOffers()
    }
  } finally {
    isSubmitting.value = false
  }
}

const onPageChange = page => {
  currentPage.value = Number(page)

  openedDetailsKey.value = null

  isSellFormVisible.value = false

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const onItemsPerPageChange = value => {
  itemsPerPage.value = Number(value)

  currentPage.value = 1

  openedDetailsKey.value = null

  isSellFormVisible.value = false
}

const openSellFormFromRoute = async () => {
  if (route.query.sell !== '1') {
    return
  }

  await showSellForm()
}

onMounted(async () => {
  try {
    await offerFlowStore.fetchOffers()

    await openSellFormFromRoute()
  } catch (error) {
    console.error(error)

    toast.error(t('Failed to fetch offers'))
  } finally {
    isLoading.value = false
  }
})

watch(
  () => route.query.sell,
  async value => {
    if (value === '1') {
      await showSellForm()
    }
  },
)

watch(offersList, () => {
  currentPage.value = 1

  openedDetailsKey.value = null
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.offers {
  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 15);
    }
  }

  &__title {
    flex: 0 1 50%;

    font-weight: 700;

    @include adaptiveValue('padding-top', 10, 4);

    @include adaptiveValue('padding-bottom', 23, 10);

    border-bottom: 2px solid var(--bg-secondary-color);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;

    flex: 0 1 50%;

    @include adaptiveValue('gap', 14, 4);
  }

  &__action {
    position: relative;

    z-index: 1;

    width: 100%;
    max-width: 142px;

    min-height: 39px;

    &_show {
      max-width: 209px;
    }
  }

  &__form {
    @include adaptiveValue('padding-bottom', 44, 20);

    @include adaptiveValue('margin-bottom', 44, 20);

    border-bottom: 2px solid var(--border-color);
  }

  &__button {
    position: relative;

    z-index: 1;

    padding: 4px 10px;

    @include adaptiveValue('min-height', 44, 40);
  }

  &__button-icon {
    min-width: 11px;
    height: 7px;

    transition: transform 0.3s ease;

    &.is-open {
      transform: rotate(180deg);
    }
  }
}
</style>
