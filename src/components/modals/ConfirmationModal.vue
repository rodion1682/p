<template>
  <div v-if="isVisible" class="modal-overlay">
    <div ref="modal" class="modal rounded-[20px]">
      <h2>{{ $t(`Confirm Purchase`) }}</h2>
      <p>{{ $t(`Are you sure you want to proceed with this purchase?`) }}</p>
      <div class="modal-actions flex items-center justify-center gap-5">
        <BaseButton @click="confirmPurchase">{{ $t(`Yes`) }}</BaseButton>
        <BaseButton @click="cancelPurchase">{{ $t(`No`) }}</BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { onClickOutside } from '@vueuse/core'

export default {
  name: 'ConfirmationModal',
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    onConfirm: {
      type: Function,
      required: true,
    },
    onCancel: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const modal = ref(null)

    const confirmPurchase = () => {
      props.onCancel()
      props.onConfirm()
    }

    const cancelPurchase = () => {
      props.onCancel()
    }

    // Close modal when clicking outside
    const handleClickOutside = () => {
      cancelPurchase()
    }

    onMounted(() => {
      onClickOutside(modal, handleClickOutside)
    })

    return {
      modal,
      confirmPurchase,
      cancelPurchase,
    }
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
.modal-actions {
  margin-top: 20px;
}
</style>
