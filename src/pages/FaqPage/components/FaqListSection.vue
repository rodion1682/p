<template>
  <section class="faq _cnt">
    <div class="faq__title _h2">
      {{ $t('FAQ') }}
    </div>

    <LoadingSpinner v-if="loadingFaq" class="faq__loading" />

    <template v-else-if="faqItems.length">
      <div class="faq__items">
        <div
          v-for="(item, index) in faqItems"
          :key="item.id"
          class="faq__item"
          :class="{ active: activeIndex === index }"
        >
          <div class="faq__content" @click="toggleItem(index)">
            <div class="faq__question">
              {{ item.question }}
            </div>

            <div
              class="faq__answer-wrapper"
              :class="{ open: activeIndex === index }"
            >
              <div class="faq__answer-inner">
                <div class="faq__answer" v-html="item.answer" />
              </div>
            </div>
          </div>

          <button
            type="button"
            class="faq__icon-wrapper"
            :aria-expanded="activeIndex === index"
            @click="toggleItem(index)"
          >
            <SvgIcon
              class="faq__icon"
              :class="{ active: activeIndex === index }"
              :icon="ChevronDownIcon"
            />
          </button>
        </div>
      </div>
    </template>

    <div v-else class="faq__empty _empty">
      {{ $t('No questions found') }}
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import axios from '@/plugins/axios'

const faqItems = ref([])
const loadingFaq = ref(false)
const activeIndex = ref(0)

const toggleItem = index => {
  activeIndex.value = activeIndex.value === index ? null : index
}

const fetchFaq = async () => {
  loadingFaq.value = true

  try {
    const { data } = await axios.get('/faq')

    const payload = Array.isArray(data)
      ? data
      : data?.status === 'OK' && Array.isArray(data?.payload)
        ? data.payload
        : []

    faqItems.value = payload
    activeIndex.value = payload.length ? 0 : null
  } catch (error) {
    console.error('Failed to fetch FAQ:', error)

    faqItems.value = []
    activeIndex.value = null
  } finally {
    loadingFaq.value = false
  }
}

onMounted(fetchFaq)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.faq {
  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__item {
    position: relative;
    cursor: pointer;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 4);
    }
  }

  &__content {
    @include adaptiveValue('padding', 30, 10);
    @include adaptiveValue('border-radius', 18, 8);
    border: 1px solid transparent;
    background:
      linear-gradient(#030b17, #030b17) padding-box,
      linear-gradient(
          0deg,
          #030b17 10%,
          rgb(26, 115, 255, 0.7) 50%,
          #030b17 90%
        )
        border-box;
    box-shadow: inset -200px 0 60px 20px rgba(26, 115, 255, 0.05);
    overflow: hidden;
  }

  &__question {
    display: flex;
    justify-content: space-between;

    gap: 20px;

    color: var(--third-color);
    font-weight: 700;
  }

  &__icon-wrapper {
    position: absolute;

    @include adaptiveValue('top', 23, 10);
    @include adaptiveValue('right', 23, 10);
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border-radius: 5px;
    background-color: var(--bg-third-color);
    border: 1px solid inherit;
    color: var(--third-color);
    transition: background-color 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-primary-color);
      }
    }
  }

  &__icon {
    min-width: 10px;
    width: 10px;
    height: 6px;

    transform: rotate(0deg);
    transition: transform 0.3s ease;

    &.active {
      transform: rotate(-180deg);
    }
  }

  &__answer-wrapper {
    display: grid;

    grid-template-rows: 0fr;

    opacity: 0;

    transition:
      grid-template-rows 0.35s ease,
      opacity 0.3s ease;

    &.open {
      grid-template-rows: 1fr;
      opacity: 1;
    }
  }

  &__answer-inner {
    min-height: 0;
    overflow: hidden;
  }

  &__answer {
    padding-top: 20px;

    color: var(--primary-color);

    :deep(p) {
      margin: 0;
    }

    :deep(p + p) {
      margin-top: 10px;
    }

    :deep(ul),
    :deep(ol) {
      margin: 10px 0 0;
      padding-left: 22px;
    }

    :deep(ul) {
      list-style: disc;
    }

    :deep(ol) {
      list-style: decimal;
    }

    :deep(li) {
      display: list-item;

      margin-bottom: 6px;

      line-height: 150%;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(li > ul),
    :deep(li > ol) {
      margin-top: 6px;
    }

    :deep(a) {
      display: inline-block;

      color: var(--hint-primary-color);

      border-bottom: 1px solid transparent;

      transition: border-color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          border-color: inherit;
        }
      }
    }

    :deep(strong),
    :deep(b) {
      color: var(--primary-color);

      font-weight: 600;
    }

    :deep(em),
    :deep(i) {
      font-style: italic;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin: 12px 0 6px;

      color: var(--primary-color);

      font-weight: 600;
      line-height: 130%;
    }

    :deep(*) {
      overflow-wrap: anywhere;
    }
  }

  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;

    text-align: center;
  }
}
</style>
