<template>
  <div class="build">
    <div class="build__bg _ibg">
      <img src="@/assets/img/about-build-bg.png" />
    </div>

    <div class="build__inner _cnt-home">
      <div class="build__top">
        <div class="build__subtitle _lab">
          {{ $t('THE GAME · YOUR DECK, YOUR STRATEGY') }}
        </div>
        <div class="build__title _h4">
          {{ $t('Build Your Constellation') }}
        </div>
      </div>
      <div class="build__items">
        <div class="build__item">
          <div class="build__iamge _ibg-contain">
            <img src="@/assets/img/why-icon.png" />
          </div>
          <div class="build__label _h6">
            {{ $t('Summon') }}
          </div>
          <div class="build__text">
            {{ $t('Call powerful creatures to the battlefield.') }}
          </div>
        </div>
        <div class="build__item">
          <div class="build__iamge _ibg-contain">
            <img src="@/assets/img/why-icon.png" />
          </div>
          <div class="build__label _h6">
            {{ $t('Cast') }}
          </div>
          <div class="build__text">
            {{ $t('Use celestial magic to change the course of battle.') }}
          </div>
        </div>
        <div class="build__item">
          <div class="build__iamge _ibg-contain">
            <img src="@/assets/img/why-icon.png" />
          </div>
          <div class="build__label _h6">
            {{ $t('Equip') }}
          </div>
          <div class="build__text">
            {{ $t('Wield ancient weapons and strengthen your hero.') }}
          </div>
        </div>
        <div class="build__item">
          <div class="build__iamge _ibg-contain">
            <img src="@/assets/img/why-icon.png" />
          </div>
          <div class="build__label _h6">
            {{ $t('Combine') }}
          </div>
          <div class="build__text">
            {{
              $t(
                'Create powerful combinations between cards and hero abilities.',
              )
            }}
          </div>
        </div>
      </div>
      <div class="build__bottom">
        <div class="build__bottom-text">
          <div>{{ $t('Every turn gives you new possibilities.') }}</div>
          <div>{{ $t('Spend your mana wisely.') }}</div>
          <div>{{ $t('Read the battlefield.') }}</div>
          <div>{{ $t('Choose when to attack.') }}</div>
          <div>{{ $t('Know when to hold back.') }}</div>
        </div>
        <div class="build__bottom-title _h4">
          {{ $t('One decision can change everything') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.build {
  @include adaptiveValue('padding-top', 140, 30);
  @include adaptiveValue('padding-bottom', 77, 30);
  position: relative;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 70%;
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 95, 18);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      margin-bottom: 9px;
    }
  }

  &__title {
    color: var(--secondary-color);
    font-weight: 500;
    line-height: 120%;
  }

  &__items {
    @include adaptiveValue('gap', 80, 20, 1870, 1370, 1);
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(4, 284px);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 140, 30);
    }
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

  &__iamge {
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
  &__bottom {
    text-align: center;
    &-text {
      color: var(--primary-color);
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 32, 18);
      }
    }

    &-title {
      color: var(--secondary-color);
      font-weight: 500;
      line-height: 120%;
    }
  }
}
</style>
