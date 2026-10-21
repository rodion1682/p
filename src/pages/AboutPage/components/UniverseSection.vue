<template>
  <div class="universe">
    <div class="universe__bg _ibg">
      <img src="@/assets/img/universe-bg.jpg" />
    </div>
    <div class="universe__inner _cnt-home">
      <div class="universe__label _lab">
        {{ $t('THE UNIVERSE · AN ANCIENT CHRONICLE') }}
        
      </div>
      <div class="universe__title _h4">
        {{ $t('A Universe Written In Stars') }}
      </div>
      <div class="universe__item">
        <div class="universe__image _ibg-cotnain">
          <img src="@/assets/img/universe-number.png" />
          <div class="universe__number _h6">I</div>
        </div>
        <div class="universe__subtitle _h6">
          {{ $t('The First Light') }}
        </div>
        <div class="universe__text">
          {{
            $t(
              'Long before the first kingdoms existed, there were the stars. From their light came galaxies — each with its own life, magic and laws.',
            )
          }}
        </div>
      </div>
      <div class="universe__item">
        <div class="universe__image _ibg-cotnain">
          <img src="@/assets/img/universe-number.png" />
          <div class="universe__number _h6">II</div>
        </div>
        <div class="universe__subtitle _h6">
          {{ $t('The Awakening Paths') }}
        </div>
        <div class="universe__text">
          {{
            $t(
              'For thousands of years these civilizations existed apart. Until the ancient celestial paths began to awaken again.',
            )
          }}
        </div>
      </div>
      <div class="universe__item">
        <div class="universe__image _ibg-cotnain">
          <img src="@/assets/img/universe-number.png" />
          <div class="universe__number _h6">III</div>
        </div>
        <div class="universe__subtitle _h6">
          {{ $t('The Celestial Convergence') }}
        </div>
        <div class="universe__text">
          {{
            $t(
              'The old astronomical chronicles spoke of a coming event — the Celestial Convergence. As the boundaries between galaxies opened, forgotten creatures, ancient artifacts and impossible powers returned.',
            )
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss">
.universe {
  @include adaptiveValue('padding-top', 64, 30);
  @include adaptiveValue('padding-bottom', 34, 30);
  position: relative;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 88%;
  }

  &__inner {
    position: relative;
    z-index: 1;

    text-align: center;
  }

  &__label {
    letter-spacing: 0px;
    &:not(:last-child) {
      margin-bottom: 9px;
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 18);
    }
  }

  &__item {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 18);
    }
  }

  &__image {
    @include adaptiveValue('min-width', 86, 46);
    @include adaptiveValue('height', 84, 44);
    position: relative;

    width: fit-content;

    margin-right: auto;
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__number {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;

    color: var(--secondary-color);
    font-weight: 500;
    line-height: 150%;

    transform: translate(-50%, -50%);
  }

  &__subtitle {
    color: var(--primary-color);
    font-weight: 500;
    line-height: 150%;
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__text {
    max-width: 680px;

    margin: 0 auto;

    color: var(--secondary-color);
    letter-spacing: 0px;
  }
}
</style>
