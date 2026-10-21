<template>
  <BaseModal
    :show="show"
    size="product"
    labelledby="hero-details-title"
    :close-label="$t('Close modal')"
    @close="$emit('close')"
  >
    <div v-if="hero" class="heros">
      <div class="heros__inner _cnt-home">
        <div class="heros__iamge _ibg-contain">
          <img
            v-if="hero.image_plain"
            :src="hero.image_plain"
            :alt="hero.name"
          />
        </div>

        <div class="heros__content">
          <div class="heros__title _h4">
            <div>{{ $t('FIVE CHAMPIONS.') }}</div>
            <div>{{ $t('FIVE FORCES OF ETERNITY.') }}</div>
          </div>

          <div class="heros__style">
            <div class="heros__style-icon _ibg-contain">
              <img v-if="elementIcon" :src="elementIcon" alt="" />
            </div>

            <div class="heros__style-label">
              {{ hero.name }}
            </div>
          </div>

          <div class="heros__name">
            <h2 id="hero-details-title" class="heros__name-large _h3">
              {{ hero.name }}
            </h2>

            <div v-if="hero.hero_power" class="heros__name-small">
              {{ hero.hero_power }}
            </div>
          </div>

          <div v-if="hero.playstyle" class="heros__playstyle">
            {{ hero.playstyle }}
          </div>

          <div v-if="hero.short_description" class="heros__desc">
            {{ hero.short_description }}
          </div>

          <div v-if="hero.description" class="heros__desc">
            {{ hero.description }}
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  hero: {
    type: Object,
    default: null,
  },
  accent: {
    type: String,
    default: '#f77936',
  },
  element: {
    type: String,
    default: 'Champion',
  },
  elementIcon: {
    type: String,
    default: '',
  },
})

defineEmits(['close'])
</script>

<style lang="scss" scoped>
.heros {
  @include adaptiveValue('padding-top', 64, 30);
  @include adaptiveValue('padding-bottom', 83, 30);

  &__inner {
    @include adaptiveValue('gap', 130, 20, 1370, 992, 1);
    display: flex;

    max-width: 1370px;

    @media (max-width: $md3) {
      flex-direction: column-reverse;
      gap: 10px;
    }
  }

  &__iamge {
    flex: 0 1 41%;

    aspect-ratio: 1 / 1.62;

    @media (max-width: $md3) {
      width: 100%;
      max-width: 491px;

      margin: 0 auto;
    }
  }

  &__content {
    flex: 0 1 59%;
  }

  &__title {
    @include adaptiveValue('font-size', 42, 19);
    color: var(--sixth-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 84, 18);
    }
  }

  &__style {
    display: flex;
    align-items: center;
    gap: 20px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }

    &-icon {
      min-width: 29px;
      height: 29px;
    }

    &-label {
      @include adaptiveValue('font-size', 24, 20);
      @include adaptiveValue('line-height', 33, 38);
      color: var(---fifth-color);
    }
  }

  &__name {
    font-weight: 400;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 42, 18);
    }

    @media (min-width: $md6) {
      @include adaptiveValue('gap', 46, 20, 1370, 992, 1);
      display: flex;
    }

    @media (max-width: $md6) {
      text-align: left;
    }

    &-large {
      color: var(--third-color);

      @media (min-width: $md6) {
        line-height: 100%;
      }
    }

    &-small {
      @include adaptiveValue('font-size', 24, 20);
      @include adaptiveValue('line-height', 33, 38);
      align-self: flex-end;

      color: var(--third-color);
    }
  }

  &__playstyle {
    color: var(--fifth-color);
    font-weight: 700;

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__desc {
    color: var(--fifth-color);
  }
}
</style>
