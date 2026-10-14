<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#120B0BB2]"
      @click="handleBackdropClick"
    >
      <div
        class="relative h-[500px] max-h-full w-full max-w-[484px] overflow-auto rounded-[2px] bg-[url(/src/assets/images/modalBg2.webp)] bg-full px-[32px] pb-[20px] pt-[36px]"
        @click.stop
      >
        <!-- Close Button (X) -->
        <button
          @click="close"
          class="absolute right-[16px] top-[16px]"
          aria-label="Close modal"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.32713 13.9123C0.983892 13.9323 0.646328 13.8182 0.385622 13.5941C-0.128541 13.0768 -0.128541 12.2415 0.385622 11.7243L11.6441 0.465744C12.1789 -0.0346629 13.018 -0.00684553 13.5184 0.527929C13.9709 1.01152 13.9973 1.75482 13.5802 2.26924L2.25537 13.5941C1.99803 13.8149 1.66588 13.9288 1.32713 13.9123Z"
              fill="#D8D0C6"
            />
            <path
              d="M12.5726 13.9124C12.2247 13.9109 11.8913 13.7728 11.6443 13.5278L0.385759 2.26923C-0.090586 1.71297 -0.0258243 0.875829 0.530436 0.39944C1.02691 -0.0257248 1.75912 -0.0257248 2.25555 0.39944L13.5804 11.658C14.115 12.1585 14.1427 12.9977 13.6421 13.5323C13.6222 13.5536 13.6016 13.5742 13.5804 13.5941C13.3031 13.8352 12.9381 13.9505 12.5726 13.9124Z"
              fill="#D8D0C6"
            />
          </svg>
        </button>

        <!-- Modal Title -->
        <h2
          class="mb-[42px] text-center font-secondary text-[24px] font-semibold leading-[34px]"
        >
          {{ $t('Sell your skins') }}
        </h2>

        <!-- Form -->
        <div class="">
          <!-- General Error Message -->
          <div
            v-if="formErrors.general"
            class="mb-[24px] rounded-[5px] border border-error/20 bg-error/10 p-[14px] text-error"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5 text-error"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-[14px] font-medium text-error">
                  {{ formErrors.general }}
                </h3>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-[14px]">
            <!-- Skin Name -->
            <div>
              <BaseInput
                v-model="formData.title"
                type="text"
                :label="$t('Skin Name:')"
                :error="formErrors.title"
                :amount="true"
              />
            </div>

            <!-- Desired Price -->
            <div>
              <div class="relative">
                <BaseInput
                  v-model="formData.price"
                  type="text"
                  :label="$t('Desired price:')"
                  :placeholder="
                    currencyStore.currentCurrencySymbol + ' ' + $t('0.00')
                  "
                  :error="formErrors.price"
                  :amount="true"
                />
              </div>
            </div>

            <!-- Quality -->
            <div>
              <BaseSelect
                v-model="formData.quality"
                :label="$t('Quality:')"
                :options="qualityOptions"
                :error="formErrors.quality"
                :amount="true"
              >
              </BaseSelect>
            </div>

            <!-- Steam Inventory Link -->
            <div>
              <BaseInput
                v-model="formData.item_url"
                type="text"
                :label="$t('Steam inventory link to skin:')"
                :error="formErrors.item_url"
                :amount="true"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-[42px] flex justify-between">
            <BaseButton
              variant="transparent"
              @click="close"
              type="button"
              class="h-[48px] flex-1 text-[14px] font-bold uppercase text-secondary"
            >
              {{ $t('Cancel') }}
            </BaseButton>
            <BaseButton
              variant="green2"
              @click="handleSubmit"
              :disabled="isLoading"
              type="button"
              class="flex-1"
            >
              <span v-if="isLoading">{{ $t('Submitting...') }}</span>
              <span v-else>{{ $t('Submit') }}</span>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useCurrencyStore } from '@/stores/currency'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

const currencyStore = useCurrencyStore()
const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()

// Form data
const formData = ref({
  title: '',
  price: '',
  quality: '',
  item_url: '',
})

// Form errors
const formErrors = ref({
  title: '',
  price: '',
  quality: '',
  item_url: '',
  general: '',
})

// Loading state
const isLoading = ref(false)

// Quality options
const qualityOptions = ref([
  { label: 'Field-Tested', value: 'field_tested' },
  { label: 'Battle-Scarred', value: 'battle_scarred' },
  { label: 'Minimal Wear', value: 'minimal_wear' },
  { label: 'Well-Worn', value: 'well_worn' },
  { label: 'Factory New', value: 'factory_new' },
  { label: 'Not Painted', value: 'not_painted' },
])

// Computed
const isVisible = computed(() => props.show)

// Methods
const close = () => {
  emit('close')
  resetForm()
}

const handleBackdropClick = () => {
  if (!isLoading.value) {
    close()
  }
}

const resetForm = () => {
  formData.value = {
    title: '',
    price: '',
    quality: '',
    item_url: '',
  }
  formErrors.value = {}
}

const validateForm = () => {
  const errors = {}

  if (!formData.value.title) {
    errors.title = 'Skin name is required'
  }

  if (!formData.value.price) {
    errors.price = 'Price is required'
  } else if (
    isNaN(formData.value.price) ||
    parseFloat(formData.value.price) <= 0
  ) {
    errors.price = 'Price must be a positive number'
  }

  if (!formData.value.quality) {
    errors.quality = 'Quality is required'
  }

  if (!formData.value.item_url) {
    errors.item_url = 'Steam inventory link is required'
  }

  return errors
}

const handleSubmit = async () => {
  try {
    // Validate form
    const errors = validateForm()
    formErrors.value = errors

    // Check if we have any errors
    if (Object.keys(errors).length > 0) {
      return
    }

    isLoading.value = true

    // Prepare data for submission
    const payload = {
      title: formData.value.title,
      price: formData.value.price,
      quality: formData.value.quality,
      item_url: formData.value.item_url,
    }

    // Submit the form using offerFlowStore
    const result = await offerFlowStore.createSellOrder(payload)

    // Only proceed if the submission was successful
    if (result && result.success) {
      // The store will already show a success toast, so we don't need to show another one here

      // Close current modal
      close()

      // Open confirmation modal
      modalStore.open('sellConfirmation')
    } else if (result && !result.success) {
      // Handle API validation errors
      if (result.validationErrors) {
        Object.keys(result.validationErrors).forEach(key => {
          formErrors.value[key] = result.validationErrors[key][0]
        })
      }

      // The store already shows the error toast, so we don't need to show another one
      if (result.error) {
        formErrors.value.general = result.error
      }
    }
  } catch (error) {
    console.error('Error creating offer:', error)

    // Clear previous errors
    formErrors.value = {
      title: '',
      price: '',
      quality: '',
      item_url: '',
      general: '',
    }

    // Handle API errors
    if (error?.response?.data?.errors) {
      // Map backend validation errors to form fields
      const apiErrors = error.response.data.errors
      Object.keys(apiErrors).forEach(key => {
        formErrors.value[key] = apiErrors[key][0]
      })
    } else if (error?.response?.data?.message) {
      formErrors.value.general = error.response.data.message
    } else {
      formErrors.value.general = error.message || 'Failed to create offer'
    }
  } finally {
    isLoading.value = false
  }
}

// Reset form when modal is closed
watch(
  () => props.show,
  newValue => {
    if (!newValue) {
      resetForm()
    }
  },
)
</script>
