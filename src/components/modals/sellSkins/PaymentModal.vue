<template>
  <BaseModal :show="show" @close="close" :wrapperClasses="['payment__inner']">
    <div class="payment">
      <div class="payment__top">
        <div class="payment__title _l">{{ $t('Sell your Skin') }}</div>
        <div class="payment__subtitle">{{ $t('Bank/SEPA') }}</div>
      </div>
      <div class="payment__inputs">
        <BaseInput
          v-model="formData.firstName"
          :placeholder="$t('Name')"
          :error="formErrors.firstName"
          class="payment__input"
          required
        />
        <BaseInput
          v-model="formData.lastName"
          :placeholder="$t('Surname')"
          :error="formErrors.lastName"
          class="payment__input"
          required
        />
        <BaseInput
          v-model="formData.iban"
          :placeholder="$t('IBAN')"
          :error="formErrors.iban"
          @input="handleIbanInput"
          required
        />
      </div>
      <!--<BaseCheckbox
        v-model="formData.termsAccepted"
        :error="formErrors.termsAccepted"
        terms
        @change="clearFieldError('termsAccepted')"
        class="payment__checkbox"
      />-->
      <div v-if="formErrors.general" class="payment__error">
        {{ formErrors.general }}
      </div>
      <div class="payment__bottom">
        <BaseButton
          variant="bordered"
          class="payment__back"
          type="button"
          :disabled="isLoading"
          @click="handleBack"
        >
          {{ $t('Back') }}
        </BaseButton>
        <BaseButton
          @click="handleConfirm"
          :disabled="isLoading"
          :loading="isLoading"
          variant="primary"
          class="payment__button"
        >
          {{ $t('Submit') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useToast } from '@/composables/useToast'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { ref, watch } from 'vue'

const props = defineProps({ show: { type: Boolean, required: true } })

const emit = defineEmits(['close'])

const modalStore = useModalStore()
const toast = useToast()
const offerFlowStore = useOfferFlowStore()

const formData = ref({
  firstName: '',
  lastName: '',
  iban: '',
  //termsAccepted: false,
})

const formErrors = ref({
  firstName: '',
  lastName: '',
  iban: '',
  //termsAccepted: '',
  general: '',
})

const isLoading = ref(false)

const close = () => {
  clearErrors()
  emit('close')
}

const clearErrors = () => {
  Object.keys(formErrors.value).forEach(key => {
    formErrors.value[key] = ''
  })
}

const clearFieldError = field => {
  if (formErrors.value[field]) {
    formErrors.value[field] = ''
  }
}

const handleBack = () => {
  close()
  // chose method
  //modalStore.open('paymentMethod')
  modalStore.open('contactInfo')
}

const handleIbanInput = event => {
  formatIBAN(event)
  clearFieldError('iban')
}

const formatIBAN = event => {
  const value = event.target.value.replace(/\s+/g, '').toUpperCase()
  formData.value.iban = value.replace(/(.{4})(?=.)/g, '$1 ')
}

const validateForm = () => {
  const errors = {}

  //if (!formData.value.termsAccepted) {
  //  errors.termsAccepted = 'You must agree to the Terms of Use'
  //}

  if (!formData.value.firstName) {
    errors.firstName = 'First name is required'
  }

  if (!formData.value.lastName) {
    errors.lastName = 'Last name is required'
  }

  if (
    !formData.value.iban ||
    formData.value.iban.replace(/\s+/g, '').length < 15
  ) {
    errors.iban = 'Please enter a valid IBAN'
  }

  return errors
}

const handleConfirm = async () => {
  try {
    clearErrors()
    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      formErrors.value = { ...formErrors.value, ...errors }
      //if (errors.termsAccepted) {
      //  toast.error('You must agree to the Terms of Use')
      //}
      return
    }

    isLoading.value = true
    const offerId = offerFlowStore.selectedOffer?.id
    if (!offerId) throw new Error('Offer ID not found')

    const contactInfo = offerFlowStore.contactInfo
    const payload = {
      id: offerId,
      address: contactInfo.address,
      city: contactInfo.city,
      country: contactInfo.country,
      email: contactInfo.email,
      name: contactInfo.firstName,
      surname: contactInfo.lastName,
      phone: contactInfo.phone,
      postCode: contactInfo.postCode,
      currency: 'EUR',
      first_name: formData.value.firstName,
      last_name: formData.value.lastName,
      account_number: formData.value.iban.replace(/\s+/g, ''),
    }

    const result = await offerFlowStore.completeOffer({
      offerId,
      paymentMethod: 'sepa',
      payload,
    })

    if (result === true || (result && result.success)) {
      toast.success('Payment submitted successfully')
      close()
      offerFlowStore.fetchOffers()
    } else if (result && result.error) {
      formErrors.value.general = result.error

      if (result.validationErrors) {
        const fieldMapping = {
          first_name: 'firstName',
          last_name: 'lastName',
          iban: 'iban',
        }

        Object.entries(result.validationErrors).forEach(([key, messages]) => {
          if (messages && messages.length > 0) {
            const formField = fieldMapping[key] || key
            if (formField in formErrors.value) {
              formErrors.value[formField] = messages[0]
            }
          }
        })
      }
    }
  } catch (error) {
    console.error('Payment submission error:', error)
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to process payment'
    formErrors.value.general = errorMessage
  } finally {
    isLoading.value = false
  }
}

const initFormData = () => {
  const { firstName, lastName } = offerFlowStore.contactInfo
  formData.value.firstName = firstName || ''
  formData.value.lastName = lastName || ''
}

watch(
  () => props.show,
  newValue => {
    if (newValue) {
      initFormData()
      clearErrors()
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.payment {
  margin: 0 auto;
  max-width: 410px;
  &__inner {
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__title {
    text-align: center;
    font-weight: 700;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__subtitle {
    text-align: center;
    color: var(--secondary-color);
  }
  &__inputs {
    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }
  &__input {
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__checkbox {
    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__error {
    margin-bottom: 8px;
  }

  &__bottom {
    display: flex;
    @include adaptiveValue('gap', 20, 10);
  }
  &__back,
  &__button {
  }
}
</style>
