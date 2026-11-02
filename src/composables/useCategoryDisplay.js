import { computed } from 'vue'

const normalize = value =>
  String(value || '')
    .toLowerCase()
    .trim()

export const capitalizeFirstLetter = string => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export function useCategoryDisplay(product, categoriesRef) {
  const getCategoryName = category => {
    return category?.name || category?.title || ''
  }

  const getCategoryUrl = category => {
    return category?.url || category?.slug || String(category?.id || '')
  }

  const getChildren = category => {
    return category?.subcategories || category?.children || []
  }

  const productCategoryName = computed(() => {
    return (
      product.value?.categories?.[0]?.name ||
      product.value?.categories?.[0]?.title ||
      product.value?.category?.name ||
      product.value?.category?.title ||
      ''
    )
  })

  const findFullCategoryPath = (categories, targetName) => {
    const target = normalize(targetName)

    const search = (list, path = []) => {
      for (const category of list) {
        const currentPath = [...path, category]

        const name = normalize(getCategoryName(category))
        const url = normalize(getCategoryUrl(category))
        const id = normalize(category?.id)

        if (target && (name === target || url === target || id === target)) {
          return currentPath
        }

        const children = getChildren(category)

        if (children.length) {
          const found = search(children, currentPath)
          if (found) return found
        }
      }

      return null
    }

    return search(categories)
  }

  const categoryPath = computed(() => {
    if (!productCategoryName.value || !categoriesRef?.value?.length) {
      return null
    }

    return findFullCategoryPath(categoriesRef.value, productCategoryName.value)
  })

  const displayCategory = computed(() => {
    return productCategoryName.value || 'All'
  })

  const parentCategory = computed(() => {
    const path = categoryPath.value

    if (!path?.length) return 'all'

    return getCategoryName(path[0]) || 'all'
  })

  const categoryInfo = computed(() => {
    const path = categoryPath.value
    return path?.length ? path[path.length - 1] : null
  })

  return {
    displayCategory,
    parentCategory,
    categoryPath,
    categoryInfo,
    capitalizeFirstLetter,
  }
}
