<template>
  <div class="moon">
    <div class="moon__bg _ibg">
      <img src="@/assets/img/moon-bg.jpg" />
    </div>
    <div class="moon__inner _cnt-home">
      <div class="moon__content">
        <div class="moon__title _h1">
          <div>{{ $t('A WORLD') }}</div>
          <div>
            {{ $t('SHAPED') }}
            <span>{{ $t('BY') }}</span>
          </div>
          <span>{{ $t('THE MOON') }}</span>
        </div>
        <div class="moon__subtitle _h5">
          {{
            $t(
              'Varellune is a strategic collectible card game where every decision can change the course of battle.',
            )
          }}
        </div>
        <div class="moon__text">
          <p>
            {{
              $t(
                'For thousands of years, civilizations have worshipped it, feared it and studied its movements. Ancient kingdoms were built around lunar temples. Secret orders devoted their lives to celestial rituals. Alchemists searched for fragments of moon-silver, believing that the mysterious metal could alter the boundary between life and death.',
              )
            }}
          </p>
          <p>
            {{
              $t(
                'But the moon has never revealed all of its secrets.Beneath its cold light lies an older power — something that existed before kingdoms, before gods and perhaps before the stars themselves.',
              )
            }}
          </p>
        </div>
        <div class="moon__info">
          <p>
            {{ $t('Now the ancient seals are beginning to break.') }}
          </p>
          <p>{{ $t('The Eclipse is coming.') }}</p>
          <p>{{ $t('And Varellune is awakening.') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.moon {
  @include adaptiveValue('padding-top', 160, 75);
  @include adaptiveValue('padding-bottom', 199, 25);
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

  &__content {
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__subtitle {
    max-width: 564px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__text {
    max-width: 564px;

    color: var(--secondary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__info {
    max-width: 564px;
    p {
      line-height: 200%;
    }
  }
}
</style>
