import { createRouter, createWebHistory } from 'vue-router'

import AboutPage from '@/pages/AboutPage/AboutPage.vue'
import AccountPage from '@/pages/AccountPage/AccountPage.vue'
import AuthPage from '@/pages/AuthPage/AuthPage.vue'
import CartPage from '@/pages/CartPage/CartPage.vue'
import FaqPage from '@/pages/FaqPage/FaqPage.vue'
import HomePage from '@/pages/HomePage/HomePage.vue'
import MyPacksPage from '@/pages/MyPacksPage.vue'
import MyCardsPage from '@/pages/MyProductsPage/MyCardsPage.vue'

import ProductDetailsPage from '@/pages/ProductPages/ProductDetailsPage.vue'
import ProductListPage from '@/pages/ProductPages/ProductListPage.vue'

import PackDetailsPage from '@/pages/PackDetailsPage.vue'
import PackListPage from '@/pages/PrdocutsPackPage/PackListPage.vue'

import StaticPage from '@/pages/StaticPage/StaticPage.vue'

import FailPaymentPage from '@/pages/StatusPages/FailPaymentPage.vue'
import PendingPaymentPage from '@/pages/StatusPages/PendingPaymentPage.vue'
import SuccessPaymentPage from '@/pages/StatusPages/SuccessPaymentPage.vue'

import { useAuthStore } from '@/stores/auth'
import { useStaticStore } from '@/stores/static'

const AUTH_MODAL = import.meta.env.VITE_AUTH_MODAL_ACTIVE === 'true'

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

const getAuthLocation = ({
  form = 'signin',
  redirect,
  fallback = '/',
} = {}) => {
  if (!AUTH_MODAL) {
    return {
      name: 'Auth',
      query: {
        form,
        ...(redirect ? { redirect } : {}),
      },
    }
  }

  return {
    path: fallback,
    query: {
      auth: form,
      ...(redirect ? { redirect } : {}),
    },
  }
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
      path: '/auth',
      name: 'Auth',
      component: AuthPage,
      props: route => ({
        form: route.query.form || 'signin',
      }),
      meta: {
        guestOnly: true,
      },
      beforeEnter: route => {
        if (!AUTH_MODAL) {
          return true
        }

        return {
          name: 'HomePage',
          query: {
            auth: route.query.form || 'signin',
            ...(route.query.redirect ? { redirect: route.query.redirect } : {}),
          },
        }
      },
    },

    {
      path: '/login',
      name: 'Login',
      redirect: () =>
        getAuthLocation({
          form: 'signin',
        }),
    },

    {
      path: '/register',
      name: 'Register',
      redirect: () =>
        getAuthLocation({
          form: 'signup',
        }),
    },

    {
      path: '/reset-password',
      name: 'ResetPassword',
      redirect: route =>
        getAuthLocation({
          form: 'reset-password',
          redirect: route.query.redirect,
        }),
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
      path: '/about',
      name: 'AboutPage',
      component: AboutPage,
    },

    {
      path: '/faq',
      name: 'FaqPage',
      component: FaqPage,
      meta: {
        title: 'Frequently Asked Questions',
      },
    },

    {
      path: '/buy-card',
      name: 'ProductListPage',
      component: ProductListPage,
    },

    {
      path: '/rent-card',
      redirect: to => ({
        name: 'ProductListPage',
        query: {
          ...to.query,
          mode: 'rent',
        },
      }),
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
      path: '/new',
      name: 'NewItemsPage',
      component: ProductListPage,
      props: {
        isNewItemsPage: true,
      },
    },

    {
      path: '/cards/:category/:subcategory?',
      name: 'ProductListPageWithCategory',
      component: ProductListPage,
    },

    {
      path: '/card/:productId',
      name: 'ProductDetailsPage',
      component: ProductDetailsPage,
      props: route => ({
        productId: route.params.productId,
      }),
    },

    {
      path: '/buy-pack',
      name: 'PackListPage',
      component: PackListPage,
    },

    {
      path: '/pack/:productId',
      name: 'PackDetailsPage',
      component: PackDetailsPage,
      props: route => ({
        productId: route.params.productId,
      }),
    },

    {
      path: '/my-cards',
      name: 'MyCardsPage',
      component: MyCardsPage,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/my-rent-cards',
      redirect: to => ({
        name: 'MyCardsPage',
        query: {
          ...to.query,
          collection: 'rented',
        },
      }),
    },

    {
      path: '/my-packs',
      name: 'MyPacksPage',
      component: MyPacksPage,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/account',
      name: 'account',
      component: AccountPage,
      meta: {
        requiresAuth: true,
      },

      children: [
        {
          path: '',
          name: 'account-settings',
          component: AccountPage,
          props: {
            activeTab: 'personal',
          },
        },

        {
          path: 'personal',
          name: 'account-personal',
          component: AccountPage,
          props: {
            activeTab: 'personal',
          },
        },

        {
          path: 'balance',
          name: 'account-wallet',
          component: AccountPage,
          props: {
            activeTab: 'wallet',
          },
        },

        {
          path: 'transactions',
          name: 'account-transactions',
          component: AccountPage,
          props: {
            activeTab: 'transactions',
          },
        },

        {
          path: 'orders',
          name: 'account-orders',
          component: AccountPage,
          props: {
            activeTab: 'orders',
          },
        },

        {
          path: 'offers',
          name: 'account-offers',
          component: AccountPage,
          props: {
            activeTab: 'offers',
          },
        },

        {
          path: 'withdrawals',
          name: 'account-withdrawals',
          component: AccountPage,
          props: {
            activeTab: 'withdrawals',
          },
        },
      ],
    },

    {
      path: '/cart',
      name: 'CartPage',
      component: CartPage,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/static-page/:id',
      name: 'StaticPage',
      component: StaticPage,
      props: route => ({
        id: route.params.id,
      }),
    },

    {
      path: '/:slug',
      name: 'StaticPageBySlug',
      component: StaticPage,

      props: route => ({
        slug: route.params.slug,
      }),

      beforeEnter: async to => {
        const staticStore = useStaticStore()

        try {
          if (staticStore.pages.length === 0) {
            await staticStore.fetchPages()
          }

          const matchingPage = staticStore.pages.find(page => {
            return page.slug === to.params.slug
          })

          if (matchingPage) {
            return true
          }

          return {
            name: 'NotFound',
          }
        } catch (error) {
          console.error('Failed to resolve static page:', error)

          return {
            name: 'NotFound',
          }
        }
      },
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

    if (to.path === from.path) {
      const pageChanged = to.query.page !== from.query.page

      if (pageChanged) {
        return {
          top: 0,
          behavior: 'smooth',
        }
      }

      return false
    }

    return {
      top: 0,
    }
  },
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  const requiresAuth = to.matched.some(record => {
    return record.meta.requiresAuth
  })

  const guestOnly = to.matched.some(record => {
    return record.meta.guestOnly
  })

  if (from.name === null) {
    await verifyAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    if (AUTH_MODAL) {
      const fallbackPath =
        from.name && !from.meta.requiresAuth ? from.fullPath : '/'

      return {
        path: fallbackPath,
        query: {
          ...from.query,
          auth: 'signin',
          redirect: to.fullPath,
        },
      }
    }

    return {
      name: 'Auth',
      query: {
        form: 'signin',
        redirect: to.fullPath,
      },
    }
  }

  if (guestOnly && isAuthenticated) {
    return {
      name: 'HomePage',
    }
  }

  return true
})

export default router
