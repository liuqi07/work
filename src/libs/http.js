import axios from "axios";
import config from "@/config";
import Cookie from 'js-cookie';
const baseUrl =
  process.env.NODE_ENV === "development"
    ? config.baseUrl.dev
    : config.baseUrl.pro;

export default {
  get: function({ vm, url, data, success, error }) {
    axios
      .get(baseUrl + url, {
        params: data
      })
      .then(res => {
        // 成功
        if (res.data.code === 1) {
          success && success(res.data);
        } 
        else if (res.data.code === 2) {
          vm.$Message.warning({
            content: res.data.msg,
            duration: 6
          });
        }
        // 登录过期，清空token、userName、
        else if (res.data.code === 3) {
          vm.$Message.warning({
            content: res.data.msg,
            duration: 6
          });
          Cookie.remove('token')
          sessionStorage.removeItem('tagNaveList')
          vm.$router.push({
            name: 'login'
          })
          // util.logout(vm);
        } else {
          vm.$Message.warning({
            content: res.data.msg,
            duration: 6
          });
          error && error();
        }
      })
      .catch(err => {
        vm.$Message.error(err.Message || err.message);
        error && error();
      });
  },
  post: function({ vm, url, data = {}, success, error }) {
    let params = [];
    for (let k in data) {
      params.push(k + "=" + data[k]);
    }
    params.join("&");
    axios({
      url: baseUrl + url + "?" + params.join("&"),
      method: "post",
      data
    })
      .then(res => {
        if (res.data.code === 1) {
          success && success(res.data);
        }
        else if(res.data.code === 2){
          vm.$Message.warning({
            content: res.data.msg,
            duration: 6
          });
        }
        // 登录过期，清空token、userName、
        else if (res.data.code === 3) {
          vm.$Message.warning({
            content: res.data.msg,
            duration: 6
          });
          sessionStorage.removeItem('tagNaveList')
          Cookie.remove('token')
          vm.$router.push({
            name: 'login'
          })
          // util.logout(vm);
        } else {
          vm.$Message.warning({
            content: res.data.msg,
            duration: 6
          });
          error && error();
        }
      })
      .catch(err => {
        vm.$Message.error(err.Message || err.message);
        error && error();
      });
  },
  _postwithupload: function({ vm, url, data = {}, success, error }) {
    axios({
      url: baseUrl + url,
      method: "post",
      data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .then(res => {
        if (res.data.code === 1) {
          success && success(res.data);
        }
        else if(res.data.code === 2){
          vm.$Message.warning({
            content: res.data.msg,
            duration: 6
          });
        }
        // 登录过期，清空token、userName、
        else if (res.data.code === 3) {
          vm.$Message.warning({
            content: res.data.msg,
            duration: 6
          });
          sessionStorage.removeItem('tagNaveList')
          Cookie.remove('token')
          vm.$router.push({
            name: 'login'
          })
          // util.logout(vm);
        } else {
          vm.$Message.warning({
            content: res.data.msg,
            duration: 6
          });
          error && error();
        }
      })
      .catch(err => {
        vm.$Message.error(err.Message || err.message);
        error && error();
      });
  }
};
