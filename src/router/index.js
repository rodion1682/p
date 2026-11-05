import AccountPage from '@/pages/AccountPage/AccountPage.vue'
import LoginPage from '@/pages/Auth/LoginPage.vue'
import FaqPage from '@/pages/FaqPage.vue'
import HomePage from '@/pages/HomePage/HomePage.vue'
import ProductListPage from '@/pages/ProductListPage.vue'
import SellSkisnPage from '@/pages/SellSkin/SellSkisnPage.vue'
import StaticPage from '@/pages/StaticPage.vue'
import FailPaymentPage from '@/pages/StatusPages/FailPaymentPage.vue'

import PendingPaymentPage from '@/pages/StatusPages/PendingPaymentPage.vue'
import SuccessPaymentPage from '@/pages/StatusPages/SuccessPaymentPage.vue'

import { useAuthStore } from '@/stores/auth'

import { createRouter, createWebHistory } from 'vue-router'

let authVerificationPromise = null

const verifyAuth = () => {
  const authStore = useAuthStore()

  if (authVerificationPromise) {
    return authVerificationPromise
  }

  authVerificationPromise = authStore.checkAuth().catch(error => {
    console.error('Auth verification failed:', error)

    authVerificationPromise = null

    return false
  })

  return authVerificationPromise
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage,
    },

    {
      path: '/login',
      name: 'LoginPage',
      component: LoginPage,
      meta: {
        guestOnly: true,
      },
    },

    {
      path: '/success-payment',
      name: 'SuccessPaymentPage',
      component: SuccessPaymentPage,
    },

    {
      path: '/fail-payment',
      name: 'FailPaymentPage',
      component: FailPaymentPage,
    },

    {
      path: '/pending-payment',
      name: 'PendingPaymentPage',
      component: PendingPaymentPage,
    },

    {
      path: '/processing-payment',
      name: 'ProcessingPaymentPage',
      component: PendingPaymentPage,
    },

    {
      path: '/sale',
      name: 'SalePage',
      component: ProductListPage,
      props: {
        isSalePage: true,
      },
    },

    {
      path: '/sell-skins',
      name: 'SellSkinsPage',
      component: SellSkisnPage,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/new',
      name: 'NewItemsPage',
      component: ProductListPage,
      props: {
        isNewItemsPage: true,
      },
    },

    {
      path: '/products',
      name: 'ProductListPage',
      component: ProductListPage,
    },

    {
      path: '/products/p/:productId',
      name: 'ProductDetailsPage',
      component: ProductListPage,
      props: route => ({
        productId: route.params.productId,
      }),
    },

    {
      path: '/account',
      name: 'account',
      component: AccountPage,
      meta: {
        requiresAuth: true,
      },
      redirect: {
        name: 'account-balance',
      },
      children: [
        {
          path: 'balance',
          name: 'account-balance',
          component: AccountPage,
        },

        {
          path: 'purchases',
          name: 'account-purchases',
          component: AccountPage,
        },

        {
          path: 'payments',
          name: 'account-payments',
          component: AccountPage,
        },

        {
          path: 'offers',
          name: 'account-offers',
          component: AccountPage,
        },
      ],
    },

    // {
    //   path: '/faq',
    //   name: 'FAQ',
    //   component: FaqPage,
    // },

    // {
    //   path: '/cart',
    //   name: 'CartPage',
    //   component: CartPage,
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },

    {
      path: '/page/:id',
      name: 'StaticPage',
      component: StaticPage,
      props: true,
    },

    {
      path: '/:slug',
      name: 'StaticPageBySlug',
      component: StaticPage,
      props: true,
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      if (to.path !== from.path) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              el: to.hash,
              behavior: 'smooth',
            })
          }, 350)
        })
      }

      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    if (to.path === from.path) {
      const pageChanged = to.query.page !== from.query.page

      if (pageChanged) {
        return {
          top: 0,
        }
      }

      return false
    }

    return {
      top: 0,
    }
  },
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (from.name === null) {
    await verifyAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next({
      name: 'LoginPage',
      query: {
        redirect: to.fullPath,
      },
    })

    return
  }

  if (guestOnly && isAuthenticated) {
    const redirect = to.query.redirect

    if (typeof redirect === 'string' && redirect) {
      next(redirect)

      return
    }

    next({
      name: 'HomePage',
    })

    return
  }

  next()
})

export default router
