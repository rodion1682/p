<template>
  <div class="info">
    <div class="info__block">
      <div class="info__subtitle _l">{{ $t('Personal Information') }}</div>
      <div class="info__content">
        <BaseButton
          class="info__save"
          variant="bordered"
          @click="submitPersonalInfo"
          :disabled="
            isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
          "
        >
          <span v-if="isSubmittingPersonal">{{ $t('Editing') }}...</span>
          <span v-else>{{ $t('Edit Information') }}</span>
        </BaseButton>

        <div class="info__row">
          <BaseInput
            v-model="form.name"
            :placeholder="t('Name')"
            class="info__input"
            :error="errors.name"
            :disabled="
              isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
            "
          />
          <BaseInput
            v-model="form.surname"
            :placeholder="t('Surname')"
            class="info__input"
            :error="errors.surname"
            :disabled="
              isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
            "
          />
        </div>

        <BaseInput
          v-model="form.email"
          type="email"
          autocomplete="email"
          :placeholder="t('Email')"
          class="info__input"
          :error="errors.email"
          :disabled="
            isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
          "
        />

        <BaseInput
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          :placeholder="t('Phone')"
          class="info__input"
          :error="errors.phone"
          :disabled="
            isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
          "
        />
      </div>
    </div>

    <div class="info__block">
      <div class="info__subtitle _l">{{ $t('Billing address') }}</div>
      <div class="info__content">
        <BaseButton
          class="info__save"
          variant="bordered"
          @click="submitBillingInfo"
          :disabled="
            isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
          "
        >
          <span v-if="isSubmittingBilling">{{ $t('Saving') }}...</span>
          <span v-else>{{ $t('Save Information') }}</span>
        </BaseButton>
        <BaseSelect
          v-model="form.countryId"
          :options="countryOptions"
          optionLabel="title"
          optionValue="id"
          :placeholder="$t('Country')"
          :error="errors.countryId"
          :disabled="
            isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
          "
          class="info__input"
        />

        <div class="info__row">
          <BaseInput
            v-model="form.city"
            :placeholder="t('City')"
            class="info__input"
            :error="errors.city"
            :disabled="
              isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
            "
          />
          <BaseInput
            v-model="form.postCode"
            :placeholder="t('Zip-code')"
            class="info__input"
            :error="errors.postCode"
            :disabled="
              isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
            "
          />
        </div>

        <BaseInput
          v-model="form.address"
          :placeholder="t('Address line')"
          class="info__input"
          :error="errors.address"
          :disabled="
            isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
          "
        />
      </div>
    </div>

    <div class="info__block">
      <div class="info__subtitle _l">{{ $t('Steam Settings') }}</div>
      <div class="info__content">
        <BaseButton
          class="info__save"
          variant="bordered"
          @click="submitSteamInfo"
          :disabled="
            isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
          "
        >
          <span v-if="isSubmittingSteam">{{ $t('Saving') }}...</span>
          <span v-else>{{ $t('Save Trade Link') }}</span>
        </BaseButton>

        <BaseInput
          v-model="form.steamId"
          :placeholder="t('Steam ID')"
          class="info__input"
          disabled
        />
        <BaseInput
          v-model="form.tradeLink"
          :placeholder="t('Steam Trade Link')"
          class="info__input"
          :error="errors.tradeLink"
          :disabled="
            isSubmittingPersonal || isSubmittingBilling || isSubmittingSteam
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useToast } from '@/composables/useToast'
import { useCountriesStore } from '@/stores/countries'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const toast = useToast()
const userStore = useUserStore()
const countriesStore = useCountriesStore()

const STEAM_ID64_BASE = 76561197960265728n

const isSubmittingPersonal = ref(false)
const isSubmittingBilling = ref(false)
const isSubmittingSteam = ref(false)

const form = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  countryId: '',
  city: '',
  postCode: '',
  address: '',
  steamId: '',
  tradeLink: '',
})

const errors = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  countryId: '',
  city: '',
  postCode: '',
  address: '',
  tradeLink: '',
})

const countryOptions = computed(() => countriesStore.countries || [])

const normalize = value => String(value ?? '').trim()

const extractSteamIdFromTradeLink = value => {
  const v = normalize(value)
  if (!v) return ''

  try {
    const url = new URL(v)
    const partner = url.searchParams.get('partner')

    if (!partner || !/^\d+$/.test(partner)) return ''

    return String(STEAM_ID64_BASE + BigInt(partner))
  } catch {
    return ''
  }
}

