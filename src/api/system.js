import axios from '@/libs/api.request'

export const getRoleList = ({ pageIndex=1, pageSize=10 }) => {
  return axios.request({
    url: '/manager/sys-role/list-page',
    method: 'get',
    params: {
      pageIndex,
      pageSize
    }
  })
}