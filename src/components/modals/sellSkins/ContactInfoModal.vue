<template>
  <BaseModal
    :show="show"
    @close="close"
    :wrapperClasses="['contact-info__inner']"
  >
    <div class="contact-info">
      <div class="contact-info__top">
        <div class="contact-info__title _l">
          {{ $t('Withdraw') }}
        </div>
        <PriceFormatter
          class="contact-info__value"
          is-currency
          :price="selectedAmount"
          :currency-code="selectedCurrency"
        />
      </div>

      <div class="contact-info__form">
        <div class="contact-info__block">
          <div class="contact-info__subtitle _l">
            <span>{{ $t('Payment information') }}</span>
          </div>

          <div class="contact-info__content"></div>
        </div>
        <div class="contact-info__block contact-info__block_margin">
          <div class="contact-info__subtitle _l"></div>
          <div class="contact-info__content">
            <div class="contact-info__row">
              <BaseInput
                v-model="formData.firstName"
                :placeholder="$t('Name')"
                :error="formErrors.firstName"
                :disabled="isLoading"
                class="contact-info__input"
                @blur="validateField('firstName')"
              />

              <BaseInput
                v-model="formData.lastName"
                :placeholder="$t('Surname')"
                :error="formErrors.lastName"
                :disabled="isLoading"
                class="contact-info__input"
                @blur="validateField('lastName')"
              />
            </div>
            <BaseInput
              v-model="formData.email"
              type="email"
              autocomplete="email"
              :placeholder="$t('Email')"
              :error="formErrors.email"
              :disabled="isLoading"
              class="contact-info__input"
              @blur="validateField('email')"
            />
            <BaseInput
              v-model="formData.phone"
              type="tel"
              autocomplete="tel"
              :placeholder="$t('Phone')"
              :error="formErrors.phone"
              :disabled="isLoading"
              class="contact-info__input"
              @blur="validateField('phone')"
            />

            <BaseSelect
              v-model="formData.country"
              :options="countryOptions"
              optionLabel="title"
              optionValue="id"
              :placeholder="$t('Country')"
              :error="formErrors.country"
              :disabled="isLoading"
              class="contact-info__input"
              @blur="validateField('country')"
            />

            <div class="contact-info__row">
              <BaseInput
                v-model="formData.city"
                :placeholder="$t('City')"
                :error="formErrors.city"
                :disabled="isLoading"
                class="contact-info__input"
                @blur="validateField('city')"
              />

              <BaseInput
                v-model="formData.postCode"
                :placeholder="$t('Post Code')"
                :error="formErrors.postCode"
                :disabled="isLoading"
                class="contact-info__input"
                @blur="validateField('postCode')"
              />
            </div>

            <BaseInput
              v-model="formData.address"
              :placeholder="$t('Address')"
              :error="formErrors.address"
              :disabled="isLoading"
              class="contact-info__input"
              @blur="validateField('address')"
            />
          </div>
        </div>

        <div class="contact-info__block contact-info__block_margin">
          <div class="contact-info__subtitle"></div>

          <div class="contact-info__content">
            <BaseCheckbox
              class="contact-info__terms"
              v-model="formData.termsAccepted"
              :error="formErrors.termsAccepted"
              :disabled="isLoading"
              terms
            />
          </div>
        </div>

        <div class="contact-info__block">
          <div class="contact-info__subtitle _l">
            <span>{{ $t('Payment Method') }}</span>
          </div>

          <div class="contact-info__content">
            <div
              v-if="formErrors.general"
              class="contact-info__error _text-error"
            >
              {{ formErrors.general }}
            </div>

            <div class="contact-info__methods">
              <BaseButton
                type="button"
                variant="bordered"
                class="contact-info__submit"
                :disabled="isLoading"
                @click="handleSepa"
              >
                <span v-if="isLoading">{{ $t('Loading') }}...</span>
                <span v-else>{{ $t('SEPA') }}</span>
              </BaseButton>
              <BaseButton
                type="button"
                variant="bordered"
                class="contact-info__submit"
                :disabled="isLoading"
                @click="handleCard"
              >
                <span v-if="isLoading">{{ $t('Loading') }}...</span>
                <span v-else>{{ $t('Credit/Debit card') }}</span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useCountriesStore } from '@/stores/countries'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])

const { t } = useI18n()

const modalStore = useModalStore()
const userStore = useUserStore()
const countriesStore = useCountriesStore()
const offerFlowStore = useOfferFlowStore()
const { ensurePages } = useStaticPages()

