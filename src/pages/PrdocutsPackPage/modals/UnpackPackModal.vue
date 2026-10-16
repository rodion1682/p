<template>
  <Teleport to="body">
    <Transition name="unpack-screen">
      <div
        v-if="show"
        class="unpack-overlay"
        role="presentation"
        @click.self="handleClose"
      >
        <section
          class="unpack-pack"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <div class="unpack-pack__container">
            <h2 :id="titleId" class="unpack-pack__title">
              {{ $t('Build Your Constellation') }}
            </h2>

            <template v-if="step === 'confirm'">
              <div class="unpack-pack__cards">
                <div
                  v-for="index in DISPLAY_CARD_COUNT"
                  :key="index"
                  class="unpack-pack__card-slot"
                >
                  <img
                    :src="packImage"
                    :alt="`${packName} ${index}`"
                    class="unpack-pack__back-image"
                    draggable="false"
                  />
                </div>
              </div>

              <p v-if="error" class="unpack-pack__error" role="alert">
                {{ error }}
              </p>

              <div class="unpack-pack__actions">
                <BaseButton
                  type="button"
                  variant="hint-bordered"
                  class="unpack-pack__button"
                  @click="handleClose"
                >
                  {{ $t('Cancel') }}
                </BaseButton>

                <BaseButton
                  type="button"
                  class="unpack-pack__button"
                  :disabled="!packId || availableQuantity <= 0"
                  @click="unpackPack"
                >
                  {{ $t('Unpack') }}
                </BaseButton>
              </div>
            </template>

            <template v-else-if="step === 'opening'">
              <div
                class="unpack-pack__cards unpack-pack__cards_opening"
                aria-live="polite"
              >
                <div
                  v-for="index in DISPLAY_CARD_COUNT"
                  :key="index"
                  class="unpack-pack__card-slot unpack-pack__card-slot_opening"
                  :style="{ '--card-index': index }"
                >
                  <img
                    :src="packImage"
                    :alt="packName"
                    class="unpack-pack__back-image"
                    draggable="false"
                  />
                </div>
              </div>

              <div class="unpack-pack__opening-status">
                <span class="unpack-pack__loader" />
                <span>{{ $t('Opening your pack...') }}</span>
              </div>
            </template>

            <template v-else-if="step === 'revealed'">
              <div
                v-if="revealedCards.length"
                class="unpack-pack__cards unpack-pack__cards_revealed"
              >
                <article
                  v-for="(instance, index) in revealedCards"
                  :key="getCardKey(instance, index)"
                  class="unpack-pack__card-slot unpack-pack__card-slot_revealed"
                  :class="getRarityClass(instance)"
                  :style="{ '--card-index': index }"
                >
                  <div class="unpack-pack__card">
                    <img
                      v-if="getCard(instance).image"
                      :src="resolveImageUrl(getCard(instance).image)"
                      alt=""
                      class="unpack-pack__card-art"
                      draggable="false"
                    />

                    <img
                      v-if="getCard(instance).image_2"
                      :src="resolveImageUrl(getCard(instance).image_2)"
                      :alt="getCard(instance).name || $t('Card')"
                      class="unpack-pack__card-frame"
                      draggable="false"
                    />

                    <span
                      v-if="hasValue(getCard(instance).mana_cost)"
                      class="unpack-pack__card-stat unpack-pack__card-stat_mana"
                    >
                      {{ getCard(instance).mana_cost }}
                    </span>

                    <span
                      v-if="getCard(instance).name"
                      class="unpack-pack__card-name"
                    >
                      {{ getCard(instance).name }}
                    </span>

                    <div
                      v-if="getCard(instance).description"
                      class="unpack-pack__card-description"
                      v-html="getCard(instance).description"
                    />

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
                </article>
              </div>

              <div v-else class="unpack-pack__empty">
                <h3>{{ $t('The pack was opened') }}</h3>
                <p>
                  {{
                    $t(
                      'Your cards were added to your collection, but no card information was returned.',
                    )
                  }}
                </p>
              </div>

              <div class="unpack-pack__actions">
                <BaseButton
                  type="button"
                  class="unpack-pack__button unpack-pack__button_collection"
                  @click="handleContinue"
                >
                  {{ $t('Add to my collection') }}
                </BaseButton>
              </div>
            </template>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import defaultImage from '@/assets/images/default-image.png'
