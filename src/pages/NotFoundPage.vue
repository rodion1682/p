<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import StatusLayout from '@/pages/StatusPages/components/StatusLayout.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  goHome()
}
</script>

<template>
  <AuthLayout>
    <StatusLayout
      :title="$t('Oops! Page Not Found')"
      :text="$t('Sorry, the page you are looking for does not exist.')"
      tone="primary"
    >
      <div class="not-found">
        <div class="not-found__code" aria-hidden="true">404</div>

        <p class="not-found__hint">
          {{
            $t(
              'The page may have been removed, renamed, or is temporarily unavailable.',
            )
          }}
        </p>
      </div>

      <template #actions>
        <BaseButton type="button" variant="primary" @click="goHome">
          {{ $t('Go Back Home') }}
        </BaseButton>

        <BaseButton type="button" variant="hint-bordered" @click="goBack">
          {{ $t('Previous Page') }}
        </BaseButton>
      </template>
    </StatusLayout>
  </AuthLayout>
</template>

<style lang="scss" scoped>
.not-found {
  width: 100%;

  &__code {
    @include adaptiveValue('font-size', 96, 62);

    background: var(--hint-primary-color);

    color: transparent;
    font-family: var(--font-spectral);
    font-weight: 600;
    line-height: 100%;
    letter-spacing: 0.08em;
    text-align: center;

    -webkit-background-clip: text;
    background-clip: text;

    filter: drop-shadow(0 8px 18px rgb(0 0 0 / 35%));
    -webkit-text-fill-color: transparent;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 16);
    }
  }

  &__hint {
    max-width: 420px;

    margin: 0 auto;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 150%;
    text-align: center;
  }
}
</style>
