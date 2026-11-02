<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => router.push('/')
</script>

<template>
  <div class="not-found">
    <div class="not-found__inner _cnt-hme">
      <div class="not-found__code _h2"><span>404</span></div>
      <div class="not-found__title _h3">{{ $t(`Oops! Page Not Found`) }}</div>
      <div class="not-found__text _5">
        {{ $t(`Sorry, the page you are looking for does not exist.`) }}
      </div>
      <BaseButton class="not-found__button" @click="goHome" variant=" bordered">
        {{ $t(`Go Back Home`) }}
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.not-found {
  @include adaptiveValue('padding-top', 50, 25);
  @include adaptiveValue('padding-bottom', 50, 25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 100%;
  &__inner {
    text-align: center;
  }
  &__code {
    margin-bottom: 10px;
  }
  &__title {
    text-align: center;
    font-weight: 700;
    @include adaptiveValue('font-size', 48, 22);
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  &__text {
    color: var(--third-color);
    font-weight: 700;

    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }
  &__button {
    justify-content: center !important;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
