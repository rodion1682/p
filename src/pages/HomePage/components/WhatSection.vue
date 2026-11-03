<script setup></script>

<template>
  <section class="what">
    <div class="what__inner _cnt-home">
      <div class="what__top">
        <div class="what__subtitle _h4">
          {{ $t('WHAT MAKES WASTELANDCORE DIFFERENT?') }}
        </div>
        <div class="what__title _h2">
          {{ $t('MORE THAN JUST SURVIVAL') }}
        </div>
      </div>
      <div class="what__items">
        <div class="what__item">
          <div class="what__label _h4">
            {{ $t('A WORLD OF POSSIBILITIES') }}
          </div>
          <div class="what__value">
            {{
              $t(
                'Explore Rust’s unforgiving environment, discover valuable loot, and decide how you want to approach each challenge.',
              )
            }}
          </div>
        </div>
        <div class="what__item">
          <div class="what__label _h4">
            {{ $t('PROGRESSION THAT MATTERS') }}
          </div>
          <div class="what__value">
            {{
              $t(
                'Develop your equipment, expand your base, and build up your resources as you progress through the game.',
              )
            }}
          </div>
        </div>
        <div class="what__item">
          <div class="what__label _h4">
            {{ $t('AN ACTIVE COMMUNITY') }}
          </div>
          <div class="what__value">
            {{
              $t(
                'Meet other players, form alliances, challenge your rivals, and make your mark on the server.',
              )
            }}
          </div>
        </div>
        <div class="what__item">
          <div class="what__label _h4">
            {{ $t('CONTINUOUS IMPROVEMENTS') }}
          </div>
          <div class="what__value">
            {{
              $t(
                'Enjoy ongoing server maintenance, gameplay adjustments, and new additions designed to keep the experience engaging.',
              )
            }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.what {
  position: relative;
  z-index: 1;
  @include adaptiveValue('padding-top', 50, 30);
  @include adaptiveValue('padding-bottom', 113, 30);
  &__inner {
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__subtitle {
    color: var(--secondary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 4);
    }
  }

  &__title {
    color: var(--secondary-color);
  }

  &__items {
    @include adaptiveValue('gap', 24, 18);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    @media (max-width: $md3) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $md6) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__item {
  }

  &__label {
    color: var(--secondary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__value {
    color: var(--third-color);
  }
}
</style>
