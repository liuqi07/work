<template>
  <div>
    <Form :model="postData" :label-width="80" inline>
      <FormItem label="手机号码：" style="width: 220px;">
        <Input v-model="postData.studentMobilePhone" placeholder="请输入学员手机号码" />
      </FormItem>
      <FormItem label="学员姓名：" style="width: 220px;">
        <Input v-model="postData.studentRealName" placeholder="请输入学员姓名" />
      </FormItem>
      <FormItem label="任课教师：" style="width: 220px;">
        <Input v-model="postData.teacherRealName" placeholder="请输入任课教师姓名" />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="query">查询</Button>
      </FormItem>
    </Form>
    <Card>
      <Table :columns="columns" :data="courseList" ></Table>
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
          { title: '学员编号', key: '', align: 'center' },
          { title: '学员姓名', key: '', align: 'center' },
          { title: '手机号码', key: '', align: 'center' },
          { title: '课程名称', key: '', align: 'center' },
          { title: '上课时间', key: '', align: 'center' },
          { title: '星期', key: '', align: 'center' },
          { title: '时间段', key: '', align: 'center' },
          { title: '任课教师', key: '', align: 'center' },
          { title: '上课链接', key: '', align: 'center' },
          { title: '课程顾问 ', key: '', align: 'center' },
          { title: '状态', key: '', align: 'center' },
          { title: '教师评价', key: '', align: 'center' }
        ],
        courseList: [],
        total: 0,
      }
    },
    methods: {
      query () {
        this.getCourseList(()=>{
          this.$Message.success('查询成功！')
        })
      },
      getCourseList(cb) {
        http.get({
        vm: this,
        url: '/manager/student/queryStudentCourseTable',
        data: this.postData,
        success: res => {
          this.courseList = res.data.list
          this.total = res.data.total
          cb && cb()
        }})
      },
      changePage(p) {
        this.postData.pageIndex = p
      },
      changePageSize(s) {
        this.postData.pageSize = s
      }
    },
    mounted(){
      this.getCourseList()
    }
  }
</script>