<template>
  <div class="build">
    <div class="build__bg _ibg">
      <img src="@/assets/img/build-bg.jpg" />
    </div>
    <div class="build__inner _cnt-home">
      <div class="build__top">
        <div class="build__subtitle _line-title">
          <span>{{ $t('THE ART OF WAR') }}</span>
        </div>
        <div class="build__title _h3">
          <div>{{ $t('BUILD YOUR DECK. ') }}</div>
          <div>{{ $t('COMMAND THE NIGHT.') }}</div>
        </div>
        <div class="build__text">
          {{
            $t(
              'Varellune is a strategic collectible card game where every decision can change the course of battle.',
            )
          }}
        </div>
      </div>
      <div class="build__items">
        <div class="build__item">
          <div class="build__number">01</div>
          <div class="build__label _h4">{{ $t('CHOOSE YOUR HERO') }}</div>
          <div class="build__value">
            {{ $t('Your hero defines your approach to the game.') }}
          </div>
        </div>
        <div class="build__item">
          <div class="build__number">02</div>
          <div class="build__label _h4">{{ $t('BUILD YOUR DECK') }}</div>
          <div class="build__value">
            {{ $t('Combine creatures, spells, artifacts and abilities.') }}
          </div>
        </div>
        <div class="build__item">
          <div class="build__number">03</div>
          <div class="build__label _h4">{{ $t('CREATE COMBINATIONS') }}</div>
          <div class="build__value">
            {{ $t('Turn individual cards into powerful strategic chains.') }}
          </div>
        </div>
        <div class="build__item">
          <div class="build__number">04</div>
          <div class="build__label _h4">{{ $t('CLAIM VICTORY') }}</div>
          <div class="build__value">
            {{ $t('Reduce your opponent`s health to zero.') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.build {
  @include adaptiveValue('padding-top', 160, 25);
  @include adaptiveValue('padding-bottom', 160, 25);
  position: relative;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }
  &__inner {
    position: relative;
    z-index: 1;
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 15);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__text {
    max-width: 450px;

    margin: 0 auto;

    color: var(--hint-third-color);
  }

  &__items {
    display: flex;
    @media (max-width: $md3) {
      flex-wrap: wrap;
    }
    @media (max-width: $md5) {
      margin-right: -10px;
      margin-left: -10px;
    }
  }

  &__item {
    @include adaptiveValue('padding-top', 32, 10);
    @include adaptiveValue('padding-bottom', 32, 10);
    @include adaptiveValue('padding-left', 46, 10);
    @include adaptiveValue('padding-right', 46, 10);
    display: flex;
    flex: 0 1 25%;
    flex-direction: column;

    border: 1px solid var(--border-sixth-color);
    background-color: var(--bg-primary-color);
    @media (min-width: $md3) {
      &:not(:last-child) {
        border-right: 0px;
      }
    }
    @media (max-width: $md3) {
      flex: 0 1 50%;
      &:nth-child(odd) {
        border-right: 0px;
      }
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
      &:nth-child(odd) {
        border-right: 1px solid var(--border-sixth-color);
      }
    }
  }

  &__number {
    color: var(--hint-third-color);
    font-family: var(--font-spectral);
    font-weight: 400;
    line-height: 120%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 15);
    }
  }

  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }
  &__value {
    margin-top: auto;

    color: var(--secondary-color);
  }
}
</style>
