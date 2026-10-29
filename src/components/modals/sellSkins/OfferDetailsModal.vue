<template>
  <BaseModal
    :show="show"
    wrapper-classes="offer-details-modal__inner"
    :persistent="isSubmitting"
    @close="close"
  >
    <div class="offer-details">
      <LoadingSpinner
        v-if="isLoading && !offer"
        class="offer-details__loading"
      />

      <template v-else-if="offer">
        <h2 class="offer-details__title">
          {{ $t('Offer Details') }}
        </h2>

        <div class="offer-details__body">
          <div class="offer-details__list">
            <div class="offer-details__row">
              <span class="offer-details__label"> {{ $t('Game') }}: </span>

              <span class="offer-details__value">
                {{ offerGame }}
              </span>
            </div>

            <div class="offer-details__row">
              <span class="offer-details__label"> {{ $t('ID') }}: </span>

              <span class="offer-details__value">
                {{ offerId }}
              </span>
            </div>

            <div class="offer-details__row">
              <span class="offer-details__label"> {{ $t('Skin name') }}: </span>

              <span class="offer-details__value">
                {{ offerTitle }}
              </span>
            </div>

            <div class="offer-details__row">
              <span class="offer-details__label">
                {{ $t('Desired price') }}:
              </span>

              <span class="offer-details__value offer-details__value_price">
                {{ desiredPrice }}
              </span>
            </div>

            <div class="offer-details__row">
              <span class="offer-details__label">
                {{ $t('Offered price') }}:
              </span>

              <span class="offer-details__value offer-details__value_price">
                {{ offeredPrice }}
              </span>
            </div>
          </div>

          <div
            v-if="statusKey === 'awaiting_item' && companyTradeUrl"
            class="offer-details__trade"
          >
            <div class="offer-details__trade-label">
              {{ $t('Send your item') }}
            </div>

            <a
              :href="companyTradeUrl"
              class="offer-details__trade-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ companyTradeUrl }}
            </a>
          </div>

          <div class="offer-details__actions">
            <BaseButton
              v-if="canAccept"
              type="button"
              variant="primary"
              class="offer-details__button offer-details__button_accept"
              :disabled="isSubmitting"
              @click="handleOfferAccept"
            >
              {{ isSubmitting ? `${$t('Loading')}...` : $t('Accept') }}
            </BaseButton>

            <BaseButton
              type="button"
              variant="bordered"
              class="offer-details__button offer-details__button_back"
              :disabled="isSubmitting"
              @click="close"
            >
              {{ $t('Back') }}
            </BaseButton>
          </div>
        </div>
      </template>

      <div v-else class="offer-details__empty">
        <h2 class="offer-details__title">
          {{ $t('Offer Details') }}
        </h2>

        <p class="offer-details__empty-text">
          {{ $t('Offer details not found') }}
        </p>

        <BaseButton
          type="button"
          variant="bordered"
          class="offer-details__button offer-details__button_back"
          @click="close"
        >
          {{ $t('Back') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

import { useToast } from '@/composables/useToast'
import { useOfferFlowStore } from '@/stores/offerFlow'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()

const toast = useToast()
const offerFlowStore = useOfferFlowStore()

const isSubmitting = ref(false)

const rawOffer = computed(() => {
  return (
    offerFlowStore.selectedOfferDetails ||
    offerFlowStore.offerDetails ||
    offerFlowStore.selectedOffer ||
    null
  )
})

const offer = computed(() => {
  const value = rawOffer.value

  if (!value) return null

  if (
    value.payload &&
    typeof value.payload === 'object' &&
    !Array.isArray(value.payload)
  ) {
    return {
      ...value,
      ...value.payload,
    }
  }

  if (
    value.data &&
    typeof value.data === 'object' &&
    !Array.isArray(value.data)
  ) {
    return {
      ...value,
      ...value.data,
    }
  }

  return value
})

const isLoading = computed(() => {
  return Boolean(offerFlowStore.isLoading || offerFlowStore.loading)
})

const offerId = computed(() => {
  return offer.value?.order_nr ?? offer.value?.id ?? '—'
})

const offerTitle = computed(() => {
  const title = String(offer.value?.title || offer.value?.name || '')
    .replace(/StatTrak™?\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/★\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return title || '—'
})

const offerGame = computed(() => {
  const game = String(
    offer.value?.type || offer.value?.game || offer.value?.category || '',
  )
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '')

  if (game === 'cs2' || game === 'csgo') {
    return 'CS2'
  }

  if (game === 'dota2') {
    return 'Dota 2'
  }

  return '—'
})

const statusKey = computed(() => {
  return String(offer.value?.status || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
})

const offerCurrency = computed(() => {
  return String(offer.value?.fiat_currency || offer.value?.currency || 'EUR')
    .trim()
    .toUpperCase()
})

const offerCurrencySymbol = computed(() => {
  const symbols = {
    EUR: '€',
    USD: '$',
    GBP: '£',
  }

  return symbols[offerCurrency.value] || offerCurrency.value
})

const formatPrice = value => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return '—'
  }

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount)

  return `${formatted} ${offerCurrencySymbol.value}`
}

const desiredPrice = computed(() => {
  const value =
    offer.value?.user_price ??
    offer.value?.user_fiat_price ??
    offer.value?.price

  return formatPrice(value)
})

const offeredPriceValue = computed(() => {
  return (
    offer.value?.service_price ??
    offer.value?.service_fiat_price ??
    offer.value?.fiat_price ??
    null
  )
})

const offeredPrice = computed(() => {
  return formatPrice(offeredPriceValue.value)
})

