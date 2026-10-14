<template>
  <div class="static">
    <div class="static__inner _cnt-home">
      <LoadingSpinner v-if="loading" class="static__loader" />
      <div v-else-if="error" class="static__error _text-error">
        {{ error }}
      </div>
      <div v-else-if="currentPage">
        <div class="static__title _h3">{{ currentPage.title }}</div>
        <div v-html="filteredContent" class="static__content"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { useStaticStore } from '@/stores/static'
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const staticStore = useStaticStore()

defineProps({
  id: String,
  slug: String,
})

const loading = computed(() => staticStore.loading)
const error = computed(() => staticStore.error)
const currentPage = computed(() => staticStore.currentPage)

const fetchPage = async () => {
  const identifier = route.params.slug || route.params.id
  if (!identifier) {
    router.push({ name: 'NotFound' })
    return
  }
  try {
    await staticStore.fetchPageById(identifier)
    if (!staticStore.currentPage) {
      router.push({ name: 'NotFound' })
    }
  } catch (err) {
    router.push({ name: 'NotFound' })
    console.error('Error fetching page:', err)
  }
}

const filteredContent = computed(() => {
  const content = currentPage.value?.content

  if (!content) {
    return ''
  }
  return content.replace(
    /(?:(?:&amp;)?&nbsp;|&nbsp;|&#160;|&#x0*a0;|\u00a0)+/gi,
    ' ',
  )
})

onMounted(() => {
  fetchPage()
})

// Watch for route changes
watch(
  () => route.params.slug || route.params.id,
  () => fetchPage(),
)
</script>

<style lang="scss" scoped>
.static {
  @include adaptiveValue('padding-top', 120, 75);
  @include adaptiveValue('padding-bottom', 64, 25);
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  &__inner {
    width: 100%;

    margin: auto;
  }

  &__loader {
    display: flex;

    margin: auto;
  }

  &__error {
    margin: auto;

    text-align: center;
  }

  &__title {
    color: var(--primary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__content {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;
    white-space: normal;

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4) {
      color: var(--secondary-color) !important;
      font-family: var(--font-inter) !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;

      &:first-child {
        margin-top: 0;
      }
    }

    :deep(h1) {
      @include adaptiveValue('font-size', 32, 24);
      @include adaptiveValue('margin-top', 32, 18);
      @include adaptiveValue('margin-bottom', 32, 18);
      line-height: 120%;
    }

    :deep(h2) {
      @include adaptiveValue('font-size', 24, 20);
      @include adaptiveValue('margin-top', 32, 18);
      @include adaptiveValue('margin-bottom', 24, 14);
      line-height: 120%;
    }

    :deep(h3) {
      @include adaptiveValue('font-size', 20, 18);
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 16, 12);
      line-height: 120%;
    }

    :deep(h4) {
      @include adaptiveValue('font-size', 18, 16);
      @include adaptiveValue('margin-top', 16, 12);
      @include adaptiveValue('margin-bottom', 16, 12);
      line-height: 120%;
    }

    :deep(p) {
      display: inline-block;

      background: transparent !important;

      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
      text-align: left !important;

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 25, 15);
      }
      &:first-child {
        display: block !important;

        color: var(--hint-primary-color) !important;
      }
      strong {
        color: var(--hint-primary-color) !important;
      }
    }

    :deep(span) {
      background: transparent !important;

      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
      text-transform: none !important;
    }

    :deep(ul),
    :deep(ol) {
      @include adaptiveValue('margin-bottom', 24, 16);
    }

    :deep(ul) {
      padding-left: 0;

      list-style: none;
    }

    :deep(ul li) {
      @include adaptiveValue('margin-bottom', 8, 6);
      position: relative;

      padding-left: 14px;

      list-style: none;

      &::before {
        position: absolute;
        top: 0;
        left: 0;

        opacity: 0.8;

        content: '-';
      }
    }

    :deep(ol) {
      padding-left: 22px;
    }

    :deep(ol li) {
      @include adaptiveValue('margin-bottom', 8, 6);
      list-style: decimal;
    }

    :deep(li) {
      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      line-height: inherit !important;
    }

    :deep(a),
    :deep(a span) {
      border-bottom: 1px solid transparent;

      color: var(--hint-secondary-color);

      transition: border 0.3s ease 0s;

      @media (any-hover: hover) {
        &:hover {
          border-color: inherit;
        }
      }
    }

    :deep(blockquote) {
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);
      padding-left: 16px;

      border-left: 4px solid var(--hint-primary-color);

      font-style: italic;
    }

    :deep(pre) {
      @include adaptiveValue('padding', 16, 12);
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);
      overflow: auto;

      border-radius: 12px;
      background: #141319;

      color: var(--primary-color);
    }

    :deep(code) {
      padding: 2px 8px;

      border-radius: 8px;
      background: #141319;

      color: var(--hint-primary-color);
    }

    :deep(strong),
    :deep(b) {
      color: var(--secondary-color) !important;
      font-weight: 500 !important;
      text-transform: uppercase !important;
    }

    :deep(em) {
      font-style: italic !important;
    }

    :deep(.br-space) {
      display: block;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    :deep(.table-scroll-wrapper) {
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);
      overflow-x: auto;

      width: 100%;
    }

    :deep(table) {
      width: 100%;

      border: 1px solid var(--border-priamry-color);
      background: var(--bg-third-color);

      border-collapse: collapse;
    }

    :deep(th) {
      @include adaptiveValue('padding-bottom', 16, 10);
      @include adaptiveValue('padding-left', 16, 10);
      @include adaptiveValue('padding-right', 16, 10);
      @include adaptiveValue('padding-top', 16, 10);
      border: 1px solid var(--border-priamry-color);
      background: transparent;

      color: var(--secondary-color) !important;
      font-size: 16px;
      font-weight: 500;
      text-align: left;
    }

    :deep(td) {
      @include adaptiveValue('padding-top', 16, 10);
      @include adaptiveValue('padding-bottom', 16, 10);
      @include adaptiveValue('padding-left', 16, 10);
      @include adaptiveValue('padding-right', 16, 10);
      border: 1px solid var(--border-priamry-color);

      color: var(--secondary-color) !important;
      font-size: 16px;
    }

    :deep(tr:nth-child(even)),
    :deep(tr:hover) {
      background: transparent;
    }

    @media (max-width: 768px) {
      :deep(table) {
        display: block;
        overflow-x: auto;

        min-width: 100%;

        font-size: 16px;
        white-space: normal;

        table-layout: fixed;
      }

      :deep(th),
      :deep(td) {
        min-width: 240px;

        padding: 6px 8px;

        white-space: normal;
        word-break: break-word;

        overflow-wrap: anywhere;
      }
    }
  }
}
</style>
