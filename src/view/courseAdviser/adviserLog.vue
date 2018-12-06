<template>
  <div>
    <Form :label-width="80" inline>
      <FormItem label="课程顾问：" style="width: 220px;">
        <Input v-model="postData.realName" placeholder="请输入课程顾问"/>
      </FormItem>
      <FormItem label="身份证号：" style="width: 230px;">
        <Input v-model="postData.idNo" placeholder="请输入课程顾问身份证号"/>
      </FormItem>
      <FormItem label="顾问状态：" style="width: 200px;">
        <Select v-model="postData.status" clearable>
          <Option :value="1">正常</Option>
          <Option :value="0">停用</Option>
        </Select>
      </FormItem>
      <FormItem label="注册日期：" style="width: 220px;">
        <DatePicker type="date" placeholder="请选择注册时间" v-model="createDate"></DatePicker>
      </FormItem>
      <FormItem label="订单编号：" style="width: 220px;">
        <Input v-model="postData.orderNo" placeholder="请输入订单编号"/>
      </FormItem>
      <FormItem label="订单类型：" style="width: 220px;">
        <Select v-model="postData.type">
          <Option :value="0">全部</Option>
          <Option :value="2">预约订单</Option>
          <Option :value="3">正式订单</Option>
        </Select>
      </FormItem>
      <Button type="primary" @click="search" v-hasPermission="'search'" style="margin-left: 20px;">查询</Button>
    </Form>
    <Card>
      <Table :columns="columns" :data="adviserLogList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize"
            :page-size="postData.pageSize"
            :page-index="postData.pageIndex" style="margin-top: 10px"/>
    </Card>
  </div>
</template>

<script>
  import http from '@/libs/http';
  import {formatDate} from '@/libs/tools';

  export default {
    data() {
      return {
        postData: {pageIndex: 1, pageSize: 10},
        columns: [
          {
            title: '订单类型', key: 'type', align: 'center', render: (h, params) => {
              return h('div', {}, params.row.type === 2 ? '预约订单' : '正式订单')
            }
          },
          {title: '订单编号', key: 'orderNo', align: 'center'},
          {title: '创建时间', key: 'createTime', align: 'center'},
          {title: '课程顾问', key: 'sysUserName', align: 'center'}
        ],
        adviserLogList: [],
        total: 0,
        createDate: '',
      }
    },
    methods: {
      search() {
        this.getAdviserLogList(() => {
          this.$Message.success('查询成功！')
        })
      },
      getAdviserLogList(cb) {
        !this.postData.orderNo && delete this.postData.orderNo
        this.postData.createDate = this.createDate ? formatDate('YYYY-MM-DD', this.createDate) : null
        this.postData.type = this.postData.type === 0 ? null : this.postData.type
        http.get({
          vm: this,
          url: '/manager/log/listLogAdviser',
          data: this.postData,
          success: res => {
            this.adviserLogList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },
      changePage(p) {
        this.postData.pageIndex = p
        this.getAdviserLogList()
      },
      changePageSize(s) {
        this.postData.pageSize = s
        this.getAdviserLogList()
      }
    },
    mounted() {
      this.getAdviserLogList()
    }
  }
</script>
