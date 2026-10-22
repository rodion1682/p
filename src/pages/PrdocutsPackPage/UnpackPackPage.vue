<template>
  <main class="unpack-page">
    <div class="unpack-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="unpack-page__container _cnt">
      <BaseButton
        type="button"
        variant="back"
        icon="arrow"
        class="unpack-page__back"
        @click="goToPacks"
      >
        {{ $t('Back to packs') }}
      </BaseButton>

      <div v-if="loading" class="unpack-page__state" role="status">
        <LoadingSpinner />
      </div>

      <div v-else-if="loadError || !ownedPack" class="unpack-page__state">
        <h1 class="unpack-page__state-title _h4">
          {{ $t('Unable to load your packs') }}
        </h1>
        <p class="unpack-page__state-text" role="alert">
          {{ loadError || $t("You don't have any card packs yet.") }}
        </p>
        <BaseButton
          type="button"
          variant="hint-bordered"
          @click="fetchOwnedPack"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else class="unpack-page__layout">
        <div
          class="unpack-page__preview"
          :aria-label="packName"
          :aria-busy="isOpening"
        >
          <img
            class="unpack-page__corner unpack-page__corner_top"
            :src="leftDecor"
            alt=""
            aria-hidden="true"
          />

          <div
            v-if="step !== 'revealed' || !revealedCards.length"
            class="unpack-page__cards"
            :class="{ 'unpack-page__cards_opening': step === 'opening' }"
            :style="{ '--pack-card-count': cardCount }"
          >
            <div
              v-for="index in cardCount"
              :key="index"
              class="unpack-page__slot"
              :class="{ 'unpack-page__slot_opening': step === 'opening' }"
              :style="{ '--card-index': index }"
            >
              <img
                v-if="packImage"
                :src="packImage"
                :alt="index === 1 ? packName : ''"
                :aria-hidden="index !== 1"
                class="unpack-page__pack-image"
                draggable="false"
              />
            </div>
          </div>

          <div
            v-else
            class="unpack-page__cards unpack-page__cards_revealed"
            :style="{ '--pack-card-count': revealedCards.length }"
          >
            <article
              v-for="(instance, index) in revealedCards"
              :key="instance.instance_uuid ?? instance.id ?? index"
              class="unpack-page__slot unpack-page__slot_revealed"
              :style="{ '--card-index': index }"
              :aria-label="getCard(instance).name || $t('Card')"
            >
              <div
                class="unpack-card"
                :class="{
                  'unpack-card_no-frame': !getCard(instance).image_2,
                }"
              >
                <div class="unpack-card__background">
                  <img
                    v-if="getCard(instance).image_2"
                    :src="resolveImageUrl(getCard(instance).image_2)"
                    alt=""
                    class="unpack-card__background-image"
                    draggable="false"
                  />
                </div>

                <div
                  v-if="getCard(instance).image"
                  class="unpack-card__image-wrapper"
                >
                  <img
                    :src="resolveImageUrl(getCard(instance).image)"
                    :alt="getCard(instance).name || ''"
                    class="unpack-card__image"
                    draggable="false"
                  />
                </div>

                <div
                  v-if="getCard(instance).name"
                  class="unpack-card__card-name"
                >
                  {{ getCard(instance).name }}
                </div>

                <div
                  v-if="
                    getCard(instance).description ||
                    getCard(instance).text_effect
                  "
                  class="unpack-card__description"
                >
                  <span>
                    {{
                      getCard(instance).description ||
                      getCard(instance).text_effect
                    }}
                  </span>
                </div>

                <div
                  v-if="hasValue(getCard(instance).mana_cost)"
                  class="unpack-card__stat unpack-card__stat_mana"
                  :aria-label="`${$t('Mana')}: ${getCard(instance).mana_cost}`"
                >
                  {{ getCard(instance).mana_cost }}
                </div>

                <div
                  v-if="hasValue(getCard(instance).attack)"
                  class="unpack-card__stat unpack-card__stat_attack"
                  :aria-label="`${$t('Attack')}: ${getCard(instance).attack}`"
                >
                  {{ getCard(instance).attack }}
                </div>

                <div
                  v-if="hasValue(getCard(instance).health)"
                  class="unpack-card__stat unpack-card__stat_health"
                  :aria-label="`${$t('Health')}: ${getCard(instance).health}`"
                >
                  {{ getCard(instance).health }}
                </div>
              </div>
            </article>
          </div>

          <div
            v-if="step === 'revealed' && !revealedCards.length"
            class="unpack-page__no-cards"
            role="status"
          >
            {{
              $t(
                'Your cards were added to your collection, but no card information was returned.',
              )
            }}
          </div>

          <img
            class="unpack-page__corner unpack-page__corner_bottom"
            :src="rightDecor"
            alt=""
            aria-hidden="true"
          />
        </div>

        <aside class="unpack-page__details">
          <h1 class="unpack-page__title _h4">{{ packName }}</h1>

          <div
            v-if="step !== 'revealed' && hasPackStats"
            class="unpack-page__stats"
          >
            <div v-if="cardCount" class="unpack-page__stat">
              <span class="unpack-page__stat-label">{{ $t('Cards') }}</span>
              <strong class="unpack-page__stat-value">{{ cardCount }}</strong>
            </div>
            <div
              v-for="entry in rarityProbabilities"
              :key="entry.rarity"
              class="unpack-page__stat"
            >
              <span class="unpack-page__stat-label">{{
                formatRarity(entry.rarity)
              }}</span>
              <strong class="unpack-page__stat-value"
                >{{ entry.probability_percent }}%</strong
              >
            </div>
          </div>

          <p v-if="openError" class="unpack-page__error" role="alert">
            {{ openError }}
          </p>

          <div
            v-if="step === 'opening'"
            class="unpack-page__progress"
            role="status"
            aria-live="polite"
          >
            <span class="unpack-page__spinner" aria-hidden="true" />
            {{ $t('Opening your pack...') }}
          </div>

          <div class="unpack-page__actions">
            <template v-if="step === 'confirm'">
              <BaseButton
                type="button"
                variant="play"
                class="unpack-page__action"
                :disabled="!packId || !availableQuantity || isOpening"
                @click="openPack"
              >
                {{ $t('Unpack') }}
              </BaseButton>
              <BaseButton
                type="button"
                variant="hint-bordered"
                class="unpack-page__secondary"
                @click="goToPacks"
              >
                {{ $t('Cancel') }}
              </BaseButton>
            </template>
            <BaseButton
              v-else-if="step === 'revealed'"
              type="button"
              variant="play"
              class="unpack-page__action"
              @click="goToCollection"
            >
              {{ $t('Add to my collection') }}
            </BaseButton>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import blueLeftDecor from '@/assets/img/blue-left-decor.png'
