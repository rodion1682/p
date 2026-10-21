<script setup>
import BackButton from '@/components/BackButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseButton from '@/components/BaseButton.vue'
import BasePhone from '@/components/BasePhone.vue'
import { useCountriesStore } from '@/stores/countries'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const topUpStore = useTopUpStore()
const userStore = useUserStore()
const countriesStore = useCountriesStore()

const step = ref(1)
const amount = ref(null)
const phoneDisplay = ref('')
const phoneData = ref({
  phone: '',
  phoneCountryCode: '',
  nationalNumber: '',
  isValid: false,
})

const handleAmountChange = () => {
  topUpStore.setAmount(Number(amount.value))
}

const handlePhoneData = data => {
  if (data) {
    phoneData.value = data
    topUpStore.formData.phone = data.phone
    topUpStore.formData.phoneCountryCode = data.phoneCountryCode
    topUpStore.formData.nationalNumber = data.nationalNumber
  } else {
    phoneData.value = {
      phone: '',
      phoneCountryCode: '',
      nationalNumber: '',
      isValid: false,
    }
    topUpStore.formData.phone = ''
    topUpStore.formData.phoneCountryCode = ''
    topUpStore.formData.nationalNumber = ''
  }
}

const handleBack = () => {
  if (step.value > 1) {
    step.value--
  } else {
    router.push({ path: '/account' })
  }
}

const handleNext = async () => {
  if (step.value === 1) {
    const isValid = await topUpStore.validateAmount(Number(amount.value))
    if (isValid) {
      step.value = 2
    }
  }
}

const handleSubmit = async () => {
  try {
    if (!phoneData.value.isValid) {
      topUpStore.error = 'Please enter a valid phone number'
      return
    }
    const result = await topUpStore.checkout(topUpStore.formData)
    if (result.redirect_url) {
      window.location.href = result.redirect_url
    } else {
      topUpStore.error = 'Payment gateway error, please try again later'
    }
  } catch (error) {
    console.error('Checkout error:', error)
    topUpStore.error = error || 'Checkout process failed. Please try again.'
  }
}

onMounted(async () => {
  await userStore.fetchProfile()
  await countriesStore.fetchCountries()
  if (userStore.user) {
    topUpStore.formData.name = userStore.user.name || ''
    topUpStore.formData.surname = userStore.user.surname || ''
    topUpStore.formData.email = userStore.user.email || ''
    phoneDisplay.value = userStore.user.phoneE164 || ''
  }
})
</script>

<template>
  <div
    class="mx-auto mt-6 max-w-[1376px] px-4 lg:mt-12 lg:px-8"
    :class="[step === 1 ? 'mb-36 lg:mb-56' : 'mb-8 lg:mb-16']"
  >
    <div
      class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between"
    >
      <!-- Back Button that pushes content to the right -->
      <BackButton @click="handleBack">
        {{ step === 1 ? 'Back' : 'Back' }}
      </BackButton>

      <!-- Main content wrapper -->
      <div
        class="mt-4 flex w-full flex-col justify-end lg:mt-0 lg:flex-row lg:gap-4"
      >
        <!-- Left Column - Form -->
        <div
          class="w-full rounded-[20px] bg-[#2E303B] p-6 lg:max-w-[514px] lg:p-[48px_52px]"
        >
          <template v-if="step === 1">
            <h2 class="mb-6 text-2xl text-secondary lg:mb-10 lg:text-3xl">
              {{ $t(`Top up balance`) }}
            </h2>
            <p class="mb-4 text-secondary lg:mb-6">{{ $t(`Enter amount:`) }}</p>
            <BaseInput
              v-model="amount"
              type="number"
              min="0"
              step="1"
              placeholder="0.00"
              suffix="EUR"
              class="mb-6 lg:mb-10"
              @input="handleAmountChange"
            />
            <BaseButton
              @click="handleNext"
              :disabled="!Number(amount) || topUpStore.isLoading"
              >{{ $t(`Continue`) }}</BaseButton
            >
            <p v-if="topUpStore.error" class="mt-2 text-sm text-error">
              {{ topUpStore.error }}
            </p>
          </template>

          <!-- Step 2 -->
          <template v-else>
            <h2 class="mb-6 text-2xl text-secondary lg:mb-10 lg:text-3xl">
              {{ $t(`Top up balance`) }}
            </h2>
            <p class="mb-4 text-secondary lg:mb-6">
              {{ $t(`Enter contact information`) }}
            </p>
            <form @submit.prevent="handleSubmit">
              <div class="space-y-[10px]">
                <BaseInput
                  v-model="topUpStore.formData.name"
                  :placeholder="$t('Name')"
                  required
                />
                <BaseInput
                  v-model="topUpStore.formData.surname"
                  :placeholder="$t('Surname')"
                  required
                />
                <BaseInput
                  v-model="topUpStore.formData.email"
                  type="email"
                  :placeholder="$t('Email')"
                  required
                />
                <BasePhone
                  v-model="phoneDisplay"
                  :placeholder="$t('Phone')"
                  @phone-data="handlePhoneData"
                />
                <BaseSelect
                  v-model="topUpStore.formData.country"
                  :options="countriesStore.countries"
                  option-label="title"
                  option-value="id"
                  :placeholder="$t('Country')"
                  required
                  :loading="countriesStore.isLoading"
                />
                <div class="flex flex-col gap-[10px] sm:flex-row">
                  <BaseInput
                    v-model="topUpStore.formData.city"
                    :placeholder="$t('City')"
                    required
                    class="w-full sm:w-1/2"
                  />
                  <BaseInput
                    v-model="topUpStore.formData.postCode"
                    :placeholder="$t('Post code')"
                    required
                    class="w-full sm:w-1/2"
                  />
                </div>
                <BaseInput
                  v-model="topUpStore.formData.address"
                  :placeholder="$t('Address')"
                  required
                />
              </div>
              <div class="mt-[42px]">
                <BaseButton type="submit" :disabled="topUpStore.isLoading">{{
                  $t(`Pay`)
                }}</BaseButton>
                <p v-if="topUpStore.error" class="mt-2 text-sm text-error">
                  {{ topUpStore.error }}
                </p>
              </div>
            </form>
          </template>
        </div>

        <!-- Right Column - Balance Info -->
        <div
          class="mt-4 w-full rounded-lg bg-[#2E303B] p-6 lg:mt-0 lg:max-w-[470px] lg:bg-transparent lg:p-4 xl:p-8"
        >
          <div class="mb-4 flex items-center justify-between gap-2">
            <span class="font-bold text-secondary">{{
              $t(`Current balance:`)
            }}</span>
            <span class="whitespace-nowrap text-xl lg:text-[28px]">
              {{ userStore.userBalance }} EUR
            </span>
          </div>
          <template v-if="step === 2">
            <div class="mt-6 flex justify-between lg:mt-9">
              <span class="font-bold text-secondary">{{ $t(`Top up:`) }}</span>
              <span class="whitespace-nowrap text-lg"> {{ amount }} EUR </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
