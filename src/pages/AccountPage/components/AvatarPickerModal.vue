<template>
  <BaseModal
    :show="modelValue"
    size="large"
    labelledby="avatar-picker-title"
    :persistent="userStore.isAvatarUpdating"
    @update:show="handleModalUpdate"
    @close="close"
  >
    <div class="avatar-picker-modal">
      <h2 id="avatar-picker-title" class="avatar-picker-modal__title">
        {{ $t('Avatars') }}
      </h2>

      <div
        v-if="userStore.isAvatarsLoading"
        class="avatar-picker-modal__state"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingSpinner class="avatar-picker-modal__loader" />
      </div>

      <div
        v-else-if="!userStore.avatars.length"
        class="avatar-picker-modal__state"
      >
        {{ $t('Failed to load avatars') }}
      </div>

      <div
        v-else
        class="avatar-picker-modal__grid"
        :aria-busy="userStore.isAvatarUpdating"
      >
        <button
          v-for="avatar in userStore.avatars"
          :key="avatar.id"
          type="button"
          class="avatar-picker-modal__item"
          :class="{
            'avatar-picker-modal__item_active': isSelected(avatar.id),
          }"
          :aria-label="`${$t('Avatar')} ${avatar.id}`"
          :aria-pressed="isSelected(avatar.id)"
          :disabled="userStore.isAvatarUpdating"
          @click="selectAvatar(avatar.id)"
        >
          <span class="avatar-picker-modal__avatar">
            <img
              :src="avatar.url"
              :alt="`${$t('Avatar')} ${avatar.id}`"
              loading="lazy"
            />
          </span>

          <span
            v-if="isSelected(avatar.id)"
            class="avatar-picker-modal__selected"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 12.5L10.25 15.75L17.5 8.5"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>

          <span
            v-if="userStore.isAvatarUpdating && isSelected(avatar.id)"
            class="avatar-picker-modal__updating"
            aria-hidden="true"
          >
            <LoadingSpinner />
          </span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'updated'])

const { t } = useI18n()
const toast = useToast()
const userStore = useUserStore()

const selectedAvatar = ref(null)
const initialAvatar = ref(null)

const isSelected = avatarId => {
  return String(selectedAvatar.value) === String(avatarId)
}

const handleModalUpdate = value => {
  if (userStore.isAvatarUpdating) {
    return
  }

  emit('update:modelValue', value)
}

const close = () => {
  if (userStore.isAvatarUpdating) {
    return
  }

  emit('update:modelValue', false)
}

const getInitialAvatarId = () => {
  return userStore.userAvatarId ?? userStore.avatars[0]?.id ?? null
}

const loadAvatars = async () => {
  try {
    if (!userStore.avatars.length) {
      await userStore.fetchAvatars()
    }

    const avatarId = getInitialAvatarId()

    selectedAvatar.value = avatarId
    initialAvatar.value = avatarId
  } catch (error) {
    console.error('Failed to load avatars:', error)

    toast.error(t('Failed to load avatars'))
  }
}

const selectAvatar = async avatarId => {
  if (userStore.isAvatarUpdating) {
    return
  }

  if (String(avatarId) === String(initialAvatar.value)) {
    selectedAvatar.value = avatarId
    return
  }

  selectedAvatar.value = avatarId

  try {
    await userStore.updateAvatar(avatarId)

    initialAvatar.value = avatarId

    toast.success(t('Avatar updated successfully'))

    emit('updated')
    close()
  } catch (error) {
    console.error('Failed to update avatar:', error)

    selectedAvatar.value = initialAvatar.value

    toast.error(t('Failed to update avatar'))
  }
}

watch(
  () => props.modelValue,
  async isOpen => {
    if (isOpen) {
      await loadAvatars()
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.avatar-picker-modal {
  @include adaptiveValue('padding-top', 20, 12);
  @include adaptiveValue('padding-bottom', 20, 12);
  @include adaptiveValue('padding-left', 38, 4);
  @include adaptiveValue('padding-right', 38, 4);

  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 0;

  &__title {
    @include adaptiveValue('font-size', 32, 24);
    @include adaptiveValue('margin-bottom', 34, 22);

    margin-top: 0;

    color: #f4d8c5;
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 1.25;
    text-align: center;
    text-transform: none;
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 350px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;
  }

  &__loader {
    width: 42px;
    height: 42px;
  }

  &__grid {
    @include adaptiveValue('column-gap', 28, 12);
    @include adaptiveValue('row-gap', 30, 16);

    display: grid;
    overflow-x: hidden;
    overflow-y: auto;
    align-items: start;
    grid-template-columns: repeat(5, minmax(0, 1fr));

    width: 100%;
    min-width: 0;
    max-height: min(480px, 60dvh);

    margin: 0 auto;
    padding: 4px;

    scrollbar-color: var(--border-secondary-color) transparent;
    scrollbar-width: thin;
  }

  &__item {
    position: relative;

    display: block;

    width: 100%;
    min-width: 0;
    aspect-ratio: 1;

    padding: 0;

    border: 2px solid var(--border-fourth-color);
    border-radius: 15px;
    outline: none;
    background: var(--bg-nineth-color);

    cursor: pointer;

    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;

    &:focus-visible {
      outline: 2px solid #9272ee;
      outline-offset: 4px;
    }

    &:disabled {
      cursor: wait;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: #9272ee;

        transform: translateY(-2px);
      }
    }

    &_active {
      border-color: #9272ee;
      box-shadow: 0 0 0 2px #9272ee;
    }
  }

  &__avatar {
    position: absolute;
    inset: 3px;

    display: block;
    overflow: hidden;

    border: 1px solid var(--border-secondary-color);
    border-radius: 10px;
    background: var(--bg-primary-color);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__selected {
    position: absolute;
    right: 5px;
    bottom: 5px;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 28px;
    height: 28px;

    border-radius: 50%;
    background: #9272ee;
    box-shadow: 0 2px 8px rgb(0 0 0 / 30%);

    color: #f4d8c5;

    pointer-events: none;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  &__updating {
    position: absolute;
    inset: 0;
    z-index: 3;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 13px;
    background: rgb(20 16 48 / 60%);
  }

  @media (max-width: $md4) {
    &__grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));

      max-height: 55dvh;
    }

    &__item {
      border-radius: 12px;
    }

    &__avatar {
      border-radius: 8px;
    }
  }

  @media (max-width: $md6) {
    &__grid {
      row-gap: 16px;
      column-gap: 12px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    &__selected {
      right: 3px;
      bottom: 3px;

      width: 24px;
      height: 24px;

      svg {
        width: 15px;
        height: 15px;
      }
    }
  }

  @media (max-width: 360px) {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
