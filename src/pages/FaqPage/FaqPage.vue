<template>
  <main class="faq-page">
    <div class="faq-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="faq-page__inner _cnt">
      <div class="faq-page__top">
        <div class="faq-page__heading">
          <h1 class="faq-page__title _h4">
            {{ $t('Frequently Asked Questions') }}
          </h1>

          <p class="faq-page__subtitle">
            {{ $t('Find answers to frequently asked questions') }}
          </p>
        </div>
      </div>

      <div
        class="faq-page__content faq"
        :aria-label="$t('Frequently Asked Questions')"
      >
        <div v-if="isLoading" class="faq__items" aria-live="polite">
          <div v-for="index in 6" :key="index" class="faq__skeleton">
            <span class="faq__skeleton-line" />
          </div>
        </div>

        <div
          v-else-if="error && !faqItems.length"
          class="faq__empty"
          role="alert"
        >
          <h2 class="faq__empty-title _h6">
            {{ $t('Unable to load questions') }}
          </h2>

          <p class="faq__empty-text">
            {{ error }}
          </p>

          <BaseButton
            type="button"
            variant="bordered"
            class="faq__retry"
            @click="reloadFaq"
          >
            {{ $t('Try again') }}
          </BaseButton>
        </div>

        <div v-else-if="filteredFaqItems.length" class="faq__items">
          <article
            v-for="item in filteredFaqItems"
            :key="item.key"
            class="faq__item"
            :class="{
              faq__item_open: isOpen(item.key),
            }"
          >
            <h2 class="faq__item-heading">
              <button
                type="button"
                class="faq__question"
                :id="getQuestionId(item.key)"
                :aria-expanded="isOpen(item.key)"
                :aria-controls="getAnswerId(item.key)"
                @click="toggle(item.key)"
              >
                <span class="faq__question-text">
                  {{ getQuestion(item.data) }}
                </span>

                <span class="faq__indicator" aria-hidden="true">
                  <SvgIcon
                    :icon="isOpen(item.key) ? CloseIcon : PlusIcon"
                    class="faq__indicator-icon"
                  />
                </span>
              </button>
            </h2>

            <div
              :id="getAnswerId(item.key)"
              class="faq__answer-wrapper"
              :class="{
                'faq__answer-wrapper_open': isOpen(item.key),
              }"
              role="region"
              :aria-labelledby="getQuestionId(item.key)"
              :inert="!isOpen(item.key)"
            >
              <div class="faq__answer-overflow">
                <div class="faq__answer">
                  <div
                    class="faq__answer-content"
                    v-html="getAnswer(item.data)"
                  />
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="faq__empty">
          <h2 class="faq__empty-title _h6">
            {{
              searchQuery.trim()
                ? $t('No questions found')
                : $t('No questions found')
            }}
          </h2>

          <p class="faq__empty-text">
            {{
              searchQuery.trim()
                ? $t('Try changing your search.')
                : $t('Frequently asked questions will appear here.')
            }}
          </p>

          <BaseButton
            v-if="searchQuery.trim()"
            type="button"
            variant="bordered"
            class="faq__retry"
            @click="clearSearch"
          >
            {{ $t('Clear') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'

import { CloseIcon, PlusIcon } from '@/components/icons'

import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useFaqStore } from '@/stores/faq'

const faqStore = useFaqStore()

const searchQuery = ref('')
const activeKey = ref(null)

const isLoading = computed(() => Boolean(faqStore.isLoading))

const error = computed(() => faqStore.error || '')

const faqItems = computed(() => {
  const items =
    faqStore.faq || faqStore.faqs || faqStore.items || faqStore.questions || []

  return Array.isArray(items) ? items : []
})

const normalizedItems = computed(() =>
  faqItems.value.map((item, index) => ({
    key: `${item?.id ?? item?.uuid ?? 'faq'}-${index}`,
    data: item,
  })),
)

const filteredFaqItems = computed(() => {
  const query = normalizeText(searchQuery.value)

  if (!query) {
    return normalizedItems.value
  }

  return normalizedItems.value.filter(({ data }) => {
    const question = normalizeText(getQuestion(data))
    const answer = normalizeText(stripHtml(getAnswer(data)))

    return question.includes(query) || answer.includes(query)
  })
})

function getQuestion(item) {
  return item?.question || item?.title || item?.name || ''
}

function getAnswer(item) {
  return item?.answer || item?.content || item?.description || item?.text || ''
}

function stripHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
}

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
}

function getQuestionId(key) {
  return `faq-question-${key}`
}

function getAnswerId(key) {
  return `faq-answer-${key}`
}

function isOpen(key) {
  return activeKey.value === key
}

function toggle(key) {
  activeKey.value = isOpen(key) ? null : key
}

function clearSearch() {
  searchQuery.value = ''
}

async function reloadFaq() {
  await faqStore.fetchFaq()
}

