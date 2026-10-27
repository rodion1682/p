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
  <section class="hero">
    <div class="hero__bg _ibg">
      <img src="@/assets/img/hero-bg.png" />
    </div>
    <div class="hero__inner _cnt">
      <div class="hero__content">
        <div class="hero__title _h1">
          <div>{{ $t('FORGE YOUR') }}</div>
          <span>{{ $t('COLLECTION.') }}</span>
          <div>{{ $t('FIND YOUR') }}</div>
          <span>{{ $t('NEXT RELIC.') }}</span>
        </div>
        <div class="hero__text">
          {{
            $t(
              'Discover a world of unique CS2 and Dota 2 skins at Relic Forge. Explore iconic weapon finishes, rare knives, distinctive gloves, legendary hero cosmetics, and other sought-after items. Find the perfect additions to your collection and get the items you want through a simple, convenient shopping experience.',
            )
          }}
        </div>
        <div class="hero__actions">
          <BaseButton class="hero__button" @click="goToCS2">{{
            $t('Explore CS2 Skins')
          }}</BaseButton>
          <BaseButton
            class="hero__button"
            variant="bordered"
            @click="goToDota2"
            >{{ $t('Browse Dota 2 Skins') }}</BaseButton
          >
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.hero {
  @include adaptiveValue('padding-top', 214, 80);
  @include adaptiveValue('padding-bottom', 446, 60);
  position: relative;
  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    img {
      object-position: center;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__content {
    text-shadow:
      0 0 5px rgba(255, 255, 255),
      0 0 8px rgba(255, 255, 255, 0.9),
      0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__text {
    max-width: 588px;
    color: var(--fourth-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    @include adaptiveValue('gap', 20, 10);
    @media (max-width: $md4) {
      justify-content: center;
    }
  }

  &__button {
    max-width: 284px;
  }
}
</style>