import BaseButton from '@/components/base/BaseButton.vue'
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
const DISPLAY_CARD_COUNT = 5
const MINIMUM_OPENING_DURATION = 1800

const step = ref('confirm')
const isUnpacking = ref(false)
const error = ref('')
const revealedCards = ref([])

const titleId = computed(() =>
  props.packId ? `unpack-pack-title-${props.packId}` : 'unpack-pack-title',
)

const packName = computed(
  () =>
    props.pack?.pack?.name ??
    props.pack?.product?.name ??
    props.pack?.name ??
    props.pack?.title ??
    'Card Pack',
)

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

const wait = duration =>
  new Promise(resolve => window.setTimeout(resolve, duration))

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

const getCard = instance =>
  instance?.card ?? instance?.product ?? instance ?? {}

const getCardKey = (instance, index) =>
  instance?.instance_uuid ?? instance?.id ?? `revealed-card-${index}`

const getRarityClass = instance => {
  const rarity = String(getCard(instance)?.rarity || '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll('_', '-')

  return rarity ? `unpack-pack__card-slot_${rarity}` : ''
}

const hasValue = value => value !== null && value !== undefined && value !== ''

function resolveImageUrl(image) {
  if (!image) return defaultImage

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image
  }

  if (!STATIC_DOMAIN) return image

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
  if (!props.packId || isUnpacking.value || availableQuantity.value <= 0) {
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

const handleClose = () => {
  if (isUnpacking.value) return

  emit('update:show', false)
  emit('close')
}

const handleShowUpdate = value => {
  if (!value && isUnpacking.value) return

  emit('update:show', value)

  if (!value) emit('close')
}

const handleContinue = () => {
  handleClose()
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      resetModal()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true },
)

watch(
  () => props.packId,
  () => {
    if (props.show) {
      resetModal()
    }
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<style lang="scss" scoped>
.unpack-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  overflow-x: hidden;
  overflow-y: auto;
  flex-direction: column;
  align-items: center;

  width: 100vw;
  height: 100dvh;

  background:
    linear-gradient(rgb(18 16 54 / 48%), rgb(18 16 54 / 65%)),
    url('@/assets/img/build-bg.jpg') center / cover no-repeat;
  background-color: #171333;
}

.unpack-pack {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;

  margin: auto;
  padding: 30px 10px;

  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 1450px;

    margin: auto;
  }

  &__title {
    @include adaptiveValue('font-size', 44, 26);
    @include adaptiveValue('margin-bottom', 70, 32);

    margin-top: 0;

    color: #f4d8c5;
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 1.2;
    text-align: center;
  }

  &__cards {
    @include adaptiveValue('gap', 20, 8);

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 1300px;

    margin: 0 auto;

    perspective: 1200px;
    &_revealed {
      align-items: stretch;
      gap: clamp(10px, 1.5vw, 24px);
    }
  }

  &__card-slot {
    position: relative;

    flex: 0 1 235px;

    min-width: 0;
    aspect-ratio: 0.69;

    transform-style: preserve-3d;

    &_opening {
      animation: unpack-floating 1s ease-in-out infinite alternate;
      animation-delay: calc(var(--card-index) * 0.12s);
    }

    &_revealed {
      opacity: 0;

      animation: unpack-reveal 0.65s ease forwards;
      animation-delay: calc(var(--card-index) * 0.13s);
    }
  }

  &__back-image {
    display: block;

    width: 100%;
    height: 100%;

    user-select: none;

    object-fit: contain;

    filter: drop-shadow(0 14px 18px rgb(0 0 0 / 35%));
  }

  &__card {
    position: relative;

    width: 100%;
    height: 100%;
    aspect-ratio: 0.69;

    transition: transform 0.3s ease;

    container-type: inline-size;

    filter: drop-shadow(0 14px 18px rgb(0 0 0 / 35%));

    @media (any-hover: hover) {
      &:hover {
        transform: translateY(-8px);
      }
    }
  }

  &__card-art {
    position: absolute;
    top: 12%;
    left: 50%;
    z-index: 3;

    width: 78%;
    height: 49%;

    pointer-events: none;

    object-fit: cover;

    transform: translateX(-50%);
  }

  &__card-frame {
    position: absolute;
    inset: 0;
    z-index: 2;

    display: block;

    width: 100%;
    height: 100%;

    pointer-events: none;

    object-fit: fill;
  }

  &__card-name {
    position: absolute;
    top: 9.5%;
    left: 50%;
    z-index: 3;

    overflow: hidden;

    width: 64%;

    color: #fff;
    font-family: var(--font-inter);
    font-size: clamp(5px, 5.5cqi, 13px);
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;

    transform: translateX(-50%);
  }

  &__card-description {
    position: absolute;
    bottom: 10%;
    left: 50%;
    z-index: 3;

    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;

    width: 65%;
    height: 23%;

    padding: 2%;

    color: #f4d8c5;
    font-family: var(--font-inter);
    font-size: clamp(4px, 4cqi, 10px);
    font-weight: 500;
    line-height: 1.2;
    text-align: center;

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

    color: #fff;
    font-family: var(--font-sedan-sc);
    font-size: clamp(10px, 10cqi, 28px);
    font-weight: 700;
    line-height: 1;

    pointer-events: none;

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

  &__actions {
    @include adaptiveValue('gap', 16, 10);
    @include adaptiveValue('margin-top', 72, 36);

    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;

    width: 100%;
  }

  &__button {
    max-width: 216px;
  }

  &__opening-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    margin-top: 55px;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
  }

  &__loader {
    width: 20px;
    height: 20px;

    border: 2px solid rgb(255 255 255 / 25%);
    border-radius: 50%;

    animation: unpack-spin 0.8s linear infinite;

    border-top-color: #9572ed;
  }

  &__error {
    margin: 25px 0 0;

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;
  }

  &__empty {
    max-width: 500px;

    margin: 40px auto;

    color: var(--primary-color);
    text-align: center;

    p {
      color: var(--secondary-color);
      font-family: var(--font-inter);
      line-height: 1.5;
    }
  }

  @media (max-width: $md3) {
    &__cards {
      flex-wrap: wrap;

      max-width: 750px;
    }

    &__card-slot {
      flex-basis: calc(33.333% - 14px);

      max-width: 220px;
    }
  }

  @media (max-width: $md5) {
    &__card-slot {
      flex-basis: calc(50% - 8px);

      max-width: 180px;
    }

    &__title {
      margin-bottom: 30px;
    }

    &__actions {
      margin-top: 35px;
    }
  }

  @media (max-width: $md7) {
    &__card-slot {
      max-width: 150px;
    }

    &__button {
      flex: 1 1 130px;
    }
  }
}

.unpack-screen-enter-active,
.unpack-screen-leave-active {
  transition: opacity 0.3s ease;
}

.unpack-screen-enter-from,
.unpack-screen-leave-to {
  opacity: 0;
}

@keyframes unpack-floating {
  from {
    transform: translateY(-6px);
  }

  to {
    transform: translateY(6px);
  }
}

@keyframes unpack-reveal {
  from {
    opacity: 0;

    transform: translateY(35px) rotateY(75deg);
  }

  to {
    opacity: 1;

    transform: translateY(0) rotateY(0);
  }
}

@keyframes unpack-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
