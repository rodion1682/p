<template>
  <section class="about">
    <div class="about__inner _cnt-home">
      <div class="about__bg _ibg">
        <img src="@/assets/img/about-bg.jpg" />
      </div>
      <div class="about__top">
        <div class="about__subtitle _h3">
          <span>{{ $t('The Wastelandcore Market') }}</span>
        </div>
        <div class="about__title _h1">
          {{ $t('Trade Smarter.') }}
          <div>{{ $t(' Survive Longer.') }}</div>
        </div>
        <div class="about__text">
          {{
            $t(
              'Why settle for standard gear? Our integrated shop allows you to customize your experience and acquire essential cosmetics directly through the platform.',
            )
          }}
        </div>
      </div>
      <div class="about__items">
        <div class="about__item">
          <div class="about__number _h2"><span>01</span></div>
          <div class="about__label _h5">{{ $t('Integrated Economy:') }}</div>
          <div class="about__value">
            {{
              $t('A seamless bridge between the game world and the web shop.')
            }}
          </div>
        </div>
        <div class="about__item">
          <div class="about__number _h2"><span>02</span></div>
          <div class="about__label _h5">{{ $t('Verified Trading:') }}</div>
          <div class="about__value">
            {{
              $t('A secure environment to obtain skins with total confidence.')
            }}
          </div>
        </div>
        <div class="about__item">
          <div class="about__number _h2"><span>03</span></div>
          <div class="about__label _h5">{{ $t('Progressive Rewards:') }}</div>
          <div class="about__value">
            {{
              $t('Play, earn, and upgrade your loadout as you conquer the map.')
            }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.about {
  @include adaptiveValue('margin-top', -56, 15);
  @media (min-width: $md5) {
    @include adaptiveValue('padding-left', 0, 10, 1400, 992, 1);
    @include adaptiveValue('padding-right', 0, 10, 1400, 992, 1);
  }
  @media (max-width: $md5) {
    margin-left: -1px;
    margin-right: -1px;
  }
  &__inner {
    @include adaptiveValue('border-radius', 30, 6);
    background-color: var(--bg-eight-color);
    border: 1px solid var(--border-primary-color);
    @include adaptiveValue('padding-left', 54, 10, 1400, 992, 1);
    @include adaptiveValue('padding-right', 54, 10, 1400, 992, 1);
    @include adaptiveValue('padding-bottom', 60, 10);
    @include adaptiveValue('padding-top', 60, 10);
    position: relative;
    z-index: 1;
    @media (max-width: $md5) {
      padding: 10px 11px;
    }
  }

  &__bg {
    @include adaptiveValue('border-radius', 30, 6);
    height: 80%;
    position: absolute;
    right: 13px;
    top: 2px;
    width: 61%;
    @media (max-width: $md6) {
      width: 100%;
    }
  }

  &__top {
    position: relative;
    z-index: 1;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 38, 20);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__text {
    max-width: 590px;
  }

  &__items {
    position: relative;
    z-index: 1;
    display: flex;
    @include adaptiveValue('gap', 106, 20, 1400, 992, 1);
    @media (max-width: $md4) {
      flex-wrap: wrap;
      gap: 20px;
    }
  }

  &__item {
    flex: 0 1 33.333%;
    @media (max-width: $md4) {
      flex: 0 1 calc(50% - 10px);
      &:last-child {
        flex: 1 1 100%;
      }
    }
    @media (max-width: $md7) {
      flex: 1 1 100%;
    }
  }

  &__number {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 10);
    }
  }

  &__label {
    &:not(:last-child) {
      margin-bottom: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-primary-color);
    }
  }

  &__value {
  }
}
</style>
