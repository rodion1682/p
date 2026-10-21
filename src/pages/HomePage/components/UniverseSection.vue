<template>
  <div class="universe" id="universe">
    <div class="universe__inner _cnt-home">
      <div class="universe__label _lab">
        {{ $t('THE UNIVERSE') }}
      </div>
      <div class="universe__title _h4">
        <div>{{ $t('One Game.') }}</div>
        <div>{{ $t('Countless Galaxies.') }}</div>
      </div>

      <div class="universe__text">
        {{
          $t(
            'Celestia Card is a strategic digital collectible card game where ancient civilizations, magical creatures and celestial heroes collide beneath the endless night sky.',
          )
        }}
      </div>
      <div class="universe__hint">
        {{
          $t(
            'Every hero carries the legacy of a different galaxy. Every deck reveals a different path to victory.',
          )
        }}
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.universe {
  @include adaptiveValue('padding-bottom', 87, 30);
  position: relative;
  z-index: 1;

  text-align: center;
  &__inner {
  }

  &__label {
    &:not(:last-child) {
      margin-bottom: 9px;
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 18);
    }
  }

  &__text,
  &__hint {
    max-width: 448px;

    margin-right: auto;
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__hint {
    color: var(--secondary-color);
  }
}
</style>
