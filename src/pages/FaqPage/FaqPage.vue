<template>
  <main class="faq-page">
    <div class="faq-page__background _ibg" aria-hidden="true">
      <img src="@/assets/img/faq-bg.jpg" alt="" />
    </div>

    <div class="faq-page__inner _cnt-home">
      <section class="faq">
        <h1 class="faq__title _h3">
          {{ $t('FAQ') }}
        </h1>

        <div v-if="isLoading" class="faq__items" aria-live="polite">
          <div v-for="item in 7" :key="item" class="faq__skeleton">
            <span class="faq__skeleton-line" />

            <span class="faq__skeleton-toggle">
              <span />
              <span />
            </span>
          </div>
        </div>

        <div v-else-if="faqItems.length" class="faq__items">
          <div
            v-for="(item, index) in faqItems"
            :key="getItemKey(item, index)"
            class="faq__item"
            :class="{ faq__item_open: isOpen(index) }"
          >
            <button
              type="button"
              class="faq__question"
              :aria-expanded="isOpen(index)"
              :aria-controls="getAnswerId(index)"
              @click="toggle(index)"
            >
              <span class="faq__question-text">
                {{ getQuestion(item) }}
              </span>

              <span class="faq__toggle" aria-hidden="true">
                <span class="faq__toggle-line" />
                <span class="faq__toggle-line faq__toggle-line_vertical" />
              </span>
            </button>

            <div
              :id="getAnswerId(index)"
              class="faq__answer-wrapper"
              :class="{ 'faq__answer-wrapper_open': isOpen(index) }"
            >
              <div class="faq__answer-overflow">
                <div class="faq__answer">
                  <div class="faq__answer-content" v-html="getAnswer(item)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="faq__empty">
          <div class="faq__empty-title _h3">
            {{ $t('No questions found') }}
          </div>

          <p class="faq__empty-text">
            {{ $t('Frequently asked questions will appear here.') }}
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'

import { useFaqStore } from '@/stores/faq'

const faqStore = useFaqStore()

const activeIndex = ref(0)

const isLoading = computed(() => {
  return Boolean(faqStore.isLoading)
})

const faqItems = computed(() => {
  const items =
    faqStore.faqs || faqStore.faq || faqStore.items || faqStore.questions || []

  return Array.isArray(items) ? items : []
})

const getItemKey = (item, index) => {
  return item?.id ?? item?.uuid ?? `faq-${index}`
}

const getQuestion = item => {
  return item?.question || item?.title || item?.name || ''
}

const getAnswer = item => {
  return item?.answer || item?.content || item?.description || item?.text || ''
}

const getAnswerId = index => {
  return `faq-answer-${index}`
}

const isOpen = index => {
  return activeIndex.value === index
}

const toggle = index => {
  activeIndex.value = activeIndex.value === index ? null : index
}
</script>

<style lang="scss" scoped>
.faq-page {
  @include adaptiveValue('padding-top', 120, 75);
  @include adaptiveValue('padding-bottom', 64, 25);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;

  &__background {
    position: absolute;
    inset: 0;
    z-index: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;

    &::after {
      position: absolute;
      inset: 0;

      background: linear-gradient(
        180deg,
        rgb(10 13 20 / 18%) 0%,
        rgb(16 21 30 / 25%) 50%,
        rgb(18 24 34 / 65%) 100%
      );

      content: '';
    }

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
  }
}

