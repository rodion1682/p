<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToCS2 = () => {
  router.push({
    name: 'ProductListPage',
    query: { category: 'cs2' },
  })
}

const goToDota2 = () => {
  router.push({
    name: 'ProductListPage',
    query: { category: 'dota2' },
  })
}
</script>

<template>
  <section class="cat">
    <div class="cat__inner _cnt">
      <div class="cat__top">
        <div class="cat__label">
          {{ $t('FEATURED CATEGORIES') }}
        </div>
        <div class="cat__title _h2">
          {{ $t('FIND YOUR') }}
          <span>{{ $t('NEXT FAVORITE') }}</span>
        </div>
        <div class="cat__text">
          {{
            $t(
              'Explore a wide selection of cosmetics and discover items that match your style.',
            )
          }}
        </div>
        <div class="cat__items">
          <div class="cat__item">
            <div class="cat__content">
              <div class="cat__number">01</div>
              <div class="cat__subtitle _h3">
                <div>{{ $t('CS2') }}</div>
                <span>{{ $t('Weapon Skins') }}</span>
              </div>
              <div class="cat__info">
                {{
                  $t(
                    'Give your loadout a new look with weapon finishes ranging fr om clean, minimalist designs to bold and colorful patterns.',
                  )
                }}
              </div>
              <BaseButton
                class="cat__button"
                variant="bordered"
                @click="goToCS2"
              >
                {{ $t('Browse CS2 Skins') }}</BaseButton
              >
            </div>
            <div class="cat__image _ibg">
              <img src="@/assets/img/cat-01.png" />
            </div>
          </div>
          <div class="cat__item">
            <div class="cat__content">
              <div class="cat__number">02</div>
              <div class="cat__subtitle _h3">
                <div>{{ $t('Knives &') }}</div>
                <span>{{ $t('Gloves') }}</span>
              </div>
              <div class="cat__info">
                {{
                  $t(
                    'Knives & Gloves Discover distinctive knives and gloves that bring character to your inventory and help you stand out in every match.',
                  )
                }}
              </div>
              <BaseButton class="cat__button" variant="bordered">
                {{ $t('Explore Knives & Gloves') }}</BaseButton
              >
            </div>
            <div class="cat__image _ibg">
              <img src="@/assets/img/cat-02.png" />
            </div>
          </div>
          <div class="cat__item">
            <div class="cat__content">
              <div class="cat__number">03</div>
              <div class="cat__subtitle _h3">
                <div>{{ $t('Dota 2') }}</div>
                <span>{{ $t('Cosmetics') }}</span>
              </div>
              <div class="cat__info">
                {{
                  $t(
                    'Customize your favorite heroes with unique equipment, character sets, and cosmetic items inspired by the world of Dota 2.',
                  )
                }}
              </div>
              <BaseButton
                class="cat__button"
                variant="bordered"
                @click="goToDota2"
              >
                {{ $t('Browse Dota 2 Skins') }}</BaseButton
              >
            </div>
            <div class="cat__image _ibg">
              <img src="@/assets/img/cat-03.png" />
            </div>
          </div>
          <div class="cat__item">
            <div class="cat__content">
              <div class="cat__number">04</div>
              <div class="cat__subtitle _h3">
                <div>{{ $t('Rare &') }}</div>
                <span>{{ $t('Collectible Items') }}</span>
              </div>
              <div class="cat__info">
                {{
                  $t(
                    'Find distinctive designs and collectible cosmetics for players who appreciate unique appearances and memorable in-game items.',
                  )
                }}
              </div>
              <BaseButton class="cat__button" variant="bordered">
                {{ $t('Discover Items') }}</BaseButton
              >
            </div>
            <div class="cat__image _ibg">
              <img src="@/assets/img/cat-04.png" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.category {
  @include adaptiveValue('padding-bottom', 230, 25);
  position: relative;
  overflow: hidden;
  &__bg {
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 100%;
    height: 44%;
    transform: translate(-50%, 50%);
    @media (max-width: $md2) {
      height: 33%;
    }
    @media (max-width: $md3) {
      height: 22%;
    }
    @media (max-width: $md4) {
      height: 11%;
    }
  }
  &__inner {
  }

  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 50, 18);
    }
  }

  &__body {
  }

  &__loading {
    display: flex;
    justify-content: center;
    margin: auto;
  }

  &__items {
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(5, 1fr);
    @include adaptiveValue('gap', 20, 4);
    @media (max-width: $md2) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: $md5) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__item {
    @include adaptiveValue('min-height', 122, 40);
    @include adaptiveValue('gap', 20, 10);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 10px;
    color: var(--bg-primary-color);
    background-color: var(--primary-color);
    transition: all 0.3s ease 0s;

    @include adaptiveValue('border-radius', 20, 10);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-primary-color);
        color: var(--primary-color);
      }
    }

    &-icon {
      @include adaptiveValue('min-width', 30, 24);
      @include adaptiveValue('height', 30, 24);
    }

    &-label {
      @include adaptiveValue('font-size', 28, 20);
      line-height: 150%;
      color: inherit;
      font-weight: 700;
    }
  }

  &__empty {
  }
}
</style>
