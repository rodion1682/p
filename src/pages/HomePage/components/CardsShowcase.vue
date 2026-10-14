<template>
  <div class="cards-showcase">
    <div class="cards-showcase__inner _cnt-home">
      <div class="cards-showcase__top">
        <div class="cards-showcase__subtitle _line-title">
          <span>{{ $t('CARD SYSTEM') }}</span>
        </div>

        <div class="cards-showcase__title _h3">
          {{ $t('COLLECT THE POWER') }}
          <span>{{ $t('OF THE MOON.') }}</span>
        </div>

        <div class="cards-showcase__description">
          {{
            $t(
              'Every card is fragment of the forgotten world. Five rarities. One universe.',
            )
          }}
        </div>
      </div>

      <div class="cards-showcase__items">
        <article
          v-for="(item, index) in rarities"
          :key="`${item.rarity}-${index}`"
          class="cards-showcase__item"
        >
          <button
            type="button"
            class="cards-showcase__card"
            :aria-label="`${$t('View')} ${item.label}`"
            @click="goToRarity(item.rarity)"
          >
            <div class="cards-showcase__image">
              <img :src="item.image" :alt="item.label" loading="lazy" />
            </div>

            <div class="cards-showcase__name">
              {{ $t(item.label) }}
            </div>
          </button>
        </article>
      </div>

      <BaseButton
        class="cards-showcase__button"
        @click="goToMarketPage"
        variant="hint-bordered"
      >
        {{ $t('Build your deck') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'

import  commonCardImage  from '@/assets/img/cards-01.png'
import rareCardImage from '@/assets/img/cards-02.png'
import legendaryCardImage from '@/assets/img/cards-03.png'
import  commonCardImage1  from '@/assets/img/cards-04.png'
import legendaryCardImage1 from '@/assets/img/cards-05.png'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const rarities = [
  {
    rarity: 'common',
    label: t('BASIC'),
    image: commonCardImage,
  },
  {
    rarity: 'rare',
    label: t('ADDITIONAL'),
    image: rareCardImage,
  },
  {
    rarity: 'common',
    label: t('BASIC'),
    image: commonCardImage1,
  },
  {
    rarity: 'legendary',
    label: t('Legendary'),
    image: legendaryCardImage,
  },
  {
    rarity: 'legendary',
    label: t('OBSIDIAN'),
    image: legendaryCardImage1,
  },
]

const goToRarity = rarity => {
  router.push({
    path: '/buy-card',
    query: {
      rarity,
    },
  })
}

const goToMarketPage = () => {
  router.push({
    path: '/buy-card',
  })
}
</script>

<style lang="scss" scoped>
.cards-showcase {
  @include adaptiveValue('padding-top', 100, 50);
  @include adaptiveValue('padding-bottom', 80, 25);

  position: relative;

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__top {
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 60, 30);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }
  &__title {
    span {
      display: block;

      color: var(--hint-secondary-color);
    }

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__description {
    max-width: 420px;

    margin-right: auto;
    margin-left: auto;

    color: var(--hint-third-color);
    font-size: 14px;
    line-height: 150%;
  }

  &__items {
    @include adaptiveValue('gap', 40, 15);

    display: grid;
    align-items: start;
    grid-template-columns: repeat(5, minmax(0, 1fr));

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 55, 30);
    }

    @media (max-width: $md3) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: $md4) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: $md5) {
      grid-template-columns: 1fr;

      max-width: 300px;
    }
  }

  &__item {
    min-width: 0;
  }

  &__card {
    display: block;

    width: 100%;

    padding: 0;

    border: none;
    background-color: transparent;

    color: inherit;

    cursor: pointer;
  }

  &__image {
    position: relative;

    width: 100%;
    aspect-ratio: 0.68;

    transition:
      transform 0.35s ease,
      filter 0.35s ease;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 12);
    }

    img {
      position: absolute;
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__name {
    font-family: var(--font-spectral);
    font-size: 16px;
    font-weight: 500;
    line-height: 120%;
    text-align: center;
    text-transform: uppercase;
  }

  &__button {
    @include adaptiveValue('min-height', 48, 40);
    max-width: 250px;

    margin-right: auto;
    margin-left: auto;
  }

  @media (any-hover: hover) {
    &__card {
      &:hover {
        .cards-showcase__image {
          transform: translateY(-8px) scale(1.02);

          filter: brightness(1.08);
        }
      }
    }
  }
}
</style>
