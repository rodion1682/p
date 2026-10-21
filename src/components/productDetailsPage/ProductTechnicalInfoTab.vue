<template>
  <div class="mb-4">
    <div
      v-if="descriptionParts.beforeList"
      class=""
      v-html="descriptionParts.beforeList"
    ></div>
    <ul v-if="displayedSpecifications">
      <li
        v-for="(value, key) in displayedSpecifications"
        :key="key"
        class="flex border-b border-dashed border-border"
      >
        <span
          class="text-text-primary w-1/2 pr-4 text-left text-[14px] font-normal leading-[18px] text-secondary"
          >{{ key }}:</span
        >
        <div
          class="text-text-primary w-1/2 text-left text-[14px] font-normal leading-[18px]"
        >
          <template v-if="typeof value === 'string'">
            {{ value }}
          </template>
          <template v-else>
            <ul v-if="value && value.length" class="ml-4 list-disc">
              <li
                v-for="(item, index) in value"
                :key="index"
                :class="{
                  '!pt-0': index === 0,
                  '!pb-0': index === value.length - 1,
                }"
              >
                {{ item }}
              </li>
            </ul>
          </template>
        </div>
      </li>
    </ul>
    <button
      v-if="
        extractedSpecifications &&
        Object.keys(extractedSpecifications).length > 2
      "
      class="mt-2 font-bold text-accent hover:opacity-70 focus:outline-none"
      @click="showAllSpecifications = !showAllSpecifications"
    >
      {{ showAllSpecifications ? 'Show less' : 'Show all' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  description: {
    type: String,
    required: true,
  },
})

const showAllSpecifications = ref(false)

const descriptionParts = computed(() => {
  if (!props.description) {
    return { beforeList: null, list: null }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(props.description, 'text/html')
  // Look for either ul or ol
  const list = doc.querySelector('ul, ol')

  if (!list) {
    return { beforeList: props.description, list: null }
  }

  const beforeList = doc.body.innerHTML.split(list.outerHTML)[0].trim()

  return { beforeList, list }
})

const extractSpecificationsFromList = list => {
  const specifications = {}
  list.querySelectorAll('li').forEach(li => {
    const text = li.childNodes[0]?.textContent?.trim() ?? ''
    const colonIndex = text.indexOf(':')
    if (colonIndex !== -1) {
      const key = text.substring(0, colonIndex).trim()
      let value = text.substring(colonIndex + 1).trim()
      const nestedList = li.querySelector('ul, ol')
      if (nestedList) {
        value = Array.from(nestedList.querySelectorAll('li')).map(nestedLi =>
          nestedLi.textContent.trim(),
        )
      }
      specifications[key] = value
    }
  })
  return specifications
}

const extractedSpecifications = computed(() => {
  if (!descriptionParts.value.list) {
    return null
  }
  return extractSpecificationsFromList(descriptionParts.value.list)
})

const displayedSpecifications = computed(() => {
  if (!extractedSpecifications.value) {
    return {}
  }
  if (showAllSpecifications.value) {
    return extractedSpecifications.value
  } else {
    return Object.fromEntries(
      Object.entries(extractedSpecifications.value).slice(0, 3),
    )
  }
})
</script>

<style scoped>
:deep(ul li),
:deep(ol li) {
  padding-top: 12px;
  padding-bottom: 12px;
}
</style>