watch(
  normalizedItems,
  items => {
    if (!items.length) {
      activeKey.value = null
      return
    }

    const exists = items.some(item => item.key === activeKey.value)

    if (!exists) {
      activeKey.value = items[0].key
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.faq-page {
  @include adaptiveValue('padding-top', 130, 80);
  @include adaptiveValue('padding-bottom', 80, 30);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 100%;

  &__bg {
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__inner {
    position: relative;
    z-index: 1;

    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__top {
    position: relative;
    z-index: 1;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__heading {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    text-transform: none;

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__subtitle {
    margin: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
  }

  &__search {
    @include adaptiveValue('padding', 18, 10);
    @include adaptiveValue('border-radius', 12, 10);

    display: flex;
    align-items: center;

    width: 100%;

    background: #111624;
  }

  &__search-input {
    width: 100%;
    min-width: 0;
    max-width: 540px;
  }

  &__search-icon {
    display: flex;

    min-width: 32px;
    height: 32px;

    color: var(--fourth-color);

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__content {
    width: 100%;
    min-width: 0;
  }
}

.faq {
  &__items {
    display: flex;
    flex-direction: column;
    gap: 8px;

    width: 100%;
  }

  &__item {
    @include adaptiveValue('border-radius', 12, 10);

    position: relative;

    overflow: hidden;

    width: 100%;
    min-width: 0;

    border: 1px solid var(--border-priamry-color);
    background: #111624;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    &_open {
      border-color: var(--border-secondary-color);

      .faq__question-text {
        color: var(--fourth-color);
      }

      .faq__indicator {
        border-color: var(--hint-primary-color);

        color: var(--hint-primary-color);
      }
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--border-secondary-color);
      }
    }
  }

  &__item-heading {
    margin: 0;
    padding: 0;

    font-size: inherit;
    font-weight: inherit;
  }

  &__question {
    @include adaptiveValue('padding-top', 24, 16);
    @include adaptiveValue('padding-bottom', 24, 16);
    @include adaptiveValue('padding-left', 32, 16);
    @include adaptiveValue('padding-right', 32, 16);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    width: 100%;
    min-height: 68px;

    margin: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: var(--fourth-color);
    text-align: left;

    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: -3px;
    }

    @media (any-hover: hover) {
      &:hover {
        .faq__question-text {
          color: var(--hint-primary-color);
        }

        .faq__indicator {
          border-color: var(--hint-primary-color);

          color: var(--hint-primary-color);
        }
      }
    }
  }

  &__question-text {
    flex: 1 1 auto;

    min-width: 0;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 16px;
    font-weight: 600;
    line-height: 150%;

    transition: color 0.3s ease;

    @media (max-width: $md4) {
      font-size: 14px;
    }
  }

  &__indicator {
    display: flex;
    flex: 0 0 36px;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    background: var(--bg-primary-color);

    color: var(--fifth-color);

    transition:
      border-color 0.3s ease,
      color 0.3s ease;

    @media (max-width: $md4) {
      flex-basis: 32px;

      width: 32px;
      height: 32px;
    }
  }

  &__indicator-icon {
    display: block;

    width: 18px;
    height: 18px;

    color: inherit;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__answer-wrapper {
    display: grid;
    grid-template-rows: 0fr;

    opacity: 0;

    transition:
      grid-template-rows 0.3s ease,
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
    @include adaptiveValue('padding-left', 32, 16);
    @include adaptiveValue('padding-right', 32, 16);
    @include adaptiveValue('padding-bottom', 28, 18);

    padding-top: 0;
  }

  &__answer-content {
    max-width: 1100px;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 170%;
    text-align: left;

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 14px;
      }
    }

    :deep(strong),
    :deep(b) {
      color: var(--fourth-color);
      font-weight: 600;
    }

    :deep(a) {
      color: var(--hint-primary-color);
      text-decoration: underline;

      transition: color 0.3s ease;

      text-underline-offset: 3px;

      @media (any-hover: hover) {
        &:hover {
          color: var(--fourth-color);
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

    :deep(h3),
    :deep(h4) {
      margin: 18px 0 10px;

      color: var(--fourth-color);
      font-weight: 600;
    }
  }

  &__skeleton {
    @include adaptiveValue('border-radius', 12, 10);

    display: flex;
    align-items: center;

    min-height: 76px;

    padding: 24px 32px;

    border: 1px solid var(--border-priamry-color);
    background: #111624;

    @media (max-width: $md4) {
      min-height: 66px;

      padding: 16px;
    }
  }

  &__skeleton-line {
    width: min(65%, 520px);
    height: 14px;

    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--bg-primary-color) 25%,
      var(--border-secondary-color) 50%,
      var(--bg-primary-color) 75%
    );
    background-size: 200% 100%;

    animation: faq-skeleton 1.5s linear infinite;
  }

  &__empty {
    @include adaptiveValue('padding', 40, 20);
    @include adaptiveValue('border-radius', 12, 10);

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;

    min-height: 220px;

    border: 1px solid var(--border-priamry-color);
    background: #111624;

    text-align: center;
  }

  &__empty-title {
    margin: 0;

    color: var(--fourth-color);
    font-weight: 600;
    text-transform: none;
  }

  &__empty-text {
    max-width: 420px;

    margin: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    line-height: 150%;
  }

  &__retry {
    width: fit-content;
    min-width: 150px;
    max-width: 250px;

    margin-top: 8px;
  }
}

@keyframes faq-skeleton {
  to {
    background-position-x: -200%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .faq {
    &__item,
    &__question-text,
    &__indicator,
    &__answer-wrapper {
      transition: none;
    }

    &__skeleton-line {
      animation: none;
    }
  }
}
</style>
