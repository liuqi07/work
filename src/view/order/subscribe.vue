<template>
  <div>
    <Form :label-width="80" inline :model="postData">
      <FormItem label="手机号：" style="width: 220px;">
        <Input v-model="postData.mobilePhone" placeholder="请输入手机号" />
      </FormItem>
      <FormItem label="订单状态：" style="width: 250px;">
        <Select v-model="postData.status" clearable>
          <Option :value="1">预约中</Option>
          <Option :value="2">排课中</Option>
          <Option :value="3">试听中/待上课</Option>
          <Option :value="4">已完成/未转单</Option>
          <Option :value="5">已关闭</Option>
          <Option :value="6">已转单</Option>
        </Select>
      </FormItem>
      <FormItem label="开始日期：" style="width: 240px;">
        <DatePicker type="datetime" placeholder="请选择开始时间" v-model="startDateTime"></DatePicker>
      </FormItem>
      <FormItem label="结束日期：" style="width: 240px;">
        <DatePicker type="datetime" placeholder="请选择结束时间" v-model="endDateTime"></DatePicker>
      </FormItem>
      <Button type="primary" @click="search">搜索</Button>
    </Form>
  </div>
</template>

<script>
  import http from '@/libs/http';
  import { formatDate } from '@/libs/tools';
  export default {
    data() {
      return {
        postData: { pageIndex: 1, pageSize: 10 },
        startDateTime: null,
        endDateTime: null,
        columns: [
          { title: '预约订单编号', key: '', align: 'center' },
          { title: '课程名称', key: '', align: 'center' },
          { title: '学员姓名', key: '', align: 'center' },
          { title: '手机号', key: '', align: 'center' },
          {
            title: '预约订单状态', key: 'status', align: 'center', render: (h, parmas) => {
              let statusStr = ''
              switch (parmas.row.status) {
                case 1:
                  statusStr = '预约中'
                  break;
                case 2:
                  statusStr = '排课中'
                  break;
                case 3:
                  statusStr = '试听中/待上课'
                  break;
                case 4:
                  statusStr = '已完成/未转单'
                  break;
                case 5:
                  statusStr = '已关闭'
                  break;
                case 6:
                  statusStr = '已转单'
                  break;
              }
            }
          },
          { title: '课程总价', key: '', align: 'center' },
          { title: '消费课时', key: '', align: 'center' },
          { title: '剩余课时', key: '', align: 'center' },
          { title: '课程顾问', key: '', align: 'center' },
          { title: '任课教师', key: '', align: 'center' },
          { title: '推荐人', key: '', align: 'center' },
          { title: '下单时间', key: '', align: 'center' },
          { title: '操作', key: 'actions', align: 'center', render: (h, params) => {
            return h('div', [
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.subscribeAllot(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "subscribeAllot" }
                  ]
                }, '分配顾问'),
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.subscribeChange(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "subscribeChange" }
                  ]
                }, '变更顾问'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.subscribeArrange(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "subscribeArrange" }
                  ]
                }, '排课'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.subscribeArrangeAgain(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "subscribeArrangeAgain" }
                  ]
                }, '重新排课'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.subscribeChangeOrder(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "subscribeChangeOrder" }
                  ]
                }, '转单')
              ])
          } },
        ],
        subscribeList: []
      }
    },
    methods: {
      search() {
        this.startDateTime && (this.postData.startDateTime = formatDate('YYYY-MM-DD hh:mm:ss', this.startDateTime))
        this.endDateTime && (this.postData.endDateTime = formatDate('YYYY-MM-DD hh:mm:ss', this.endDateTime))
        this.getSubscribeList(()=>{this.$Message.success('查询成功！')})
      },
      getSubscribeList(cb) {
        http.get({
          vm: this,
          url: '/manager/order-subscribe/list',
          data: this.postData,
          success: res => {
            this.subscribeList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },

      subscribeExport() {},
      subscribeAllot() {},
      subscribeChange() {},
      subscribeArrange() {},
      subscribeArrangeAgain() {},
      subscribeChangeOrder() {}
    },
    mounted(){
      this.getSubscribeList()
    }
  }
</script>