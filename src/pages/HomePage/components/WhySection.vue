<template>
  <div class="why">
    <div class="why__bg why__bg_right _ibg-contain">
      <img src="@/assets/img/hero-right-bg.png" />
    </div>
    <div class="why__inner _cnt-home">
      <div class="why__bg why__bg_left _ibg-contain">
        <img src="@/assets/img/why-bg-left.png" />
      </div>
      <div class="why__top">
        <div class="why__subtitle">
          {{ $t('WHY CELESTIA CARD') }}
        </div>
        <div class="why__title _h4">
          <div>{{ $t('Forged in the Light') }}</div>
          <div>{{ $t('of Distant Stars ') }}</div>
        </div>
      </div>
      <div class="why__items">
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-icon.png" />
          </div>
          <div class="why__label _h6">{{ $t('Strategic Deck Building') }}</div>
          <div class="why__text">
            {{ $t('Build a deck that reflects your playstyle.') }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-icon.png" />
          </div>
          <div class="why__label _h6">{{ $t('Unique Hero Powers') }}</div>
          <div class="why__text">
            {{ $t('Every hero changes the way you approach the battlefield.') }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-icon.png" />
          </div>
          <div class="why__label _h6">{{ $t('Living Celestial World') }}</div>
          <div class="why__text">
            {{
              $t('Discover civilizations scattered across distant galaxies.')
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-icon.png" />
          </div>
          <div class="why__label _h6">{{ $t('Collect & Master') }}</div>
          <div class="why__text">
            {{
              $t(
                'Collect powerful cards and build your ultimate constellation.',
              )
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.why {
  @include adaptiveValue('padding-top', 135, 30);
  @include adaptiveValue('padding-bottom', 96, 30);
  position: relative;
  &__bg {
    position: absolute;
    @media (max-width: $md6) {
      @include hide-item;
    }
    &_right {
      top: 0;
      right: 0;

      width: 38.4%;
      aspect-ratio: 1 / 0.97;
    }

    &_left {
      top: -16%;
      left: 1.5%;

      width: 29%;
      aspect-ratio: 1 / 0.87;
      @media (max-width: $md2) {
        top: -6%;
      }
      @media (max-width: $md3) {
        top: -3%;
      }
    }
  }

  &__inner {
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 98, 18);
    }
  }

  &__subtitle {
    color: var(--third-color);
    font-size: 14px;
    &:not(:last-child) {
      margin-bottom: 9px;
    }
  }

  &__title {
    font-weight: 500;
    line-height: 120%;
  }

  &__items {
    @include adaptiveValue('gap', 80, 20, 1870, 1370, 1);
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(4, 284px);
    @media (max-width: $md3) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $md5) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__item {
    text-align: center;
    @media (min-width: $md5) {
      max-width: 284px;
    }
  }

  &__icon {
    @include adaptiveValue('min-width', 86, 46);
    @include adaptiveValue('height', 84, 44);
    width: fit-content;

    margin-right: auto;
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__label {
    font-weight: 400 !important;
    line-height: 150% !important;
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__text {
    color: var(--secondary-color);
  }
}
</style>
