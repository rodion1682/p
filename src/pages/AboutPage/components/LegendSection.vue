<template>
  <div class="legend">
    <div class="legend__inner _cnt-home">
      <div class="legend__top">
        <div class="legend__subtitle _line-title">
          <span>{{ $t('ANCIENT CHRONICLES') }}</span>
        </div>

        <div class="legend__title _h3">
          {{ $t('THE LEGEND OF') }}
          <div>{{ $t('VARELLUNE') }}</div>
        </div>

        <div class="legend__label _h5">
          {{ $t('An Ancient Chronicle of the First Veiling') }}
        </div>
      </div>

      <div class="legend__body">
        <div class="legend__item">
          <div class="legend__info _h3">
            {{ $t('In the beginning, there was only darkness.') }}
          </div>

          <div class="legend__block">
            <div class="legend__text">
              <p>
                {{
                  $t(
                    'Before the first kingdom raised its towers, before the first god was given a name, the world of Varellune slept beneath an empty sky.',
                  )
                }}
              </p>

              <p>{{ $t('Then the Moon appeared.') }}</p>
              <p>{{ $t('It was not born like a star.') }}</p>
              <p>{{ $t('It descended.') }}</p>
            </div>

            <div class="legend__text">
              <p>
                {{
                  $t(
                    'The ancient sages called it Varellune, the Silver Witness.',
                  )
                }}
              </p>

              <p>
                {{
                  $t(
                    'Where its light touched the earth, stone began to remember.',
                  )
                }}
              </p>

              <p>
                {{
                  $t(
                    'Forests grew around forgotten temples. Rivers changed their course beneath its reflection. And from the silver soil came the first people.',
                  )
                }}
              </p>

              <p>
                {{ $t('They believed the Moon had chosen them.') }}
              </p>

              <p>
                {{
                  $t(
                    'They built great cities beneath its light and raised enor mous temples toward the heavens. Their priests learned to read the stars. Their oracles learned to interpret dreams. Their alchemists discovered that silver could hold memories.',
                  )
                }}
              </p>

              <p>
                {{
                  $t(
                    'And their necromancers discovered something far more dangerous.',
                  )
                }}
              </p>

              <p>{{ $t('The dead could hear the Moon.') }}</p>
            </div>
          </div>
        </div>

        <div class="legend__item">
          <div class="legend__info _h3">
            {{
              $t(
                'For centuries, the ancient orders lived beneath a fragile peace.',
              )
            }}
          </div>

          <div class="legend__row">
            <span class="legend__row-label">
              {{ $t('The Lunar Priests guarded the temples') }}
            </span>

            <span class="legend__row-value">
              {{ $t('guarded the temples.') }}
            </span>
          </div>

          <div class="legend__row">
            <span class="legend__row-label">
              {{ $t('The Alchemical Conclave') }}
            </span>

            <span class="legend__row-value">
              {{ $t('studied the mysteries of silver.') }}
            </span>
          </div>

          <div class="legend__row">
            <span class="legend__row-label">
              {{ $t('The Dreamveil') }}
            </span>

            <span class="legend__row-value">
              {{ $t('watched over the boundary between dreams and waking.') }}
            </span>
          </div>

          <div class="legend__row">
            <span class="legend__row-label">
              {{ $t('The great warriors of the Moonscar clans') }}
            </span>

            <span class="legend__row-value">
              {{ $t('defended the sacred lands.') }}
            </span>
          </div>

          <div class="legend__row">
            <span class="legend__row-label">
              {{ $t('The Starmoon Oracles') }}
            </span>

            <span class="legend__row-value">
              {{ $t('watched the heavens.') }}
            </span>
          </div>
        </div>

        <BaseButton
          variant="hint-bordered"
          class="legend__button"
          @click="scrollToDark"
        >
          {{ $t('Read more') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

const scrollToDark = () => {
  const target = document.querySelector('#dark')
  const header = document.querySelector('.header')

  if (!target) return

  const headerHeight = header?.offsetHeight ?? 0

  const targetTop =
    target.getBoundingClientRect().top + window.scrollY - headerHeight

  window.scrollTo({
    top: targetTop,
    behavior: 'smooth',
  })
}
</script>

<style lang="scss" scoped>
.legend {
  @include adaptiveValue('padding-bottom', 64, 25);

  padding-top: 25px;

  &__top {
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 84, 15);
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

  &__label {
    color: var(--hint-third-color);
  }

  &__body {
    position: relative;

    max-width: 680px;

    margin: 0 auto;

    &::before {
      position: absolute;
      top: -15%;
      left: -50%;

      width: 216px;
      height: 176px;

      background-image: url('../../../assets/img/quote.svg');
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;

      content: '';

      @media (max-width: $md4) {
        @include hide-item;
      }
    }
  }

  &__item {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 25);
    }
  }

  &__info {
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__text {
    color: var(--secondary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__row {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }

    &-label {
      margin-right: 4px;
    }

    &-value {
      color: var(--hint-third-color);
    }
  }

  &__button {
    max-width: 140px;
  }
}
</style>
