<template>
  <div class="contact">
    <div class="contact__inner _cnt">
      <h2 class="contact__title _h2">
        {{ $t(`Need help?`) }}
      </h2>
      <form @submit.prevent="handleSubmit" class="contact__form">
        <BaseInput
          v-model="formData.name"
          name="name"
          :placeholder="$t('Name')"
          required
          class="contact__input"
        />
        <BaseInput
          v-model="formData.surname"
          name="surname"
          :placeholder="$t('Surname')"
          required
          class="contact__input"
        />
        <BaseInput
          v-model="formData.email"
          type="email"
          name="email"
          autocomplete="email"
          :placeholder="$t('Email')"
          required
          class="contact__input"
        />
        <BaseInput
          v-model="formData.phone"
          name="phone"
          type="tel"
          :placeholder="$t('Phone')"
          required
          class="contact__input"
        />
        <BaseTextarea
          v-model="formData.message"
          name="message"
          :placeholder="$t('Your message')"
          :rows="6"
          :maxLength="500"
          :showCounter="true"
          required
          class="contact__input"
        />
        <BaseInput
          v-model="formData.topic"
          :placeholder="$t('Topic')"
          required
          class="contact__input"
        />
        <BaseButton
          class="contact__submit"
          type="submit"
          :disabled="isLoading"
          >{{ $t(`Submit`) }}</BaseButton
        >
      </form>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import { useToast } from '@/composables/useToast'
import api from '@/plugins/axios'
import { ref } from 'vue'

const isLoading = ref(false)
const formData = ref({
  name: '',
  surname: '',
  email: '',
  phone: '',
  topic: '',
  message: '',
})

const toast = useToast()

// Handle form submission
const handleSubmit = async () => {
  try {
    isLoading.value = true
    await api.post('/contact-us', {
      ...formData.value,
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
    phone: '',
    topic: '',
    message: '',
  }
}
</script>


