<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import SignInModal from '@/components/modals/auth/SignInModal.vue'
import SignUpModal from '@/components/modals/auth/SignUpModal.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const isSignUpOpen = ref(false)
const isSignInOpen = ref(false)

const goToCS2 = () => {
  router.push({
    name: 'ProductListPage',
    query: { category: 'cs2' },
  })
}

const goToDota2 = () => {
  router.push({
    name: 'ProductListPage',
    query: { category: 'dota2' },
  })
}

const openSignUp = () => {
  if (isAuthenticated.value) return

  isSignInOpen.value = false
  isSignUpOpen.value = true
}

const openSignIn = () => {
  if (isAuthenticated.value) return

  isSignUpOpen.value = false
  isSignInOpen.value = true
}

watch(isAuthenticated, value => {
  if (value) {
    isSignUpOpen.value = false
    isSignInOpen.value = false
  }
})
</script>

<template>
  <section class="ready">
    <div class="ready__inner _cnt">
      <div class="ready__image ready__image_left _ibg-contain">
        <img src="@/assets/img/ready-left.png" alt="" />
      </div>

      <div class="ready__image ready__image_right _ibg-contain">
        <img src="@/assets/img/ready-right.png" alt="" />
      </div>

      <div class="ready__bg _ibg">
        <img src="@/assets/img/ready-bg.png" alt="" />
      </div>

      <div class="ready__content">
        <div class="ready__label">
          {{ $t('FINAL CALL TO ACTION') }}
        </div>

        <div class="ready__title _h2">
          <div>{{ $t('READY TO FIND YOUR') }}</div>
          <span>{{ $t('NEXT RELIC?') }}</span>
        </div>

        <div class="ready__text">
          {{
            $t(
              'Explore distinctive CS2 and Dota 2 skins, discover new favorites, and build a collection that reflects your style. Your next great find could be waiting at Relic Forge.',
            )
          }}
        </div>

        <div class="ready__actions">
          <BaseButton
            class="ready__button"
            variant="bordered"
            @click="goToDota2"
          >
            {{ $t('Browse Dota 2 Skins') }}
          </BaseButton>

          <BaseButton class="ready__button" @click="goToCS2">
            {{ $t('Explore CS2 Skins') }}
          </BaseButton>

          <BaseButton
            v-if="!isAuthenticated"
            class="ready__button"
            variant="dark"
            @click="openSignUp"
          >
            {{ $t('Create Account') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </section>

  <SignUpModal v-model="isSignUpOpen" @switch-to-sign-in="openSignIn" />

  <SignInModal v-model="isSignInOpen" @switch-to-sign-up="openSignUp" />
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.ready {
  @include adaptiveValue('padding-top', 180, 60);
  @include adaptiveValue('padding-bottom', 160, 30);
  overflow: hidden;
  &__inner {
    @include adaptiveValue('padding-top', 65, 18);
    @include adaptiveValue('padding-bottom', 75, 18);
    position: relative;
  }

  &__image {
    position: absolute;
    z-index: 2;
    &_left {
      left: 0;
      top: 0;
      transform: translate(-40%, -30%);
      width: 37%;
      aspect-ratio: 1 / 1;
    }

    &_right {
      right: 0;
      bottom: 0;
      width: 22%;
      transform: translate(45%, 10%);
      aspect-ratio: 1 / 1.5;
    }
  }

  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  &__content {
    position: relative;
    z-index: 2;
    text-align: center;
  }

  &__label {
    text-transform: uppercase;
    color: var(--sixth-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__title {
    color: var(--secondary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__text {
    max-width: 601px;
    margin: 0 auto;
    color: var(--fourth-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    @include adaptiveValue('gap', 20, 10);
  }

  &__button {
    max-width: 230px;
  }
}
</style>
