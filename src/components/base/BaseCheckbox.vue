<template>
  <div
    class="base-checkbox"
    :class="[
      attrs.class,
      {
        bordered,
        secondary,
        'variant-products': variant === 'products',
        'is-checked': modelValue,
        'is-disabled': disabled,
      },
    ]"
  >
    <label class="base-checkbox__row">
      <input
        class="base-checkbox__input"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
      />

      <span
        class="base-checkbox__box"
        :class="{
          'is-checked': modelValue,
          'has-error': !!error,
        }"
        aria-hidden="true"
      >
        <SvgIcon :icon="CheckIcon" class="base-checkbox__check" />
      </span>

      <span class="base-checkbox__label">
        <slot />

        <template v-if="terms">
          {{
            $t('I confirm that I am 18 years old or older and I agree to the')
          }}

          <router-link
            v-if="termsPage"
            class="_link"
            :to="getPageUrl(termsPage)"
            target="_blank"
            @click.stop
          >
            {{ capitalizeWords(termsPage?.title) }}
          </router-link>

          <template v-if="privacyPage">
            {{ ` ${$t('and')} ` }}

            <router-link
              class="_link"
              :to="getPageUrl(privacyPage)"
              target="_blank"
              @click.stop
            >
              {{ capitalizeWords(privacyPage?.title) }}
            </router-link>
          </template>
        </template>
      </span>
    </label>

    <div v-if="error" class="base-checkbox__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, useAttrs } from 'vue'

import { CheckIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useStaticPages } from '@/composables/useStaticPages'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },

  bordered: {
    type: Boolean,
    default: false,
  },

  secondary: {
    type: Boolean,
    default: false,
  },

  variant: {
    type: String,
    default: 'default',
  },

  terms: {
    type: Boolean,
    default: false,
  },

  error: {
    type: String,
    default: '',
  },

  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const { termsPage, privacyPage, getPageUrl, ensurePages } = useStaticPages()

onMounted(async () => {
  if (!props.terms) return

  try {
    await ensurePages()
  } catch (err) {
    console.error('Failed to load static pages:', err)
  }
})

const onChange = event => {
  emit('update:modelValue', event.target.checked)
}

const capitalizeWords = text => {
  if (!text) return ''

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-checkbox {
  &.is-disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &.bordered {
    cursor: pointer;
    border-style: solid;
    border-color: transparent;
    display: flex;
    align-items: center;

    .base-checkbox__row {
      flex: 1 1 100%;
    }

    .base-checkbox__label {
      display: flex;
      align-items: center;
      width: 100%;
      font-weight: 700;
      text-transform: capitalize;
    }
  }

  &.secondary {
    .base-checkbox__row {
      gap: 12px;
    }

    .base-checkbox__box.is-checked {
      background-color: var(--hint-primary-color);
    }
  }

  &__row {
    cursor: pointer;
    display: flex;
    align-items: flex-start;

    @include adaptiveValue('gap', 21, 12);

    @media (any-hover: hover) {
      &:hover {
        .base-checkbox__box {
          border-color: var(--link-color);
        }
      }
    }
  }

  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;

    &:focus-visible + .base-checkbox__box {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 3px;
    }
  }

  &__box {
    position: relative;
    flex-shrink: 0;

    min-width: 24px;
    width: 24px;
    height: 24px;

    border-radius: 4px;
    border: 1px solid var(--border-primary-color);
    background-color: var(--bg-seventh-color);

    transition:
      background-color 0.3s ease,
      border-color 0.3s ease;

    &.has-error {
      border-color: var(--error-color);
    }

    &.is-checked {
      border-color: var(--link-color);

      .base-checkbox__check {
        opacity: 1;
      }
    }
  }

  &__check {
    position: absolute;
    left: 50%;
    top: 50%;

    width: 12px;
    height: 9px;

    transform: translate(-50%, -50%);

    color: var(--link-color);
    opacity: 0;

    transition: opacity 0.3s ease;

    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
  }

  &__label {
    flex: 1 1 100%;
    cursor: pointer;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;
    color: var(--fifth-color);

    :deep(a) {
      color: var(--link-color) !important;
      display: inline-block !important;
      text-transform: capitalize !important;
      margin: 0 4px;

      transition: color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          color: var(--link-hover-color) !important;
        }
      }
    }
  }

  &__error {
    margin-top: 8px;
  }

  // SHOP / PRODUCTS VARIANT
  &.variant-products {
    padding: 10px 12px;
    border-radius: 4px;

    transition: background-color 0.25s ease;

    &.is-checked {
      background-color: var(--bg-seventh-color);
    }

    .base-checkbox__row {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 12px;
    }

    .base-checkbox__box {
      min-width: 18px;
      width: 18px;
      height: 18px;

      background-color: var(--bg-third-color);
      border: 1px solid var(--border-primary-color);
      border-radius: 4px;

      &.is-checked {
        background-color: var(--hint-primary-color);
        border-color: var(--hint-primary-color);
      }

      &.has-error {
        border-color: var(--error-color);
      }
    }

    .base-checkbox__check {
      width: 11px;
      height: 9px;
      color: var(--secondary-color);
    }

    .base-checkbox__label {
      min-width: 0;
      color: var(--primary-color);
      font-size: 13px;
      font-weight: 400;
      line-height: 150%;
    }

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-seventh-color);

        .base-checkbox__box {
          border-color: var(--hint-primary-color);
        }
      }
    }

    @media (max-width: $md6) {
      padding: 9px 10px;

      .base-checkbox__row {
        gap: 10px;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-checkbox,
  .base-checkbox__box,
  .base-checkbox__check {
    transition: none;
  }
}
</style>
