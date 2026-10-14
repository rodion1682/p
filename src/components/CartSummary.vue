<template>
  <div
    class="cart-summary relative rounded-[36px] bg-[#2E303B] p-[47px_45px_34px_46px] shadow-md"
  >
    <div
      v-if="isLoading || cartStore.isCalculating"
      class="absolute inset-0 z-10 flex items-center justify-center bg-[#2E303B] bg-opacity-75"
    >
      <svg
        class="h-8 w-8 animate-spin text-secondary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <!-- <h2 class="mb-6 text-lg font-bold">
      {{ $t('cart_items_count', { count: cartItemsCount }) }}
    </h2> -->

    <div class="mb-[24px] space-y-[24px]">
      <div class="flex justify-between">
        <span class="text-[14px] font-normal uppercase leading-[19px]">{{
          $t('subtotal')
        }}</span>
        <span
          v-if="cartStore.totalData?.cart_total !== null"
          class="text-[14px] font-bold leading-[19px]"
          >{{ formattedSubtotal }}</span
        >
        <span v-else class="text-[14px] font-bold leading-[19px]">---</span>
      </div>

      <div class="flex justify-between">
        <span class="text-[14px] font-normal uppercase leading-[19px]">{{
          $t('delivery')
        }}</span>
        <span class="text-[14px] font-bold leading-[19px]">{{
          formattedDeliveryFee
        }}</span>
      </div>

      <div v-if="formattedVat !== null" class="flex justify-between">
        <span class="text-[14px] font-normal uppercase leading-[19px]">
          {{ $t('vat') }} {{ vatIsZero ? '(n/a)' : formattedVatRate }}
        </span>
        <span class="text-[14px] font-bold leading-[19px]">{{
          formattedVat
        }}</span>
      </div>

      <div
        v-if="formattedPromoDiscount && formattedPromoDiscount !== '---'"
        class="mb-4 flex justify-between"
      >
        <span class="text-[14px] font-normal uppercase leading-[19px]">{{
          $t('promo_discount')
        }}</span>
        <span class="text-[14px] font-bold leading-[19px] text-green-600">{{
          formattedPromoDiscount
        }}</span>
      </div>
    </div>

    <!-- separator -->
    <div class="mb-[24px] flex justify-between border-t border-[#E7E7E7]" />

    <div class="mb-[32px] flex justify-between">
      <span class="text-[24px] uppercase">{{ $t('total') }}</span>
      <span
        v-if="cartStore.totalData?.final_amount !== null"
        class="text-[24px] font-bold"
        >{{ formattedTotal }}</span
      >
      <span v-else class="text-[24px] font-bold">---</span>
    </div>
    <p v-if="cartStore.hasError" class="mb-4 text-error">
      {{ cartStore.error.message }}
    </p>

    <BaseButton
      @click="handleCheckoutClick"
      :disabled="!isButtonEnabled"
      class="mb-[32px] w-full"
    >
      {{ buttonState?.text }}
    </BaseButton>

    <!-- Address Check Text -->
    <p class="mb-[16px] text-[12px]">
      {{
        $t(
          'Please double check your delivery address details to ensure they are correct on the payment pop up.',
        )
      }}
    </p>

    <div class="mb-4 text-[12px]">
      <span>{{ $t('terms_agreement_start') }}</span>
      <RouterLink
        v-if="termsPage"
        :to="getPageUrl(termsPage)"
        class="font-bold text-info hover:underline"
      >
        {{ $t('terms') }}
      </RouterLink>
      <span v-else class="font-bold text-info">{{ $t('terms') }}</span>
      <span>{{ $t('terms_agreement_middle') }}</span>
      <RouterLink
        v-if="privacyPage"
        :to="getPageUrl(privacyPage)"
        class="font-bold text-info hover:underline"
      >
        {{ $t('privacy') }}
      </RouterLink>
      <span v-else class="font-bold text-info">{{ $t('privacy') }}</span
      >.
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs, ref, watch } from 'vue'
import { useCurrencyStore } from '@/stores/currency'
import { useCartStore } from '@/stores/cart'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { useStaticPages } from '@/composables/useStaticPages'
const { termsPage, privacyPage, ensurePages, getPageUrl } = useStaticPages()

const props = defineProps({
  buttonState: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const { buttonState, isLoading } = toRefs(props)
const cartStore = useCartStore()
const currencyStore = useCurrencyStore()
const cartItemsCount = computed(() => cartStore.cartItemsCount)
const { t } = useI18n()
const toast = useToast()

const formattedSubtotal = computed(() => {
  if (
    !cartStore.totalData ||
    (cartStore.totalData.converted?.cart_total === null &&
      cartStore.totalData.original?.cart_total === null)
  )
    return '---'
  return formatPrice(
    cartStore.totalData.converted?.cart_total ||
      cartStore.totalData.original?.cart_total,
  )
})

const formattedVatRate = computed(() => {
  if (!cartStore.totalData) return null
  const vatRate = cartStore.totalData.vatRate
  if (vatRate === null || vatRate === undefined) return null
  return `${(vatRate * 100).toFixed(2)}%`
})

const formattedDeliveryFee = computed(() => {
  if (
    !cartStore.totalData ||
    (cartStore.totalData.converted?.delivery_cost === null &&
      cartStore.totalData.original?.delivery_cost === null)
  ) {
    return '---'
  }
  return formatPrice(
    cartStore.totalData.converted?.delivery_cost ||
      cartStore.totalData.original?.delivery_cost,
  )
})

const formattedPromoDiscount = computed(() => {
  if (
    !cartStore.totalData ||
    (cartStore.totalData.converted?.discount_amount === null &&
      cartStore.totalData.original?.discount_amount === null)
  ) {
    return '---'
  }
  const discountAmount =
    cartStore.totalData.converted?.discount_amount ||
    cartStore.totalData.original?.discount_amount
  if (discountAmount === 0) {
    return '---'
  }
  return `-${formatPrice(discountAmount)}`
})

const vatIsZero = computed(() => {
  const vatAmount =
    cartStore.totalData?.converted?.vat || cartStore.totalData?.original?.vat
  return vatAmount === 0
})

const formattedVat = computed(() => {
  if (!cartStore.totalData) return null
  const vatAmount =
    cartStore.totalData.converted?.vat || cartStore.totalData.original?.vat
  if (vatAmount === null || vatAmount === undefined) return null
  return formatPrice(vatAmount)
})

const formattedTotal = computed(() => {
  if (
    !cartStore.totalData ||
    (cartStore.totalData.converted?.final_amount === null &&
      cartStore.totalData.original?.final_amount === null)
  )
    return '---'
  return formatPrice(
    cartStore.totalData.converted?.final_amount ||
      cartStore.totalData.original?.final_amount,
  )
})

const formatPrice = amount => {
  if (amount === null || amount === undefined) {
    return '---'
  }
  const currencySymbol =
    cartStore.totalData.converted?.currency_symbol ||
    cartStore.totalData.original?.currency_symbol
  return `${amount.toFixed(2)} ${currencySymbol}`
}

const isButtonEnabled = computed(() => {
  if (cartStore.isEmpty) {
    return false
  }
  return !buttonState.value?.disabled
})

const handleCheckoutClick = () => {
  emit('checkout')
}
const emit = defineEmits(['checkout'])
</script>
