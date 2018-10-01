import { getParams } from '@/libs/util'
const USER_MAP = {
  super_admin: {
    name: 'super_admin',
    user_id: '1',
    access: ['super_admin', 'admin'],
    token: 'super_admin',
    avator: 'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png'
  },
  admin: {
    name: 'admin',
    user_id: '2',
    access: ['admin'],
    token: 'admin',
    avator: 'https://avatars0.githubusercontent.com/u/20942571?s=460&v=4'
  }
}

const accessRoutes = [
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
  },
  {
    path: '/student-management',
    name: 'student-management',
    meta: {
      icon: 'logo-buffer',
      title: '学员管理'
    },
    children: [
      {
        path: '/student-list',
        name: 'student-list',
        meta: {
          icon: 'logo-buffer',
          title: '学员列表'
        },
        buttons: [
          { path: 'add', title: '添加' },
          { path: 'edit', title: '编辑' },
          { path: 'del', title: '删除' }
        ]
      },
      {
        path: '/student-schedule',
        name: 'student-schedule',
        meta: {
          icon: 'logo-buffer',
          title: '学员课表'
        }
      }
    ]
  }
]

export const login = req => {
  req = JSON.parse(req.body)
  return {token: USER_MAP[req.userName].token}
}

export const getUserInfo = req => {
  const params = getParams(req.url)
  return {...USER_MAP[params.token], accessRoutes}
}

export const logout = req => {
  return null
}

export const getAccessRoutes = req => {
  return {
    code: 1,
    message: 'success',
    data: accessRoutes
  }
}
