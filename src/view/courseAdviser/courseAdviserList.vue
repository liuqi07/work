<template>
  <div>
    <Form :model="postData" :label-width="80" inline>
      <FormItem label="课程顾问：" style="width: 220px;">
        <Input type="text" v-model="postData.realName" placeholder="请输入课程顾问姓名" />
      </FormItem>
      <FormItem label="身份证号：" style="width: 230px;">
        <Input v-model="postData.idNo" placeholder="请输入课程顾问身份证号" />
      </FormItem>
      <FormItem label="顾问状态：" style="width: 220px;">
        <Select v-model="postData.status" clearable>
          <Option :value="1">正常</Option>
          <Option :value="0">停用</Option>
        </Select>
      </FormItem>
      <FormItem label="注册日期：" style="width: 220px;">
        <DatePicker type="date" placeholder="请选择注册时间" v-model="createDate"></DatePicker>
      </FormItem>
      <Button type="primary" @click="search" style="margin-left: 20px;">搜索</Button>
    </Form>
    <Card>
      <Table :data="courseAdviserList" :columns="columns"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-index="postData.pageIndex"
        :page-size="postData.pageSize" style="margin-top: 10px" />
    </Card>
    <Modal v-model="detailModal" title="完善资料">
      <Form :model="updateDetailData" :label-width="100">
        <FormItem label="课程顾问编号：" style="width: 300px;">
          <Input v-model="updateDetailData.code" disabled />
        </FormItem>
        <FormItem label="课程顾问：" style="width: 300px;">
          <Input v-model="updateDetailData.realName" disabled />
        </FormItem>
        <FormItem label="手机号码：" style="width: 300px;">
          <Input v-model="updateDetailData.mobilePhone" disabled />
        </FormItem>
        <FormItem label="身份证号：" style="width: 300px;" required>
          <Input v-model="updateDetailData.idNo" />
        </FormItem>
        <FormItem label="性别：" style="width: 300px;" required>
          <RadioGroup v-model="updateDetailData.sex">
            <Radio :label="1">男</Radio>
            <Radio :label="2">女</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="年龄" style="width: 300px;" required>
          <Input v-model="updateDetailData.age" />
        </FormItem>
        <FormItem label="提成比例：" style="width: 320px;" required>
          <Row>
            <Input v-model="updateDetailData.rate" style="width: 200px;" /> %</Row>
        </FormItem>
        <FormItem label="邮箱：" style="width: 300px;">
          <Input v-model="updateDetailData.email" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelUpdateDetail">取消</Button>
        <Button type="primary" @click="updateDetail">确定</Button>
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
        postData: {
          pageIndex: 1,
          pageSize: 10
        },
        total: 0,
        createDate: '',
        columns: [
          { title: '课程顾问编号', key: 'code', },
          { title: '课程顾问', key: 'realName', },
          { title: '手机号码', key: 'mobilePhone', },
          { title: '邮箱', key: 'email', },
          {
            title: '性别', key: 'sex', render: (h, params) => {
              const sex = params.row.sex
              return h('div', {}, sex === 1 ? '男' : (sex === 2 ? '女' : '未知'))
            }
          },
          { title: '年龄', key: 'age', },
          { title: '身份证号', key: 'idNo', },
          { title: '提成比例(%)', key: 'rate', },
          {
            title: '顾问状态', key: 'status', render: (h, params) => {
              const status = params.row.status
              return h('div', {}, status === 1 ? '正常' : '停用')
            }
          },
          { title: '注册时间', key: 'createTime', },
          {
            title: '操作', key: 'actions', render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                },
                on: {
                  click: () => {
                    this.openDetail(params.row)
                  }
                },
                directives: [
                  { name: 'hasPermission', value: "courseAdviserDetail" }
                ]
              }, '完善资料')
            }
          },
        ],
        courseAdviserList: [],
        detailModal: false,
        updateDetailData: {}
      }
    },
    methods: {
      search() {
        this.getCourseAdviserList(() => {
          this.$Message.success('查询成功')
        })
      },
      getCourseAdviserList(cb) {
        this.createDate && (this.postData.createDate = formatDate('YYYY-MM-DD', this.createDate))
        http.get({
          vm: this,
          url: '/manager/course-adviser/list',
          data: this.postData,
          success: res => {
            this.courseAdviserList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },
      openDetail({ code, realName, mobilePhone, idNo, sex, age, rate, email, id }) {
        this.detailModal = true
        this.updateDetailData = { code, realName, mobilePhone, idNo, sex, age, rate, email, id }
      },
      updateDetail() {
        const { idNo, sex, age, rate } = this.updateDetailData
        if (!idNo || !sex || !age || !rate) {
          this.$Message.error({
            content: '标星内容不能为空！',
            duration: 5
          })
          return
        }
        http.post({
          vm: this,
          url: '/manager/course-adviser/edit',
          data: this.updateDetailData,
          success: res => {
            this.$Message.success('更新成功！')
            this.detailModal = false
            this.updateDetailData = {}
            this.getCourseAdviserList()
          }
        })
      },
      cancelUpdateDetail() {
        this.detailModal = false
        this.updateDetailData = {}
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getCourseAdviserList(() => { this.$Message.success('查询成功！') })
      },
      changePageSize(pageSize) {
        this.postData.pageSize = pageSize
        this.getCourseAdviserList(() => { this.$Message.success('查询成功！') })
      }
    },
    mounted() {
      this.getCourseAdviserList()
    }
  }
</script>