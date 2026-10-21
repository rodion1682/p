<script setup>
import { computed, useAttrs } from 'vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { CheckIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).slice(2, 9)}`,
  },

  name: {
    type: String,
    default: '',
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  required: {
    type: Boolean,
    default: false,
  },

  error: {
    type: [String, Boolean],
    default: '',
  },

  terms: {
    type: Boolean,
    default: false,
  },

  bordered: {
    type: Boolean,
    default: false,
  },

  secondary: {
    type: Boolean,
    default: false,
  },
  rowClass: {
    type: [String, Array, Object],
    default: '',
  },

  boxClass: {
    type: [String, Array, Object],
    default: '',
  },

  labelClass: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const attrs = useAttrs()

const { termsPage, privacyPage, getPageUrl } = useStaticPages()

const rootClasses = computed(() => [
  'base-checkbox',

  {
    'base-checkbox_checked': props.modelValue,
    'base-checkbox_disabled': props.disabled,
    'base-checkbox_error': Boolean(props.error),
    'base-checkbox_bordered': props.bordered,
    'base-checkbox_secondary': props.secondary,
  },

  attrs.class,
])

const rowClasses = computed(() => ['base-checkbox__row', props.rowClass])

const boxClasses = computed(() => [
  'base-checkbox__box',

  {
    'base-checkbox__box_checked': props.modelValue,
    'base-checkbox__box_error': Boolean(props.error),
  },

  props.boxClass,
])

const labelClasses = computed(() => ['base-checkbox__label', props.labelClass])

const forwardedAttrs = computed(() => {
  const { class: ignoredClass, style: ignoredStyle, ...rest } = attrs

  return rest
})

function onChange(event) {
  const checked = event.target.checked

  emit('update:modelValue', checked)
  emit('change', checked)
}

function capitalizeWords(value) {
  if (!value) {
    return ''
  }

  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

function getPageTitle(page, fallback) {
  return page?.title ? capitalizeWords(page.title) : fallback
}
</script>

<template>
  <div :class="rootClasses" :style="attrs.style">
    <label :for="id" :class="rowClasses">
      <input
        :id="id"
        :name="name"
        class="base-checkbox__input"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        v-bind="forwardedAttrs"
        @change="onChange"
      />

      <span :class="boxClasses" aria-hidden="true">
        <Transition name="checkbox-check">
          <SvgIcon
            :icon="CheckIcon"
            v-if="modelValue"
            class="base-checkbox__check"
          />
        </Transition>
      </span>

      <span :class="labelClasses">
        <slot v-if="!terms" />
        <template v-else>
          <span>
            {{
              $t('I confirm that I am 18 years old or older and I agree to the')
            }}
          </span>
          <span>{{ $t(' ') }}</span>
          <RouterLink
            v-if="termsPage"
            :to="getPageUrl(termsPage)"
            class="_link"
            target="_blank"
            @click.stop
          >
            {{ getPageTitle(termsPage) }}
          </RouterLink>
          <span>{{ $t(' ') }}</span>
          <span>
            {{ $t('and') }}
          </span>
          <span>{{ $t(' ') }}</span>

          <RouterLink
            v-if="privacyPage"
            :to="getPageUrl(privacyPage)"
            class="_link"
            target="_blank"
            @click.stop
          >
            {{ getPageTitle(privacyPage) }}
          </RouterLink>
        </template>
      </span>
    </label>

    <div
      v-if="error"
      class="base-checkbox__error"
      role="alert"
      aria-live="polite"
    >
      {{ error }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-checkbox {
  width: 100%;

  &_disabled {
    opacity: 0.5;

    pointer-events: none;
  }

  &_bordered {
  }

  &_secondary {
  }
}

.base-checkbox__row {
  @include adaptiveValue('gap', 16, 12);
  display: flex;
  align-items: flex-start;

  width: 100%;

  cursor: pointer;
  user-select: none;

  @media (any-hover: hover) {
    &:hover {
      .base-checkbox__box {
        border-color: var(--hint-primary-color);
      }
    }
  }
}

.base-checkbox__input {
  position: absolute;

  overflow: hidden;

  width: 1px;
  height: 1px;

  margin: -1px;
  padding: 0;

  border: 0;

  white-space: nowrap;

  clip: rect(0 0 0 0);
  clip-path: inset(50%);

  &:disabled + .base-checkbox__box {
    cursor: not-allowed;
  }
}

.base-checkbox__box {
  position: relative;

  overflow: hidden;
  flex: 0 0 24px;

  width: 24px;
  height: 24px;

  border: 1px solid var(--bg-third-color);
  border-radius: 6px;
  background: var(--bg-primary-color);

  transition: all 0.3s ease 0s;

  &_checked {
    &::before {
      opacity: 1;
    }
  }

  &_error {
    border-color: var(--error-color);
  }
}

.base-checkbox__check {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;

  width: 12px;
  height: 12px;

  color: var(--hint-primary-color);

  transform: translate(-50%, -50%);
}

.base-checkbox__label {
  display: inline;

  color: var(--fifth-color);
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 120% !important;
  text-align: left;

  cursor: pointer;
  :deep(a) {
    color: var(--hint-primary-color) !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    line-height: 120% !important;
  }
}

.base-checkbox__error {
  margin-top: 8px;
  padding-left: 37px;

  color: var(--error-color);
}

.checkbox-check-enter-active,
.checkbox-check-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.checkbox-check-enter-from,
.checkbox-check-leave-to {
  opacity: 0;

  transform: translate(-50%, -50%) scale(0.7);
}
</style>
