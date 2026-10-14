<template>
  <div class="relative inline-block text-left">
    <div>
      <button
        type="button"
        class="inline-flex h-[48px] w-full items-center justify-between gap-x-1.5 rounded-large p-[14px_17px_14px_16px] text-left text-sm font-normal text-gray-900 shadow-sm"
        :class="{
          'bg-filter': isOpen,
          'border border-border bg-filter': !isOpen,
        }"
        @click="handleButtonClick"
        ref="buttonRef"
      >
        <div
          class="line-clamp-1 text-ellipsis text-[14px] font-normal leading-[18px] text-filter"
        >
          {{ displayedLabel }}
        </div>

        <img
          src="@/assets/images/arrow-down.svg"
          alt="Arrow down"
          class="transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>
    </div>
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="absolute left-0 z-10 mt-4 w-full rounded-large bg-filter shadow-lg focus:outline-none"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      tabindex="-1"
    >
      <div class="z-[1] p-5">
        <ul
          v-if="categories && categories.length > 0"
          class="categories-dropdown__list max-h-[350px] overflow-y-auto p-[10px]"
        >
          <li class="categories-dropdown__list-item">
            <RouterLink
              :to="{
                name: 'ProductListPage',
                params: { category: 'all', subcategory: 'all' },
                query: {},
              }"
              class="categories-dropdown__list-item-link block text-[14px] font-bold text-primary transition-colors duration-200 hover:text-accent"
            >
              {{ t('All categories') }}
            </RouterLink>
          </li>
          <li
            v-for="category in categories"
            :key="category.id"
            class="categories-dropdown__list-item"
            @mouseover="handleCategoryHover(category.id)"
            @mouseleave="handleCategoryLeave"
          >
            <a
              href="#"
              @click.prevent="handleParentCategoryClick(category)"
              class="categories-dropdown__list-item-link flex items-center justify-between text-[14px] font-bold text-primary transition-colors duration-200 hover:text-accent"
              :class="{ 'text-accent': activeCategory === category.id }"
            >
              {{ category.name }}
            </a>
          </li>
        </ul>
        <ul
          v-else-if="options && options.length > 0"
          class="categories-dropdown__list max-h-[350px] w-[190px] overflow-y-auto"
        >
          <li
            v-for="option in options"
            :key="option.value"
            class="categories-dropdown__list-item"
          >
            <a
              href="#"
              @click.prevent="handleOptionClick(option)"
              class="categories-dropdown__list-item-link flex items-center justify-between text-[14px] font-bold text-primary transition-colors duration-200 hover:text-accent"
            >
              {{ option.label }}
            </a>
          </li>
        </ul>
        <ul
          v-if="
            activeCategory &&
            categories.find(c => c.id === activeCategory)?.subCategories
              ?.length > 0
          "
          class="categories-dropdown__sublist max-h-[350px] w-[190px] overflow-y-auto rounded-[0px_0px_10px_0px] bg-filter"
        >
          <li
            v-for="subcategory in categories.find(c => c.id === activeCategory)
              ?.subCategories"
            :key="subcategory.id"
            class="categories-dropdown__sublist-item"
          >
            <RouterLink
              :to="{
                name: 'ProductListPage',
                params: { category: subcategory.name || 'all' },
              }"
              class="categories-dropdown__sublist-item-link block text-[14px] font-bold text-primary transition-colors duration-200 hover:text-accent"
            >
              {{ subcategory.name }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { twMerge } from 'tailwind-merge'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: 'Sort by price',
  },
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const dropdownRef = ref(null)
const activeCategory = ref(null)
const isClickingButton = ref(false)
const buttonRef = ref(null)

const toggleDropdown = () => {
  // console.log('toggleDropdown - isOpen:', isOpen.value)
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  // console.log('closeDropdown - isOpen:', isOpen.value)
  isOpen.value = false
  // activeCategory.value = null;
}

const handleCategoryHover = categoryId => {
  activeCategory.value = categoryId
}

const handleCategoryLeave = () => {
  // activeCategory.value = null;
}

const handleParentCategoryClick = category => {
  closeDropdown()
  router.push({
    name: 'ProductListPage',
    params: { category: category.name || 'all' },
  })
}

const handleOptionClick = option => {
  emit('update:modelValue', option.value)
  closeDropdown()
}

const handleButtonClick = () => {
  // console.log('handleButtonClick - isClickingButton:', isClickingButton.value)
  isClickingButton.value = true
  toggleDropdown()
  setTimeout(() => {
    isClickingButton.value = false
    // console.log(
    //   'handleButtonClick - after setTimeout - isClickingButton:',
    //   isClickingButton.value,
    // )
  }, 0)
}

onClickOutside(dropdownRef, event => {
  // console.log(
  //   'onClickOutside - isClickingButton:',
  //   isClickingButton.value,
  //   'event:',
  //   event,
  // )
  if (!isClickingButton.value && !buttonRef.value.contains(event.target)) {
    closeDropdown()
  }
})

watch(
  () => route.path,
  () => {
    closeDropdown()
  },
)

const displayedLabel = computed(() => {
  if (props.label === 'Sort by price') {
    const selectedOption = props.options.find(
      option => option.value === props.modelValue,
    )
    return selectedOption ? selectedOption.label : t('Sort by price')
  }
  return props.label
})
</script>

<style scoped>
.categories-dropdown__list-item {
  margin-bottom: 24px;
}
.categories-dropdown__list-item:last-child {
  margin-bottom: 0;
}
.categories-dropdown__sublist-item {
  margin-bottom: 24px;
}
.categories-dropdown__sublist-item:last-child {
  margin-bottom: 0;
}
</style>
