import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/pages/Login'
import Dashboard from '@/components/Dashboard'
import Products from '@/components/pages/Products'
import CustomerOrders from '@/components/pages/CustomerOrders'
import Coupons from '@/components/pages/Coupons'
import CustomerCheckout from '@/components/pages/CustomerCheckout'
import Order from '@/components/pages/Order'
import Index from '@/components/pages/index'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path:'*',
      redirect:"/login",
    },
    {
      path:'/index',
      name:'index',
      component:Index
    },

    {
      path:'/login',
      name:'login',
      component:Login
    },

    {
      path:'/admin',
      name:'admin',
      component:Dashboard,
      children:[
        {
          path:'products',
          name:'Products',
          component:Products,
          meta: { requiresAuth: true },
        },
        {
          path:'coupons',
          name:'Coupons',
          component:Coupons,
          meta: { requiresAuth: true },
        },
        {
          path:'order',
          name:'Order',
          component:Order,
          meta: { requiresAuth: true },
        }
      ] 
    },

    {
      path:'/',
      name:'admin',
      component:Dashboard,
      children:[
        {
          path:'customer_order',
          name:'CustomerOrders',
          component:CustomerOrders,
        },
        {
          path:'customer_checkout/:orderId',
          name:'CustomerCheckout',
          component:CustomerCheckout,
        },
        
      ] 
    },
  ]
})
