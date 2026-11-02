<template>
  <div class="static">
    <!--<FixedBg />-->
    <div class="static__inner _cnt-home">
      <LoadingSpinner v-if="loading" class="static__loading" />
      <div v-else-if="error" class="static__error _text-error">
        {{ error }}
      </div>
      <div v-else-if="currentPage" class="static__body">
        <div class="static__title _h3">{{ currentPage.title }}</div>
        <div
          v-html="sanitizedContent"
          class="static__contet _text-primary"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useStaticStore } from '@/stores/static'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const staticStore = useStaticStore()

const loading = computed(() => staticStore.loading)
const error = computed(() => staticStore.error)
const currentPage = computed(() => staticStore.currentPage)

const sanitizedContent = computed(() => {
  if (!currentPage.value?.content) return ''

  let content = currentPage.value.content
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')

  // turn <br><br> into a spacer div
  content = content.replace(
    /(<br\s*\/?>\s*){2,}/gi,
    '<div class="br-space"></div>',
  )

  // Wrap tables in scroll container
  content = content.replace(
    /<table[^>]*>/gi,
    '<div class="table-scroll-wrapper"><table>',
  )
  content = content.replace(/<\/table>/gi, '</table></div>')

  return content
})

const fetchPage = async () => {
  const slug = route.params.slug
  if (!slug) {
    router.push({ name: 'NotFound' })
    return
  }

  try {
    await staticStore.fetchPage({ slug })
    if (!staticStore.currentPage) router.push({ name: 'NotFound' })
  } catch (e) {
    router.push({ name: 'NotFound' })
  }
}

watch(() => route.params.slug, fetchPage, { immediate: true })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;
.static {
  @include adaptiveValue('padding-top', 60, 25);
  @include adaptiveValue('padding-bottom', 60, 25);
  min-height: 90vh;
  position: relative;
  &__inner {
    min-height: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &__loading {
    text-transform: none;
  }
  &__error {
  }
  &__body {
  }
  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }
  &__contet {
    background-color: transparent !important;
    :deep(p) {
      background-color: transparent !important;
      background: transparent !important;

      text-align: left !important;
      font-size: 14px;
      line-height: 150% !important;
      &:not(:last-child) {
        margin-bottom: 25px;
      }
    }
    :deep(span) {
      background-color: transparent !important;
      color: var(--primary-color) !important;
      font-family: var(--font-open-sans) !important;
      font-weight: 400;
      text-align: left !important;
      padding: 0;
      color: var(--primary-color) !important;
      text-transform: none !important;
      line-height: 150% !important;
      font-size: 16px;
    }
    :deep(strong) {
      span {
        color: var(--primary-color) !important;
      }
    }

    :deep(.br-space) {
      display: block;
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    :deep(em) {
      font-style: italic !important;
    }
    :deep(ul),
    :deep(ol) {
      margin-top: 15px;
      margin-bottom: 15px;
      padding-left: 50px;
    }
    :deep(li) {
      font-size: 14px;
      line-height: 150% !important;
    }

    :deep(ul li::marker) {
      color: var(--primary-color);
      font-size: 1em;
    }

    :deep(ol li::marker) {
      color: var(--primary-color);
      font-weight: 700;
    }

    :deep(td) {
      width: fit-content !important;
    }

    :deep(table),
    :deep(th),
    :deep(td) {
      padding: 10px;
      border-color: var(--primary-color) !important;
      border-style: solid !important;
      border-width: 1px;
      background-color: transparent !important;
    }

    :deep(ul li) {
      list-style: disc;
      margin-bottom: 6px;
    }

    :deep(ol li) {
      list-style: decimal;
      margin-bottom: 6px;
    }
    :deep(strong),
    :deep(b) {
      font-weight: 700 !important;
      span {
        opacity: 1 !important;
      }
    }
    :deep(a) {
      color: var(--link-color) !important;
      border-bottom-style: solid;
      border-bottom-color: transparent;
      transition: border 0.3s ease 0s;
      border-bottom-width: 1px;
      @media (any-hover: hover) {
        &:hover {
          border-bottom-color: inherit;
        }
      }
    }
    :deep(a) {
      span,
      strong,
      b {
        opacity: 1;
        color: var(--link-color) !important;
        border-bottom-style: solid;
        border-bottom-color: transparent;
        transition: border 0.3s ease 0s;
        border-bottom-width: 1px;
        @media (any-hover: hover) {
          &:hover {
            border-bottom-color: inherit;
          }
        }
      }
    }
  }
}
</style>