import blueRightDecor from '@/assets/img/blue-right-decor.png'
import redLeftDecor from '@/assets/img/red-left-decor.png'
import redRightDecor from '@/assets/img/red-right-decor.png'
import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import axios from '@/plugins/axios'

const route = useRoute()
const router = useRouter()
const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''
const MINIMUM_OPENING_DURATION = 1200

const packId = computed(() => String(route.params.packId || ''))
const ownedPack = ref(null)
const availableQuantity = ref(0)
const loading = ref(true)
const loadError = ref('')
const openError = ref('')
const step = ref('confirm')
const isOpening = ref(false)
const revealedCards = ref([])
let requestId = 0
let active = true

// GET /players/me/packs returns PackInstanceResource::collection (paginated data array).
const packName = computed(() => ownedPack.value?.pack?.name || '')
const cardCount = computed(() =>
  Math.max(0, Number(ownedPack.value?.pack?.card_count) || 0),
)
const rarityProbabilities = computed(() => {
  const values = ownedPack.value?.rarity_probabilities
  return Array.isArray(values)
    ? values.filter(entry => entry?.rarity && entry.probability_percent != null)
    : []
})
const hasPackStats = computed(
  () => cardCount.value > 0 || rarityProbabilities.value.length > 0,
)
const isElite = computed(() => /elite/i.test(packName.value))
const leftDecor = computed(() => (isElite.value ? redLeftDecor : blueLeftDecor))
const rightDecor = computed(() =>
  isElite.value ? redRightDecor : blueRightDecor,
)
const packImage = computed(() =>
  resolveImageUrl(
    ownedPack.value?.pack?.image || ownedPack.value?.pack?.image_details,
  ),
)

