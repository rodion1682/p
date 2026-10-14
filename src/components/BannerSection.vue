<template>
  <!-- Page background -->
  <section class="z-1 relative m-0">
    <img
      :src="bannerBg2"
      alt=""
      class="3xl:hidden pointer-events-none absolute left-0 top-1/2 z-[1] hidden w-full -translate-y-1/2 select-none md:block"
    />
    <div class="relative mx-auto max-w-[1204px]">
      <img
        :src="bannerBg"
        alt=""
        class="pointer-events-none absolute bottom-0 left-0 top-1/2 z-[1] hidden w-full -translate-y-1/2 select-none md:block"
      />

      <img
        :src="knife1"
        alt="knife"
        class="pointer-events-none absolute -bottom-4 -left-[116px] z-[2] hidden select-none md:block"
      />

      <img
        :src="knife2"
        alt="knife 2"
        class="pointer-events-none absolute -bottom-4 -right-[28px] z-[2] hidden select-none md:block"
      />
      <div
        class="relative z-[3] flex w-full flex-col justify-center px-3 py-[60px] text-center md:py-[96px]"
      >
        <!-- headline -->
        <h3
          class="mx-auto mb-[34px] max-w-[604px] font-secondary text-[32px] font-medium leading-[42px] md:text-[42px] md:leading-[54px]"
        >
          {{ $t('banner_title') }}
        </h3>

        <!-- sub-text -->
        <p
          class="mx-auto mb-[34px] max-w-[778px] text-sm leading-normal text-filter"
        >
          {{ $t('banner_desc') }}
        </p>

        <RouterLink to="/products" class="mx-auto w-fit">
          <BaseButton variant="red" class="w-[184px]">
            {{ $t('banner_btn') }}
          </BaseButton>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import bannerBg2 from '@/assets/images/banner-bg.webp'
import bannerBg from '@/assets/images/banner-bg2.webp'
import knife1 from '@/assets/images/knife1.webp'
import knife2 from '@/assets/images/knife2.webp'
import BaseButton from './BaseButton.vue'
</script>

<style scoped></style>
