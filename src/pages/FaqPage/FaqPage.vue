<template>
  <main class="faq-page">
    <div class="faq-page__background _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.png" alt="" />
    </div>

    <div class="faq-page__container _cnt">
      <div class="faq-page__decoration" aria-hidden="true">
        <img src="@/assets/img/product-list-decor.png" alt="" />
      </div>

      <div class="faq-page__inner">
        <section class="faq">
          <h1 class="faq__title _h5">
            {{ $t('Frequently Asked Questions') }}
          </h1>

          <div v-if="isLoading" class="faq__items" aria-live="polite">
            <div v-for="index in 5" :key="index" class="faq__skeleton">
              <span class="faq__skeleton-line" />
            </div>
          </div>

          <div v-else-if="faqItems.length" class="faq__items">
            <article
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
                <span class="faq__question-text _h6">
                  {{ getQuestion(item) }}
                </span>

                <span
                  v-if="isOpen(index)"
                  class="faq__close"
                  aria-hidden="true"
                >
                  <SvgIcon :icon="CloseIcon" class="faq__close-icon" />
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
            </article>
          </div>

          <div v-else class="faq__empty">
            <h2 class="faq__empty-title _h3">
              {{ $t('No questions found') }}
            </h2>

            <p class="faq__empty-text">
              {{ $t('Frequently asked questions will appear here.') }}
            </p>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'

import { CloseIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useFaqStore } from '@/stores/faq'

const faqStore = useFaqStore()

const activeIndex = ref(null)

const isLoading = computed(() => Boolean(faqStore.isLoading))

const faqItems = computed(() => {
  const items =
    faqStore.faqs || faqStore.faq || faqStore.items || faqStore.questions || []

  return Array.isArray(items) ? items : []
})

const getItemKey = (item, index) => item?.id ?? item?.uuid ?? `faq-${index}`

const getQuestion = item => item?.question || item?.title || item?.name || ''

const getAnswer = item =>
  item?.answer || item?.content || item?.description || item?.text || ''

const getAnswerId = index => `faq-answer-${index}`

const isOpen = index => activeIndex.value === index

const toggle = index => {
  activeIndex.value = isOpen(index) ? null : index
}
</script>

<style lang="scss" scoped>
.faq-page {
  @include adaptiveValue('padding-bottom', 64, 30);

  position: relative;

  display: flex;
  overflow: hidden;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 550px;

  padding-top: 80px;

  background-color: var(--bg-primary-color);

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;

    width: 100%;
    height: 100%;
    max-height: 915px;

    pointer-events: none;

    img {
      object-position: center top;
    }
  }

  &__container {
    position: relative;
    z-index: 1;

    display: flex;
    flex: 1 1 100%;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__decoration {
    position: relative;

    display: flex;
    align-items: flex-end;
    justify-content: center;

    width: 100%;
    height: 32px;

    margin-bottom: 20px;

    border-bottom: 1px solid var(--border-priamry-color);

    img {
      position: absolute;
      bottom: 0;
      left: 50%;

      display: block;

      width: min(250px, 55vw);
      max-height: 50px;

      object-fit: contain;
      object-position: center bottom;

      transform: translateX(-50%);
    }
  }

  &__inner {
    position: relative;

    display: flex;
    flex: 1 1 100%;
    flex-direction: column;

    width: 100%;
    min-width: 0;

    margin: auto;
  }

  @media (max-width: $md4) {
    &__decoration {
      height: 25px;

      margin-bottom: 18px;

      img {
        max-height: 36px;
      }
    }
  }
}

.faq {
  width: 100%;
  max-width: 1376px;

  margin: auto;

  &__title {
    color: var(--secondary-color);
    font-weight: 500;
    line-height: 120%;
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 18);
    }
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 8px;

    width: 100%;
  }

  &__item {
    position: relative;

    overflow: hidden;

    width: 100%;
    min-width: 0;

    border: 1px solid var(--border-seventh-color);
    border-radius: 12px;
    background-color: var(--bg-tenth-color);

    transition: all 0.3s ease 0s;

    &_open {
      border-color: var(--border-eight-color);
      background-color: var(--bg-nineth-color);

      .faq__question-text {
        color: var(--secondary-color);
      }
    }
  }

  &__question {
    @include adaptiveValue('padding-top', 17, 15);
    @include adaptiveValue('padding-left', 54, 45);
    @include adaptiveValue('padding-right', 54, 45);
    @include adaptiveValue('padding-bottom', 23, 17);

    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;

    padding-top: 12px;
    padding-bottom: 12px;

    border: 0;
    outline: none;
    background: transparent;

    color: var(--primary-color);

    cursor: pointer;

    transition: color 0.3s ease;

    &:focus-visible {
      outline: 2px solid var(--border-secondary-color);
      outline-offset: -3px;
    }

    @media (any-hover: hover) {
      &:hover {
        .faq__question-text {
          color: var(--secondary-color);
        }
      }
    }
  }

  &__question-text {
    font-weight: 500;
    line-height: 150%;
    text-align: center;

    transition: color 0.3s ease 0s;
  }

  &__close {
    position: absolute;
    top: 50%;
    right: 15px;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 34px;
    height: 34px;

    color: var(--secondary-color);

    transform: translateY(-50%);
    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      opacity: 0.5;

      .faq__question:hover & {
        opacity: 1;
      }
    }
  }

  &__close-icon {
    width: 24px;
    height: 24px;

    color: inherit;
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
    @include adaptiveValue('padding-left', 55, 20);
    @include adaptiveValue('padding-right', 55, 20);
    @include adaptiveValue('padding-bottom', 28, 20);

    padding-top: 0;
  }

  &__answer-content {
    text-align: center;

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 24, 18);
      }
    }

    :deep(a) {
      color: var(--hint-primary-color);
      text-decoration: none;

      transition: color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          color: var(--primary-color);
        }
      }
    }

    :deep(ul),
    :deep(ol) {
      display: inline-block;

      margin: 12px auto;
      padding-left: 20px;

      text-align: left;
    }

    :deep(li) {
      &:not(:last-child) {
        margin-bottom: 6px;
      }
    }
  }

  &__skeleton {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 64px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 11px;
    background-color: rgb(48 43 91 / 48%);
  }

  &__skeleton-line {
    width: min(65%, 520px);
    height: 14px;

    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--bg-secondary-color) 25%,
      var(--border-fourth-color) 50%,
      var(--bg-secondary-color) 75%
    );
    background-size: 200% 100%;

    animation: faq-skeleton 1.5s linear infinite;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 180px;

    padding: 30px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 11px;
    background-color: rgb(48 43 91 / 48%);

    text-align: center;
  }

  &__empty-title {
    margin: 0 0 10px;

    color: var(--primary-color);
  }

  &__empty-text {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 1.5;
  }

  @media (max-width: $md4) {
    &__items {
      gap: 8px;
    }

    &__question {
      padding-right: 42px;
      padding-left: 42px;
    }

    &__close {
      right: 5px;
    }

    &__close-icon {
      width: 20px;
      height: 20px;
    }
  }
}

@keyframes faq-skeleton {
  to {
    background-position-x: -200%;
  }
}
</style>
