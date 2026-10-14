<template>
  <div class="relative z-[2] mx-auto">
    <div class="mx-auto w-full max-w-[1272px]">
      <div>
        <div class="flex flex-col-reverse gap-4 md:flex-row">
          <div class="w-full md:w-[45%]">
            <div class="flex min-w-0 flex-1 justify-center md:justify-end">
              <div
                class="flex h-[48px] w-[54px] items-center justify-center bg-[url(/src/assets/images/whyNum.webp)] font-secondary font-medium"
              >
                01
              </div>
              <div class="pl-4 pt-[12px]">
                <h3
                  class="mb-[24px] font-secondary text-[18px] font-medium leading-[24px] text-white"
                >
                  {{ $t('why_us_item1_title') }}
                </h3>
                <p class="text-sm leading-[24px] text-filter">
                  {{ $t('why_us_item1_desc') }}
                </p>
              </div>
            </div>

            <div
              class="mt-[70px] flex min-w-0 flex-1 justify-center md:justify-start"
            >
              <div
                class="flex h-[48px] w-[54px] items-center justify-center bg-[url(/src/assets/images/whyNum.webp)] font-secondary font-medium"
              >
                02
              </div>
              <div class="pl-4 pt-[12px]">
                <h3
                  class="mb-[24px] font-secondary text-[18px] font-medium leading-[24px] text-white"
                >
                  {{ $t('why_us_item2_title') }}
                </h3>
                <p class="text-sm leading-[24px] text-filter">
                  {{ $t('why_us_item2_desc') }}
                </p>
              </div>
            </div>
            <div
              class="mt-[70px] flex min-w-0 flex-1 justify-center md:justify-end"
            >
              <div
                class="flex h-[48px] w-[54px] items-center justify-center bg-[url(/src/assets/images/whyNum.webp)] font-secondary font-medium"
              >
                03
              </div>
              <div class="pl-4 pt-[12px]">
                <h3
                  class="mb-[24px] font-secondary text-[18px] font-medium leading-[24px] text-white"
                >
                  {{ $t('why_us_item3_title') }}
                </h3>
                <p class="text-sm leading-[24px] text-filter">
                  {{ $t('why_us_item3_desc') }}
                </p>
              </div>
            </div>
          </div>
          <div class="w-full pt-0 md:w-[55%] md:pt-[135px]">
            <h2
              class="font-primary mb-[34px] w-full text-center text-[32px] font-medium leading-[42px] md:text-[58px] md:leading-[74px]"
            >
              {{ $t('why_us_title') }}
            </h2>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WhyUsSection',
}
</script>
