import axios from '@/plugins/axios'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const route = useRoute()

  const normalize = value =>
    String(value || '')
      .toLowerCase()
      .trim()

  const getCategoryName = category => {
    return category?.name || category?.title || ''
  }

  const getCategoryUrl = category => {
    return category?.url || category?.slug || String(category?.id || '')
  }

  const getChildren = category => {
    return category?.subcategories || category?.children || []
  }

  const fetchCategories = async () => {
    if (loading.value || categories.value.length) return

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/categories', {
        noParams: true,
      })

      if (data?.status === 'OK') {
        categories.value = Array.isArray(data.payload) ? data.payload : []
      } else {
        throw new Error(data?.message || 'Failed to fetch categories')
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load categories'
      console.error('Error fetching categories:', err)
      categories.value = []
    } finally {
      loading.value = false
    }
  }

  const findCategory = (list, value) => {
    const target = normalize(value)

    for (const category of list) {
      const name = normalize(getCategoryName(category))
      const url = normalize(getCategoryUrl(category))
      const id = normalize(category?.id)

      if (target && (url === target || name === target || id === target)) {
        return category
      }

      const children = getChildren(category)

      if (children.length) {
        const found = findCategory(children, value)
        if (found) return found
      }
    }

    return null
  }

  const findCategoryByUrl = url => {
    return findCategory(categories.value, url)
  }

  const findCategoryByName = name => {
    return findCategory(categories.value, name)
  }

  const findParent = (list, targetCategory) => {
    for (const parent of list) {
      const children = getChildren(parent)

      if (children.some(child => child.id === targetCategory.id)) {
        return parent
      }

      const foundParent = findParent(children, targetCategory)
      if (foundParent) return foundParent
    }

    return null
  }

  const getCategoryIds = () => {
    const categoryParam = route.params.category
    const subcategoryParam = route.params.subcategory

    const category =
      categoryParam && categoryParam !== 'all'
        ? findCategory(categories.value, categoryParam)
        : null

    const subcategory =
      subcategoryParam && subcategoryParam !== 'all'
        ? findCategory(categories.value, subcategoryParam)
        : null

    return {
      categoryId: category?.id || null,
      subcategoryId: subcategory?.id || null,
    }
  }

  const getCategoryPath = (categoryUrl, subcategoryUrl) => {
    const value =
      subcategoryUrl && subcategoryUrl !== 'all'
        ? subcategoryUrl
        : categoryUrl && categoryUrl !== 'all'
          ? categoryUrl
          : null

    const currentCategory = value ? findCategory(categories.value, value) : null

    if (!currentCategory) return []

    const path = [currentCategory]

    let parent = findParent(categories.value, currentCategory)

    while (parent) {
      path.unshift(parent)
      parent = findParent(categories.value, parent)
    }

    return path.map(category => ({
      id: category.id,
      name: getCategoryName(category),
      url: getCategoryUrl(category),
      raw: category,
    }))
  }

  const categoryIds = computed(() => getCategoryIds())

  return {
    categories,
    loading,
    error,

    fetchCategories,
    categoryIds,
    getCategoryPath,

    findCategoryByUrl,
    findCategoryByName,

    getCategoryName,
    getCategoryUrl,
    getChildren,
  }
}
