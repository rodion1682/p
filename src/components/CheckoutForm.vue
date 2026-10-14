<template>
  <div class="flex flex-col items-start gap-[28px] xl:flex-row">
    <div
      class="w-full rounded-[36px] bg-[#2E303B] p-6 md:p-[31px_50px_34px] xl:w-[55%]"
    >
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="mb-6">
          <PromoCodeInput
            @applied="handlePromoCodeApplied"
            @removed="handlePromoCodeRemoved"
            :disabled="!isAddressValid"
          />
          <p v-if="!isAddressValid" class="mt-2 text-sm text-secondary">
            {{ t('Enter shipping address to apply promo code') }}
          </p>
        </div>
        <div class="space-y-4">
          <h3 class="text-xl font-bold">{{ t('Shipping Information') }}</h3>
          <BaseInput
            v-model="formData.name"
            :placeholder="t('First Name')"
            required
          />
          <BaseInput
            v-model="formData.surname"
            :placeholder="t('Last Name')"
            required
          />
          <BaseInput
            v-model="formData.email"
            type="email"
            :placeholder="t('Email')"
            required
          />
          <BasePhone
            v-model="phoneDisplay"
            name="phone"
            :placeholder="t('Phone')"
            @phone-data="handlePhoneData"
            required
          />
          <BaseSelect
            v-if="countriesStore.countries.length > 0"
            v-model="formData.country"
            :options="countriesStore.countries"
            option-label="name"
            option-value="name"
            :placeholder="t('Country')"
            required
            :loading="countriesStore.isLoading"
            :error="error"
          />
          <p v-else-if="countriesStore.error" class="text-error">
            {{ countriesStore.error }}
          </p>
          <BaseInput
            v-model="formData.city"
            :placeholder="t('City')"
            required
          />
          <BaseInput
            v-model="formData.address"
            :placeholder="t('Street Address')"
            required
          />
          <BaseInput
            v-model="formData.postCode"
            :placeholder="t('Postal Code')"
            required
          />
        </div>
        <div class="flex justify-between gap-[16px] pt-4">
          <BaseButton type="button" @click="$emit('back')" variant="green2">
            {{ t('Back to Cart') }}
          </BaseButton>
          <BaseButton
            type="button"
            @click="handleCalculateTotals"
            :disabled="isCalculatingDelivery"
          >
            {{ t('Calculate Totals') }}
          </BaseButton>
        </div>
        <!-- Display error message here -->
        <p
          v-if="cartStore.hasDeliveryError || cartStore.error"
          class="text-error"
        >
          {{ cartStore.error }}
        </p>
      </form>
    </div>

    <div class="w-full xl:w-[526px]">
      <CartSummary
        @checkout="handleSubmit"
        :button-state="buttonState"
        :is-loading="cartStore.isCalculating"
      />
    </div>
  </div>
</template>

<script setup>
import BasePhone from '@/components/BasePhone.vue'
import CartSummary from '@/components/CartSummary.vue'
import PromoCodeInput from '@/components/PromoCodeInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'
import { useCartStore } from '@/stores/cart'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { usePromoCodeStore } from '@/stores/promocode'
import { useUserStore } from '@/stores/user'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const userStore = useUserStore()
const countriesStore = useCountriesStore()
const promoCodeStore = usePromoCodeStore()
const currencyStore = useCurrencyStore()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const error = ref('')
const phoneDisplay = ref('')
const isCalculatingDelivery = ref(false)
const hasShippingCalculated = ref(false) // For API submission
const phoneData = ref({
  phone: '',
  phoneCountryCode: '',
  nationalNumber: '',
  isValid: false,
})
const isPhoneValid = computed(() => phoneData.value.isValid)
const formData = reactive({
  name: '',
  surname: '',
  email: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
})
const handlePhoneData = data => {
  if (data) {
    phoneData.value = data
  } else {
    phoneData.value = {
      phone: '',
      phoneCountryCode: '',
      nationalNumber: '',
      isValid: false,
    }
  }
}
const isSubmitting = ref(false)
const isAddressValid = computed(() => {
  return formData.country && formData.postCode && formData.city
})
const buttonState = ref({ text: '', disabled: true })