const canAccept = computed(() => {
  const price = Number(offeredPriceValue.value)

  return (
    statusKey.value === 'offer' &&
    offeredPriceValue.value != null &&
    Number.isFinite(price) &&
    price > 0
  )
})

const companyTradeUrl = computed(() => {
  const url = String(offer.value?.company_trade_url || '').trim()

  if (!url) return ''

  try {
    const parsed = new URL(url)

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return ''
    }

    return parsed.href
  } catch {
    return ''
  }
})

const close = () => {
  if (isSubmitting.value) return

  emit('close')
}

const handleOfferAccept = async () => {
  const id = offer.value?.id

  if (!id || !canAccept.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  try {
    const success = await offerFlowStore.acceptOffer(id)

    if (!success) {
      return
    }

    await offerFlowStore.fetchOfferDetails(id)

    toast.success(t('Offer was accepted successfully'))

    emit('close')
  } catch (error) {
    console.error('Failed to accept offer:', error)

    toast.error(error?.message || t('Failed to accept offer'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

:global(.modal .modal__inner.offer-details-modal__inner) {
  width: min(566px, calc(100% - 32px));
  max-width: 566px;
  max-height: calc(100dvh - 32px);

  padding: 58px 49px 63px;

  border: 1px solid #344050;
  border-radius: 18px;

  background: #111821;
  background-image: none;

  box-shadow: 0 20px 65px rgba(0, 0, 0, 0.3);

  overflow-x: hidden;
  overflow-y: auto;
}

:global(.modal .modal__inner.offer-details-modal__inner .modal__close) {
  top: 17px;
  right: 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  min-width: 34px;
  height: 34px;

  padding: 0;

  border: 0;
  border-radius: 6px;
  background: transparent;

  color: #f4f6fb;

  transition: color 0.25s ease;
}

:global(.modal .modal__inner.offer-details-modal__inner .modal__close:hover) {
  color: #65a7ff;
}

.offer-details {
  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 0;

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 300px;
  }

  &__title {
    margin: 0;

    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: clamp(24px, 2.5vw, 30px);
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
    text-transform: none;
    overflow-wrap: anywhere;

    &:not(:last-child) {
      margin-bottom: 22px;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__list {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;
    width: 100%;
    min-width: 0;
    min-height: 64px;
    padding: 15px 0;

    border-bottom: 1px solid rgba(153, 161, 176, 0.09);

    &:last-child {
      border-bottom: 0;
    }
  }

  &__label {
    flex: 0 0 auto;

    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 400;
    line-height: 1.5;

    text-align: left;
  }

  &__value {
    flex: 1 1 auto;
    min-width: 0;

    color: #f4f6fb;
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.5;

    text-align: right;
    overflow-wrap: anywhere;
    word-break: normal;

    &_price {
      white-space: nowrap;
    }
  }

  &__trade {
    display: flex;
    flex-direction: column;
    gap: 10px;

    width: 100%;
    min-width: 0;

    margin-top: 18px;
    padding: 16px;

    border: 1px solid #303948;
    border-radius: 8px;
    background-color: #19212c;
  }

  &__trade-label {
    color: #f4f6fb;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
  }

  &__trade-link {
    display: block;

    color: #65a7ff;
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.6;

    text-decoration: underline;
    text-underline-offset: 3px;
    overflow-wrap: anywhere;

    transition: color 0.25s ease;

    &:hover,
    &:focus-visible {
      color: #f4f6fb;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 14px;

    width: 100%;
    min-width: 0;
    margin-top: 24px;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;
    min-height: 50px;
    height: 50px;

    padding: 10px 15px;

    border-radius: 8px !important;

    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.4;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease;

    &_accept {
      border: 1px solid #1a73ff !important;
      background-color: #1a73ff !important;
      color: #ffffff !important;

      @media (any-hover: hover) {
        &:not(:disabled):hover {
          border-color: #005fe8 !important;
          background-color: #005fe8 !important;
          color: #ffffff !important;
        }
      }
    }

    &_back {
      border: 1px solid #8794a6 !important;
      background-color: transparent !important;
      color: #f4f6fb !important;

      @media (any-hover: hover) {
        &:not(:disabled):hover {
          border-color: #1a73ff !important;
          background-color: rgba(26, 115, 255, 0.1) !important;
          color: #ffffff !important;
        }
      }
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid #65a7ff;
      outline-offset: 3px;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
    min-width: 0;

    text-align: center;
  }

  &__empty-text {
    margin: 0 0 30px;

    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.6;
  }

  @media (max-width: $md5) {
    &__title {
      font-size: 24px;
      margin-bottom: 20px;
    }

    &__row {
      min-height: 58px;
      gap: 12px;
      padding: 13px 0;
    }

    &__label {
      font-size: 13px;
    }

    &__value {
      font-size: 13px;
    }

    &__actions {
      margin-top: 23px;
      gap: 10px;
    }

    &__button {
      min-height: 45px;
      height: 45px;
      font-size: 13px;
    }
  }

  @media (max-width: $md7) {
    &__row {
      align-items: flex-start;
    }

    &__label {
      flex: 0 0 40%;
    }

    &__value {
      flex: 1 1 auto;
    }

    &__value_price {
      white-space: normal;
    }
  }
}

@media (max-width: $md5) {
  :global(.modal .modal__inner.offer-details-modal__inner) {
    width: 100%;
    max-width: 100%;
    max-height: 90dvh;

    padding: 55px 22px 30px;

    border-radius: 16px 16px 0 0;
  }
}

@media (max-width: $md7) {
  :global(.modal .modal__inner.offer-details-modal__inner) {
    padding-left: 18px;
    padding-right: 18px;
  }
}
</style>
