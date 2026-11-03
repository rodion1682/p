<template>
  <AuthLayout form-class="not-found__card">
    <div class="not-found">
      <div class="not-found__code">404</div>

      <div class="not-found__content">
        <h1 class="not-found__title _h3">
          {{ $t('Oops! Page Not Found') }}
        </h1>

        <p class="not-found__text">
          {{ $t('Sorry, the page you are looking for does not exist.') }}
        </p>
      </div>

      <BaseButton class="not-found__button" variant="primary" @click="goHome">
        {{ $t('Go Back Home') }}
      </BaseButton>
    </div>
  </AuthLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  min-width: 0;

  text-align: center;

  &__code {
    color: var(--hint-primary-color);

    font-family: var(--font-akshar);
    font-weight: 700;
    line-height: 1;

    @include adaptiveValue('font-size', 120, 72);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 12);
    }
  }

  &__content {
    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__title {
    color: var(--primary-color);
    text-transform: uppercase;
    overflow-wrap: anywhere;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 10);
    }
  }

  &__text {
    max-width: 360px;
    margin-inline: auto;

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-weight: 400;
    line-height: 150%;

    @include adaptiveValue('font-size', 16, 14);
  }

  &__button {
    width: 100%;
    max-width: 280px;

    @include adaptiveValue('min-height', 46, 40);
  }

  @media (max-width: $md6) {
    &__button {
      max-width: 100%;
    }
  }
}

:deep(.not-found__card) {
  max-width: 600px;
}
</style>