const updateButtonState = () => {
  buttonState.value = getButtonState()
}
const getButtonState = () => {
  if (!isAddressValid.value) {
    return { text: t('Enter Shipping Address'), disabled: true }
  }
  if (isCalculatingDelivery.value || cartStore.isCalculating.value) {
    return { text: t('Processing...'), disabled: true }
  }
  if (cartStore.hasDeliveryError.value) {
    return { text: cartStore.error, disabled: true }
  }
  if (cartStore.totalData.delivery_cost === null) {
    return { text: t('Invalid Shipping Address'), disabled: true }
  }
  if (!hasShippingCalculated.value) {
    return { text: t('Calculate Shipping'), disabled: true }
  }
  if (isSubmitting.value) {
    return { text: t('Processing...'), disabled: true }
  }
  return { text: t('Place Order'), disabled: false }
}
watch(
  [
    isAddressValid,
    isCalculatingDelivery,
    () => cartStore.isCalculating,
    () => cartStore.hasDeliveryError.value,
    hasShippingCalculated,
    isSubmitting,
  ],
  updateButtonState,
)
const handleCalculateTotals = async () => {
  if (!isAddressValid.value) {
    toast.error(t('Please complete shipping address'))
    return
  }
  isCalculatingDelivery.value = true
  hasShippingCalculated.value = false
  error.value = null

  const checkoutData = {
    ...formData,
    phone: phoneData.value.phone,
    promoCode: promoCodeStore.currentPromo?.code || null,
    currency: currencyStore.currentCurrencyCode,
  }

  try {
    await cartStore.fetchTotals(checkoutData)
    if (cartStore.error) {
      toast.error(cartStore.error)
      error.value = cartStore.error
    } else {
      error.value = null
      hasShippingCalculated.value = true
    }
  } catch (err) {
    toast.error('An error occurred while calculating totals.')
    error.value = 'An error occurred while calculating totals.'
  } finally {
    isCalculatingDelivery.value = false
  }
}

const handlePromoCodeApplied = async code => {
  if (isAddressValid.value) {
    isCalculatingDelivery.value = true
    hasShippingCalculated.value = false // Reset flag
    try {
      // Use a new object for promo code request
      const promoCodeData = {
        ...formData,
        phone: phoneData.value.phone,
        promoCode: code,
        currency: currencyStore.currentCurrencyCode,
      }
      await cartStore.fetchTotals(promoCodeData) // Pass the new object
      if (cartStore.error) {
        toast.error(cartStore.error)
      }
    } catch (err) {
      toast.error('An error occurred while applying the promo code.')
    } finally {
      isCalculatingDelivery.value = false
      hasShippingCalculated.value = !cartStore.hasDeliveryError
    }
  } else {
    promoCodeStore.setPromoCode({ code })
  }
}

const handlePromoCodeRemoved = async () => {
  if (isAddressValid.value) {
    isCalculatingDelivery.value = true
    hasShippingCalculated.value = false // Reset flag
    try {
      // Use a new object for promo code removal request
      const promoCodeData = {
        ...formData,
        phone: phoneData.value.phone,
        promoCode: null,
        currency: currencyStore.currentCurrencyCode,
      }
      await cartStore.fetchTotals(promoCodeData) // Pass the new object
      if (cartStore.error) {
        toast.error(cartStore.error)
      }
    } catch (err) {
      toast.error('An error occurred while removing the promo code.')
    } finally {
      isCalculatingDelivery.value = false
      hasShippingCalculated.value = !cartStore.hasDeliveryError
    }
  } else {
    promoCodeStore.clearPromoCode()
  }
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  if (!isAddressValid.value) {
    toast.error(t('Please complete shipping address'))
    return
  }
  // Prevent submission if still calculating
  if (isCalculatingDelivery.value) {
    toast.info(t('Please wait while we calculate totals'))
    return
  }
  if (cartStore.hasDeliveryError.value) {
    toast.error(
      t('There was an error with your address. Please check and try again.'),
    )
    return
  }
  if (!hasShippingCalculated.value) {
    toast.error(t('Please calculate shipping first.'))
    return
  }
  try {
    isSubmitting.value = true
    const checkoutData = {
      ...formData,
      phone: phoneData.value.phone,
      promoCode: promoCodeStore.currentPromo?.code || null,
      currency: currencyStore.currentCurrencyCode,
      accept_terms: true, //TODO
    }

    const { data } = await axios.post('/orders/checkout', checkoutData, {
      timeout: 30000,
    })

    if (data.status === 'OK') {
      window.location.href = data.redirect_url
    } else if (data.status === 'PRICE_CHANGED') {
      // Update the cart store with the new totals
      cartStore.updateTotals(data.new_totals)

      // Display a message to the user, potentially with a UI element to show details
      toast.warning(data.message)
    } else {
      error.value = data.message
      toast.error(data.message)

      // Check if the error message indicates an out-of-stock issue (optional)
      if (data.message.includes('no stock')) {
      } else {
        router.push({ name: 'FailPaymentPage' })
      }
    }
  } catch (err) {
    console.error('Checkout error:', err)
    error.value =
      err.response?.data?.message || 'An error occurred during checkout'
    toast.error(
      err.response?.data?.message || 'An error occurred during checkout',
    )
  } finally {
    isSubmitting.value = false
  }
}

// Watch for changes in user data and update form fields
watch(
  () => userStore.user,
  newUser => {
    if (newUser) {
      formData.name = userStore.firstName
      formData.surname = userStore.lastName
      formData.email = userStore.userEmail
      formData.country = userStore.userCountry
      formData.city = userStore.userCity
      formData.address = userStore.userAddress
      formData.postCode = userStore.userPostCode
      phoneDisplay.value = userStore.userPhone
    }
  },
  { immediate: true },
) // Populate form with user data onMounted
onMounted(async () => {
  if (!userStore.user) {
    await userStore.fetchProfile()
  }
  await countriesStore.fetchCountries()
  updateButtonState()
})
defineEmits(['back'])
</script>
