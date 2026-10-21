<template>
  <section class="about-heroes">
    <div class="about-heroes__inner _cnt-home">
      <div class="about-heroes__heading">
        <h2 class="about-heroes__title _h4">
          {{ $t('Five heroes answered the call') }}
        </h2>
        <p class="about-heroes__subtitle">
          {{ $t('Each came from a different galaxy.') }}
          <br />
          {{ $t('Each carried a different legacy.') }}
        </p>
      </div>

      <div
        v-if="heroesStore.isLoading && !heroes.length"
        class="about-heroes__state"
      >
        <LoadingSpinner />
      </div>

      <div
        v-else-if="heroesStore.error && !heroes.length"
        class="about-heroes__state"
      >
        {{ $t('Failed to load heroes') }}
      </div>

      <div v-else class="about-heroes__list">
        <article
          v-for="(hero, index) in heroes"
          :key="hero.id"
          class="about-heroes__hero"
          :class="{
            'about-heroes__hero_reverse': index % 2 !== 0,
          }"
        >
          <div
            v-if="getDecoration(index)"
            class="about-heroes__decoration"
            :class="{
              'about-heroes__decoration_right': index === 1 || index === 3,
            }"
            aria-hidden="true"
          >
            <img :src="getDecoration(index)" alt="" loading="lazy" />
          </div>

          <div class="about-heroes__artwork">
            <img
              v-if="hero.image_plain"
              class="about-heroes__image"
              :src="hero.image_plain"
              :alt="hero.name"
              loading="lazy"
            />
          </div>

          <div class="about-heroes__content">
            <div v-if="getGalaxyName(hero)" class="about-heroes__eyebrow _lab">
              {{ $t('Galaxy of') }}
              {{ getGalaxyName(hero) }}
            </div>

            <h3 class="about-heroes__name _h4">
              {{ hero.name }}
            </h3>

            <p v-if="hero.short_description" class="about-heroes__role">
              {{ hero.short_description }}
            </p>

            <p v-if="hero.hero_power" class="about-heroes__description">
              {{ hero.hero_power }}
            </p>

            <p v-if="hero.description" class="about-heroes__details">
              {{ hero.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'

import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { useHeroesStore } from '@/stores/heroes'

import fifthDecoration from '@/assets/img/about-heros-left.png'
import fourthDecoration from '@/assets/img/about-heros-right.png'
import thirdDecoration from '@/assets/img/hero-left-bg.png'
import secondDecoration from '@/assets/img/hero-right-bg.png'
import firstDecoration from '@/assets/img/why-bg-left.png'

const heroesStore = useHeroesStore()

const heroes = computed(() => heroesStore.heroes || [])

const decorations = [
  firstDecoration,
  secondDecoration,
  thirdDecoration,
  fourthDecoration,
  fifthDecoration,
]

const getDecoration = index => decorations[index] || null

const getGalaxyName = hero => {
  if (typeof hero.galaxy === 'object' && hero.galaxy !== null) {
    return hero.galaxy.name || hero.galaxy_name || ''
  }

  return hero.galaxy_name || hero.galaxy || ''
}

onMounted(async () => {
  try {
    await heroesStore.ensureHeroes()
  } catch (error) {
    console.error('Failed to load about heroes:', error)
  }
})
</script>

<style lang="scss" scoped>
.about-heroes {
  @include adaptiveValue('padding-top', 80, 36);
  @include adaptiveValue('padding-bottom', 110, 50);

  position: relative;

  overflow: hidden;

  width: 100%;
  min-width: 0;

  background-color: var(--bg-primary-color);

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
    min-width: 0;
  }

  &__heading {
    @include adaptiveValue('margin-bottom', 75, 36);

    text-align: center;
  }

  &__title {
    @include adaptiveValue('margin-bottom', 24, 14);

    margin-top: 0;

    color: #f4d8c5;
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 1.2;
    text-transform: none;
  }

  &__subtitle {
    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.6;
  }

  &__list {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__hero {
    @include adaptiveValue('min-height', 520, 300);
    @include adaptiveValue('column-gap', 70, 20);

    position: relative;

    display: grid;
    align-items: center;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 35, 15);
    }

    &_reverse {
      .about-heroes__artwork {
        justify-content: flex-start;
        grid-column: 2;
        grid-row: 1;
      }

      .about-heroes__content {
        justify-self: end;
        grid-column: 1;
        grid-row: 1;
      }
    }
  }

  &__artwork {
    position: relative;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    width: 100%;
    min-width: 0;
    height: 100%;
  }

  &__image {
    @include adaptiveValue('max-height', 510, 280);

    display: block;

    width: auto;
    max-width: 100%;
    height: auto;

    object-fit: contain;
    object-position: center;

    filter: drop-shadow(0 20px 32px rgb(0 0 0 / 20%));
  }

  &__content {
    position: relative;
    z-index: 2;

    width: 100%;
    min-width: 0;
    max-width: 440px;
  }

  &__eyebrow {
    @include adaptiveValue('margin-bottom', 18, 10);

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__name {
    @include adaptiveValue('font-size', 48, 30);
    @include adaptiveValue('margin-bottom', 12, 8);

    margin-top: 0;

    color: #f4d8c5;
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 1.1;
    text-transform: none;
  }

  &__role {
    @include adaptiveValue('margin-bottom', 20, 12);

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
  }

  &__description {
    @include adaptiveValue('margin-bottom', 16, 10);

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 400;
    line-height: 1.65;
  }

  &__details {
    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.65;
  }

  &__decoration {
    position: absolute;
    top: 50%;
    left: 0;
    z-index: 0;

    width: 33%;
    aspect-ratio: 1 / 0.91;

    opacity: 0.8;

    pointer-events: none;

    transform: translate(-35%, -50%);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
      object-position: left center;
    }

    &_right {
      right: 0;
      left: auto;

      transform: translate(0%, -50%);

      img {
        object-position: right center;
      }
    }
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 300px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;
  }

  @media (max-width: $md3) {
    &__hero {
      column-gap: 24px;
    }

    &__content {
      max-width: 360px;
    }

    &__decoration {
      width: 58%;

      opacity: 0.65;
    }
  }

  @media (max-width: $md4) {
    &__hero {
      gap: 12px;
      grid-template-columns: minmax(0, 1fr);

      min-height: 0;

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 65, 40);
      }

      &_reverse {
        .about-heroes__artwork {
          justify-content: center;
          grid-column: 1;
          grid-row: 1;
        }

        .about-heroes__content {
          justify-self: center;
          grid-column: 1;
          grid-row: 2;
        }
      }
    }

    &__artwork {
      justify-content: center;
      grid-column: 1;
      grid-row: 1;

      height: auto;
    }

    &__image {
      max-height: 380px;
    }

    &__content {
      grid-column: 1;
      grid-row: 2;

      max-width: 480px;

      margin: 0 auto;

      text-align: center;
    }

    &__decoration {
      top: 22%;
      left: 50%;

      width: 100%;
      height: 65%;

      opacity: 0.4;

      transform: translate(-50%, -50%);

      &_right {
        right: auto;
        left: 50%;

        transform: translate(-50%, -50%);
      }

      img {
        object-position: center;
      }
    }
  }

  @media (max-width: $md6) {
    &__image {
      max-height: 310px;
    }

    &__role {
      font-size: 13px;
    }

    &__description {
      font-size: 14px;
    }

    &__details {
      font-size: 12px;
    }
  }
}
</style>
