<script setup>
import { computed, onMounted, ref, useAttrs } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },

  placeholder: {
    type: String,
    default: '',
  },

  label: {
    type: String,
    default: '',
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  readonly: {
    type: Boolean,
    default: false,
  },

  error: {
    type: String,
    default: '',
  },

  required: {
    type: Boolean,
    default: false,
  },

  autocomplete: {
    type: String,
    default: 'off',
  },

  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).substring(2, 9)}`,
  },

  rows: {
    type: Number,
    default: 5,
  },

  maxLength: {
    type: Number,
    default: 1000,
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const isFocused = ref(false)
const isInitiallyFilled = ref(false)

const hasValue = computed(() => {
  return String(props.modelValue ?? '').length > 0
})

const isFilled = computed(() => {
  return isFocused.value || hasValue.value || isInitiallyFilled.value
})

const characterCount = computed(() => {
  return String(props.modelValue ?? '').length
})

const attrsExceptClass = computed(() => {
  const { class: _class, ...rest } = attrs

  return rest
})

const containerClasses = computed(() => ({
  'is-focused': isFocused.value,
  'is-filled': isFilled.value,
  'has-error': !!props.error,
  'is-disabled': props.disabled,
}))

const onInput = event => {
  emit('update:modelValue', event.target.value)
}

const onFocus = event => {
  isFocused.value = true

  emit('focus', event)
}

const onBlur = event => {
  isFocused.value = false

  emit('blur', event)
}

onMounted(() => {
  isInitiallyFilled.value = hasValue.value
})
</script>

<template>
  <div class="base-textarea-wrap" :class="attrs.class">
    <div v-if="label" class="base-textarea__label" :class="{ error: error }">
      {{ label }}
    </div>

    <div class="base-textarea" :class="containerClasses">
      <textarea
        :id="id"
        class="base-textarea__control"
        :value="modelValue"
        :rows="rows"
        :maxlength="maxLength"
        :readonly="readonly"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        placeholder=""
        v-bind="attrsExceptClass"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />

      <div
        v-if="placeholder"
        class="base-textarea__placeholder"
        :class="{
          'is-raised': isFilled,
        }"
      >
        {{ placeholder }}
      </div>

      <div class="base-textarea__counter">
        {{ characterCount }}/{{ maxLength }}
      </div>
    </div>

    <div v-if="error" class="base-textarea__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-textarea-wrap {
  width: 100%;
}

.base-textarea {
  position: relative;

  display: flex;
  flex-direction: column;

  width: 100%;

  overflow: hidden;

  background-color: var(--bg-primary-color);

  border: 1px solid var(--border-secondary-color);

  transition:
    border-color 0.3s ease,
    opacity 0.3s ease;

  @include adaptiveValue('min-height', 140, 120);

  &.is-focused {
    border-color: var(--hint-primary-color);

    .base-textarea__placeholder {
      opacity: 0;
    }
  }

  &.is-filled {
    .base-textarea__placeholder {
      opacity: 0;
    }
  }

  &.has-error {
    border-color: var(--error-color);

    .base-textarea__placeholder {
      opacity: 0;
    }
  }

  &.is-disabled {
    opacity: 0.5;

    pointer-events: none;
  }

  &__label {
    line-height: 150%;
    font-weight: 500;

    color: var(--secondary-color);

    font-family: var(--font-barlow);

    font-size: 14px;

    transition: color 0.3s ease;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 4);
    }

    &.error {
      color: var(--error-color);
    }
  }

  &__control {
    width: 100%;
    flex: 1 1 auto;

    min-height: 140px;

    resize: none;

    overflow-y: auto;

    outline: none;
    border: none;

    background: transparent;

    color: var(--primary-color);

    font-family: var(--font-barlow);

    font-size: 16px;
    font-weight: 500;
    line-height: 140%;

    @include adaptiveValue('padding-left', 18, 15);

    @include adaptiveValue('padding-right', 18, 15);

    padding-top: 14px;
    padding-bottom: 34px;

    &::placeholder {
      color: transparent;
    }

    &:disabled {
      cursor: not-allowed;
    }

    scrollbar-width: thin;
  }

  &__placeholder {
    position: absolute;

    top: 14px;

    pointer-events: none;

    color: var(--fifth-color);

    font-family: var(--font-sans);

    font-size: 14px;
    font-weight: 700;
    line-height: 19px;

    transition: opacity 0.3s ease;

    @include adaptiveValue('left', 18, 15);

    max-width: calc(100% - 36px);

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.is-raised {
      opacity: 0;
    }
  }

  &__counter {
    position: absolute;

    right: 0;
    bottom: 0;

    width: 100%;

    padding-top: 6px;
    padding-bottom: 8px;

    @include adaptiveValue('padding-left', 18, 15);

    @include adaptiveValue('padding-right', 18, 15);

    text-align: right;

    color: var(--secondary-color);

    font-family: var(--font-barlow);

    font-size: 12px;
    font-weight: 500;
    line-height: 1;

    opacity: 0.6;

    pointer-events: none;

    background: linear-gradient(
      to top,
      var(--bg-primary-color) 70%,
      transparent
    );
  }

  &__error {
    margin-top: 6px;

    @include adaptiveValue('padding-left', 18, 15);
  }
}
</style>
