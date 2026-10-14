<template>
  <div
    class="relative inline-block w-full max-w-[40px] text-[12px] font-bold text-primary"
    ref="dropdownRef"
    v-if="languageOptions && languageOptions.length > 1"
  >
    <Multiselect
      v-model="selectedLanguage"
      :mode="'single'"
      :options="languageOptions"
      :trackBy="'value'"
      :label="'label'"
      :closeOnSelect="true"
      :hideSelected="false"
      :canDeselect="false"
      placeholder=""
      :canClear="false"
      @select="handleLanguageChange"
      :classes="{
        container:
          'relative mx-auto w-full flex items-center justify-end box-border capitalize cursor-pointer bg-transparent rounded-large text-primary leading-snug outline-none',
        containerDisabled: 'cursor-default bg-gray-100',
        containerOpen: 'rounded-b-none',
        containerOpenTop: 'rounded-t-none',
        // containerActive: 'ring ring-green-500 ring-opacity-30',
        wrapper:
          'relative mx-auto w-full flex items-center gap-[5px] box-border cursor-pointer outline-none h-[15px]',
        singleLabel:
          'flex items-center h-full max-w-full left-0 top-0 pointer-events-none bg-transparent leading-normal box-border rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3.5',
        singleLabelText:
          'overflow-ellipsis overflow-hidden block whitespace-nowrap max-w-full',
        multipleLabel:
          'flex items-center h-full absolute left-0 top-0 pointer-events-none bg-transparent leading-snug pl-3.5 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3.5',
        search:
          'w-full absolute inset-0 outline-none focus:ring-0 appearance-none box-border border-0 text-base font-sans bg-[#2E303B] rounded pl-3.5 rtl:pl-0 rtl:pr-3.5',
        tags: 'flex-grow flex-shrink flex flex-wrap items-center mt-1 pl-2 min-w-0 rtl:pl-0 rtl:pr-2',
        tag: 'bg-green-500 text-primary text-sm font-semibold py-0.5 pl-2 rounded mr-1 mb-1 flex items-center whitespace-nowrap min-w-0 rtl:pl-0 rtl:pr-2 rtl:mr-0 rtl:ml-1',
        tagDisabled: 'pr-2 opacity-50 rtl:pl-2',
        tagWrapper: 'whitespace-nowrap overflow-hidden overflow-ellipsis',
        tagWrapperBreak: 'whitespace-normal break-all',
        tagRemove:
          'flex items-center justify-center p-1 mx-0.5 rounded-sm hover:bg-black hover:bg-opacity-10 group',
        tagRemoveIcon:
          'bg-multiselect-remove bg-center bg-no-repeat opacity-30 inline-block w-3 h-3 group-hover:opacity-60',
        tagsSearchWrapper:
          'inline-block relative mx-1 mb-1 flex-grow flex-shrink h-full',
        tagsSearch:
          'absolute inset-0 border-0 outline-none focus:ring-0 appearance-none p-0 text-base font-sans box-border w-full',
        tagsSearchCopy: 'invisible whitespace-pre-wrap inline-block h-px',
        placeholder:
          'flex items-center h-full absolute left-0 top-0 pointer-events-none bg-transparent leading-snug pl-3.5 text-primary rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3.5',
        caret:
          'bg-multiselect-caret bg-center bg-no-repeat w-2.5 h-4 py-px box-content ml-[4px] relative z-10 opacity-40 flex-shrink-0 flex-grow-0 transition-transform transform pointer-events-none rtl:mr-0 rtl:ml-3.5',
        caretOpen: 'rotate-180 pointer-events-auto',
        clear:
          'pr-3.5 relative z-10 opacity-40 transition duration-300 flex-shrink-0 flex-grow-0 flex hover:opacity-80 rtl:pr-0 rtl:pl-3.5',
        clearIcon:
          'bg-multiselect-remove bg-center bg-no-repeat w-2.5 h-4 py-px box-content inline-block',
        spinner:
          'bg-multiselect-spinner bg-center bg-no-repeat w-4 h-4 z-10 mr-3.5 animate-spin flex-shrink-0 flex-grow-0 rtl:mr-0 rtl:ml-3.5',
        infinite: 'flex items-center justify-center w-full',
        infiniteSpinner:
          'bg-multiselect-spinner bg-center bg-no-repeat w-4 h-4 z-10 animate-spin flex-shrink-0 flex-grow-0 m-3.5',
        dropdown:
          'max-h-[200px] absolute -left-px -right-px bottom-0 transform translate-y-full border border-gray-300 -mt-px overflow-y-auto z-50 bg-[#2E303B] flex flex-col rounded-b',
        dropdownTop:
          '-translate-y-full top-px bottom-auto rounded-b-none rounded-t',
        dropdownHidden: 'hidden',
        options: 'flex flex-col p-0 m-0 list-none',
        optionsTop: '',
        group: 'p-0 m-0',
        groupLabel:
          'flex text-sm box-border items-center justify-start text-left py-1 px-3 font-semibold bg-gray-200 cursor-default leading-normal',
        groupLabelPointable: 'cursor-pointer',
        groupLabelPointed: 'bg-gray-300 text-gray-700',
        groupLabelSelected: 'bg-green-600 text-primary',
        groupLabelDisabled: 'bg-gray-100 text-gray-300 cursor-not-allowed',
        groupLabelSelectedPointed: 'bg-green-600 text-primary opacity-90',
        groupLabelSelectedDisabled:
          'text-green-100 bg-green-600 bg-opacity-50 cursor-not-allowed',
        groupOptions: 'p-0 m-0',
        option:
          'flex items-center justify-center box-border text-center cursor-pointer text-[12px] text-primary font-bold leading-snug py-2',
        optionPointed: 'text-gray-800 bg-gray-100',
        optionSelected: 'bg-primary text-white',
        optionDisabled: 'text-gray-300 cursor-not-allowed',
        optionSelectedPointed: 'bg-primary text-white',
        optionSelectedDisabled:
          'text-green-100 bg-green-500 bg-opacity-50 cursor-not-allowed',
        noOptions:
          'py-2 px-3 text-gray-600 bg-[#2E303B] text-center rtl:text-right',
        noResults:
          'py-2 px-3 text-gray-600 bg-[#2E303B] text-center rtl:text-right',
        fakeInput:
          'bg-transparent absolute left-0 right-0 -bottom-px w-full h-px border-0 p-0 appearance-none outline-none text-transparent',
        assist: 'absolute -m-px w-px h-px overflow-hidden',
        spacer: 'py-px box-content',
      }"
    >
      <template #caret="{ handleCaretClick, isOpen }">
        <div
          class="relative flex items-center justify-center"
          @click="handleCaretClick"
          :style="{ pointerEvents: isOpen ? 'auto' : 'none' }"
        >
          <img
            src="@/assets/images/arrow-down.svg"
            alt="Caret"
            class="h-2.5 w-2.5 transform transition-transform"
            :class="{ 'rotate-180': isOpen }"
          />
        </div>
      </template>
    </Multiselect>
  </div>
</template>

<script setup>
import Multiselect from '@vueform/multiselect'
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

const languageOptions = computed(() =>
  languageStore.languages.map(lang => ({
    label: lang.name,
    value: lang.id,
  })),
)

const selectedLanguage = computed({
  get: () => languageStore.currentLanguageId,
  set: value => languageStore.changeLanguage(value),
})

const handleLanguageChange = async value => {
  if (value !== selectedLanguage.value) {
    await languageStore.changeLanguage(value)
  }
}
</script>
