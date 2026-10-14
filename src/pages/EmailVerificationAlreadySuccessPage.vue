<template>
  <div
    class="flex min-h-screen w-full items-center justify-center bg-[length:100%] bg-left-top bg-no-repeat px-4 pb-[160px] pt-[120px] md:pt-[175px]"
  >
    <img
      src="@/assets/images/magiculus/hero.webp"
      alt="Hero Background"
      class="pointer-events-none absolute right-0 top-0 -z-[1] w-full select-none object-contain object-top"
    />
    <div
      class="pointer-events-none absolute right-0 top-0 h-[60vw] w-full select-none bg-gradient-to-b from-[#00000099] to-[#000000]"
    ></div>
    <div class="relative text-center">
      <!-- <img src="@/assets/images/info-icon.svg" alt="Info" class="mb-4" /> -->
      <h2 class="mb-4 text-2xl font-bold">
        {{ $t('Email Already Verified') }}
      </h2>
      <p class="mb-6">
        {{
          $t('Your email was already verified. No further action is needed.')
        }}
      </p>
      <BaseButton @click="goToAccount" class="w-fit">{{
        $t('Go to My Account')
      }}</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()

const goToAccount = () => {
  router.push({ name: 'account-personal' })
}
</script>
