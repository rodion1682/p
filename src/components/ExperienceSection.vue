<template>
  <!-- Hero Section -->
  <section class="relative">
    <div class="relative pb-20 lg:pb-[558px]">
      <img
        src="@/assets/images/magiculus/experienceBg.webp"
        alt="experienceBg"
        class="pointer-events-none absolute left-1/2 top-[124px] -z-[1] hidden min-w-[2118px] -translate-x-1/2 select-none lg:block"
      />
      <div
        class="relative text-center font-primary text-[64px] text-[#FC812A] md:text-[96px]"
      >
        {{ $t('Experience') }}
      </div>
      <div
        class="relative text-center font-primary text-[64px] text-[#FC812A] md:text-[96px]"
      >
        {{ $t('the unique card designs') }}
      </div>
      <div
        class="mx-auto mt-[82px] max-w-[646px] text-center text-[20px] leading-[150%] opacity-60"
      >
        {{
          $t(
            'In Magikolus, every card is a meticulously crafted masterpiece, inspired by deep history and powerful magic. Whether it`s an alchemist`s fantastic potion or a wizard`s magical spell, each card features rich illustrations that bring your heroes and spells to life.',
          )
        }}
      </div>

      <a href="https://game.magiculus.com/">
        <button
          class="group relative mx-auto mt-[88px] table h-[92px] w-[292px]"
        >
          <img
            src="@/assets/images/magiculus/btnBg2.webp"
            alt="btnBg2"
            class="pointer-events-none absolute left-0 top-0 -z-[1] h-full w-full select-none object-contain"
          />

          <img
            src="@/assets/images/magiculus/btnBgLine2.webp"
            alt="btnBgLine2"
            class="pointer-events-none absolute left-0 top-0 -z-[1] h-full w-full select-none object-contain opacity-0 transition duration-300 group-hover:opacity-100"
          />

          <span
            class="font-secondary text-[24px] transition duration-300 group-hover:text-accent"
            >{{ $t('Start') }}</span
          >
        </button>
      </a>
    </div>
  </section>
</template>

<script setup></script>

<style scoped></style>
