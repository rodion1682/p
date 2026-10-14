<template>
  <div class="truth">
    <div class="truth__inner _cnt-home">
      <div class="truth__bg _ibg">
        <img src="@/assets/img/truth.png" />
      </div>
      <div class="truth__content">
        <div class="truth__subtitle _h5">
          {{ $t('THE ANCIENT TRUTH') }}
        </div>
        <div class="truth__title _h3">
          <div>{{ $t('WHEN THE MOON TURNS BLACK,') }}</div>
          <span>{{ $t('THE OLD GODS') }}</span>
          {{ $t('AWAKEN.') }}
        </div>
        <div class="truth__text">
          <p>
            {{
              $t(
                'For centuries, the lunar cults of Varellune guarded secrets that were never meant to be remembered.',
              )
            }}
          </p>
          <p>
            {{
              $t(
                'They spoke of ancient eclipses, sleeping gods, forgotten stars and a silver force hidden beyond the veil of dreams.',
              )
            }}
          </p>
          <p class="truth__text-italic">
            {{
              $t(
                'Now the seals are breaking. The old rituals are returning. And those who seek the power of the moon must choose how much of themselves they are willing to sacrifice.',
              )
            }}
          </p>
        </div>
      </div>
      <BaseButton
        @click="goToAboutPage"
        class="truth__button"
        variant="hint-bordered"
        >{{ $t('DISCOVER THE LORE') }}</BaseButton
      >
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
.truth {
  @include adaptiveValue('margin-top', 0, -100);
  position: relative;
  &::before {
    position: absolute;
    top: 50%;
    left: 0;

    width: 100%;
    height: 58%;

    border: 1px solid var(--border-fifth-color);
    background-color: var(--bg-third-color);

    content: '';

    transform: translate(0px, -50%);
  }
  &__inner {
    @include adaptiveValue('padding-top', 229, 150);
    @include adaptiveValue('padding-bottom', 36, 25);
    position: relative;
  }

  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }

  &__content {
    @include adaptiveValue('padding-bottom', 145, 80);
    position: relative;
    z-index: 1;

    text-align: center;
  }

  &__subtitle {
    font-family: var(--font-spectral);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__title {
    color: var(--bg-third-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__text {
    max-width: 450px;

    margin-right: auto;
    margin-left: auto;
    p {
      color: var(--bg-third-color);
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 25, 15);
      }
    }
    &-italic {
      color: #5c1e2a !important;
      font-style: italic !important;
      font-weight: 600 !important;
    }
  }

  &__button {
    @include adaptiveValue('min-height', 48, 40);
    max-width: 250px;

    margin: 0 auto;
  }
}
</style>
