<template>
  <AuthLayout>
    <!-- Back button -->
    <!-- <BackButton
      @click="handleBack"
      class="absolute -top-8 left-8 z-[1] sm:top-0"
    >
      {{ $t(`Back`) }}
    </BackButton> -->
    <h1 class="mb-[60px] text-center font-secondary text-[40px]">
      {{ $t('Create a New Password') }}
    </h1>

    <!-- Centered Form -->

    <div
      :class="[
        'relative z-[1] w-full rounded-[16px] bg-[#1A1A1AB8] px-4 py-[50px]',
      ]"
    >
      <img
        src="@/assets/images/magiculus/border.webp"
        alt="border"
        class="pointer-events-none absolute right-0 top-0 h-full w-full select-none object-fill"
      />
      <img
        src="@/assets/images/magiculus/gem.webp"
        alt="gem"
        class="pointer-events-none absolute left-1/2 top-[-9px] w-5 -translate-x-1/2 select-none object-contain"
      />
      <div
        v-if="successMessage"
        class="flex flex-col items-center justify-center text-center"
      >
        <span class="text-[#34C759]">
          <SuccessIcon />
        </span>
        <div
          class="mx-auto mt-[22px] max-w-[294px] text-base leading-[150%] opacity-60"
        >
          {{
            $t(
              'The password has been successfully changed, you can log in to your account.',
            )
          }}
        </div>
        <RouterLink :to="{ name: 'Auth', query: { form: 'signin' } }">
          <BaseButton class="group relative mt-[32px] min-w-[250px]">
            <span class="relative">{{ $t(`GO TO THE LOGIN PAGE`) }}</span>
          </BaseButton>
        </RouterLink>
      </div>
      <div v-else class="mx-auto w-full max-w-[340px] text-center">
        <div class="mb-10 text-base">
          {{
            $t('To keep your account secure, consider creating a new password.')
          }}
        </div>
        <form @submit.prevent="handleReset" class="w-full">
          <div class="space-y-[16px]">
            <!-- Password Input -->
            <BaseInput
              v-model="password"
              type="password"
              name="password"
              :placeholder="$t('New Password')"
              required
              :icon="KeyIcon"
              icon-color="#FFFFFF"
              icon-opacity="0.2"
            />

            <!-- Password Confirmation Input -->
            <BaseInput
              v-model="passwordConfirmation"
              type="password"
              name="password_confirmation"
              :placeholder="$t('Confirm New Password')"
              required
              :icon="KeyIcon"
              icon-color="#FFFFFF"
              icon-opacity="0.2"
            />
          </div>

          <!-- Error Message -->
          <p v-if="errorMessage" class="mt-4 text-error">
            {{ errorMessage }}
          </p>
          <div class="mt-[32px] text-[14px] opacity-[60%]">
            {{
              $t(
                'The password must contain at least 8 characters, including letters and numbers.',
              )
            }}
          </div>
          <div class="mt-[32px] flex flex-wrap items-center justify-between">
            <button
              class="text-[14px] text-accent hover:underline"
              @click="handleBack"
            >
              {{ $t('Сancel') }}
            </button>
            <!-- Reset Password Button -->
            <BaseButton
              type="submit"
              :disabled="isLoading"
              class="group relative min-w-[182px]"
            >
              <span class="relative" v-if="isLoading">{{
                $t(`Saving...`)
              }}</span>
              <span class="relative" v-else>{{ $t(`SAVE`) }}</span>
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import KeyIcon from '@/components/icons/KeyIcon.vue'
import SuccessIcon from '@/components/icons/SuccessIcon.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useUserStore } from '@/stores/user'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const password = ref('')
const passwordConfirmation = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const successMessage = ref(false)

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// Get the token and email from the URL
const token = ref(route.query.token)
const email = ref(route.query.email)

onMounted(() => {
  if (!token.value || !email.value) {
    errorMessage.value = 'Invalid password reset link.'
  }
})

const handleReset = async () => {
  errorMessage.value = ''
  isLoading.value = true

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Passwords do not match.'
    isLoading.value = false
    return
  }

  try {
    await userStore.reset(token.value, email.value, password.value)
    // toast.success('Your password has been reset successfully.')
    // router.push({ name: 'Auth', query: { form: 'signin' } })
    successMessage.value = true
  } catch (error) {
    errorMessage.value = error
  } finally {
    isLoading.value = false
  }
}

// Handle back navigation
const handleBack = () => {
  router.push({ name: 'Auth', query: { form: 'signin' } })
}
</script>