.faq {
  width: 100%;
  max-width: 940px;

  margin: 0 auto;

  &__title {
    @include adaptiveValue('margin-bottom', 38, 25);

    color: var(--primary-color);
    text-align: center;
    text-transform: uppercase;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 6px;

    width: 100%;
  }

  &__item {
    width: 100%;
    min-width: 0;

    &_open {
      .faq__question {
        border-color: var(--border-sixth-color);
        background-color: var(--bg-fifth-color);

        color: var(--hint-sixth-color);
      }

      .faq__toggle {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }

      .faq__toggle-line_vertical {
        opacity: 0;

        transform: translate(-50%, -50%) rotate(90deg);
      }
    }
  }

  &__question {
    @include adaptiveValue('min-height', 54, 48);
    @include adaptiveValue('padding-left', 38, 15);
    @include adaptiveValue('padding-right', 14, 10);
    @include adaptiveValue('gap', 25, 15);

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    border: 1px solid var(--border-fourth-color);
    outline: none;
    background-color: var(--bg-primary-color);

    color: var(--primary-color);
    text-align: left;

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease;

    &:focus-visible {
      border-color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--border-secondary-color);

        color: var(--hint-sixth-color);

        .faq__toggle {
          border-color: var(--hint-secondary-color);

          color: var(--hint-secondary-color);
        }
      }
    }
  }

  &__question-text {
    @include adaptiveValue('font-size', 20, 15);

    display: block;

    min-width: 0;

    font-family: var(--font-spectral);
    font-weight: 400;
    line-height: 120%;
    letter-spacing: 0.01em;

    overflow-wrap: anywhere;
  }

  &__toggle {
    position: relative;

    flex: 0 0 22px;

    width: 22px;
    height: 22px;

    border: 1px solid var(--hint-primary-color);
    border-radius: 6px;

    color: var(--hint-primary-color);

    transition:
      border-color 0.3s ease,
      color 0.3s ease;
  }

  &__toggle-line {
    position: absolute;
    top: 50%;
    left: 50%;

    display: block;

    width: 10px;
    height: 1px;

    background-color: currentColor;

    transform: translate(-50%, -50%);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;

    &_vertical {
      transform: translate(-50%, -50%) rotate(90deg);
    }
  }

  &__answer-wrapper {
    display: grid;
    grid-template-rows: 0fr;

    opacity: 0;

    transition:
      grid-template-rows 0.35s ease,
      opacity 0.3s ease;

    &_open {
      grid-template-rows: 1fr;

      opacity: 1;
    }
  }

  &__answer-overflow {
    overflow: hidden;

    min-height: 0;
  }

  &__answer {
    @include adaptiveValue('min-height', 154, 100);
    @include adaptiveValue('padding-top', 38, 20);
    @include adaptiveValue('padding-right', 38, 15);
    @include adaptiveValue('padding-bottom', 38, 20);
    @include adaptiveValue('padding-left', 38, 15);

    margin-top: 4px;

    border: 1px solid var(--border-fourth-color);
    background-color: var(--bg-primary-color);
  }

  &__answer-content {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 145%;

    overflow-wrap: anywhere;

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    :deep(a) {
      color: var(--hint-secondary-color);

      transition: color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          color: var(--primary-color);
        }
      }
    }

    :deep(ul),
    :deep(ol) {
      margin: 12px 0;
      padding-left: 20px;
    }

    :deep(li) {
      &:not(:last-child) {
        margin-bottom: 6px;
      }
    }
  }

  &__skeleton {
    @include adaptiveValue('min-height', 54, 48);
    @include adaptiveValue('padding-left', 38, 15);
    @include adaptiveValue('padding-right', 14, 10);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 25px;

    border: 1px solid var(--border-fourth-color);
    background-color: var(--bg-primary-color);
  }

  &__skeleton-line {
    width: min(60%, 480px);
    height: 14px;

    background: linear-gradient(
      90deg,
      var(--bg-secondary-color) 25%,
      var(--border-fourth-color) 50%,
      var(--bg-secondary-color) 75%
    );
    background-size: 200% 100%;

    animation: faq-skeleton 1.5s linear infinite;
  }

  &__skeleton-toggle {
    position: relative;

    flex: 0 0 22px;

    width: 22px;
    height: 22px;

    border: 1px solid var(--hint-primary-color);
    border-radius: 6px;

    span {
      position: absolute;
      top: 50%;
      left: 50%;

      width: 10px;
      height: 1px;

      background-color: var(--hint-primary-color);

      transform: translate(-50%, -50%);

      &:last-child {
        transform: translate(-50%, -50%) rotate(90deg);
      }
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 180px;

    padding: 30px;

    border: 1px solid var(--border-fourth-color);
    background-color: var(--bg-primary-color);

    text-align: center;
  }

  &__empty-title {
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__empty-text {
    color: var(--secondary-color);
    font-size: 14px;
    line-height: 145%;
  }

  @media (max-width: $md4) {
    &__items {
      gap: 5px;
    }

    &__question-text {
      line-height: 130%;
    }

    &__toggle,
    &__skeleton-toggle {
      flex-basis: 20px;

      width: 20px;
      height: 20px;

      border-radius: 5px;
    }

    &__toggle-line,
    &__skeleton-toggle span {
      width: 9px;
    }
  }

  @media (max-width: $md7) {
    &__question {
      min-height: 46px;
    }

    &__question-text {
      font-size: 14px;
    }

    &__answer-content {
      font-size: 13px;
    }
  }
}

@keyframes faq-skeleton {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