const isPlaceholderValue = (value, placeholderKey) => {
  const v = normalize(value).toLowerCase()
  const ph = normalize(t(placeholderKey)).toLowerCase()
  return !!v && v === ph
}

const isLegacyPlaceholderValue = value => {
  const v = normalize(value).toLowerCase()
  return v === 'name' || v === 'surname'
}

const isValidTradeLink = value => {
  const v = normalize(value)
  if (!v) return false

  try {
    const url = new URL(v)

    return (
      ['http:', 'https:'].includes(url.protocol) &&
      url.hostname.includes('steamcommunity.com') &&
      url.pathname.includes('/tradeoffer/new') &&
      !!url.searchParams.get('partner') &&
      !!url.searchParams.get('token')
    )
  } catch {
    return false
  }
}

const clearErrors = fields => {
  fields.forEach(field => {
    errors[field] = ''
  })
}

const fillFromUser = user => {
  const name = user?.name || ''
  const surname = user?.surname || ''
  const tradeLink = user?.steam_trade_link || ''

  form.name =
    isPlaceholderValue(name, 'Name') || isLegacyPlaceholderValue(name)
      ? ''
      : name

  form.surname =
    isPlaceholderValue(surname, 'Surname') || isLegacyPlaceholderValue(surname)
      ? ''
      : surname

  form.email = user?.email || ''
  form.phone = user?.phone || ''
  form.countryId = user?.country || user?.country_id || ''
  form.postCode = user?.zip || user?.post_code || ''
  form.city = user?.city || ''
  form.address = user?.address || ''
  form.tradeLink = tradeLink

  form.steamId =
    user?.steamid ||
    user?.steam_id ||
    extractSteamIdFromTradeLink(tradeLink) ||
    ''
}

const validatePersonalInfo = () => {
  clearErrors(['name', 'surname', 'email', 'phone'])

  if (!normalize(form.name)) {
    errors.name = t('Please enter name')
  } else if (
    isPlaceholderValue(form.name, 'Name') ||
    isLegacyPlaceholderValue(form.name)
  ) {
    errors.name = t('Please enter a real name')
  }

  if (!normalize(form.surname)) {
    errors.surname = t('Please enter surname')
  } else if (
    isPlaceholderValue(form.surname, 'Surname') ||
    isLegacyPlaceholderValue(form.surname)
  ) {
    errors.surname = t('Please enter a real surname')
  }

  if (!normalize(form.email)) {
    errors.email = t('Email is required')
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = t('Invalid email format')
  }

  if (!normalize(form.phone)) {
    errors.phone = t('Phone number is required')
  }

  return !errors.name && !errors.surname && !errors.email && !errors.phone
}

const validateBillingInfo = () => {
  clearErrors(['countryId', 'city', 'address', 'postCode'])

  if (!form.countryId) errors.countryId = t('Country is required')
  if (!normalize(form.city)) errors.city = t('City is required')
  if (!normalize(form.address)) errors.address = t('Address is required')
  if (!normalize(form.postCode)) errors.postCode = t('Post Code is required')

  return (
    !errors.countryId && !errors.city && !errors.address && !errors.postCode
  )
}

const validateSteamInfo = () => {
  clearErrors(['tradeLink'])

  if (!normalize(form.tradeLink)) {
    errors.tradeLink = t('Trade link is required')
  } else if (!isValidTradeLink(form.tradeLink)) {
    errors.tradeLink = t('Invalid Steam trade link')
  } else if (!extractSteamIdFromTradeLink(form.tradeLink)) {
    errors.tradeLink = t('Steam ID could not be extracted from trade link')
  }

  return !errors.tradeLink
}

const buildPersonalPayload = () => ({
  name: normalize(form.name),
  surname: normalize(form.surname),
  email: normalize(form.email),
  phone: normalize(form.phone),
})

const buildBillingPayload = () => ({
  country: form.countryId || null,
  city: normalize(form.city),
  address: normalize(form.address),
  postCode: normalize(form.postCode),
})

