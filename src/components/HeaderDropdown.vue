<template>
  <div class="relative inline-block w-full max-w-[184px]" ref="dropdownRef">
    <Multiselect
      v-model="selectedValues"
      :mode="mode"
      :options="options"
      :trackBy="'value'"
      :label="'label'"
      :closeOnSelect="false"
      :hideSelected="false"
      :placeholder="label"
      :canClear="canClear"
      @select="handleSelect"
      :classes="{
        dropdown:
          'max-h-[200px] absolute -left-px -right-px bottom-0 transform translate-y-full border border-gray-300 -mt-px overflow-y-auto z-50 bg-[#2E303B] flex flex-col rounded-b',
        dropdownTop:
          '-translate-y-full top-px bottom-auto rounded-b-none rounded-t',
        dropdownHidden: 'hidden',
        container:
          'relative mx-auto w-full flex items-center justify-end box-border cursor-pointer border border-[#C3C2C7] rounded-large text-primary leading-snug outline-none',
        wrapper:
          'relative mx-auto w-full flex items-center justify-end box-border cursor-pointer outline-none py-3',
        placeholder:
          'flex items-center h-full absolute left-0 top-0 pointer-events-none bg-transparent leading-snug pl-3.5 text-primary rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3.5',
        optionSelected: 'bg-dark text-white',
        optionSelectedPointed: 'bg-dark text-white',
      }"
    >
      <template v-slot:multiplelabel="{ values }">
        <div class="multiselect-multiple-label">
          {{ values.length }} {{ $t(`selected`) }}
        </div>
      </template>
    </Multiselect>
  </div>
</template>

<script setup>
import Multiselect from '@vueform/multiselect'
import { ref } from 'vue'
import { useMultiDropdown } from '@/composables/useMultiDropdown'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number, Array],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  mode: {
    type: String,
    default: 'single',
  },
  canClear: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])
const dropdownRef = ref(null)

const { selectedValues } = useMultiDropdown(props, emit)

const handleSelect = () => {
  const value =
    props.mode === 'single' && Array.isArray(selectedValues.value)
      ? selectedValues.value[0]
      : selectedValues.value

  emit('update:modelValue', value)
}
</script>
