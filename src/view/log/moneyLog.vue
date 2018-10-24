<template>
  <div>
    <Form :model="postData" :label-width="90" inline>
      <FormItem label="订单编号：" style="width: 250px;" :label-width="110">
        <Input v-model="postData.orderNo" placeholder="请输入订单编号"/>
      </FormItem>
      <Button type="primary" @click="search" v-hasPermission="'search'" style="margin-left: 20px;">查询</Button>
    </Form>
    <Card>
      <Table :columns="columns" :data="moneyLogList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-index="postData.pageIndex"
      :page-size="postData.pageSize" style="margin-top: 10px" />
    </Card>
  </div>
</template>

<script>
import http from '@/libs/http';
export default {
  data() {
    return {
      postData: { pageIndex: 1, pageSize: 10 },
      total: 0,
      columns: [
        { title: '学员姓名', key: 'studentName', align: 'center' },
        { title: '操作员姓名', key: 'operateName', align: 'center' },
        { title: '订单号', key: 'orderNo', align: 'center' },
        { title: '描述', key: 'msg', align: 'center' },
        { title: '创建时间', key: 'createTime', align: 'center' },
      ],
      moneyLogList: []
    };
  },
  methods: {
    search() {
      this.getMoneyLogList(() => {
        this.$Message.success("查询成功！");
      });
    },
    getMoneyLogList(cb) {
      http.get({
        vm: this,
        url: "/manager/log/listLogMoney",
        data: this.postData,
        success: res => {
          this.moneyLogList = res.data.list;
          this.total = res.data.total;
          cb && cb();
        }
      });
    },
    changePage(p) {},
    changePageSize(s) {}
  },
  mounted() {
    this.getMoneyLogList()
  }
};
</script>
