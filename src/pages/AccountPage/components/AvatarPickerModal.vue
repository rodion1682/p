<template>
  <BaseModal
    :show="modelValue"
    size="medium"
    labelledby="avatar-picker-title"
    @update:show="handleModalUpdate"
    @close="close"
  >
    <div class="avatar-picker-modal">
      <h2 id="avatar-picker-title" class="avatar-picker-modal__title _h3">
        {{ $t('Avatars') }}
      </h2>

      <div v-if="userStore.isAvatarsLoading" class="avatar-picker-modal__state">
        <LoadingSpinner class="avatar-picker-modal__loader" />
      </div>

      <div
        v-else-if="userStore.avatars.length === 0"
        class="avatar-picker-modal__state"
      >
        {{ $t('Failed to load avatars') }}
      </div>

      <div v-else class="avatar-picker-modal__grid">
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
          @click="selectAvatar(avatar.id)"
        >
          <span class="avatar-picker-modal__avatar-frame">
            <span class="avatar-picker-modal__avatar _ibg-contain">
              <img :src="avatar.url" :alt="`${$t('Avatar')} ${avatar.id}`" />
            </span>
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
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      <div class="avatar-picker-modal__actions">
        <BaseButton
          type="button"
          variant="hint-bordered"
          class="avatar-picker-modal__button avatar-picker-modal__button_cancel"
          :disabled="userStore.isAvatarUpdating"
          @click="close"
        >
          {{ $t('Cancel') }}
        </BaseButton>

        <BaseButton
          type="button"
          class="avatar-picker-modal__button avatar-picker-modal__button_apply"
          :disabled="
            !selectedAvatar || !hasAvatarChanged || userStore.isAvatarUpdating
          "
          @click="saveAvatar"
        >
          <LoadingSpinner
            v-if="userStore.isAvatarUpdating"
            class="avatar-picker-modal__save-loader"
          />

          <span v-else>
            {{ $t('Apply') }}
          </span>
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
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

const hasAvatarChanged = computed(() => {
  if (!selectedAvatar.value) {
    return false
  }

  return String(selectedAvatar.value) !== String(initialAvatar.value)
})

const isSelected = avatarId => {
  return String(selectedAvatar.value) === String(avatarId)
}

const handleModalUpdate = value => {
  emit('update:modelValue', value)
}

const close = () => {
  if (userStore.isAvatarUpdating) {
    return
  }

  emit('update:modelValue', false)
}

const selectAvatar = avatarId => {
  if (userStore.isAvatarUpdating) {
    return
  }

  selectedAvatar.value = avatarId
}

