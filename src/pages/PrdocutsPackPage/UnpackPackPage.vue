<template>
  <main class="unpack-page">
    <div class="unpack-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="unpack-page__inner _cnt">
      <BaseButton
        variant="back"
        icon="arrow"
        class="unpack-page__back"
        @click="goToPacks"
      >
        {{ $t('Back') }}
      </BaseButton>

      <div v-if="loading" class="unpack-page__state">
        <LoadingSpinner />
      </div>

      <div v-else-if="error || !ownedPack" class="unpack-page__state">
        <h1 class="unpack-page__state-title _h4">
          {{ $t('Unable to load your packs') }}
        </h1>
        <p class="unpack-page__state-text">
          {{ error || $t("You don't have any card packs yet.") }}
        </p>
        <BaseButton variant="hint-bordered" @click="fetchOwnedPack">
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else class="unpack-page__content">
        <UnpackPackModal
          :show="true"
          :inline="true"
          :pack-id="packId"
          :pack="ownedPack"
          @opened="handleOpened"
          @close="goToPacks"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import axios from '@/plugins/axios'
import UnpackPackModal from './modals/UnpackPackModal.vue'

const route = useRoute()
const router = useRouter()
const packId = computed(() => String(route.params.packId || ''))
const ownedPack = ref(null)
const loading = ref(true)
const error = ref('')
let lastRequest = 0

const extractItems = payload => {
  return (
    [
      payload?.data?.data,
      payload?.data,
      payload?.payload?.data,
      payload?.payload,
      payload?.items,
    ].find(Array.isArray) || []
  )
}

const getTemplateId = instance => {
  return instance?.pack?.id ?? instance?.pack_id ?? instance?.product_id ?? null
}

async function fetchOwnedPack() {
  const request = ++lastRequest
  loading.value = true
  error.value = ''
  ownedPack.value = null

  try {
    const { data } = await axios.get('/players/me/packs', {
      params: { per_page: 200 },
    })
    if (request !== lastRequest) return

    const matches = extractItems(data).filter(
      item => String(getTemplateId(item)) === packId.value,
    )

    if (!matches.length) {
      error.value = 'You do not own this pack'
      return
    }

    const first = matches[0]
    ownedPack.value = {
      ...first,
      pack_id: getTemplateId(first),
      quantity: matches.length,
      instances: matches,
    }
  } catch (requestError) {
    if (request !== lastRequest) return
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Unable to load pack'
  } finally {
    if (request === lastRequest) loading.value = false
  }
}

function handleOpened() {
  if (!ownedPack.value) return
  ownedPack.value = {
    ...ownedPack.value,
    quantity: Math.max(0, Number(ownedPack.value.quantity) - 1),
  }
}

function goToPacks() {
  router.push({ name: 'PackListPage' })
}

watch(packId, fetchOwnedPack, { immediate: true })
</script>

<style lang="scss" scoped>
.unpack-page {
  @include adaptiveValue('padding-top', 120, 80);
  @include adaptiveValue('padding-bottom', 80, 30);

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
      width: 100%;
      height: 100%;

      object-fit: cover;
    }
  }

  &__inner {
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
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__content {
    @include adaptiveValue('padding', 32, 16);
    @include adaptiveValue('border-radius', 16, 10);
    min-width: 0;

    border: 1px solid var(--border-priamry-color);
    background: #111624;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    min-height: 250px;

    padding: 24px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 10px;
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
  }
}
</style>
