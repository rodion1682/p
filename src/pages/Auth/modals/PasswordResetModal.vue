<template>
  <BaseModal
    v-model:show="show"
    :persistent="persistent"
    wrapper-classes="sign-in__inner"
    @close="handleClose"
  >
    <PasswordResetForm
      :is-auth-modal-active="true"
      @back-to-sign-in="handleSwitchToSignIn"
    />
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'

import BaseModal from '@/components/base/BaseModal.vue'
import PasswordResetForm from '../components/PasswordResetForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  persistent: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close', 'switch-to-sign-in'])

const show = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const handleClose = () => {
  emit('close')
  emit('update:modelValue', false)
}

const handleSwitchToSignIn = () => {
  emit('update:modelValue', false)
  emit('switch-to-sign-in')
}
</script>
