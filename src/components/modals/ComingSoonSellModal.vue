<template>
  <BaseModal
    :show="show"
    wrapper-classes="coming-soon__inner"
    :aria-label="$t('Coming Soon')"
    @close="emit('close')"
  >
    <div class="coming-soon">
      <div class="coming-soon__icon" aria-hidden="true">
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
          <circle
            cx="24"
            cy="24"
            r="17"
            stroke="currentColor"
            stroke-width="2"
          />

          <path
            d="M24 13V24L31 29"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div class="coming-soon__content">
        <span class="coming-soon__eyebrow">
          {{ $t('Sell Items') }}
        </span>

        <h2 class="coming-soon__title _h2">
          {{ $t('Coming Soon') }}
        </h2>

        <p class="coming-soon__description">
          {{ $t('Selling skins is not available yet.') }}
        </p>
      </div>

      <div class="coming-soon__bottom">
        <BaseButton
          type="button"
          variant="primary"
          class="coming-soon__button"
          @click="emit('close')"
        >
          {{ $t('Got it') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

:global(.modal__inner.coming-soon__inner) {
  width: 100%;
  max-width: 450px;
  border-radius: 6px;
  background-color: var(--bg-eight-color);
}

.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  min-width: 0;

  @include adaptiveValue('padding-top', 24, 12);
  @include adaptiveValue('padding-bottom', 10, 4);

  text-align: center;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    width: 84px;
    height: 84px;

    margin-bottom: 26px;

    border: 1px solid var(--hint-primary-color);
    border-radius: 6px;

    background-color: var(--hint-primary-color);
    color: var(--bg-third-color);

    svg {
      display: block;
      width: 44px;
      height: 44px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
    min-width: 0;
  }

  &__eyebrow {
    display: block;

    margin-bottom: 10px;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 500;
    line-height: 1.4;

    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-akshar);
    font-weight: 700;
    line-height: 1.1;

    text-transform: uppercase;

    @include adaptiveValue('font-size', 38, 30);

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__description {
    max-width: 310px;

    margin: 0;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.65;

    text-align: center;
    overflow-wrap: anywhere;
  }

  &__bottom {
    display: flex;
    justify-content: center;

    width: 100%;
    min-width: 0;

    @include adaptiveValue('margin-top', 30, 24);
    @include adaptiveValue('padding-top', 24, 18);

    border-top: 1px solid var(--border-primary-color);
  }

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 220px;
    min-height: 44px;

    padding: 10px 20px;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;

    text-align: center;
    text-transform: uppercase;

    transition:
      background-color 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease;
  }

  @media (max-width: $md6) {
    &__icon {
      width: 72px;
      height: 72px;
      margin-bottom: 22px;

      svg {
        width: 38px;
        height: 38px;
      }
    }

    &__eyebrow {
      font-size: 10px;
    }

    &__title {
      font-size: 30px;
    }

    &__description {
      font-size: 13px;
    }

    &__button {
      max-width: 100%;
      min-height: 42px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .coming-soon__button {
    transition: none;
  }
}
</style>
