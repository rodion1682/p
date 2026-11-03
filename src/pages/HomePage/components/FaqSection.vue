<template>
  <section id="faq" class="faq">
    <div class="faq__inner _cnt">
      <div class="faq__body">
        <LoadingSpinner v-if="faqStore.isLoading" class="faq__loading" />

        <div v-else-if="faqStore.error" class="faq__error _text-error">
          {{ faqStore.error }}
        </div>

        <div v-else-if="faqItems.length" class="faq__items">
          <div
            v-for="(item, index) in faqItems"
            :key="item.id"
            class="faq__item"
            :class="{
              'is-open': activeIndex === index,
            }"
          >
            <button
              type="button"
              class="faq__question"
              :aria-expanded="activeIndex === index"
              :aria-controls="`faq-answer-${item.id}`"
              @click="toggleFaq(index)"
            >
              <SvgIcon
                :icon="ChevronDownIcon"
                class="faq__chevron"
                :class="{
                  'is-open': activeIndex === index,
                }"
              />

              <div class="faq__label _h4">
                {{ item.question }}
              </div>

              <div class="faq__number _h4">
                {{ String(index + 1).padStart(2, '0') }}
              </div>
            </button>

            <div
              :id="`faq-answer-${item.id}`"
              class="faq__answer-wrap"
              :class="{
                'is-open': activeIndex === index,
              }"
              :inert="activeIndex !== index"
            >
              <div class="faq__answer-inner">
                <div class="faq__answer" v-html="item.answer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="faq__content">
        <div class="faq__title _h2">
          <div>{{ $t('FREQUENTLY ASKED') }}</div>
          <div>{{ $t(' ') }}</div>
          <div>{{ $t('QUESTIONS') }}</div>
        </div>
        <div class="faq__image _ibg-contain">
          <img src="@/assets/img/faq.png" alt="FAQ" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useFaqStore } from '@/stores/faq'
import { useLanguageStore } from '@/stores/language'

const faqStore = useFaqStore()
const languageStore = useLanguageStore()

// All answers closed by default
const activeIndex = ref(0)
const loadedLangId = ref(null)

const faqItems = computed(() => {
  return Array.isArray(faqStore.faq) ? faqStore.faq : []
})

// Close all answers
const resetFaqState = () => {
  activeIndex.value = faqItems.value.length ? 0 : null
}

const loadFaq = async langId => {
  if (!langId) {
    return
  }

  if (loadedLangId.value === langId) {
    return
  }

  if (faqStore.isLoading) {
    return
  }

  loadedLangId.value = langId

  await faqStore.fetchFaq(langId)

  resetFaqState()
}

// Open selected question, close previously opened one
const toggleFaq = index => {
  activeIndex.value = activeIndex.value === index ? null : index
}

onMounted(async () => {
  await languageStore.initializeLanguages()

  await loadFaq(languageStore.currentLanguageId)
})

watch(
  () => languageStore.currentLanguageId,
  async newLangId => {
    resetFaqState()
    await loadFaq(newLangId)
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.faq {
  @include adaptiveValue('padding-top', 104, 30);
  @include adaptiveValue('padding-bottom', 50, 30);
  &__inner {
    display: flex;
    @include adaptiveValue('gap', 118, 20, 1430, 992, 1);
    @media (max-width: $md4) {
      flex-direction: column-reverse;
      gap: 8px;
    }
  }

  &__body {
    flex: 0 1 50%;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__loading {
    margin: auto;
  }

  &__error {
    text-align: center;
  }

  &__items {
    width: 100%;
  }

  &__item {
    border-radius: 6px;
    background-color: var(--bg-fifth-color);
    border: 1px solid var(--border-primary-color);

    transition:
      background-color 0.3s ease,
      border-color 0.3s ease;

    &:not(:last-child) {
      margin-bottom: 4px;
    }

    &.is-open {
      background-color: var(--bg-third-color);
      .faq__number {
        color: var(--hint-primary-color);
      }

      .faq__label {
        color: var(--primary-color);
      }
    }

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-third-color);
      }
    }
  }

  &__question {
    display: flex;
    align-items: center;
    gap: 20px;
    width: 100%;

    background-color: transparent;
    cursor: pointer;
    text-align: left;

    @include adaptiveValue('padding-top', 24, 10);
    @include adaptiveValue('padding-bottom', 24, 10);
    @include adaptiveValue('padding-left', 18, 10);
    @include adaptiveValue('padding-right', 18, 10);
  }

  &__chevron {
    flex-shrink: 0;
    width: 12px;
    height: 8px;

    transition: transform 0.5s ease;

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__label {
    flex: 1 1 auto;
    text-align: left;

    transition: color 0.3s ease;
  }

  &__number {
    flex-shrink: 0;
    color: var(--hint-primary-color);

    transition: color 0.3s ease;
  }
  &__answer {
    &-wrap {
      display: grid;
      grid-template-rows: 0fr;
      opacity: 0;
      visibility: hidden;

      transition:
        grid-template-rows 0.5s ease,
        opacity 0.5s ease,
        visibility 0.5s ease;

      &.is-open {
        grid-template-rows: 1fr;
        opacity: 1;
        visibility: visible;
      }
    }

    &-inner {
      min-height: 0;
      overflow: hidden;
    }
  }

  &__answer {
    color: var(--primary-color);
    @include adaptiveValue('padding-bottom', 24, 10);
    @include adaptiveValue('padding-right', 18, 10);
    @include adaptiveValue('padding-left', 50, 10);
  }

  &__content {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__title {
    @media (min-width: $md4) {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 19, 10);
      }
    }
    @media (max-width: $md4) {
      div {
        display: inline;
      }
    }
  }

  &__image {
    max-width: 535px;
    margin-left: auto;
    aspect-ratio: 1 / 0.67;
    @media (max-width: $md4) {
      @include hide-item;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__answer-wrap,
    &__chevron {
      transition: none;
    }
  }
}
</style>
