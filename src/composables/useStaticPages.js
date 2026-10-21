import { computed } from 'vue'
import { useStaticStore } from '@/stores/static'

export function useStaticPages() {
  const staticStore = useStaticStore()

  const termsPage = computed(() =>
    staticStore.pages.find(page => page.is_terms === 1),
  )
  const privacyPage = computed(() =>
    staticStore.pages.find(page => page.is_privacy === 1),
  )

  const ensurePages = async () => {
    if (staticStore.pages.length === 0) {
      await staticStore.fetchPages()
    }
  }

  const getPageUrl = page => {
    if (!page) return ''
    return page.slug ? `/${page.slug}` : `/static-page/${page.id}`
  }

  return {
    termsPage,
    privacyPage,
    ensurePages,
    getPageUrl,
    loading: computed(() => staticStore.loading),
    error: computed(() => staticStore.error),
  }
}
