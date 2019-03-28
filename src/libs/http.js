import axios from "axios";
import config from "@/config";
import Cookie from "js-cookie";

const baseUrl =
  process.env.NODE_ENV === "development"
    ? config.baseUrl.dev
    : config.baseUrl.pro;

const handleResponse = (vm, success, error) => res => {
  if (res.data.code === 1) {// 请求成功
    success && success(res.data);
  } else if (res.data.code === 2) {// 请求失败
    vm.$Message.warning({
      content: res.data.msg,
      duration: 6
    });
    error && error();
  }
  else if (res.data.code === 3) {// 重新登录
    vm.$Message.warning({
      content: res.data.msg,
      duration: 6
    });
    sessionStorage.removeItem("tagNaveList");
    Cookie.remove("token");
    error && error();
    vm.$router.push({
      name: "login"
    });
  } else {
    vm.$Message.warning({
      content: res.data.msg,
      duration: 6
    });
    error && error();
  }
};

export default {
  get: function ({vm, url, data, success, error}) {
    axios
      .get(baseUrl + url, {
        params: data
      })
      .then(handleResponse(vm, success, error))
      .catch(err => {
        vm.$Message.error(err.Message || err.message);
        error && error();
      });
  },
  post: function ({vm, url, data = {}, success, error}) {
    let params = [];
    for (let k in data) {
      params.push(k + "=" + data[k]);
    }
    params.join("&");
    console.log(params)
    axios({
      url: baseUrl + url + "?" + params.join("&"),
      method: "post",
      data
    })
      .then(handleResponse(vm, success, error))
      .catch(err => {
        console.log(err, 'abbbbbbbb')
        vm.$Message.error(err.Message || err.message);
        error && error();
      });
  },
  _post: function ({vm, url, data = {}, success, error}) {
    axios.post(baseUrl + url, data).then(handleResponse(vm, success, error))
      .catch(function (error) {
        alert(JSON.stringify(error));
      });
  },

  _postwithupload: function ({vm, url, data = {}, success, error}) {
    console.log(data, 'dddddddddd')
    axios({
      url: baseUrl + url,
      method: "post",
      data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .then(handleResponse(vm, success, error))
      .catch(err => {
        // vm.$Message.error(err.Message || err.message);
        console.log('_postwithupload', err.Message, err.message);
        error && error();
      });
    }
};
