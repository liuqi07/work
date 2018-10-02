import Main from '@/view/main'
import parentView from '@/components/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面不会缓存
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    type: 0,
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
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
          title: '首页',
          notCache: true
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
  {
    path: '/sysTem',
    name: 'sysTem',
    component: Main,
    meta: {
      icon: 'logo-buffer',
      title: '后台管理'
    },
    children: [
      {
        path: '/sysRole',
        name: 'sysRole',
        component: () => import('@/view/sysTem/sysRole.vue'),
        meta: {
          icon: 'logo-buffer',
          title: '角色管理'
        },
        buttons: [
          { path: 'addSysRole', title: '添加' },
          { path: 'editSysRole', title: '编辑' },
          { path: 'deleteSysRole', title: '删除' },
          { path: 'authSysRole', title: '授权' },
        ]
      },
      {
        path: '/sysUser',
        name: 'sysUser',
        component: () => import('@/view/sysTem/sysUser.vue'),
        meta: {
          icon: 'logo-buffer',
          title: '人员管理'
        },
        buttons: [
          {path: 'editSysUser', title: '编辑'},
          {path: 'openOrClose', title: '停用启用'}
        ]
      },
      {
        path: '/sysResource',
        name: 'sysResource',
        component: () => import('@/view/sysTem/sysResource.vue'),
        meta: {
          icon: 'logo-buffer',
          title: '资源管理'
        },
      }
    ]
  },
  {
    path: '/student-management',
    name: 'student-management',
    component: Main,
    meta: {
      icon: 'logo-buffer',
      title: '学员管理'
    },
    children: [
      {
        path: '/student-list',
        name: 'student-list',
        component: () => import('@/view/student-management/student-list.vue'),
        meta: {
          icon: 'logo-buffer',
          title: '学员列表'
        }
      },
      {
        path: '/student-schedule',
        name: 'student-schedule',
        component: () => import('@/view/student-management/student-schedule.vue'),
        meta: {
          icon: 'logo-buffer',
          title: '学员课表'
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
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    type: 0,
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    type: 0,
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]

// export default [
//   {
//     path: '/login',
//     name: 'login',
//     type: 0,
//     meta: {
//       title: 'Login - 登录',
//       hideInMenu: true
//     },
//     component: () => import('@/view/login/login.vue')
//   },
//   {
//     path: '/',
//     name: '_home',
//     redirect: '/home',
//     component: Main,
//     type: 0,
//     meta: {
//       hideInMenu: true,
//       notCache: true
//     },
//     children: [
//       {
//         path: '/home',
//         name: 'home',
//         meta: {
//           hideInMenu: true,
//           title: '首页',
//           notCache: true
//         },
//         component: () => import('@/view/single-page/home')
//       }
//     ]
//   },
//   {
//     path: '/backstage-management',
//     name: 'backstage-management',
//     component: Main,
//     meta: {
//       icon: 'logo-buffer',
//       title: '后台管理'
//     },
//     children: [
//       {
//         path: '/role-management',
//         name: 'role-management',
//         component: () => import('@/view/backstage-management/role-management.vue'),
//         meta: {
//           icon: 'logo-buffer',
//           title: '角色管理'
//         },
//         buttons: [
//           { path: 'addRole', title: '添加角色' },
//           { path: 'editRole', title: '编辑角色' },
//           { path: 'delRole', title: '删除角色' }
//         ]
//       },
//       {
//         path: '/people-management',
//         name: 'people-management',
//         component: () => import('@/view/backstage-management/people-management.vue'),
//         meta: {
//           icon: 'logo-buffer',
//           title: '人员管理'
//         },
//       }
//     ]
//   },
//   {
//     path: '/student-management',
//     name: 'student-management',
//     component: Main,
//     meta: {
//       icon: 'logo-buffer',
//       title: '学员管理'
//     },
//     children: [
//       {
//         path: '/student-list',
//         name: 'student-list',
//         component: () => import('@/view/student-management/student-list.vue'),
//         meta: {
//           icon: 'logo-buffer',
//           title: '学员列表'
//         }
//       },
//       {
//         path: '/student-schedule',
//         name: 'student-schedule',
//         component: () => import('@/view/student-management/student-schedule.vue'),
//         meta: {
//           icon: 'logo-buffer',
//           title: '学员课表'
//         }
//       }
//     ]
//   },
//   {
//     path: '/401',
//     name: 'error_401',
//     type: 0,
//     meta: {
//       hideInMenu: true
//     },
//     component: () => import('@/view/error-page/401.vue')
//   },
//   {
//     path: '/500',
//     name: 'error_500',
//     type: 0,
//     meta: {
//       hideInMenu: true
//     },
//     component: () => import('@/view/error-page/500.vue')
//   },
//   {
//     path: '*',
//     name: 'error_404',
//     type: 0,
//     meta: {
//       hideInMenu: true
//     },
//     component: () => import('@/view/error-page/404.vue')
//   }
// ]
