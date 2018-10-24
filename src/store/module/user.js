import { login, logout, getUserInfo, getAccessRoutes } from "@/api/user";
import { setToken, getToken, getMenuByRouter, formatRouter } from "@/libs/util";
import routers from "@/router/routers";
import defaultRouters from "@/router/defaultRouters";

export default {
  state: {
    loginName: "",
    userId: "",
    avatorImgPath: "",
    token: getToken(),
    access: "",
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
      const _routers = routers.filter(r => r.type === 0);
      return getMenuByRouter(
        [..._routers, ...accessRoutes],
        rootState.user.access
      );
    }
  },
  mutations: {
    setAvator(state, avatorPath) {
      state.avatorImgPath = avatorPath;
    },
    setUserId(state, id) {
      state.userId = id;
    },
    setloginName(state, name) {
      state.loginName = name;
    },
    setAccess(state, access) {
      state.access = access;
    },
    setToken(state, token) {
      state.token = token;
      setToken(token);
    },
    setAccessRoutes(state, accessRoutes) {
      state.accessRoutes = accessRoutes;
    }
  },
  actions: {
    // 登录
    handleLogin({ commit }, { loginName, password, validCode }) {
      loginName = loginName.trim();
      return new Promise((resolve, reject) => {
        login({
          loginName,
          password,
          validCode
        }).then(res => {
          if (res.data.code === 1) {
            const data = res.data;
            commit("setToken", data.code);
            resolve();
          } else if (res.data.code === 2) {
            // this.$Message.error(res.data.msg)
            alert(res.data.msg);
          } else if (res.data.code === 3) {
            logout().then(() => {
              commit("setToken", "");
              commit("setAccess", []);
            });
          }
        });
      });
    },
    // 退出登录
    handleLogOut({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          commit("setToken", "");
          commit("setAccess", []);
          sessionStorage.removeItem('tagNaveList')
          resolve();
        });
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        // commit('setToken', '')
        // commit('setAccess', [])
        // resolve()
      });
    },
    // 获取用户相关信息
    getUserInfo({ state, commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(res => {
          if (res.data.code === 1) {
            const data = res.data;
            const routers = [...defaultRouters, ...formatRouter(data.data)];
            commit("setAccessRoutes", routers);
            resolve(data);
          } else if (res.data.code === 2) {
            alert(res.data.msg);
          } else if (res.data.code === 3) {
            logout().then(res => {
              commit("setToken", "");
              commit("setAccess", []);
              resolve({code: 3});
            });
          }
        });
      });
    }
  }
};
