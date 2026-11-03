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
  <section class="hero">
    <div class="hero__inner _cnt-home">
      <div class="hero__title">
        <div class="_h2">{{ $t('THE WORLD ENDED.') }}</div>
        <span class="_h1">{{ $t('YOUR STORY DIDN’T.') }}</span>
      </div>
      <div class="hero__subtitle _h3">
        {{ $t('Survive the Chaos. Build Your Legacy.') }}
      </div>
      <div class="hero__text">
        <p>
          {{
            $t(
              'Enter WastelandCore, a Rust survival experience where every resource matters, every encounter carries a risk, and every decision shapes your future. Explore a hostile world, construct fortified bases, challenge rival survivors, and collect valuable items along the way.',
            )
          }}
        </p>
        <p>
          {{
            $t(
              'Need better equipment or want to sell items you’ve collected? The WastelandCore Shop gives you a convenient way to buy and sell in-game items while preparing for your next adventure.',
            )
          }}
        </p>
      </div>
      <div class="hero__actions">
        <BaseButton class="hero__button" variant="shadow" @click="goToProducts">
          {{ $t('JOIN THE MARKET') }}
        </BaseButton>
        <div v-if="serverIP" class="hero__connect">
          <div class="hero__connect-text">
            {{ $t('SERVER IP') }}
          </div>
          <div class="hero__connect-ip">{{ serverIP }}</div>
          <BaseButton
            class="hero__copy"
            variant="dark"
            :disabled="!connectCommand"
            @click="copyServerIP"
          >
            {{ $t('COPY IP') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.hero {
  position: relative;
  z-index: 1;
  @include adaptiveValue('padding-top', 216, 80);
  @include adaptiveValue('padding-bottom', 91, 30);
  &__inner {
    @include adaptiveValue('padding-left', 46, 10, 1430, 768, 1);
    @include adaptiveValue('padding-right', 49, 10, 1430, 768, 1);
  }

  &__title {
    div {
      @include adaptiveValue('font-size', 48, 20);
    }
    span {
      color: var(--hint-primary-color);
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 39, 18);
    }
    @media (min-width: $md6) {
      div {
        display: inline;
      }
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__text {
    max-width: 659px;
    p {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 22, 18);
      }
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 22);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    @include adaptiveValue('gap', 42, 10);
  }

  &__button {
    max-width: 225px;
  }

  &__connect {
    @include adaptiveValue('min-height', 48, 40);
    display: flex;
    align-items: center;
    text-transform: uppercase;
    padding: 4px 4px 4px 10px;
    color: var(--secondary-color);
    border-radius: 6px;
    background-color: var(--bg-secondary-color);
    border: 1px solid var(--border-third-color);
    @include adaptiveValue('gap', 14, 10);
    &-text {
      font-weight: 500;
      font-size: 12px;
      white-space: nowrap;
      &::after {
        content: ':';
      }
    }

    &-ip {
      white-space: nowrap;
    }
  }

  &__copy {
  }
}
</style>
