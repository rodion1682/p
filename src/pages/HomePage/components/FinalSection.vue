<template>
  <div class="final">
    <div class="final__inner _cnt-home">
      <div class="final__subtitle _line-title">
        <span>{{ $t('THE FINAL CALL') }}</span>
      </div>
      <div class="final__title _h1">
        {{ $t('THE ECLIPSE HAS BEGUN.') }}
      </div>
      <div class="final__label _h3">
        {{ $t('WILL YOU ANSWER THE CALL?') }}
      </div>

      <div class="final__actions">
        <BaseButton @click="openPlayPage" class="final__button">
          {{ $t('Play now') }}
        </BaseButton>

        <BaseButton
          @click="goToMarketPage"
          variant="hint-bordered"
          class="final__button"
        >
          {{ $t('Build your deck') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

const playRedirectLink = import.meta.env.VITE_PLAY_REDIRECT_LINK

const openPlayPage = () => {
  if (!playRedirectLink) {
    console.warn('VITE_PLAY_REDIRECT_LINK is not defined')
    return
  }

  window.open(playRedirectLink, '_blank', 'noopener,noreferrer')
}

const goToMarketPage = () => {
  router.push({
    name: 'ProductListPage',
  })
}
</script>

<style lang="scss" scoped>
.final {
  @include adaptiveValue('padding-top', 100, 25);
  @include adaptiveValue('padding-bottom', 100, 25);
  &__inner {
    text-align: center;
  }
  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__label {
    color: var(--hint-third-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 15);
    }
  }

  &__actions {
    @include adaptiveValue('gap', 16, 4);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__button {
    @include adaptiveValue('min-height', 48, 40);
    max-width: 250px;
  }
}
</style>