const isLoading = ref(false)

const selectedOffer = computed(
  () => offerFlowStore.selectedOffer || offerFlowStore.getSelectedOffer || null,
)

const selectedAmount = computed(() => offerFlowStore?.selectedOffer?.fiat_price)
const selectedCurrency = computed(
  () => offerFlowStore?.selectedOffer?.fiat_currency,
)

const countryOptions = computed(() => countriesStore.countries || [])

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  postCode: '',
  address: '',
  termsAccepted: false,
})

const formErrors = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  postCode: '',
  address: '',
  termsAccepted: '',
  general: '',
})

const norm = value => String(value ?? '').trim()

const toId = value => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : ''
}

const clearErrors = () => {
  formErrors.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    postCode: '',
    address: '',
    termsAccepted: '',
    general: '',
  }
}

const saveContactInfoToStore = () => {
  offerFlowStore.updateContactInfo({
    firstName: norm(formData.value.firstName),
    lastName: norm(formData.value.lastName),
    email: norm(formData.value.email),
    phone: norm(formData.value.phone),
    country: formData.value.country,
    city: norm(formData.value.city),
    address: norm(formData.value.address),
    postCode: norm(formData.value.postCode),
  })
}

const prefillForm = () => {
  const stored = offerFlowStore.contactInfo || {}
  const user = userStore.user || {}

  formData.value = {
    firstName: stored.firstName || user.name || '',
    lastName: stored.lastName || user.surname || '',
    email: stored.email || user.email || '',
    phone: stored.phone || user.phone || '',
    country: stored.country || toId(user.country_id || user.country) || '',
    city: stored.city || user.city || '',
    postCode: stored.postCode || user.post_code || user.zip || '',
    address: stored.address || user.address || '',
    termsAccepted: false,
  }

  clearErrors()
}

const validateField = field => {
  formErrors.value[field] = ''

  if (field === 'firstName') {
    if (!norm(formData.value.firstName)) {
      formErrors.value.firstName = t('First name is required')
    }
    return
  }

  if (field === 'lastName') {
    if (!norm(formData.value.lastName)) {
      formErrors.value.lastName = t('Last name is required')
    }
    return
  }

  if (field === 'email') {
    if (!norm(formData.value.email)) {
      formErrors.value.email = t('Email is required')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
      formErrors.value.email = t('Invalid email format')
    }
    return
  }

  if (field === 'phone') {
    if (!norm(formData.value.phone)) {
      formErrors.value.phone = t('Phone number is required')
    }
    return
  }

  if (field === 'country') {
    if (!formData.value.country) {
      formErrors.value.country = t('Country is required')
    }
    return
  }

  if (field === 'city') {
    if (!norm(formData.value.city)) {
      formErrors.value.city = t('City is required')
    }
    return
  }

  if (field === 'postCode') {
    if (!norm(formData.value.postCode)) {
      formErrors.value.postCode = t('Post code is required')
    }
    return
  }

  if (field === 'address') {
    if (!norm(formData.value.address)) {
      formErrors.value.address = t('Address is required')
    }
    return
  }

  if (field === 'termsAccepted') {
    if (!formData.value.termsAccepted) {
      formErrors.value.termsAccepted = t('You must accept the terms')
    }
  }
}

const validateForm = () => {
  clearErrors()

  validateField('firstName')
  validateField('lastName')
  validateField('email')
  validateField('phone')
  validateField('country')
  validateField('city')
  validateField('postCode')
  validateField('address')
  validateField('termsAccepted')

  return Object.values(formErrors.value).every(value => !value)
}

const payoutAmount = computed(() => {
  const offer = selectedOffer.value

  if (!offer) return null

  const amount = Number(offer.service_price ?? offer.user_price ?? 0)

  return {
    amount,
    currency: offer.currency || '',
  }
})

const close = () => {
  clearErrors()
  emit('close')
}

const openSepaPaymentModal = async () => {
  const payout = payoutAmount.value

  close()

  modalStore.open('payment', {
    amount: payout?.amount ?? 0,
    currency: payout?.currency ?? '',
  })
}

