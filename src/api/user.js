import axios from '@/libs/api.request'

export const login = ({ loginName, password, validCode }) => {
  return axios.request({
    url: '/manager/login?loginName='+loginName+'&password='+password+'&validCode='+validCode,
    method: 'POST'
  })
}

export const getUserInfo = () => {
  return axios.request({
    url: '/manager/sys-user/getAuth',
    method: 'get'
  })
}

export const logout = () => {
  return axios.request({
    url: '/manager/logOut',
    method: 'post'
  })
}

export const getAccessRoutes = (token) => {
  return axios.request({
    url: 'get_access_routes',
    method: 'get',
    params: {
      token
    }
  })
}

export const getValidCode = () => {
  return axios.request({
    url: '/manager/getValidCode',
    method: 'get'
  })
}