function resolveImageUrl(path) {
  if (typeof path !== 'string' || !path) return ''
  if (/^(https?:|data:|blob:)/i.test(path)) return path
  if (!STATIC_DOMAIN) return path
  return `${STATIC_DOMAIN.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function formatRarity(rarity) {
  const name = String(rarity).replaceAll('_', ' ')
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const hasValue = value => value !== undefined && value !== null && value !== ''
const getCard = instance => instance?.card || {}

async function fetchOwnedPack() {
  const current = ++requestId
  loading.value = true
  loadError.value = ''
  ownedPack.value = null
  availableQuantity.value = 0
  step.value = 'confirm'
  revealedCards.value = []
  openError.value = ''

  try {
    if (!packId.value) throw new Error('Pack ID is missing')

    // Match the pack *template* ID, not the pack-instance ID.
    const { data } = await axios.get('/players/me/packs', {
      params: { per_page: 200 },
    })
    if (!active || current !== requestId) return

    const items = Array.isArray(data?.data) ? data.data : []
    const matches = items.filter(
      item => String(item?.pack?.id) === packId.value,
    )

    if (!matches.length) {
      loadError.value = 'You do not own this pack'
      return
    }

    ownedPack.value = matches[0]
    availableQuantity.value = matches.length
  } catch (error) {
    if (!active || current !== requestId) return
    loadError.value =
      error?.response?.data?.message ||
      error?.message ||
      'Unable to load your packs'
  } finally {
    if (active && current === requestId) loading.value = false
  }
}

async function openPack() {
  if (isOpening.value || availableQuantity.value <= 0 || !packId.value) return
  isOpening.value = true
  openError.value = ''
  step.value = 'opening'

  try {
    // Keep the existing endpoint and request body unchanged.
    const [response] = await Promise.all([
      axios.post(`/packs/${packId.value}/open`),
      new Promise(resolve =>
        window.setTimeout(resolve, MINIMUM_OPENING_DURATION),
      ),
    ])
    if (!active) return

    // Laravel CardInstanceResource::collection returns { data: [...] }.
    const cards = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : []

    revealedCards.value = cards
    availableQuantity.value = Math.max(0, availableQuantity.value - 1)
    step.value = 'revealed'
  } catch (error) {
    if (!active) return
    openError.value =
      error?.response?.data?.message ||
      error?.message ||
      'Unable to open the pack'
    step.value = 'confirm'
  } finally {
    if (active) isOpening.value = false
  }
}

function goToPacks() {
  if (isOpening.value) return
  router.push({ name: 'PackListPage' })
}

// The backend already grants the opened cards. No second API call is needed.
function goToCollection() {
  router.push({ name: 'MyCardsPage', query: { collection: 'bought' } })
}

watch(packId, fetchOwnedPack, { immediate: true })
onBeforeUnmount(() => {
  active = false
  requestId += 1
})
</script>

<style lang="scss" scoped>
.unpack-page {
  @include adaptiveValue('padding-top', 110, 80);
  @include adaptiveValue('padding-bottom', 95, 30);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 100%;

  background: var(--bg-primary-color);

  &__bg {
    position: absolute;
    inset: 0;

    pointer-events: none;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__container {
    position: relative;
    z-index: 1;

    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__back {
    align-self: flex-start;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 55, 24);
    }
  }

  &__layout {
    @include adaptiveValue('column-gap', 24, 12);
    @include adaptiveValue('row-gap', 22, 14);
    display: grid;
    align-items: stretch;
    grid-template-columns: minmax(0, 1fr) minmax(270px, 0.3fr);

    width: 100%;
    min-width: 0;
    max-width: 1530px;

    margin: 0 auto;
  }

  &__preview,
  &__details {
    @include adaptiveValue('border-radius', 22, 12);
    position: relative;

    min-width: 0;

    background: #111624;
  }

  &__preview {
    @include adaptiveValue('padding-top', 60, 24);
    @include adaptiveValue('padding-right', 40, 16);
    @include adaptiveValue('padding-bottom', 60, 24);
    @include adaptiveValue('padding-left', 40, 16);

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 460px;
  }

  &__corner {
    position: absolute;
    z-index: 2;

    width: clamp(80px, 10vw, 145px);

    pointer-events: none;

    object-fit: contain;

    &_top {
      top: 0;
      left: 0;

      transform: translate(-12%, -12%);
    }
    &_bottom {
      right: 0;
      bottom: 0;

      transform: translate(12%, 12%) rotate(90deg);
    }
  }

  &__cards {
    @include adaptiveValue('gap', 22, 9);
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-columns: repeat(var(--pack-card-count), minmax(0, 1fr));

    width: 100%;
    max-width: 1100px;

    margin: auto;

    &_revealed {
      align-items: center;
      grid-template-columns: repeat(auto-fit, minmax(min(170px, 100%), 1fr));
    }
  }

  &__slot {
    position: relative;

    width: 100%;
    min-width: 0;
    max-width: 210px;
    aspect-ratio: 2 / 3;

    margin: 0 auto;

    perspective: 1000px;

    &_opening {
      animation: unpack-page-floating 0.9s ease-in-out infinite alternate;
      animation-delay: calc(var(--card-index) * 90ms);
    }
    &_revealed {
      animation: unpack-page-reveal 0.55s ease both;
      animation-delay: calc(var(--card-index) * 100ms);
    }
  }

  &__pack-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;

    filter: drop-shadow(0 12px 17px rgb(0 0 0 / 30%));
  }

  &__details {
    @include adaptiveValue('padding', 32, 18);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;

    min-height: 460px;
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    text-align: center;
    text-transform: none;

    overflow-wrap: anywhere;
  }

  &__stats {
    display: grid;
    gap: 4px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    width: 100%;

    margin-top: auto;
    padding-top: 28px;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: 8px;

    min-width: 0;

    padding: 16px;

    border-radius: 10px;
    background: var(--bg-primary-color);
  }

  &__stat-label {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 13px;
    line-height: 140%;
  }

  &__stat-value {
    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 600;
    line-height: 145%;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    width: 100%;

    margin-top: auto;
    padding-top: 22px;
  }

  &__action {
    width: 100%;
    max-width: 272px;
  }

  &__secondary {
    width: 100%;
    max-width: 160px;
    min-height: 40px;
  }

  &__progress {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    width: 100%;

    margin-top: auto;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    text-align: center;
  }

  &__spinner {
    width: 22px;
    height: 22px;

    border: 2px solid var(--border-priamry-color);
    border-radius: 50%;

    animation: unpack-page-spin 0.8s linear infinite;

    border-top-color: var(--hint-primary-color);
  }

  &__error {
    margin: 20px 0 0;

    color: var(--error-color);
    font-family: var(--font-open-sans);
    font-size: 13px;
    text-align: center;
  }

  &__no-cards {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    text-align: center;
  }

  &__state {
    @include adaptiveValue('padding', 40, 20);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;

    width: 100%;
    max-width: 550px;
    min-height: 300px;

    margin: auto;

    border: 1px solid var(--border-priamry-color);
    border-radius: 12px;
    background: #111624;

    text-align: center;
  }

  &__state-title {
    margin: 0;

    color: var(--fourth-color);
  }
  &__state-text {
    margin: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    line-height: 150%;
  }

  @media (max-width: $md3) {
    &__layout {
      grid-template-columns: minmax(0, 1fr);

      max-width: 760px;
    }

    &__preview {
      min-height: 330px;
    }
    &__details {
      gap: 20px;

      min-height: 0;
    }
    &__stats,
    &__actions,
    &__progress {
      margin-top: 0;
      padding-top: 0;
    }
    &__cards {
      max-width: 670px;
    }
  }

  @media (max-width: $md6) {
    &__preview {
      min-height: 240px;
    }
    &__cards {
      grid-template-columns: repeat(auto-fit, minmax(min(115px, 42%), 1fr));
    }
    &__slot {
      max-width: 170px;
    }
    &__corner {
      width: 90px;
    }
    &__stat {
      padding: 12px;
    }
  }
}

.unpack-card {
  position: relative;

  width: 100%;
  height: 100%;
  aspect-ratio: 2 / 3;

  container-type: inline-size;

  filter: drop-shadow(0 12px 17px rgb(0 0 0 / 30%));

  &__background {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;
  }

  &__background-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;
  }

  &__image-wrapper {
    position: absolute;
    top: 15.3%;
    left: 50%;

    width: 77%;
    height: 45.5%;

    transform: translateX(-50%);
  }

  &__image {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    object-fit: cover;
  }

  &__card-name {
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

  &__description {
    position: absolute;
    bottom: 11%;
    left: 50%;

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
    white-space: pre-line;

    transform: translateX(-50%);
  }

  &__stat {
    position: absolute;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 14%;
    aspect-ratio: 1;

    border-radius: 50%;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: clamp(14px, 10cqi, 28px);
    font-weight: 700;
    line-height: 135%;

    paint-order: stroke fill;

    -webkit-text-fill-color: var(--primary-color);
    -webkit-text-stroke-width: clamp(1px, 0.8cqi, 2px);

    &_mana {
      top: 6.4%;
      left: 7.5%;

      background: radial-gradient(
        circle at 50% 42%,
        #4fa9df 0%,
        #2c8bc4 28%,
        #176fa8 48%,
        #07578b 68%,
        #003b66 86%,
        #002a4b 100%
      );
      box-shadow:
        inset 0 0 4px rgb(0 10 25 / 35%),
        inset 0 3px 5px rgb(0 15 30 / 45%),
        inset 0 -5px 8px rgb(0 8 20 / 75%),
        inset 4px 0 6px rgb(0 12 28 / 40%),
        inset -4px 0 6px rgb(0 12 28 / 40%),
        0 1px 3px rgb(0 0 0 / 60%),
        0 0 5px rgb(0 20 40 / 50%);

      -webkit-text-stroke-color: #01588a;
    }

    &_attack {
      right: 5.85%;
      bottom: 5.5%;

      width: 12%;

      background: radial-gradient(
        circle at 50% 42%,
        #c44976 0%,
        #a92e5d 28%,
        #8c1e4b 48%,
        #70123c 68%,
        #52092e 86%,
        #35051f 100%
      );
      box-shadow:
        inset 0 0 4px rgb(45 0 20 / 35%),
        inset 0 3px 5px rgb(55 0 25 / 45%),
        inset 0 -5px 8px rgb(35 0 18 / 75%),
        inset 4px 0 6px rgb(45 0 22 / 40%),
        inset -4px 0 6px rgb(45 0 22 / 40%),
        0 1px 3px rgb(0 0 0 / 60%),
        0 0 5px rgb(40 0 20 / 50%);

      line-height: 110%;

      -webkit-text-stroke-color: #72153e;
    }

    &_health {
      bottom: 5.5%;
      left: 5.85%;

      width: 12%;

      background: radial-gradient(
        circle at 50% 42%,
        #42a995 0%,
        #268878 28%,
        #146d62 48%,
        #09564f 68%,
        #03413e 86%,
        #022d2d 100%
      );
      box-shadow:
        inset 0 0 4px rgb(0 25 23 / 35%),
        inset 0 3px 5px rgb(0 35 30 / 45%),
        inset 0 -5px 8px rgb(0 18 20 / 75%),
        inset 4px 0 6px rgb(0 25 25 / 40%),
        inset -4px 0 6px rgb(0 25 25 / 40%),
        0 1px 3px rgb(0 0 0 / 60%),
        0 0 5px rgb(0 25 25 / 50%);

      line-height: 110%;

      -webkit-text-stroke-color: #07584f;
    }
  }

  &_no-frame {
    overflow: hidden;

    border: 1px solid var(--border-priamry-color);
    border-radius: 10px;
    background: var(--bg-primary-color);
  }
}

@keyframes unpack-page-floating {
  to {
    transform: translateY(-7px);
  }
}

@keyframes unpack-page-reveal {
  from {
    opacity: 0;

    transform: translateY(24px) rotateY(50deg);
  }
  to {
    opacity: 1;

    transform: translateY(0) rotateY(0);
  }
}

@keyframes unpack-page-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .unpack-page__slot_opening,
  .unpack-page__slot_revealed,
  .unpack-page__spinner {
    animation: none;
  }
}
</style>
