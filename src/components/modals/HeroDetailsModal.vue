<template>
  <BaseModal
    :show="show"
    size="product"
    modal-class="heros-modal"
    :close-label="$t('Close modal')"
    @close="$emit('close')"
  >
    <div v-if="hero" class="heros">
      <div class="heros__inner _cnt-home">
        <div class="heros__iamge _ibg-contain">
          <img
            v-if="hero.image_plain"
            :key="hero.id"
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

            <div class="heros__name-small">
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

          <div class="heros__cards">
            <button
              v-for="item in heroes"
              :key="item.id"
              type="button"
              class="heros__card"
              :class="{
                heros__card_selected: Number(hero.id) === Number(item.id),
              }"
              :aria-label="`${$t('Select')} ${item.name}`"
              :aria-pressed="Number(hero.id) === Number(item.id)"
              @click="selectHero(item.id)"
            >
              <div class="heros__card-iamge _ibg-contain">
                <img
                  v-if="item.image_plain"
                  :src="item.image_plain"
                  :alt="item.name"
                  loading="lazy"
                />
              </div>
            </button>
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
  heroes: {
    type: Array,
    default: () => [],
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

const emit = defineEmits(['close', 'select-hero'])

function selectHero(heroId) {
  emit('select-hero', heroId)
}
</script>

<style lang="scss" scoped>
.heros {
  padding-top: 30px;
  padding-bottom: 30px;

  &__inner {
    @include adaptiveValue('gap', 130, 20, 1370, 992, 1);
    display: flex;

    max-width: 1370px;

    @media (max-width: $md3) {
      flex-direction: column-reverse;
    }

    @media (max-width: $md3) {
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
    display: flex;
    flex: 0 1 59%;
    flex-direction: column;
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

  &__cards {
    @include adaptiveValue('margin-top', 124, 22);
    display: flex;
    flex-wrap: wrap;

    @media (max-width: $md6) {
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  &__card {
    @include adaptiveValue('padding-left', 17, 10);
    @include adaptiveValue('padding-right', 17, 10);
    @include adaptiveValue('padding-top', 20, 10);
    @include adaptiveValue('padding-bottom', 20, 10);

    flex: 0 1 20%;

    border: 1px solid transparent;
    border-radius: 10px;
    opacity: 0.5;

    transition: all 0.3s ease 0s;

    &_selected {
      border-color: var(--hint-fifth-color);
      opacity: 1;

      pointer-events: none;
    }

    &-iamge {
      width: 100%;
      aspect-ratio: 1 / 1.5;
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-fifth-color);
        opacity: 1;
      }
    }

    @media (max-width: $md6) {
      flex: 0 1 33.333%;
    }
  }

  &__loading {
    margin: auto;
  }

  &__empty {
    margin: auto;

    color: var(--fifth-color);
    text-align: center;
  }
}
</style>
