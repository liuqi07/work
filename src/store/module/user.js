import { login, logout, getUserInfo, getAccessRoutes } from '@/api/user'
import { setToken, getToken, getMenuByRouter, formatRouter } from '@/libs/util'
import routers from '@/router/routers';
import defaultRouters from '@/router/defaultRouters';
import Main from '@/view/main';

export default {
  state: {
    userName: '',
    userId: '',
    avatorImgPath: '',
    token: getToken(),
    access: '',
    accessRoutes: []
  },
  getters: {
    menuList: (state, getters, rootState) => {
      // console.log('%c state.accessRoutes', 'color:red;', state.accessRoutes);
      const accessRoutes = state.accessRoutes;
      // const children = (child, parentPath) => {
      //   child.map(c => ({
      //     ...c,
      //     component: () => import(`@/view/${parentPath}/${r.path}.vue`)
      //   }))
      // }
      // const _routers = accessRoutes.map(r => ({
      //   ...r,
      //   component: Main,
      //   children: r.children && r.children.length > 0 && children(r.children, r.path)
      // }))
      const _routers = routers.filter(r => r.type===0)
      return getMenuByRouter([..._routers, ...accessRoutes], rootState.user.access)
    }
  },
  mutations: {
    setAvator (state, avatorPath) {
      state.avatorImgPath = avatorPath
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUserName (state, name) {
      state.userName = name
    },
    setAccess (state, access) {
      state.access = access
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    setAccessRoutes (state, accessRoutes) {
      state.accessRoutes = accessRoutes
    }
  },
  actions: {
    // 登录
    handleLogin ({ commit }, {userName, password}) {
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        login({
          userName,
          password
        }).then(res => {
          const data = res.data
          commit('setToken', data.token)
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('setToken', '')
          commit('setAccess', [])
          resolve()
        }).catch(err => {
          reject(err)
        })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        // commit('setToken', '')
        // commit('setAccess', [])
        // resolve()
      })
    },
    // 获取用户相关信息
    getUserInfo ({ state, commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(res => {
          const data = res.data
          console.log('%c data', 'color:red;', data.data);
          const routers = [...defaultRouters, ...formatRouter(data.data)]
          // commit('setAvator', data.avator)
          // commit('setUserName', data.user_name)
          // commit('setUserId', data.user_id)
          // commit('setAccess', data.access)
          console.log('%c routers', 'color:red;', routers);
          commit('setAccessRoutes', routers)
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // getAccessRoutes ({ state, commit }) {
    //   return new Promise((resolve, reject) => {
    //     getAccessRoutes(state.token='abc').then(res => {
    //       const accessRoutes = res.data.data
    //       commit('setAccessRoutes', accessRoutes)
    //       resolve(accessRoutes)
    //     }).catch(err => {
    //       reject(err)
    //     })
    //   })
    // }
  }
}
