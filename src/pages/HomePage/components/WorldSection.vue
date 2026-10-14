<template>
  <div class="world">
    <div class="world__bg _ibg">
      <img src="@/assets/img/world.jpg" />
    </div>
    <div class="world__inner _cnt-home">
      <div class="world__subtitle _line-title">
        <span>{{ $t('THE WORLD OF VARELLUNE') }}</span>
      </div>
      <div class="world__content">
        <div class="world__title _h3">
          <div>{{ $t('A WORLD BENEATH') }}</div>
          <span>{{ $t('THE ECLIPSE') }}</span
          >.
        </div>
        <div class="world__text">
          <p>
            {{
              $t(
                'Varellune is a world shaped by the moon. Ancient civilizations built temples to celestial gods.',
              )
            }}
          </p>
          <p>
            {{
              $t(
                'Alchemists searched for immortality. Warriors carried scars gifted by lunar powers. Oracles learned to read the stars.',
              )
            }}
          </p>
          <p>
            {{
              $t(
                'Then came the Eclipse. Something answered from beyond the moon.',
              )
            }}
          </p>
        </div>
        <div class="world__info _h5">{{ $t('No one knows what it was') }}</div>
        <BaseButton
          @click="goToAboutPage"
          class="world__button"
          variant="hint-bordered"
          >{{ $t('DISCOVER THE LORE') }}
        </BaseButton>
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
.world {
  @include adaptiveValue('padding-top', 100, 25);
  @include adaptiveValue('padding-bottom', 100, 25);
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

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }
  &__content {
    max-width: 450px;

    margin-right: auto;
    margin-left: auto;
  }

  &__title {
    color: var(--primary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__text {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
    p {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 25, 15);
      }
    }
  }

  &__info {
    color: var(--hint-third-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__button {
    @include adaptiveValue('min-height', 48, 40);
    max-width: 250px;

    margin: 0 auto;
  }
}
</style>
