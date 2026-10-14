<template>
  <BaseModal
    :show="show"
    :persistent="isUnpacking"
    class="unpack-pack-modal"
    content-class="unpack-pack-modal__content"
    :labelledby="titleId"
    @close="handleClose"
    @update:show="handleShowUpdate"
  >
    <div v-if="step === 'confirm'" class="unpack-pack">
      <h2 :id="titleId" class="unpack-pack__title _h3">
        {{ packName }}
      </h2>

      <div class="unpack-pack__confirmation">
        <div class="unpack-pack__preview">
          <div class="unpack-pack__preview-inner">
            <img
              v-if="packImage"
              :src="packImage"
              :alt="packName"
              class="unpack-pack__pack-image"
            />
          </div>
        </div>

        <div class="unpack-pack__confirmation-content">
          <h3 class="unpack-pack__confirmation-title _h3">
            {{ $t('Open this card pack?') }}
          </h3>

          <p class="unpack-pack__confirmation-text">
            {{
              $t(
                'The pack will be opened and all received cards will be added to your collection automatically.',
              )
            }}
          </p>

          <div v-if="availableQuantity > 0" class="unpack-pack__quantity">
            <span class="unpack-pack__quantity-label">
              {{ $t('Packs available') }}
            </span>

            <span class="unpack-pack__quantity-value">
              {{ availableQuantity }}
            </span>
          </div>

          <p v-if="error" class="unpack-pack__error" role="alert">
            {{ error }}
          </p>

          <div class="unpack-pack__actions">
            <BaseButton
              type="button"
              variant="hint-bordered"
              class="unpack-pack__button"
              :disabled="isUnpacking"
              @click="handleClose"
            >
              {{ $t('Cancel') }}
            </BaseButton>

            <BaseButton
              type="button"
              class="unpack-pack__button"
              :disabled="isUnpacking || !packId"
              @click="unpackPack"
            >
              {{ $t('Unpack') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="step === 'opening'"
      class="unpack-pack unpack-pack_opening"
      aria-live="polite"
    >
      <h2 :id="titleId" class="unpack-pack__title _h3">
        {{ packName }}
      </h2>

      <div class="unpack-pack__opening">
        <div
          class="unpack-pack__opening-line unpack-pack__opening-line_left"
          aria-hidden="true"
        />

        <div
          class="unpack-pack__opening-line unpack-pack__opening-line_right"
          aria-hidden="true"
        />

        <div class="unpack-pack__opening-frame">
          <img
            v-if="packImage"
            :src="packImage"
            :alt="packName"
            class="unpack-pack__opening-image"
          />
        </div>
      </div>

      <p class="unpack-pack__opening-text">
        {{ $t('Opening your pack...') }}
      </p>

      <span class="unpack-pack__loader" aria-hidden="true" />
    </div>

    <div
      v-else-if="step === 'revealed'"
      class="unpack-pack unpack-pack_revealed"
    >
      <h2 :id="titleId" class="unpack-pack__title _h3">
        {{ packName }}
      </h2>

      <div v-if="revealedCards.length" class="unpack-pack__cards">
        <article
          v-for="(instance, index) in revealedCards"
          :key="getCardKey(instance, index)"
          class="unpack-pack__card-item"
          :class="getRarityClass(instance)"
          :style="{ '--reveal-index': index }"
        >
          <div class="unpack-pack__card">
            <img
              v-if="getCard(instance).image_2"
              :src="resolveImageUrl(getCard(instance).image_2)"
              :alt="getCard(instance).name"
              class="unpack-pack__card-frame"
            />

            <img
              v-if="getCard(instance).image"
              :src="resolveImageUrl(getCard(instance).image)"
              alt=""
              class="unpack-pack__card-image"
            />

            <div
              v-if="getCard(instance).name"
              class="unpack-pack__card-overlay-name"
            >
              {{ getCard(instance).name }}
            </div>

            <div
              v-if="getCard(instance).description"
              class="unpack-pack__card-description"
              v-html="getCard(instance).description"
            />

            <span
              v-if="hasValue(getCard(instance).mana_cost)"
              class="unpack-pack__card-stat unpack-pack__card-stat_mana"
            >
              {{ getCard(instance).mana_cost }}
            </span>

            <span
              v-if="hasValue(getCard(instance).attack)"
              class="unpack-pack__card-stat unpack-pack__card-stat_attack"
            >
              {{ getCard(instance).attack }}
            </span>

            <span
              v-if="hasValue(getCard(instance).health)"
              class="unpack-pack__card-stat unpack-pack__card-stat_health"
            >
              {{ getCard(instance).health }}
            </span>
          </div>

          <div class="unpack-pack__card-information">
            <h3 class="unpack-pack__card-name">
              {{ getCard(instance).name || $t('Card') }}
            </h3>

            <span
              v-if="getCard(instance).rarity"
              class="unpack-pack__card-rarity"
            >
              {{ formatValue(getCard(instance).rarity) }}
            </span>
          </div>
        </article>
      </div>

      <div v-else class="unpack-pack__empty">
        <h3 class="unpack-pack__empty-title _h3">
          {{ $t('The pack was opened') }}
        </h3>

        <p class="unpack-pack__empty-text">
          {{
            $t(
              'Your cards were added to your collection, but no card information was returned.',
            )
          }}
        </p>
      </div>

      <div class="unpack-pack__revealed-actions">
        <BaseButton
          type="button"
          class="unpack-pack__continue"
          @click="handleContinue"
        >
          {{ $t('Continue') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import defaultImage from '@/assets/images/default-image.png'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import axios from '@/plugins/axios'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  packId: {
    type: [String, Number],
    default: null,
  },

  pack: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'update:show', 'opened'])

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''
const MINIMUM_OPENING_DURATION = 1800

const step = ref('confirm')
const isUnpacking = ref(false)
const error = ref('')
const revealedCards = ref([])

const titleId = computed(() => {
  return props.packId
    ? `unpack-pack-title-${props.packId}`
    : 'unpack-pack-title'
})

const packName = computed(() => {
  return (
    props.pack?.pack?.name ??
    props.pack?.product?.name ??
    props.pack?.name ??
    props.pack?.title ??
    'Card Pack'
  )
})

const availableQuantity = computed(() => {
  const value =
    props.pack?.quantity ??
    props.pack?.count ??
    props.pack?.amount ??
    props.pack?.instances?.length ??
    1

  return Math.max(0, Number(value) || 0)
})

const packImage = computed(() => {
  const image =
    props.pack?.image_details ??
    props.pack?.pack?.image_details ??
    props.pack?.product?.image_details ??
    props.pack?.image ??
    props.pack?.pack?.image ??
    props.pack?.product?.image ??
    props.pack?.image_2 ??
    props.pack?.pack?.image_2 ??
    props.pack?.product?.image_2 ??
    props.pack?.img_url ??
    ''

  return resolveImageUrl(image)
})

const wait = duration => {
  return new Promise(resolve => {
    window.setTimeout(resolve, duration)
  })
}

const getResponseCards = response => {
  const data = response?.data

  const possibleCards = [
    data?.data,
    data?.payload,
    data?.cards,
    data?.payload?.cards,
    data?.data?.cards,
  ]

  return possibleCards.find(Array.isArray) || []
}

const getCard = instance => {
  return instance?.card ?? instance?.product ?? instance ?? {}
}

const getCardKey = (instance, index) => {
  return (
    instance?.instance_uuid ??
    instance?.id ??
    getCard(instance)?.id ??
    `revealed-card-${index}`
  )
}

const getRarityClass = instance => {
  const rarity = String(getCard(instance)?.rarity || '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll('_', '-')

  return rarity ? `unpack-pack__card-item_${rarity}` : ''
}

const hasValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const formatValue = value => {
  if (!hasValue(value)) {
    return ''
  }

  const normalized = String(value).replaceAll('_', ' ')

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
}

function resolveImageUrl(image) {
  if (!image) {
    return defaultImage
  }

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image
  }

  if (!STATIC_DOMAIN) {
    return image
  }

  const domain = STATIC_DOMAIN.replace(/\/$/, '')
  const path = image.startsWith('/') ? image : `/${image}`

  return `${domain}${path}`
}

const resetModal = () => {
  step.value = 'confirm'
  isUnpacking.value = false
  error.value = ''
  revealedCards.value = []
}

const unpackPack = async () => {
  if (!props.packId || isUnpacking.value) {
    return
  }

  isUnpacking.value = true
  error.value = ''
  step.value = 'opening'

  try {
    const [response] = await Promise.all([
      axios.post(`/packs/${props.packId}/open`),
      wait(MINIMUM_OPENING_DURATION),
    ])

    revealedCards.value = getResponseCards(response)

    step.value = 'revealed'

    emit('opened', {
      packId: props.packId,
      cards: revealedCards.value,
      response: response.data,
    })
  } catch (requestError) {
    console.error('Unable to open pack:', requestError)

    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Unable to open the pack'

    step.value = 'confirm'
  } finally {
    isUnpacking.value = false
  }
}

const handleContinue = () => {
  handleClose()
}

const handleClose = () => {
  if (isUnpacking.value) {
    return
  }

  emit('update:show', false)
  emit('close')
}

const handleShowUpdate = value => {
  if (!value && isUnpacking.value) {
    return
  }

  emit('update:show', value)

  if (!value) {
    emit('close')
  }
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      resetModal()
    }
  },
)

