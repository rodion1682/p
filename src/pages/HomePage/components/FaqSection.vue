<template>
  <section class="faq-section">
    <div class="faq-section__title _h3">{{ $t('FAQ') }}</div>
    <div class="faq-section__body">
      <LoadingSpinner v-if="faqStore.isLoading" class="faq-section__loading" />

      <div v-else-if="faqStore.error" class="faq-section__error _text-error">
        {{ faqStore.error }}
      </div>

      <div v-else-if="faqItems.length" class="faq-section__items">
        <div
          v-for="(item, index) in faqItems"
          :key="item.id"
          class="faq-section__item"
          :class="{
            'is-open': activeIndex === index,
          }"
        >
          <button
            type="button"
            class="faq-section__question"
            :aria-expanded="activeIndex === index"
            @click="toggleFaq(index)"
          >
            <div class="faq-section__number">
              {{ String(index + 1).padStart(2, '0') }}
            </div>

            <div class="faq-section__label">
              {{ item.question }}
            </div>

            <SvgIcon
              :icon="ChevronDownIcon"
              class="faq-section__chevron"
              :class="{
                'is-open': activeIndex === index,
              }"
            />
          </button>

          <div
            class="faq-section__answer-wrap"
            :class="{
              'is-open': activeIndex === index,
            }"
          >
            <div class="faq-section__answer-inner">
              <div class="faq-section__answer" v-html="item.answer" />
            </div>
          </div>
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

const activeIndex = ref(0)
const loadedLangId = ref(null)

const faqItems = computed(() => {
  return Array.isArray(faqStore.faq) ? faqStore.faq : []
})

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
    await loadFaq(newLangId)
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.faq-section {
  width: 100%;
  max-width: 808px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }
  &__body {
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
  }
  &__loading,
  &__error {
    margin: auto;
  }

  &__items {
    @media (max-width: $md6) {
      margin-left: -10px;
      margin-right: -10px;
    }
  }

  &__item {
    width: 100%;

    background-color: rgb(18, 24, 28, 0.9);

    border-radius: 6px;

    overflow: hidden;

    &:not(:last-child) {
      margin-bottom: 3px;
    }

    &.is-open {
      .faq-section__question {
        border-bottom-color: var(--hint-primary-color);
      }

      .faq-section__number {
        color: var(--hint-primary-color);
      }

      .faq-section__label {
        color: var(--primary-color);
      }
    }
  }

  &__question {
    background-color: rgb(18, 24, 28, 0.9);
    display: grid;

    grid-template-columns:
      40px
      minmax(0, 1fr)
      20px;

    align-items: center;

    width: 100%;

    @include adaptiveValue('min-height', 62, 40);
    padding-top: 10px;
    padding-bottom: 10px;

    @include adaptiveValue('padding-left', 16, 10);

    @include adaptiveValue('padding-right', 16, 10);
    color: var(--primary-color);

    text-align: left;

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        .faq-section__number,
        .faq-section__chevron {
          color: var(--hint-primary-color);
        }
      }
    }
  }

  &__number {
    color: var(--hint-primary-color);

    font-family: var(--font-condensed);

    font-size: 20px;
    font-weight: 700;
    line-height: 1;

    transition: color 0.3s ease;
  }

  &__label {
    min-width: 0;

    padding-left: 8px;
    padding-right: 15px;

    color: var(--primary-color);

    font-family: var(--font-condensed);

    font-size: 14px;

    font-weight: 700;
    line-height: 24px;

    transition: color 0.3s ease;
  }

  &__chevron {
    justify-self: end;

    width: 12px;
    min-width: 12px;
    height: 12px;

    color: var(--hint-primary-color);

    pointer-events: none;

    svg {
      transform: rotate(0deg);

      transition: transform 0.3s ease;
    }

    &.is-open {
      svg {
        transform: rotate(180deg);
      }
    }
  }

  &__answer-wrap {
    display: grid;
    background-color: rgb(18, 24, 28, 0.9);

    grid-template-rows: 0fr;

    opacity: 0;
    visibility: hidden;

    transition:
      grid-template-rows 0.3s ease,
      opacity 0.25s ease,
      visibility 0.25s ease;

    &.is-open {
      grid-template-rows: 1fr;

      opacity: 1;
      visibility: visible;
    }
  }

  &__answer-inner {
    min-height: 0;

    overflow: hidden;
  }

  &__answer {
    @include adaptiveValue('padding-bottom', 18, 15);

    @include adaptiveValue('padding-left', 56, 10);

    @include adaptiveValue('padding-right', 50, 10);

    color: var(--primary-color);

    font-family: var(--font-open-sans);

    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
  }
}
</style>
