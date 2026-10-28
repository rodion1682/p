<template>
  <BaseModal
    v-model:show="show"
    :persistent="persistent"
    wrapper-classes="sign-in__inner"
    @close="handleClose"
  >
    <SignUpForm
      :is-auth-modal-active="true"
      @success="handleSuccess"
      @open-sign-in="handleSwitchToSignIn"
    />
  </BaseModal>
</template>

<script setup>
import { computed, watch } from 'vue'

import BaseModal from '@/components/base/BaseModal.vue'
import { useAuthStore } from '@/stores/auth'
import SignUpForm from '../components/SignUpForm.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  persistent: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close', 'switch-to-sign-in'])

const authStore = useAuthStore()

const show = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const handleClose = () => {
  show.value = false
  emit('close')
}

const handleSuccess = () => {
  show.value = false
}

const handleSwitchToSignIn = () => {
  show.value = false
  emit('switch-to-sign-in')
}

watch(
  () => authStore.isAuthenticated,
  value => {
    if (value) {
      show.value = false
    }
  },
)
</script>
