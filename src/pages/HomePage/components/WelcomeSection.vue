<template>
  <div class="welcome">
    <div class="welcome__decor _ibg-contain">
      <img src="@/assets/img/welcome-decor-left.png" />
    </div>
    <div class="welcome__inner _cnt-home">
      <div class="welcome__info">
        <div class="welcome__subtitle _h5">{{ $t('Origins') }}</div>
        <div class="welcome__title _h2">
          <span>{{ $t('Welcome to') }}</span>
          {{ $t('varellune') }}
        </div>
        <div class="welcome__text">
          {{
            $t(
              'Before kingdoms rose and empires fell, there was varellune — the greatest magical civilization ever known',
            )
          }}
        </div>
      </div>
      <div class="welcome__column">
        <div class="welcome__items">
          <div class="welcome__item">
            {{ $t('Its libraries contained limitless knowledge.') }}
          </div>
          <div class="welcome__item">
            {{ $t('Its academies shaped legendary masters.') }}
          </div>
          <div class="welcome__item">
            {{ $t('Its temples protected artifacts beyond imagination.') }}
          </div>
        </div>
        <div class="welcome__label _h3">
          {{ $t('Now their gates stand open once more.') }}
        </div>
        <BaseButton
          @click="goToAboutPage"
          class="welcome__button"
          variant="bordered"
          >{{ $t('Learn more about the world of varellune') }}</BaseButton
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAboutPage = () => {
  router.push({
    name: 'AboutPage',
  })
}
</script>

<style lang="scss" scoped>
.welcome {
  @include adaptiveValue('padding-top', 41, 25);
  @include adaptiveValue('padding-bottom', 146, 25);
  position: relative;
  &__decor {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;

    width: 15.7vw;
    height: 10.4vw;

    transform: translate(0px, 70%);
  }
  &__inner {
    @media (min-width: $md4) {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
  }

  &__info {
    @media (min-width: $md4) {
      max-width: 444px;
    }
    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    span {
      display: block;
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__text {
  }

  &__column {
    width: 100%;
    max-width: 676px;
  }

  &__items,
  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__item {
    &::before {
      margin-right: 9px;

      color: var(--hint-secondary-color);

      content: '◈';
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__label {
  }

  &__button {
    max-width: 395px;

    letter-spacing: 0px;
  }
}
</style>
