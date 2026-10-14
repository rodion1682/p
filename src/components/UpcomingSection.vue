<template>
  <!-- Hero Section -->
  <section class="relative">
    <div class="text-center font-primary text-[32px]">
      {{ $t('Who will you become?') }}
    </div>
    <img
      src="@/assets/images/magiculus/upcomingBg.webp"
      alt="upcomingBg"
      class="pointer-events-none absolute left-1/2 top-[82px] mx-auto w-[1090px] min-w-[1090px] -translate-x-1/2 select-none object-contain"
    />

    <img
      src="@/assets/images/magiculus/ice.webp"
      alt="ice"
      class="pointer-events-none absolute left-1/2 top-[462px] mx-auto w-[646px] min-w-[646px] -translate-x-1/2 select-none object-contain"
    />

    <div
      class="relative z-[1] mx-auto mt-[42px] flex w-full max-w-[1308px] flex-col items-center justify-between gap-10 pb-[152px] lg:flex-row lg:items-start lg:pt-[350px]"
    >
      <div class="max-w-[450px] pt-[90px] text-center lg:text-left">
        <div class="font-primary text-[64px] leading-[90%] md:text-[128px]">
          {{ $t('Upcoming Legends') }}
        </div>
        <!-- <button class="group relative mt-[82px] h-[92px] w-[232px]">
          <img
            src="@/assets/images/magiculus/btnBg.webp"
            alt="btnBg"
            class="pointer-events-none absolute left-0 top-0 -z-[1] h-full w-full select-none object-contain"
          />

          <img
            src="@/assets/images/magiculus/btnBgLine.webp"
            alt="btnBgLine"
            class="pointer-events-none absolute left-0 top-0 -z-[1] h-full w-full select-none object-contain opacity-0 transition duration-300 group-hover:opacity-100"
          />

          <span
            class="font-secondary text-[24px] transition duration-300 group-hover:text-accent"
            >{{ $t('Submit') }}</span
          >
        </button> -->
      </div>
      <div class="relative h-[586px] w-[416px] pt-[122px] text-center">
        <img
          src="@/assets/images/magiculus/scroll.webp"
          alt="scroll"
          class="pointer-events-none absolute left-0 top-0 -z-[1] h-full w-full select-none object-contain"
        />
        <div class="mx-auto max-w-[240px] text-base leading-[150%] text-[#000]">
          {{
            $t(
              'New heroes, combat styles, and unique mechanics are coming to the game soon. Stay tuned for updates!',
            )
          }}
        </div>
        <div
          class="mx-auto mt-[50px] max-w-[240px] text-base leading-[150%] text-[#000]"
        >
          {{
            $t(
              'Each update will bring new possibilities, unique abilities, and exciting combat mechanics.',
            )
          }}
        </div>
        <div
          class="mx-auto mt-[42px] max-w-[160px] font-secondary text-[24px] text-[#710000]"
        >
          {{ $t('Prepare for adventure!') }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style scoped></style>
