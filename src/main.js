// main.js
import './assets/main.css'
import './assets/styles/styles.scss'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import axiosInstance from './plugins/axios'
import i18n from './plugins/i18n'
import { phonePlugin } from './plugins/phone'
import { toastPlugin } from './plugins/toast'

import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import ArrowIcon from '@/components/icons/ArrowIcon.vue'
import App from './App.vue'
import BaseCheckbox from './components/base/BaseCheckbox.vue'
import BaseButton from './components/BaseButton.vue'
import BasePhone from './components/BasePhone.vue'
import PriceFormatter from './components/PriceFormatter.vue'
import router from './router'

// Create the app and pinia store early, but don't mount yet
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Import here after pinia is created
import { useAuthStore } from '@/stores/auth'

// Register global components
app.component('BaseInput', BaseInput)
app.component('BaseButton', BaseButton)
app.component('BaseCheckbox', BaseCheckbox)
app.component('BasePhone', BasePhone)
app.component('BaseSelect', BaseSelect)
app.component('BaseBadge', BaseBadge)
app.component('ArrowIcon', ArrowIcon)
app.component('PriceFormatter', PriceFormatter)
// Register plugins
app.use(router)
app.use(toastPlugin)
app.use(i18n)

app.use(phonePlugin, {
  mode: 'international',
})

// Add Axios to the global properties
app.config.globalProperties.$http = axiosInstance

// Initialize authentication state before mounting the app
const initApp = async () => {
  try {
    // Get auth store and verify with server before mounting
    const authStore = useAuthStore()

    // Check authentication status with server
    await authStore.checkAuth()

    // Mount the app once authentication is verified
    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize app:', error)
    // Mount anyway in case of error
    app.mount('#app')
  }
}

// Start initialization
initApp()
