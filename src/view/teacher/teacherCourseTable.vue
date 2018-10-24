<template>
  <div>
    <Form :model="postData" :label-width="90" inline>
      <FormItem label="二级分类：" style="width: 200px;" >
        <Select v-model="postData.secondCode" @on-change="secondChange" @on-open-change="getSecondList" clearable>
          <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="三级分类：" style="width: 200px;" >
        <Select v-model="postData.thirdCode" @on-change="thirdChange" clearable>
          <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="教师真实姓名：" style="width: 250px;" :label-width="110">
        <Input v-model="postData.teacherRealName" placeholder="教师真实姓名"/>
      </FormItem>
      <Button type="primary" @click="search" style="margin-left: 20px;">查询</Button>
    </Form>
    <Card>
      <Table :columns="columns" :data="teacherCourseList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-index="postData.pageIndex"
      :page-size="postData.pageSize" style="margin-top: 10px" />
    </Card>
  </div>
</template>

<script>
import http from "@/libs/http";
import { formatDate, getWeek } from '@/libs/tools';
export default {
  data() {
    return {
      postData: { pageIndex: 1, pageSize: 10 },
      columns: [
        { title: '教师姓名', key: 'teacherName', align: 'center' },
        { title: '教师编号', key: 'teacherCode', align: 'center' },
        { title: '二级分类', key: 'secondName', align: 'center' },
        { title: '三级分类', key: 'thirdName', align: 'center' },
        { title: '课程名称', key: 'courseName', align: 'center' },
        { title: '上课日期', key: 'classBeginTime', align: 'center', render: (h, params) => {
          return h('div', formatDate('YYYY-MM-DD', params.row.classBeginTime))
        } },
        { title: '周', key: 'classBeginTime', align: 'center', render: (h, params) => {
          return h('div', getWeek(params.row.classBeginTime))
        } },
        { title: '上课时间', key: 'classBeginTime', align: 'center', render: (h, params) => {
          return h('div', formatDate('hh:mm', params.row.classBeginTime))
        } },
        { title: '状态', key: 'status', align: 'center', render: (h, params) => {
          const status = params.row.status
          const statusStr = status === 1 ? '未上课' : ( status === 2 ? '已上课' : '已退款')
          return h('div', statusStr)
        } },
      ],
      teacherCourseList: [],
      total: 0,
      secondList: [],
      thirdList: []
    };
  },
  methods: {
    search() {
      this.getTeacherCourseList(() => {
        this.$Message.success("查询成功!");
      });
    },
    getTeacherCourseList(cb) {
      http.get({
        vm: this,
        url: "/manager/teacher/queryTeacherCourseTable",
        data: this.postData,
        success: res => {
          this.teacherCourseList = res.data.list;
          this.total = res.data.total;
          cb && cb();
        }
      });
    },
    getSecondList() {
      http.get({
        vm: this,
        url: "/manager/course-classification/getAll",
        data: { type: 2 },
        success: res => {
          this.secondList = res.data;
        }
      });
    },
    getThirdList() {
      http.get({
        vm: this,
        url: "/manager/course-classification/getAll",
        data: { type: 3, parentCode: this.postData.secondCode },
        success: res => {
          this.thirdList = res.data;
        }
      });
    },
    secondChange(val) {
      this.postData.thirdCode = null;
      this.postData.thirdId = null;
      this.postData.secondId = null
      if (val) {
        const _secondId = this.secondList.find(s => s.code === val);
        this.postData.secondId = (_secondId && _secondId.id) || null;
        this.getThirdList();
      } else {
        this.thirdList = [];
      }
    },
    thirdChange(val) {
      this.postData.thirdId = null;
      if (val) {
        const _thirdId = this.thirdList.find(item => item.code === val);
        this.postData.thirdId = (_thirdId && _thirdId.id) || null;
      }
    },
    changePage(p) {
      this.postData.pageIndex = p;
      this.getTeacherCourseList();
    },
    changePageSize(s) {
      this.postData.pageSize = s;
      this.getTeacherCourseList();
    }
  },
  mounted() {
    this.getTeacherCourseList();
  }
};
</script>
