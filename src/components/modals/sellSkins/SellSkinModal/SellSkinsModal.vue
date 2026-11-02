<template>
  <BaseModal
    v-model:show="show"
    :wrapperClasses="['sell-skins__inner']"
    @close="handleClose"
  >
    <SellSkinFrom @success="handleSuccess" @cancel="handleClose" />
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue'
import SellSkinFrom from '@/components/modals/sellSkins/SellSkinModal/SellSkinFrom.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close'])

const show = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const handleClose = () => {
  emit('close')
  emit('update:modelValue', false)
}

const handleSuccess = async () => {
  emit('update:modelValue', false)
  await router.push('/account/offers')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;

.sell-skins__inner {
  @include adaptiveValue('max-width', 520, 320);
}
</style>