const getInitialAvatarId = () => {
  if (userStore.userAvatarId) {
    return userStore.userAvatarId
  }

  return userStore.avatars[0]?.id ?? null
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

const saveAvatar = async () => {
  if (
    !selectedAvatar.value ||
    !hasAvatarChanged.value ||
    userStore.isAvatarUpdating
  ) {
    return
  }

  try {
    await userStore.updateAvatar(selectedAvatar.value)

    initialAvatar.value = selectedAvatar.value

    toast.success(t('Avatar updated successfully'))

    emit('updated')

    close()
  } catch (error) {
    console.error('Failed to update avatar:', error)

    toast.error(t('Failed to update avatar'))
  }
}

watch(
  () => props.modelValue,
  async isOpen => {
    if (!isOpen) {
      return
    }

    await loadAvatars()
  },
)
</script>

<style lang="scss" scoped>
.avatar-picker-modal {
  display: flex;
  flex-direction: column;

  width: 100%;

  &__title {
    @include adaptiveValue('margin-bottom', 32, 22);

    padding: 0 40px;

    color: var(--primary-color);
    text-align: center;
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 330px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 140%;
    text-align: center;
  }

  &__loader {
    width: 42px;
    height: 42px;
  }

  &__grid {
    @include adaptiveValue('column-gap', 30, 14);
    @include adaptiveValue('row-gap', 24, 16);

    display: grid;
    overflow-x: hidden;
    overflow-y: auto;
    grid-template-columns: repeat(5, 1fr);

    width: 100%;
    max-width: 650px;
    max-height: 430px;

    margin: 0 auto;
    padding: 5px 5px 10px;

    scrollbar-color: var(--border-third-color) transparent;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--border-third-color);
    }
  }

  &__item {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;
    aspect-ratio: 1 / 1;

    padding: 0;

    border: 0;
    border-radius: 50%;
    outline: none;
    background: transparent;

    cursor: pointer;

    transition:
      transform 0.3s ease,
      filter 0.3s ease;

    &::before {
      position: absolute;
      inset: -4px;

      border: 2px solid transparent;
      border-radius: 50%;

      pointer-events: none;

      content: '';

      transition:
        border-color 0.3s ease,
        box-shadow 0.3s ease;
    }

    &:focus-visible {
      &::before {
        border-color: var(--hint-secondary-color);
        box-shadow: 0 0 0 2px rgb(74 119 178 / 18%);
      }
    }

    @media (any-hover: hover) {
      &:hover {
        transform: translateY(-2px);

        &::before {
          border-color: rgb(142 178 224 / 55%);
        }
      }
    }

    &_active {
      &::before {
        border-color: var(--hint-primary-color);
        box-shadow:
          0 0 0 1px rgb(74 119 178 / 30%),
          0 0 14px rgb(74 119 178 / 16%);
      }
    }
  }

  &__avatar-frame {
    position: relative;

    display: block;

    width: 100%;
    height: 100%;

    border-radius: 50%;
    background-image: url('../../../assets/img/avatar-frame-big.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;

    pointer-events: none;
  }

  &__avatar {
    position: absolute;
    top: 50%;
    left: 50%;

    overflow: hidden;

    width: 74%;
    height: 74%;

    border-radius: 50%;

    transform: translate(-50%, -50%);

    img {
      border-radius: 50%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__selected {
    position: absolute;
    right: -5px;
    bottom: -3px;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 30px;
    height: 30px;

    border: 2px solid var(--bg-primary-color);
    border-radius: 50%;
    background-color: var(--hint-primary-color);
    box-shadow:
      0 2px 7px rgb(0 0 0 / 45%),
      0 0 0 1px rgb(142 178 224 / 30%);

    color: var(--primary-color);

    pointer-events: none;

    svg {
      width: 19px;
      height: 19px;
    }
  }

  &__actions {
    @include adaptiveValue('margin-top', 38, 26);

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;

    width: 100%;
  }

  &__button {
    flex: 0 1 145px;

    min-width: 0;

    &_cancel {
      min-width: 145px;
    }

    &_apply {
      min-width: 145px;
    }
  }

  &__save-loader {
    width: 20px;
    height: 20px;
  }

  @media (max-width: $md5) {
    &__title {
      padding: 0 30px;
    }

    &__grid {
      grid-template-columns: repeat(4, 1fr);

      max-width: 520px;
      max-height: 420px;
    }
  }

  @media (max-width: $md7) {
    &__title {
      padding: 0 25px;
    }

    &__grid {
      grid-template-columns: repeat(3, 1fr);

      max-width: 390px;
    }

    &__selected {
      right: -3px;
      bottom: -2px;

      width: 26px;
      height: 26px;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    &__actions {
      gap: 10px;
    }

    &__button {
      flex: 1 1 50%;

      min-width: 0;
      max-width: 160px;
    }
  }

  @media (max-width: $md8) {
    &__grid {
      row-gap: 14px;
      column-gap: 10px;
      grid-template-columns: repeat(3, 1fr);
    }

    &__actions {
      flex-wrap: wrap;
    }

    &__button {
      flex: 1 1 100%;

      width: 100%;
      max-width: 100%;
    }
  }
}
</style>
