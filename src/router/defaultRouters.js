export default [
  {
    path: '/login',
    name: 'login',
    type: 0,
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    }
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    type: 0,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '首页'
        }
      }
    ]
  },
  {
    path: '/401',
    name: 'error_401',
    type: 0,
    meta: {
      hideInMenu: true
    }
  },
  {
    path: '/500',
    name: 'error_500',
    type: 0,
    meta: {
      hideInMenu: true
    }
  },
  {
    path: '*',
    name: 'error_404',
    type: 0,
    meta: {
      hideInMenu: true
    }
  }
]