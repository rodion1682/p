import { useStaticStore } from '@/stores/static'
import { computed } from 'vue'

export function useStaticPages() {
  const staticStore = useStaticStore()

  const normalize = value =>
    String(value || '')
      .toLowerCase()
      .trim()

  const termsPage = computed(() =>
    staticStore.pages.find(page => {
      const title = normalize(page.title)
      const slug = normalize(page.slug)

      return (
        page.is_terms === 1 ||
        page.is_terms === true ||
        slug === 'terms-of-use' ||
        slug === 'terms-and-conditions' ||
        title.includes('terms')
      )
    }),
  )

  const privacyPage = computed(() =>
    staticStore.pages.find(page => {
      const title = normalize(page.title)
      const slug = normalize(page.slug)

      return (
        page.is_privacy === 1 ||
        page.is_privacy === true ||
        slug === 'privacy-notice' ||
        slug === 'privacy-policy' ||
        title.includes('privacy')
      )
    }),
  )

  const cookiePage = computed(() =>
    staticStore.pages.find(page => {
      const title = normalize(page.title)
      const slug = normalize(page.slug)

      return (
        page.is_cookie === 1 ||
        page.is_cookie === true ||
        slug === 'cookie-notice' ||
        slug === 'cookie-policy' ||
        title.includes('cookie')
      )
    }),
  )

  const ensurePages = async () => {
    if (!staticStore.pages.length) {
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
    cookiePage,
    ensurePages,
    getPageUrl,
    loading: computed(() => staticStore.loading),
    error: computed(() => staticStore.error),
  }
}