const handleSepa = async () => {
  if (!validateForm()) {
    formErrors.value.general = t('Please fill all required fields')
    return
  }

  try {
    isLoading.value = true
    saveContactInfoToStore()
    //const saveResult = await offerFlowStore.saveUserOfferData()
    //if (!saveResult.success) {
    //  formErrors.value.general =
    //    saveResult.message || t('Failed to save payout data')
    //  return
    //}

    openSepaPaymentModal()
  } catch (error) {
    console.error(error)
    formErrors.value.general = t('Something went wrong')
  } finally {
    isLoading.value = false
  }
}

const handleCard = async () => {
  formErrors.value.general = ''

  if (!validateForm()) {
    formErrors.value.general = t('Please fill all required fields')
    return
  }

  const offerId = selectedOffer.value?.id

  if (!offerId) {
    formErrors.value.general = t('No offer selected')
    return
  }

  try {
    isLoading.value = true
    saveContactInfoToStore()

    //const saveResult = await offerFlowStore.saveUserOfferData(offerId)
    //if (!saveResult.success) {
    //  formErrors.value.general =
    //    saveResult.message || t('Failed to save payout data')
    //  return
    //}

    const result = await offerFlowStore.requestPayout(offerId, 'card-form')

    if (!result?.success) {
      const messages = Array.isArray(result?.messages) ? result.messages : []

      formErrors.value.general = messages.length
        ? messages.join('\n')
        : result?.message || t('Failed to start card payout')

      return
    }

    close()
  } catch (error) {
    console.error(error)
    formErrors.value.general = t('Something went wrong')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => formData.value.firstName,
  () => validateField('firstName'),
)
watch(
  () => formData.value.lastName,
  () => validateField('lastName'),
)
watch(
  () => formData.value.email,
  () => validateField('email'),
)
watch(
  () => formData.value.phone,
  () => validateField('phone'),
)
watch(
  () => formData.value.country,
  () => validateField('country'),
)
watch(
  () => formData.value.city,
  () => validateField('city'),
)
watch(
  () => formData.value.postCode,
  () => validateField('postCode'),
)
watch(
  () => formData.value.address,
  () => validateField('address'),
)
watch(
  () => formData.value.termsAccepted,
  () => validateField('termsAccepted'),
)

watch(
  () => props.show,
  async isOpen => {
    if (!isOpen) return

    await ensurePages()

    if (!countriesStore.countries?.length) {
      try {
        await countriesStore.fetchCountries()
      } catch (error) {
        console.error('Failed to fetch countries:', error)
      }
    }

    if (!userStore.user) {
      try {
        await userStore.fetchProfile?.()
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }

    prefillForm()
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.contact-info {
  width: 100%;
  margin: 0 auto;
  max-width: 652px;
  &__top {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
    background-color: var(--bg-primary-color);
    @include adaptiveValue('border-radius', 12, 10);
    @include adaptiveValue('padding', 15, 10);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 10);
    }
  }
  &__title {
    text-align: center;
  }

  &__form {
  }

  &__block {
    &_margin {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 43, 25);
      }
    }

    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 70, 20, 1820, 768, 1);
    }
  }

  &__subtitle {
    flex: 0 1 32%;

    span {
      text-align: left;
      display: block;
      font-weight: 700;
      font-size: 14px;
      line-height: 19px;

      @media (min-width: $md5) {
        @include adaptiveValue('padding-bottom', 23, 15);
        border-bottom: 1px solid var(--bg-secondary-color);
      }
      @media (max-width: $md5) {
        margin-bottom: 10px;
      }
    }
  }

  &__content {
    flex: 0 1 68%;
    margin-left: auto;
  }

  &__summary {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__label {
    line-height: 130%;
    height: fit-content;
    color: var(--secondary-color);
  }

  &__value {
    :deep(.price__value),
    :deep(.price__currency) {
      font-weight: 700;
    }
  }

  &__row {
    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 14, 10);
    }
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 14px;
      }
    }
  }

  &__input {
    :deep(.base-select),
    :deep(.base-input) {
      border: 1px solid var(--bg-secondary-color);

      &:focus,
      &:focus-within {
        border: 1px solid var(--hint-color);
      }
    }

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__terms {
  }

  &__error {
    white-space: pre-line;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__methods {
    @media (min-width: $md7) {
      display: flex;
      @include adaptiveValue('gap', 22, 10);
    }
  }

  &__method {
  }

  &__submit {
    width: 100%;
    position: relative;
    z-index: 1;
    @include adaptiveValue('min-height', 46, 45);
    @media (max-width: $md7) {
      &:not(:last-child) {
        margin-bottom: 4px;
      }
    }
  }
}
</style>