const submitPersonalInfo = async () => {
  if (
    isSubmittingPersonal.value ||
    isSubmittingBilling.value ||
    isSubmittingSteam.value
  ) {
    return
  }

  if (!validatePersonalInfo()) return

  userStore.clearError?.()

  try {
    isSubmittingPersonal.value = true

    await userStore.updateProfile(buildPersonalPayload())
    toast.success(t('Personal information updated successfully'))

    await userStore.fetchProfile?.()
    fillFromUser(userStore.user)
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      t('Failed to update personal information')

    toast.error(msg)
  } finally {
    isSubmittingPersonal.value = false
  }
}

const submitBillingInfo = async () => {
  if (
    isSubmittingBilling.value ||
    isSubmittingPersonal.value ||
    isSubmittingSteam.value
  ) {
    return
  }

  if (!validateBillingInfo()) return

  userStore.clearError?.()

  try {
    isSubmittingBilling.value = true

    await userStore.updateProfile(buildBillingPayload())
    toast.success(t('Address information updated successfully'))

    await userStore.fetchProfile?.()
    fillFromUser(userStore.user)
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      t('Failed to update address information')

    toast.error(msg)
  } finally {
    isSubmittingBilling.value = false
  }
}

const submitSteamInfo = async () => {
  if (
    isSubmittingSteam.value ||
    isSubmittingPersonal.value ||
    isSubmittingBilling.value
  ) {
    return
  }

  if (!validateSteamInfo()) return

  userStore.clearError?.()

  const steamId = extractSteamIdFromTradeLink(form.tradeLink)
  form.steamId = steamId

  try {
    isSubmittingSteam.value = true

    await userStore.updateSteamTradeLink({
      steam_trade_link: normalize(form.tradeLink),
      steamid: steamId,
    })

    toast.success(t('Steam trade link updated successfully'))

    await userStore.fetchProfile?.()
    fillFromUser(userStore.user)
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      t('Failed to update Steam trade link')

    errors.tradeLink = msg
    toast.error(msg)
  } finally {
    isSubmittingSteam.value = false
  }
}

onMounted(async () => {
  try {
    if (!countriesStore.countries?.length) {
      await countriesStore.fetchCountries?.()
    }

    await userStore.fetchProfile?.()
    fillFromUser(userStore.user)
  } catch {
    toast.error(t('Failed to load profile data'))
  }
})

watch(
  () => userStore.user,
  user => {
    if (user) fillFromUser(user)
  },
  { deep: true },
)

watch(
  () => form.name,
  () => (errors.name = ''),
)
watch(
  () => form.surname,
  () => (errors.surname = ''),
)
watch(
  () => form.email,
  () => (errors.email = ''),
)
watch(
  () => form.phone,
  () => (errors.phone = ''),
)
watch(
  () => form.countryId,
  () => (errors.countryId = ''),
)
watch(
  () => form.city,
  () => (errors.city = ''),
)
watch(
  () => form.address,
  () => (errors.address = ''),
)
watch(
  () => form.postCode,
  () => (errors.postCode = ''),
)

watch(
  () => form.tradeLink,
  value => {
    errors.tradeLink = ''

    const steamId = extractSteamIdFromTradeLink(value)

    if (steamId) {
      form.steamId = steamId
    } else {
      form.steamId = ''
    }
  },
)
</script>
<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.info {
  &__block {
    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 70, 20, 1280, 992, 1);
      &:not(:last-child) {
        border-bottom: 2px solid var(--border-color);
        @include adaptiveValue('padding-bottom', 34, 15);
        @include adaptiveValue('margin-bottom', 44, 25);
      }
    }
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 25px;
      }
    }
  }

  &__subtitle {
    flex: 0 1 50%;
    font-weight: 700;
    height: fit-content;
    @media (min-width: $md5) {
      @include adaptiveValue('padding-bottom', 23, 15);
      border-bottom: 1px solid var(--bg-secondary-color);
    }
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__content {
    flex: 0 1 50%;
  }

  &__save {
    min-width: 217px;
    width: fit-content;
    margin-left: auto;
    @media (min-width: $md5) {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 50, 20);
      }
    }
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__row {
    display: flex;
    @include adaptiveValue('gap', 14, 10);
  }
  &__input {
    :deep(.base-select),
    :deep(.base-input) {
      border: 1px solid var(--bg-secondary-color);
      &:focus,
      &:focus-within {
        border: 1px solid var(--hint-color);
      }
    }

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }
}
</style>
