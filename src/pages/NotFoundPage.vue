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

        <div class="not-found__divider" aria-hidden="true">
          <span />
        </div>

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
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  min-width: 0;

  &__code {
    @include adaptiveValue('font-size', 100, 64);

    color: #f4c6b3;
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 1;
    letter-spacing: 0.06em;
    text-align: center;
    text-shadow: 0 4px 22px rgb(244 198 179 / 15%);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 14);
    }
  }

  &__divider {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 220px;
    height: 1px;

    margin: 0 auto;

    background: linear-gradient(
      90deg,
      transparent,
      var(--border-secondary-color),
      transparent
    );

    span {
      width: 5px;
      height: 5px;

      border: 1px solid var(--border-secondary-color);
      background: var(--bg-primary-color);

      transform: rotate(45deg);
    }

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__hint {
    width: 100%;
    max-width: 420px;

    margin: 0 auto;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.6;
    text-align: center;

    overflow-wrap: anywhere;
  }

  @media (max-width: $md6) {
    &__code {
      letter-spacing: 0.03em;
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
