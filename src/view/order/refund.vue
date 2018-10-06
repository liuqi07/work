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
      <Button type="primary" @click="search" style="margin-left: 20px;">搜索</Button>
    </Form>
    <Card>
      <Table :columns="columns" :data="refundList"></Table>
      <Page :total="total" show-total @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal title="退款单详情" v-model="detailModal">
      <div>
        <p class="detailRow">
          <span><b>退款单号：</b> {{detailData.aaa}}</span>
          <span><b>订单编号：</b> {{detailData.aaa}}</span>
        </p>
        <p class="detailRow">
          <span><b>学员姓名：</b> {{detailData.aaa}}</span>
          <span><b>手机电话：</b> {{detailData.aaa}}</span>
        </p>
        <p class="detailRow">
          <span><b>课程名称：</b> {{detailData.aaa}}</span>
          <span></span>
        </p>
        <p class="detailRow">
          <span><b>课程顾问：</b> {{detailData.aaa}}</span>
          <span><b>任课教师：</b> {{detailData.aaa}}</span>
        </p>
        <p class="detailRow">
          <span><b>消费课时：</b> {{detailData.aaa}}</span>
          <span><b>剩余课时：</b> {{detailData.aaa}}</span>
        </p>
        <p class="detailRow">
          <span><b>课程总价：</b> {{detailData.aaa}}</span>
          <span><b>实收金额：</b> {{detailData.aaa}}</span>
        </p>
        <p class="detailRow">
          <span><b>应退金额：</b> {{detailData.aaa}}</span>
          <span><b>实退金额：</b> {{detailData.aaa}}</span>
        </p>
        <p class="detailRow">
          <span><b>退款方式：</b> {{detailData.aaa}}</span>
          <span><b>退款人：</b> {{detailData.aaa}}</span>
        </p>
        <p class="detailRow">
          <span><b>收款人信息：</b> {{detailData.aaa}}</span>
          <span></span>
        </p>
        <p class="detailRow">
          <span><b>退款时间：</b> {{detailData.aaa}}</span>
          <span></span>
        </p>
        <p class="detailRow">
          <span><b>退款凭证：</b> <img :src="detailData.aaa" ></span>
          <span></span>
        </p>
      </div>
    </Modal>
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
          { title: '退货单编号', key: '', align: 'center' },
          { title: '订单编号', key: 'orderNo', align: 'center' },
          { title: '课程名称', key: 'name', align: 'center' },
          { title: '学员姓名', key: 'studentRealName', align: 'center' },
          { title: '手机号码', key: 'studentMobilePhone', align: 'center' },
          { title: '课程总价', key: 'allPrice', align: 'center' },
          { title: '消费课时', key: 'consumeClassHour', align: 'center' },
          { title: '剩余课时', key: 'surplusClassHour', align: 'center' },
          { title: '应退金额', key: 'shouldRefundAmt', align: 'center' },
          { title: '实退金额', key: '', align: 'center' },
          { title: '退款人', key: '', align: 'center' },
          { title: '提交日期', key: 'createTime', align: 'center' },
          {
            title: '操作', key: 'actions', align: 'center', width: 100, render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.lookDetail(params.row)
                  }
                },
                directives: [
                  { name: 'hasPermission', value: "refundLookDetail" }
                ]
              }, '查看详情')
            }
          }
        ],
        refundList: [],
        detailModal: false,
        detailData: { aaa: 12313213 }
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
      lookDetail(row) {
        this.detailModal = true
      },


      changePage(p) {
        this.postData.pageIndex = p
        this.getRefundList()
      },
      changePageSize(s) {
        this.postData.pageSize = s
        thi.getRefundList()
      },
    },
    mounted() {
      this.getRefundList()
    }
  }
</script>