import axios from "axios";
import config from "@/config";
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
        // 登录过期，清空token、userName、
        else if (res.data.code === 3) {
          vm.$Message.warning(res.data.msg);
          // util.logout(vm);
        } else {
          vm.$Message.warning(res.data.msg);
          error && error();
        }
      })
      .catch(err => {
        vm.$Message.error(err.Message || err.message);
        error && error();
      });
  },
  post: function({ vm, url, data={}, success, error }) {
    let params = [];
    for(let k in data) {
      params.push(k + '=' + data[k])
    }
    params.join('&')
    axios
      .post(baseUrl + url + '?'+ params.join('&'))
      .then(res => {
        if (res.data.code === 1) {
          success && success(res.data);
        }
        // 登录过期，清空token、userName、
        else if (res.data.code === 3) {
          vm.$Message.warning(res.data.msg);
          // util.logout(vm);
        } else {
          vm.$Message.warning(res.data.msg);
          error && error();
        }
      })
      .catch(err => {
        vm.$Message.error(err.Message || err.message);
        error && error();
      });
  }
};
