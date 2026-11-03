<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'

import { useToast } from '@/composables/useToast'
import { useSettingsStore } from '@/stores/settings'
import { useRouter } from 'vue-router'

const settingsStore = useSettingsStore()
const router = useRouter()

const toast = useToast()
const { t } = useI18n()

const { serverIP } = storeToRefs(settingsStore)

const copied = ref(false)

const goToProducts = () => {
  router.push({ name: 'ProductListPage' })
}

const connectCommand = computed(() => {
  if (!serverIP.value) {
    return ''
  }

  return `client.connect ${serverIP.value}`
})

const copyServerIP = async () => {
  if (!connectCommand.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(connectCommand.value)

    copied.value = true

    toast.success(t('Server connect command copied'))

    setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch (error) {
    toast.error(t('Failed to copy server connect command'))

    console.error(error)
  }
}
</script>

<template>
  <section class="start">
    <div class="start__inner _cnt-home">
      <div class="start__title _h1">
        <span>{{ $t('THE WASTELAND IS WAITING.') }}</span>
      </div>
      <div class="start__text">
        <div>
          {{
            $t(
              'Build your shelter. Gather your resources. Defend your territory.',
            )
          }}
        </div>
        {{
          $t(
            'Whether you’re a seasoned Rust veteran or a newcomer ready to test your survival skills, WastelandCore is wh ere your next adventure begins. Prepare your equipment, enter the wasteland, and make every decision count.a convenient way to buy and sell in-game items while preparing for your next adventure.',
          )
        }}
      </div>
      <div class="start__actions">
        <BaseButton
          class="start__copy"
          variant="shadow"
          :disabled="!connectCommand"
          @click="copyServerIP"
        >
          {{ $t('JOIN WASTELANDCORE') }}
        </BaseButton>
        <BaseButton class="start__button" variant="dark" @click="goToProducts">
          {{ $t('JOIN THE MARKET') }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.start {
  position: relative;
  z-index: 1;
  @include adaptiveValue('padding-top', 50, 30);
  @include adaptiveValue('padding-bottom', 234, 30);
  &__inner {
    text-align: center;
    text-shadow: 1px 1px 1px var(--secondary-color);
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 8);
    }
  }

  &__text {
    max-width: 959px;
    margin-left: auto;
    margin-right: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    @include adaptiveValue('gap', 24, 10);
  }
  &__copy,
  &__button {
    @include adaptiveValue('min-height', 48, 40);
  }
  &__copy {
    max-width: 274px;
  }

  &__button {
    max-width: 212px;
  }
}
</style>
