<template>
  <div
    v-show="languageStore.languages.length > 1"
    ref="dropdownRef"
    class="language-select"
  >
    <Multiselect
      v-model="selectedLanguage"
      mode="single"
      :options="languageOptions"
      value-prop="value"
      track-by="value"
      label="label"
      :close-on-select="true"
      :hide-selected="false"
      :can-deselect="false"
      :can-clear="false"
      placeholder=""
      :classes="dropdownClasses"
    >
      <template #singlelabel="{ value }">
        <div class="language-select__label">
          <div class="language-select__text">
            <div class="language-select__code">
              {{ value?.code }}
            </div>
          </div>
        </div>
      </template>

      <template #option="{ option }">
        <div class="language-select__option-content">
          <span class="language-select__option-code">
            {{ option?.code }}
          </span>

          <span v-if="option?.title" class="language-select__option-title">
            {{ option.title }}
          </span>
        </div>
      </template>

      <template #caret="{ handleCaretClick, isOpen }">
        <button
          type="button"
          class="language-select__caret"
          :aria-expanded="isOpen"
          @click="handleCaretClick"
        >
          <SvgIcon
            :icon="ChevronDownIcon"
            class="language-select__caret-icon"
            :class="{ 'is-open': isOpen }"
          />
        </button>
      </template>
    </Multiselect>
  </div>
</template>

<script setup>
import Multiselect from '@vueform/multiselect'
import { computed, onMounted, ref } from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  isFooter: {
    type: Boolean,
    default: false,
  },
})

const languageStore = useLanguageStore()
const dropdownRef = ref(null)

const languageOptions = computed(() =>
  (languageStore.languages || []).map(language => ({
    value: String(language.id),
    label: language.title || language.code,
    title: language.title || '',
    code: String(language.code || '').toUpperCase(),
  })),
)

const selectedLanguage = computed({
  get: () =>
    languageStore.currentLanguageId
      ? String(languageStore.currentLanguageId)
      : null,

  set: value => {
    if (!value) return

    languageStore.changeLanguage(String(value))
  },
})

const dropdownClasses = computed(() => ({
  container: 'language-dropdown',
  containerOpen: 'language-dropdown_open',
  wrapper: 'language-dropdown__wrapper',

  singleLabel: 'language-dropdown__single',
  singleLabelText: 'language-dropdown__singleText',

  dropdown: `language-dropdown__list ${props.isFooter ? 'language-dropdown__list_footer' : ''}`,

  options: 'language-dropdown__options',
  option: 'language-dropdown__option',
  optionPointed: 'language-dropdown__option_pointed',
  optionSelected: 'language-dropdown__option_selected',
}))

onMounted(() => {
  languageStore.initializeLanguages()
})
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.language-select {
  @media (min-width: $md4) {
    display: flex;
    align-self: stretch;
  }
  @media (any-hover: hover) {
    &:hover {
      .language-select__caret {
        color: var(--primary-color);
      }
    }
  }

  &__label {
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 700;
    line-height: 150%;
    color: inherit;
  }

  &__code {
    text-transform: uppercase;
  }

  &__caret {
    pointer-events: none;
    color: var(--third-color);
    width: 10px;
    min-width: 10px;
    height: 6px;
    display: flex;
    align-items: center;
    background-color: transparent;
    justify-content: center;
    padding: 0;
    border: 0;

    &-icon {
      width: 10px;
      min-width: 10px;
      height: 6px;
      color: inherit;
      transform: rotate(0deg);

      svg {
        transition: transform 0.3s ease;
      }

      &.is-open svg {
        transform: rotate(180deg);
      }
    }
  }

  &__option-content {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
  }

  &__option-code {
    flex: 0 0 auto;
    text-transform: uppercase;
  }

  &__option-title {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-transform: none;
  }
}

.language-dropdown {
  position: relative;

  &_open {
    .language-dropdown__wrapper {
      background-color: var(--hint-primary-color);
      color: var(--third-color);
      border-color: transparent;
    }
  }

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: inherit;
    padding-top: 5px;
    padding-bottom: 5px;

    @include adaptiveValue('padding-left', 20, 10, 1400, 992, 1);
    @include adaptiveValue('padding-right', 20, 10, 1400, 992, 1);

    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease 0s;
    color: var(--third-color);
    border: 1px solid var(--border-primary-color);
    background-color: var(--bg-third-color);

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-primary-color);
        color: var(--third-color);
        border-color: transparent;
      }
    }

    @media (max-width: $md4) {
      min-height: 45px;
      width: 100%;
      justify-content: center;

      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }

  &__list {
    position: absolute;
    top: calc(100% + 3px);
    right: 0;
    min-width: 100%;
    padding: 10px;
    border-radius: 8px;
    background-color: var(--bg-third-color);
    border: 1px solid var(--border-primary-color);
    overflow: hidden;
    z-index: var(--header-z-index);
    transition: all 0.3s ease 0s;

    &.is-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateY(-6px);
    }

    &_footer {
      max-height: 200px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    @media (max-width: $md3) {
      top: calc(100% + 6px);
      width: 100%;
    }
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__single,
  &__singleText {
    width: 100%;
  }

  &__option {
    cursor: pointer;
    pointer-events: auto;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    min-width: 40px;
    padding: 5px 10px;
    border-radius: 8px;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 100%;
    text-transform: uppercase;

    color: var(--third-color);
    border: 1px solid transparent;
    background-color: transparent;
    transition: all 0.3s ease 0s;

    &:not(:last-child) {
      margin-bottom: 2px;
    }

    &_selected {
      background-color: var(--hint-primary-color);
      color: var(--third-color);
      border-color: transparent;
      pointer-events: none;
    }

    &_pointed {
    }

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color);
        color: var(--primary-color);
        border-color: var(--hint-primary-color);
      }
    }

    @media (max-width: $md3) {
      min-height: 45px;
    }
  }
}
</style>
