<style>
  .detailRow {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    margin-left: 40px;
  }

  .detailRow span {
    display: inline-block;
    width: 50%;
  }
</style>

<template>
  <div>
    <Form :label-width="80" inline>
      <FormItem label="手机号：" style="width: 220px;">
        <Input v-model="postData.mobilePhone" placeholder="请输入学员手机号" />
      </FormItem>
      <FormItem label="退款人：" style="width: 220px;">
        <Input v-model="postData.sysUserName" placeholder="请输入退款人姓名" />
      </FormItem>
      <FormItem label="提交日期：" style="width: 220px;">
        <DatePicker type="date" placeholder="请选择提交日期" v-model="refundDate"></DatePicker>
      </FormItem>
      <Button type="primary" @click="search" v-hasPermission="'search'" style="margin-left: 20px; margin-right: 20px;">查询</Button>
      <Button type="primary" @click="refundExport" v-hasPermission="'refundExport'">导出</Button>
    </Form>
    <Card>
      <Table :columns="columns" :data="refundList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
  </div>
</template>

<script>
  import http from '@/libs/http';
  import { formatDate } from '@/libs/tools';
  export default {
    data() {
      return {
        postData: { pageIndex: 1, pageSize: 10 },
        refundDate: '',
        total: 0,
        columns: [
          { title: '退货订单编号', key: 'orderNo', align: 'center' },
          { title: '课程名称', key: 'name', align: 'center' },
          { title: '学员姓名', key: 'studentRealName', align: 'center' },
          { title: '手机号码', key: 'studentMobilePhone', align: 'center', render: (h, params) => {
            const studentMobilePhone = params.row.studentMobilePhone
            return h('div', studentMobilePhone && studentMobilePhone.replace(studentMobilePhone.substr(3, 4), '****') || '')
          } },
          { title: '课程总价', key: 'allPrice', align: 'center' },
          { title: '消费课时', key: 'consumeClassHour', align: 'center' },
          { title: '剩余课时', key: 'surplusClassHour', align: 'center' },
          { title: '应退金额', key: 'shouldRefundAmt', align: 'center' },
          { title: '实退金额', key: '', align: 'center' },
          { title: '退款人', key: '', align: 'center' },
          { title: '提交日期', key: 'createTime', align: 'center' }
        ],
        refundList: [],
      }
    },
    methods: {
      search() {
        this.postData.refundDate = this.refundDate && formatDate('YYYY-MM-DD', this.refundDate) || ''
        this.getRefundList(() => { this.$Message.success('查询成功！') })
      },
      getRefundList(cb) {
        http.get({
          vm: this,
          url: '/manager/order-formal/refund-list',
          data: this.postData,
          success: res => {
            this.refundList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },
      refundExport() {
        const { mobilePhone, sysUserName } = this.postData
        const refundDate = this.refundDate
        const formData = { mobilePhone, sysUserName, refundDate: formatDate('YYYY-MM-DD hh:mm:ss', refundDate) }
        const paramsArr = []
        for (let k in formData) {
          if (formData[k]) {
            paramsArr.push(k + '=' + formData[k])
          }
        }
        const _params = paramsArr.join('&')
        const params = _params && '?' + _params
        window.open('http://www.zilongshu.com/manager/order-formal/refund-export' + params)
      },

      changePage(p) {
        this.postData.pageIndex = p
        this.getRefundList()
      },
      changePageSize(s) {
        this.postData.pageSize = s
        this.getRefundList()
      },
    },
    mounted() {
      this.getRefundList()
    }
  }
</script>