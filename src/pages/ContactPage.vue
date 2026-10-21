<template>
  <div class="relative mx-auto mt-12 max-w-[1344px] flex-col px-8">
    <!-- Back button on the top left -->
    <BackButton
      @click="handleBack"
      class="absolute -top-8 left-8 z-[1] sm:top-0"
      >{{ $t(`Back`) }}</BackButton
    >

    <!-- Centered Form -->
    <div
      class="relative mb-20 flex items-start justify-center sm:relative sm:mt-0"
    >
      <div
        class="w-full rounded-[20px] bg-[#2E303B] p-6 md:max-w-[514px] md:p-[48px_52px]"
      >
        <h2 class="mb-6 text-2xl text-primary md:mb-10 md:text-3xl">
          {{ $t(`Need help?`) }}
        </h2>

        <form @submit.prevent="handleSubmit" class="w-full">
          <div class="space-y-[10px]">
            <!-- Common fields for both forms -->
            <BaseInput
              v-model="formData.name"
              name="name"
              :placeholder="$t('Name')"
              required
            />
            <BaseInput
              v-model="formData.surname"
              name="surname"
              :placeholder="$t('Surname')"
              required
            />
            <BaseInput
              v-model="formData.email"
              type="email"
              name="email"
              autocomplete="email"
              :placeholder="$t('Email')"
              required
            />
            <!-- Phone Input -->
            <BasePhone
              v-model="phoneDisplay"
              name="phone"
              :placeholder="$t('Phone')"
              class="mb-2.5"
              @phone-data="handlePhoneData"
              :required="true"
            />
            <BaseInput
              v-model="formData.topic"
              :placeholder="$t('Topic')"
              required
            />
            <textarea
              v-model="formData.message"
              :placeholder="$t('Your message')"
              required
              class="max-h-[300px] w-full rounded-large border border-border bg-[#2E303B] px-[16px] py-[15px] pr-[16px] text-[14px] placeholder:text-secondary focus:border-gray-400 focus:outline-none focus:ring-0"
            ></textarea>
          </div>
          <div class="mt-[42px]">
            <BaseButton type="submit" :disabled="isLoading">{{
              $t(`Submit`)
            }}</BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import BackButton from '@/components/BackButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import BasePhone from '@/components/BasePhone.vue'
import { useToast } from '@/composables/useToast'
import api from '@/plugins/axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const formData = ref({
  name: '',
  surname: '',
  email: '',
  topic: '',
  message: '',
})

const phoneDisplay = ref('')

// For API submission
const phoneData = ref({
  phone: '',
  phoneCountryCode: '',
  nationalNumber: '',
  isValid: false,
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

const toast = useToast()

// Handle back navigation
const handleBack = () => {
  router.push('/')
}

// Handle form submission
const handleSubmit = async () => {
  try {
    isLoading.value = true
    if (!phoneData.value.isValid) {
      throw new Error('Please enter a valid phone number')
    }
    await api.post('/contact-us', {
      ...formData.value,
      phone: phoneData.value.phone || phoneDisplay.value,
      phoneCountryCode: phoneData.value.phoneCountryCode,
      nationalNumber: phoneData.value.nationalNumber,
    })

    toast.success('Message sent successfully!')
    clearForm()
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || 'Something went wrong'
    toast.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const clearForm = () => {
  formData.value = {
    name: '',
    surname: '',
    email: '',
    topic: '',
    message: '',
  }
  phoneDisplay.value = ''
  phoneData.value = {
    phone: '',
    phoneCountryCode: '',
    nationalNumber: '',
    isValid: false,
  }
}
</script>
