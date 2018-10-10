<template>
    <div>
      <Form :label-width="80" inline>
        <FormItem label="订单编号：" style="width: 220px;">
          <Input v-model="postData.orderNo" placeholder="请输入订单编号" />
        </FormItem>
        <FormItem label="订单类型：" style="width: 220px;">
          <Select v-model="postData.type" placeholder="请选择订单类型">
            <Option :value="2">预约订单</Option>
            <Option :value="3">正式订单</Option>
          </Select>
        </FormItem>
        <Button type="primary" @click="search">搜索</Button>
      </Form>
      <Card>
        <Table :columns="columns" :data="arrangeLogList"></Table>
        <Page :total="total" show-total @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
          :page-index="postData.pageIndex" style="margin-top: 10px" />
      </Card>
    </div>
  </template>
  
  <script>
    import http from '@/libs/http';
    export default {
      data() {
        return {
          postData: { pageIndex: 1, pageSize: 10 },
          columns: [
            // { title: 'Id', key: 'id', align: 'center' },
            // { title: '订单类型', key: 'type', align: 'center', render: (h, params) => {
            //   return h('div', {}, params.row.type===2?'预约订单':'正式订单')
            // } },
            // { title: '订单编号', key: 'orderNo', align: 'center' },
            // { title: '创建时间', key: 'createTime', align: 'center' },
            // { title: '课程顾问Id', key: 'sysUserId', align: 'center' }
          ],
          arrangeLogList: [],
          total: 0,
        }
      },
      methods: {
        search() {
          this.getArrangeLogList(() => {this.$Message.success('查询成功！')})
        },
        getArrangeLogList() {
          http.get({
            vm: this,
            url: '/manager/log/listLogArrange',
            data: this.postData,
            success: res => {
              this.arrangeLogList = res.data.list
              this.total = res.data.total
              cb && cb()
            }
          })
        },
        changePage(p) {
          this.postData.pageIndex = p
          this.getArrangeLogList(()=>{this.$Message.success('查询成功！')})
        },
        changePageSize(s) {
          this.postData.pageSize = s
          this.getArrangeLogList(()=>{this.$Message.success('查询成功！')})
        }
      },
      mounted () {
        this.getArrangeLogList()
      }
    }
  </script>