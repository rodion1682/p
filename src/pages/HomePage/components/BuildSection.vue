<template>
  <div class="build">

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
          <div class="build__label _h4">{{ $t('STRATEGY') }}</div>
          <div class="build__value">
            {{
              $t(
                'Every card changes the possibilities of the battlefield. Command the flow of fate.',
              )
            }}
          </div>
        </div>
        <div class="build__item">
          <div class="build__number">02</div>
          <div class="build__label _h4">{{ $t('COMBOS') }}</div>
          <div class="build__value">
            {{
              $t(
                'Combine heroes, creatures, spells and artifacts to create devastating strategies.',
              )
            }}
          </div>
        </div>
        <div class="build__item">
          <div class="build__number">03</div>
          <div class="build__label _h4">{{ $t('CHOICE') }}</div>
          <div class="build__value">
            {{
              $t(
                'Every hero offers a different way to control the battle. Your path defines your power.',
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
.build {
  @include adaptiveValue('padding-top', 64, 25);
  @include adaptiveValue('padding-bottom', 100, 25);

  &__inner {

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
    flex: 0 1 33.333%;

    border: 1px solid var(--border-sixth-color);
    background-color: var(--bg-primary-color);
    @media (min-width: $md3) {
      &:not(:last-child) {
        border-right: 0px;
      }
    }
    @media (max-width: $md3) {
      flex: 0 1 50%;
      &:first-child {
        border-right: 0px;
      }
      &:last-child {
        flex: 1 1 100%;
      }
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
      &:first-child {
        border-right: 1px solid var(--border-sixth-color);
      }
    }
  }

  &__number {
    color: var(--hint-third-color);
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
    color: var(--secondary-color);
  }
}
</style>
