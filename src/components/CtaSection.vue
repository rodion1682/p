<template>
  <!-- Page background -->
  <section class="relative z-0 m-0">
    <img
      :src="ctaBg"
      alt=""
      class="pointer-events-none absolute bottom-0 left-0 w-full select-none 2xl:hidden"
    />
    <div class="relative mx-auto">
      <div class="relative flex w-full flex-col justify-center text-center">
        <!-- headline -->
        <h5
          class="mx-auto mb-[42px] max-w-[746px] font-secondary text-[32px] font-medium leading-[42px] md:text-[42px] md:leading-[54px]"
        >
          {{ $t('cta_title') }}
        </h5>

        <!-- sub-text -->
        <p
          class="mx-auto mb-[42px] max-w-[778px] text-sm leading-normal text-filter"
        >
          {{ $t('cta_desc') }}
        </p>

        <RouterLink
          :to="{ name: 'Auth', query: { form: 'signup' } }"
          class="mx-auto w-fit"
        >
          <BaseButton variant="red" class="w-[184px]">
            {{ $t('cta_btn') }}
          </BaseButton>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import ctaBg from '@/assets/images/cta-bg.webp'
import BaseButton from './BaseButton.vue'
</script>

<style scoped></style>
