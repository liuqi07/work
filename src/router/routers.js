import Main from "@/view/main";
import parentView from "@/components/parent-view";

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
    path: "/login",
    name: "login",
    type: 0,
    meta: {
      title: "Login - 登录",
      hideInMenu: true
    },
    component: () => import("@/view/login/login.vue")
  },
  {
    path: "/",
    name: "_home",
    redirect: "/home",
    component: Main,
    type: 0,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: "/home",
        name: "home",
        meta: {
          hideInMenu: true,
          title: "首页",
          notCache: true
        },
        component: () => import("@/view/single-page/home")
      }
    ]
  },
  {
    path: "/sysTem",
    name: "sysTem",
    component: Main,
    meta: {
      icon: "md-cog",
      title: "后台管理"
    },
    children: [
      {
        path: "/sysRole",
        name: "sysRole",
        component: () => import("@/view/sysTem/sysRole.vue"),
        meta: {
          icon: "logo-buffer",
          title: "角色管理"
        },
        buttons: [
          { path: "addSysRole", title: "添加" },
          { path: "editSysRole", title: "编辑" },
          { path: "deleteSysRole", title: "删除" },
          { path: "authSysRole", title: "授权" }
        ]
      },
      {
        path: "/sysUser",
        name: "sysUser",
        component: () => import("@/view/sysTem/sysUser.vue"),
        meta: {
          icon: "logo-buffer",
          title: "人员管理"
        },
        buttons: [
          { path: "editSysUser", title: "编辑" },
          { path: "openOrClose", title: "停用启用" }
        ]
      },
      {
        path: "/sysResource",
        name: "sysResource",
        component: () => import("@/view/sysTem/sysResource.vue"),
        meta: {
          icon: "logo-buffer",
          title: "资源管理"
        }
      }
    ]
  },
  {
    path: "/student",
    name: "student",
    component: Main,
    meta: {
      icon: "logo-buffer",
      title: "学员管理"
    },
    children: [
      {
        path: "/studentList",
        name: "studentList",
        component: () => import("@/view/student/studentList.vue"),
        meta: {
          icon: "logo-buffer",
          title: "学员列表"
        }
      },
      {
        path: "/studentCourseList",
        name: "studentCourseList",
        component: () => import("@/view/student/studentCourseList.vue"),
        meta: {
          icon: "logo-buffer",
          title: "学员课表"
        }
      }
    ]
  },
  {
    path: "/courseAdviser",
    name: "courseAdviser",
    component: Main,
    meta: {
      icon: "",
      title: "课程顾问"
    },
    children: [
      {
        path: "/courseAdviserList",
        name: "courseAdviserList",
        component: () => import("@/view/courseAdviser/courseAdviserList.vue"),
        meta: {
          icon: "",
          title: "课程顾问管理"
        }
      }
    ]
  },
  {
    path: "/teacher",
    name: "teacher",
    component: Main,
    meta: {
      icon: "",
      title: "教师管理"
    },
    children: [
      {
        path: "/teacherList",
        name: "teacherList",
        component: () => import("@/view/teacher/teacherList.vue"),
        meta: {
          icon: "",
          title: "教师列表"
        }
      }
    ]
  },
  {
    path: "/course",
    name: "course",
    component: Main,
    meta: {
      icon: "",
      title: "课程管理"
    },
    children: [
      {
        path: "/firstList",
        name: "firstList",
        component: () => import("@/view/course/firstList.vue"),
        meta: {
          icon: "",
          title: "一级分类"
        }
      },
      {
        path: "/secondList",
        name: "secondList",
        component: () => import("@/view/course/secondList.vue"),
        meta: {
          icon: "",
          title: "二级分类"
        }
      },
      {
        path: "/thirdList",
        name: "thirdList",
        component: () => import("@/view/course/thirdList.vue"),
        meta: {
          icon: "",
          title: "三级分类"
        }
      },
      {
        path: "/courseList",
        name: "courseList",
        component: () => import("@/view/course/courseList.vue"),
        meta: {
          icon: "",
          title: "课程管理"
        }
      },
      {
        path: "/packageList",
        name: "packageList",
        component: () => import("@/view/course/packageList.vue"),
        meta: {
          icon: "",
          title: "套餐管理"
        }
      }
    ]
  },
  {
    path: "/material",
    name: "material",
    component: Main,
    meta: {
      icon: "",
      title: "教材管理"
    },
    children: [
      {
        path: "/materialList",
        name: "materialList",
        component: () => import("@/view/material/materialList.vue"),
        meta: {
          icon: "",
          title: "教材列表"
        }
      }
    ]
  },
  {
    path: "/order",
    name: "order",
    component: Main,
    meta: {
      icon: "",
      title: "订单管理"
    },
    children: [
      {
        path: "/subscribe",
        name: "subscribe",
        component: () => import("@/view/order/subscribe.vue"),
        meta: {
          icon: "",
          title: "预约订单"
        }
      },
      {
        path: "/formal",
        name: "formal",
        component: () => import("@/view/order/formal.vue"),
        meta: {
          icon: "",
          title: "正式订单"
        }
      },
      {
        path: "/refund",
        name: "refund",
        component: () => import("@/view/order/refund.vue"),
        meta: {
          icon: "",
          title: "退款订单"
        }
      }
    ]
  },
  {
    path: "/log",
    name: "log",
    component: Main,
    meta: {
      icon: "",
      title: "日志管理"
    },
    children: [
      {
        path: "/adviserLog",
        name: "adviserLog",
        component: () => import("@/view/log/adviserLog.vue"),
        meta: {
          icon: "",
          title: "分配顾问"
        }
      },
      {
        path: "/arrangeLog",
        name: "arrangeLog",
        component: () => import("@/view/log/arrangeLog.vue"),
        meta: {
          icon: "",
          title: "转单日志"
        }
      },
      {
        path: "/manager",
        name: "manager",
        component: () => import("@/view/log/manager.vue"),
        meta: {
          icon: "",
          title: "后台日志"
        }
      },
      {
        path: "/web",
        name: "web",
        component: () => import("@/view/log/web.vue"),
        meta: {
          icon: "",
          title: "后台日志"
        }
      }
    ]
  },
  {
    path: "/401",
    name: "error_401",
    type: 0,
    meta: {
      hideInMenu: true
    },
    component: () => import("@/view/error-page/401.vue")
  },
  {
    path: "/500",
    name: "error_500",
    type: 0,
    meta: {
      hideInMenu: true
    },
    component: () => import("@/view/error-page/500.vue")
  },
  {
    path: "*",
    name: "error_404",
    type: 0,
    meta: {
      hideInMenu: true
    },
    component: () => import("@/view/error-page/404.vue")
  }
];

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
