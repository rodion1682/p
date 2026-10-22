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

        <BaseButton type="button" icon="arrow" variant="back" @click="goBack">
          {{ $t('Previous Page') }}
        </BaseButton>
      </template>
    </StatusLayout>
  </AuthLayout>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-width: 0;

  &__code {
    @include adaptiveValue('font-size', 100, 64);

    color: var(--hint-primary-color);
    font-family: var(--font-audiowide);
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.04em;
    text-align: center;
    text-shadow: 0 4px 24px rgb(0 0 0 / 15%);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 16);
    }
  }

  &__hint {
    width: 100%;
    max-width: 420px;

    margin: 0 auto;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 160%;
    text-align: center;

    overflow-wrap: anywhere;
  }

  @media (max-width: $md6) {
    &__code {
      letter-spacing: 0.02em;
    }

    &__divider {
      max-width: 160px;
    }

    &__hint {
      font-size: 13px;
    }
  }
}
</style>
