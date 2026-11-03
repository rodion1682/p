<template>
  <div
    class="base-checkbox"
    :class="[
      attrs.class,
      {
        bordered,
        secondary,
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

    &.is-checked {
    }

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

    .base-checkbox__box {
      &.is-checked {
        background-color: var(--hint-primary-color);
      }
    }
  }

  &__row {
    cursor: pointer;
    display: flex;
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
    opacity: 0;
    pointer-events: none;
  }

  &__box {
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.3s ease 0s;
    background-color: var(--bg-seventh-color);
    min-width: 24px;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid var(--border-primary-color);
    border-radius: 4px;

    &.has-error {
      border-color: var(--error-color);
    }

    &.is-checked {
      border-color: var(--link-color);
      .base-checkbox__check {
        opacity: 1;
      }
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--link-color);
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
    transition: opacity 0.3s ease 0s;

    svg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }

  &__label {
    flex: 1 1 100%;
    cursor: pointer;
    font-weight: 400;
    font-size: 16px;
    line-height: 150%;
    color: var(--fifth-color);
    font-family: var(--font-inter);

    :deep(a) {
      color: var(--link-color) !important;
      display: inline-block !important;
      text-transform: capitalize !important;
      margin: 0 4px;
      transition: border 0.3s ease 0s;
      border-bottom: 1px solid inherit;
      @media (any-hover: hover) {
        color: var(--link-hover-color) !important;
      }
    }
  }

  &__error {
    margin-top: 8px;
  }
}
</style>
