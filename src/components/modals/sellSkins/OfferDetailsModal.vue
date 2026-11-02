<template>
  <BaseModal :show="show" @close="close" :wrapperClasses="['details__inner']">
    <div class="details">
      <!-- v-if="isLoading" -->
      <LoadingSpinner v-if="isLoading" class="details__loading" />

      <div v-else-if="offer" class="details__content">
        <div class="details__title _l">
          {{ $t('Offer Details') }}
        </div>

        <div class="details__rows">
          <div class="details__row">
            <div class="details__label">{{ $t('Skin') }}:</div>
            <div class="details__value">{{ offer.title }}</div>
          </div>

          <div class="details__row">
            <div class="details__label">{{ $t('Id') }}:</div>
            <div class="details__value">{{ offer.order_nr }}</div>
          </div>
          <div class="details__row">
            <div class="details__label">{{ $t('Date/time') }}:</div>
            <div class="details__value">{{ getDate(offer.date_time) }}</div>
          </div>
          <div class="details__row">
            <div class="details__label">{{ $t('Desired price') }}:</div>
            <div class="details__value details__value_price">
              {{ formatPrice(offer.user_price) }} {{ offer.currency }}
            </div>
          </div>
          <div v-if="hasCounterOffer" class="details__row details__row_service">
            <div class="details__label">
              <!--{{ $t('Offered price') }}{{ `(${offer.currency}):` }}-->
              {{ $t('Offered price:') }}
            </div>
            <div class="details__value details__value_service">
              {{ formatPrice(offer.service_price) }}
              {{ offer.currency }}
            </div>
          </div>
        </div>

        <div
          v-if="hasCounterOffer && offer.status === 'offer'"
          class="details__bottom"
        >
          <BaseButton
            @click="handleOfferDecline"
            :disabled="isSubmitting"
            class="details__button"
            variant="white"
          >
            {{ $t('Decline Offer') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            class="details__button"
            @click="handleOfferAccept"
            :disabled="isSubmitting"
          >
            {{ $t('Accept offer') }}
          </BaseButton>
        </div>
      </div>
      <div v-else class="details__empty _h3">
        {{ $t('Offer details not found') }}
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useToast } from '@/composables/useToast'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

const modalStore = useModalStore()
const toast = useToast()
const offerFlowStore = useOfferFlowStore()

// State
const isLoading = ref(false)
const isSubmitting = ref(false)

// Computed properties
const offer = computed(() => offerFlowStore.getSelectedOffer)
const hasCounterOffer = computed(() => offer.value && offer.value.service_price)

// Methods
const close = () => {
  emit('close')
}

// Format price with 2 decimal places
const formatPrice = price => {
  return parseFloat(price).toFixed(2)
}

// Get status label
const getStatusLabel = statusValue => {
  const statusMap = {
    pending: 'Pending Review',
    offer: 'Counter Offer Available',
    awaiting_item: 'Awaiting Item Trade',
    ready_for_payout: 'Ready for Payout',
    payout_processing: 'Processing Payout',
    approved: 'Payout Completed',
    declined_by_user: 'Declined by You',
    declined_by_service: 'Declined by Service',
  }

  return statusMap[statusValue] || statusValue || 'Unknown'
}

const getDate = unixSeconds => {
  if (!unixSeconds) return ''

  const date = new Date(unixSeconds * 1000)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}.${month}.${year} ${hours}:${minutes}`
}

// Get status color
const getStatusColor = status => {
  const colorMap = {
    pending: 'text-yellow-400',
    offer: 'text-blue-400',
    awaiting_item: 'text-orange-400',
    ready_for_payout: 'text-green-400',
    payout_processing: 'text-purple-400',
    approved: 'text-green-500',
    declined_by_user: 'text-red-400',
    declined_by_service: 'text-red-400',
  }

  return colorMap[status] || ''
}

// Get quality label
const getQualityLabel = qualityValue => {
  const qualityMap = {
    factory_new: 'Factory New',
    minimal_wear: 'Minimal Wear',
    field_tested: 'Field-Tested',
    well_worn: 'Well-Worn',
    battle_scarred: 'Battle-Scarred',
    not_painted: 'Not Painted',
  }

  return qualityMap[qualityValue] || qualityValue || 'Unknown'
}

// Handle accepting the counter offer
const handleOfferAccept = async () => {
  if (!offer.value || !offer.value.id) return

  isSubmitting.value = true
  const success = await offerFlowStore.acceptOffer(offer.value.id)
  if (success) {
    toast.success('Offer accepted! Please provide your details for payout.')
    //offerFlowStore.setStep('contact')
    //modalStore.open('contactInfo')
    close()
  }
  // If !success, the store shows an error toast, and we stop.
  isSubmitting.value = false
}

// Handle declining the counter offer
const handleOfferDecline = async () => {
  if (!offer.value || !offer.value.id) return

  isSubmitting.value = true
  const success = await offerFlowStore.declineOffer(offer.value.id)
  if (success) {
    toast.success('Offer declined successfully')
    close()
  }
  isSubmitting.value = false
}

watch(
  () => offer.value,
  (newVal, oldVal) => {
    console.log('Status changed:', oldVal, '→', newVal)
  },
  { immediate: true },
)

// Load offer details when modal opens
watch(
  () => props.show,
  newValue => {
    if (newValue && offer.value && offer.value.id) {
      // Load detailed offer information if needed
      isLoading.value = true
      offerFlowStore
        .fetchOfferDetails(offer.value.id)
        .catch(error => {
          console.error('Failed to fetch offer details:', error)
          toast.error('Failed to fetch offer details')
        })
        .finally(() => {
          isLoading.value = false
        })
    }
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.details {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  @include adaptiveValue('max-width', 468);

  &__loading {
  }
  &__empty {
    text-transform: none;
    text-align: center;
    color: var(--secondary-color);
  }
  &__content {
  }

  &__title {
    text-align: center;
    text-transform: capitalize;
    @include adaptiveValue('font-size', 28, 22);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }
  &__rows {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }
  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    @include adaptiveValue('gap', 20);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15);
    }
    &_service {
      border-style: solid;
      border-color: rgb(255, 255, 255, 0.5);
      @include adaptiveValue('padding-top', 30, 15);
      @include adaptiveValue('margin-top', 30, 15);
      @include adaptiveValue('border-top-width', 1);
    }
  }
  &__label {
    opacity: 0.5;
    line-height: 120%;
    @include adaptiveValue('font-size', 16);
  }
  &__value {
    line-height: 120%;
    @include adaptiveValue('font-size', 16);
    &_price {
    }
  }
  &__bottom {
    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 16, 6);
    }
  }
  &__button {
    text-transform: capitalize;
    flex: 0 1 50%;
    @include adaptiveValue('border-radius', 25, 10);
    @media (max-width: $md5) {
      flex: 1 1 100%;
      &:not(:last-child) {
        margin-bottom: 6px;
      }
    }
  }
}
</style>
