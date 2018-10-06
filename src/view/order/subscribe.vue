<template>
  <div>
    <Form :label-width="100" inline :model="postData">
      <FormItem label="手机号：" style="width: 250px;">
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
      <FormItem label="开始日期：" style="width: 260px;">
        <DatePicker type="datetime" placeholder="请选择开始时间" v-model="postData.startDateTime"></DatePicker>
      </FormItem>
      <FormItem label="结束日期日期：" style="width: 260px;">
        <DatePicker type="datetime" placeholder="请选择结束时间" v-model="postData.endDateTime"></DatePicker>
      </FormItem>
      <Button type="primary" @click="search">搜索</Button>
    </Form>
  </div>
</template>

<script>
  import http from '@/libs/http';
  export default {
    data() {
      return {
        postData: { pageIndex: 1, pageSize: 10 },
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
          { title: '操作', key: 'actions', align: 'center' },
        ],
        subscribeList: []
      }
    },
    methods: {
      search() {
        console.log('%c postData', 'color:red;', this.postData);
      },
      getsubscribeList() {
        http.get({
          vm: this,
          url: '/manager/order-subscriber/list',
          data: this.postData,
          success: res => {
            this.subscribeList = res.data.list
            this.total = res.data.total
          }
        })
      }
    }
  }
</script>