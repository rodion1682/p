<template>
  <div class="battlefield">
    <div class="battlefield__inner _cnt-home">
      <div class="battlefield__decor battlefield__decor_left _ibg-contain">
        <img src="@/assets/img/blue-left-decor.png" />
      </div>
      <div class="battlefield__decor battlefield__decor_right _ibg-contain">
        <img src="@/assets/img/blue-right-decor.png" />
      </div>
      <div class="battlefield__top">
        <div class="battlefield__subtitle _h6">
          {{ $t('Reveal the main battlefield.') }}
        </div>
        <div class="battlefield__title _h4">
          <div>{{ $t('EVERY DUEL AWAKENS') }}</div>
          <div>{{ $t('ETERNITY.') }}</div>
        </div>
      </div>
      <div class="battlefield__images">
        <div class="battlefield__iamge _ibg-contain">
          <img src="@/assets/img/battlefield-01.png" />
        </div>
        <div class="battlefield__iamge _ibg-contain">
          <img src="@/assets/img/battlefield-02.png" />
        </div>
        <div class="battlefield__iamge _ibg-contain">
          <img src="@/assets/img/battlefield-03.png" />
        </div>
        <div class="battlefield__iamge _ibg-contain">
          <img src="@/assets/img/battlefield-04.png" />
        </div>
        <div class="battlefield__iamge _ibg-contain">
          <img src="@/assets/img/battlefield-05.png" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.battlefield {
  @include adaptiveValue('margin-bottom', -196, -30);
  position: relative;
  z-index: 1;
  &__inner {
    @include adaptiveValue('padding-top', 136, 30);
    @include adaptiveValue('border-radius', 22, 10);
    @include adaptiveValue('padding-bottom', 97, 30);
    position: relative;

    max-width: 1356px;

    background: linear-gradient(0deg, #111624 0%, rgba(9, 13, 23, 0) 100%);
  }

  &__decor {
    @include adaptiveValue('width', 305, 105);
    position: absolute;
    top: 0;

    aspect-ratio: 1 / 0.82;
    &_left {
      left: 0;

      transform: translate(-20%, -20%);
    }

    &_right {
      right: 0;

      transform: translate(20%, -20%);
    }
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 42, 22);
    }
  }

  &__subtitle {
    @include adaptiveValue('font-size', 24, 18);
    color: var(--fifth-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 27, 18);
    }
  }

  &__title {
    @include adaptiveValue('font-size', 42, 22);
  }

  &__images {
    @include adaptiveValue('gap', 20, 10);
    display: flex;
    justify-content: space-between;

    width: 100%;
    max-width: 1044px;

    margin: 0 auto;
  }

  &__iamge {
    @include adaptiveValue('min-width', 116, 50);
    width: fit-content;
    aspect-ratio: 1;
  }
}
</style>
