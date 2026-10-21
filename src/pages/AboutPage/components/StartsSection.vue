<template>
  <div class="starts">
    <div class="starts__bg _ibg">
      <img src="@/assets/img/product-list-bg.png" />
    </div>
    <div class="starts__inner _cnt-home">
      <div class="starts__title _h2">
        <div>{{ $t('The Stars Have Chosen') }}</div>
        <div>{{ $t('Their Champions') }}</div>
      </div>
      <div class="starts__text">
        {{
          $t(
            'Celestia Card is a strategic digital collectible card game set in a universe of living constellations, ancient galaxies and celestial magic.',
          )
        }}
      </div>
      <div class="starts__hint">
        {{ $t('Five heroes. Five galaxies. Infinite strategies.') }}
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.starts {
  @include adaptiveValue('padding-top', 162, 80);
  @include adaptiveValue('padding-bottom', 43, 30);
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

    text-align: center;
  }

  &__title {
    font-weight: 600;
    line-height: 113%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 18);
    }
  }

  &__text,
  &__hint {
    max-width: 680px;

    margin-right: auto;
    margin-left: auto;

    letter-spacing: 0px;
  }
  &__text {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__hint {
    color: var(--secondary-color);
  }
}
</style>