watch(
  () => props.packId,
  () => {
    if (props.show) {
      resetModal()
    }
  },
)
</script>

<style lang="scss" scoped>
.unpack-pack {
  width: 100%;
  min-width: 0;

  &__title {
    color: var(--primary-color);
    font-weight: 400;
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 38, 24);
    }
  }

  &__confirmation {
    display: flex;
    align-items: center;
    gap: clamp(35px, 5vw, 80px);

    width: 100%;
  }

  &__preview {
    display: flex;
    flex: 0 1 48%;
    align-items: center;
    justify-content: center;

    min-width: 0;
  }

  &__preview-inner {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 420px;
    min-height: 430px;

    &::before {
      position: absolute;
      top: 50%;
      left: 50%;

      width: 80%;
      height: 65%;

      background: radial-gradient(
        circle,
        rgb(74 119 178 / 12%) 0%,
        rgb(139 122 170 / 6%) 40%,
        transparent 72%
      );

      content: '';

      transform: translate(-50%, -50%);

      filter: blur(30px);
    }
  }

  &__pack-image {
    position: relative;
    z-index: 1;

    display: block;

    width: min(100%, 360px);
    max-height: 440px;

    object-fit: contain;

    filter: drop-shadow(0 20px 25px rgb(0 0 0 / 45%));
  }

  &__confirmation-content {
    flex: 1 1 auto;

    min-width: 0;
    max-width: 480px;
  }

  &__confirmation-title {
    color: var(--primary-color);
    font-weight: 400;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 14);
    }
  }

  &__confirmation-text {
    max-width: 460px;

    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__quantity {
    display: flex;
    align-items: center;
    gap: 10px;

    width: fit-content;

    padding-top: 14px;

    border-top: 1px solid var(--border-sixth-color);

    font-family: var(--font-inter);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__quantity-label {
    color: var(--secondary-color);
    font-size: 13px;
  }

  &__quantity-value {
    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: 20px;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    width: 100%;
  }

  &__button {
    flex: 0 1 170px;

    min-width: 145px;
  }

  &__error {
    margin: 0 0 20px;
    padding: 10px 12px;

    border: 1px solid rgb(192 67 113 / 35%);
    background-color: rgb(192 67 113 / 8%);

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 145%;
  }

  &_opening {
    display: flex;
    flex-direction: column;
    align-items: center;

    min-height: 500px;
  }

  &__opening {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: min(100%, 520px);
    min-height: 360px;

    margin: 0 auto;
  }

  &__opening-frame {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 390px;

    &::before {
      position: absolute;
      top: 50%;
      left: 50%;

      width: 80%;
      aspect-ratio: 1;

      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgb(74 119 178 / 16%) 0%,
        rgb(139 122 170 / 8%) 42%,
        transparent 70%
      );

      content: '';

      transform: translate(-50%, -50%);

      filter: blur(28px);
    }
  }

  &__opening-line {
    position: absolute;
    top: 50%;

    width: 32%;
    height: 1px;

    background: linear-gradient(90deg, transparent, var(--hint-primary-color));
    opacity: 0.6;

    &_left {
      left: 0;
    }

    &_right {
      right: 0;

      transform: scaleX(-1);
    }
  }

  &__opening-image {
    position: relative;
    z-index: 1;

    width: min(80%, 320px);
    max-height: 380px;

    object-fit: contain;

    animation: unpack-pack-opening 1.2s ease-in-out infinite alternate;

    filter: drop-shadow(0 0 12px rgb(74 119 178 / 22%))
      drop-shadow(0 18px 24px rgb(0 0 0 / 45%));
  }

  &__opening-text {
    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;
    text-align: center;
  }

  &__loader {
    width: 26px;
    height: 26px;

    margin-top: 18px;

    border: 2px solid var(--border-third-color);
    border-radius: 50%;

    animation: unpack-spin 0.8s linear infinite;

    border-top-color: var(--hint-secondary-color);
  }

  &_revealed {
    min-height: 520px;
  }

  &__cards {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
    gap: clamp(12px, 1.5vw, 24px);

    width: 100%;

    perspective: 1400px;
  }

  &__card-item {
    --rarity-color: var(--border-third-color);

    position: relative;

    flex: 0 1 235px;

    min-width: 0;

    opacity: 0;

    animation: unpack-card-reveal 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    animation-delay: calc(var(--reveal-index) * 0.12s);

    &_common {
      --rarity-color: var(--secondary-color);
    }

    &_uncommon {
      --rarity-color: var(--success-color);
    }

    &_rare {
      --rarity-color: var(--hint-primary-color);
    }

    &_epic {
      --rarity-color: var(--hint-sixth-color);
    }

    &_legendary {
      --rarity-color: var(--pending-color);
    }
  }

  &__card {
    position: relative;

    width: 100%;
    aspect-ratio: 0.69;

    transition:
      transform 0.3s ease,
      filter 0.3s ease;

    container-type: inline-size;

    filter: drop-shadow(0 15px 20px rgb(0 0 0 / 35%));

    @media (any-hover: hover) {
      &:hover {
        transform: translateY(-5px);

        filter: drop-shadow(0 18px 24px rgb(0 0 0 / 45%))
          drop-shadow(0 0 12px var(--rarity-color));
      }
    }
  }

  &__card-frame {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;

    width: 100%;
    height: 100%;

    object-fit: contain;

    transform: translate(-50%, -50%);
  }

  &__card-image {
    position: absolute;
    top: 13%;
    left: 50%;
    z-index: 3;

    width: 55%;
    height: 45%;

    object-fit: cover;

    transform: translateX(-50%);
  }

  &__card-overlay-name {
    position: absolute;
    top: 9.25%;
    left: 55%;
    z-index: 3;

    overflow: hidden;

    width: 65%;
    height: fit-content;

    padding: 0 5%;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: clamp(6px, 5cqi, 14px);
    font-weight: 400;
    line-height: 1;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;

    pointer-events: none;

    transform: translateX(-50%);
  }

  &__card-description {
    position: absolute;
    bottom: 11%;
    left: 50%;
    z-index: 3;

    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;

    width: 56%;
    height: 22%;

    padding: 2%;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: clamp(5px, 3.8cqi, 9px);
    line-height: 1.2;
    text-align: center;

    pointer-events: none;

    transform: translateX(-50%);

    :deep(p) {
      margin: 0;
    }
  }

  &__card-stat {
    position: absolute;
    z-index: 4;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 17%;
    aspect-ratio: 1;

    color: var(--primary-color);
    font-family: var(--font-sedan-sc);
    font-size: clamp(14px, 10cqi, 28px);
    font-weight: 700;
    line-height: 1;

    pointer-events: none;

    paint-order: stroke fill;

    -webkit-text-fill-color: var(--primary-color);
    -webkit-text-stroke-width: clamp(1px, 0.8cqi, 2px);

    &_mana {
      top: 5%;
      left: 5.5%;

      -webkit-text-stroke-color: #01588a;
    }

    &_attack {
      bottom: 4.5%;
      left: 3.5%;

      -webkit-text-stroke-color: #066508;
    }

    &_health {
      right: 3.5%;
      bottom: 4.5%;

      -webkit-text-stroke-color: #7a0102;
    }
  }

  &__card-information {
    margin-top: 8px;

    text-align: center;
  }

  &__card-name {
    overflow: hidden;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__card-rarity {
    display: block;

    margin-top: 4px;

    color: var(--rarity-color);
    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
  }

  &__revealed-actions {
    @include adaptiveValue('margin-top', 34, 24);

    display: flex;
    justify-content: center;
  }

  &__continue {
    width: min(100%, 220px);
  }

  &__empty {
    max-width: 500px;

    margin: 70px auto 0;

    text-align: center;
  }

  &__empty-title {
    color: var(--primary-color);
    font-weight: 400;

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__empty-text {
    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;
  }

  @media (max-width: $md3) {
    &__confirmation {
      flex-direction: column;
      gap: 25px;
    }

    &__preview,
    &__confirmation-content {
      width: 100%;
      max-width: 100%;
    }

    &__preview-inner {
      min-height: 320px;
    }

    &__pack-image {
      width: min(72vw, 300px);
      max-height: 320px;
    }

    &__confirmation-content {
      text-align: center;
    }

    &__confirmation-text {
      margin-right: auto;
      margin-left: auto;
    }

    &__quantity {
      justify-content: center;

      margin-right: auto;
      margin-left: auto;
    }

    &__actions {
      justify-content: center;
    }

    &__card-item {
      flex-basis: calc(33.333% - 16px);

      max-width: 220px;
    }
  }

  @media (max-width: $md5) {
    &__card-item {
      flex-basis: calc(50% - 10px);

      max-width: 210px;
    }
  }

  @media (max-width: $md7) {
    &__actions {
      flex-direction: column;
    }

    &__button {
      flex: 0 0 auto;

      width: 100%;
      max-width: none;
    }

    &__card-item {
      flex-basis: min(100%, 190px);
    }

    &__opening {
      min-height: 300px;
    }

    &__opening-image {
      width: min(75%, 260px);
    }
  }
}

@keyframes unpack-pack-opening {
  0% {
    transform: translateY(-5px) scale(0.99);
  }

  100% {
    transform: translateY(6px) scale(1.025);
  }
}

@keyframes unpack-card-reveal {
  0% {
    opacity: 0;

    transform: translateY(40px) rotateY(70deg) scale(0.88);
  }

  70% {
    opacity: 1;

    transform: translateY(-5px) rotateY(-3deg) scale(1.015);
  }

  100% {
    opacity: 1;

    transform: translateY(0) rotateY(0deg) scale(1);
  }
}

@keyframes unpack-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.unpack-pack-modal) {
  max-width: 1260px;
}

:global(.unpack-pack-modal .base-modal__frame) {
  padding: clamp(30px, 4vw, 55px) clamp(18px, 4vw, 50px);

  background-color: var(--bg-fifth-color);
}

:global(.unpack-pack-modal__content) {
  width: 100%;
}
</style>
