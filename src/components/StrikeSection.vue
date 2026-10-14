<template>
  <div class="relative mx-auto px-4">
    <img
      :src="strikeBg"
      alt=""
      class="3xl:hidden pointer-events-none absolute left-1/2 top-[154px] w-[1512px] -translate-x-1/2 select-none"
    />
    <div class="relative z-[2] mx-auto w-full max-w-[1288px]">
      <div>
        <div class="flex flex-col gap-4 lg:flex-row">
          <div
            class="w-full pt-0 text-center md:pt-[116px] lg:w-[45%] lg:text-left"
          >
            <h4
              class="mx-auto mb-[34px] max-w-[516px] font-secondary text-[32px] font-medium leading-[42px] md:text-[42px] md:leading-[54px] lg:mx-0"
            >
              {{ $t('strike_title') }}
            </h4>

            <!-- sub-text -->
            <p
              class="mx-auto mb-[34px] max-w-[426px] text-sm leading-normal text-filter lg:mx-0"
            >
              {{ $t('strike_desc') }}
            </p>

            <RouterLink to="/products" class="mx-auto w-fit">
              <BaseButton variant="red" class="w-[184px]">
                {{ $t('strike_btn') }}
              </BaseButton>
            </RouterLink>
          </div>
          <div
            class="mt-6 flex w-full flex-wrap justify-center lg:mt-0 lg:w-[55%] lg:justify-end"
          >
            <div
              class="w-[228px]"
              v-for="(item, i) in productStore.randomProducts.slice(0, 6)"
              :key="i"
            >
              <ProductCard :product="item" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import strikeBg from '@/assets/images/strike-bg.webp'
import { useProductStore } from '@/stores/product'
const productStore = useProductStore()
import ProductCard from './ProductCard.vue'
</script>
