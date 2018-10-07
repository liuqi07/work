<style>
  .ivu-table .warning {
    background-color: #ff6600;
    color: #fff;
  }

  .ivu-table .active {
    background-color: #2db7f5;
    color: #fff;
  }

  .certificate {
    margin: 10px 0;
  }

  .certificate .item {
    margin: 0 5px;
  }

  .teacherDetailTitle {
    font-weight: bold;
    margin: 10px 0;
  }
</style>

<template>
  <div>
    <Form :model="postData" :label-width="80">
      <Row>
        <Col :span="6">
        <FormItem label="邮箱：" style="width: 220px;">
          <Input type="text" v-model="postData.email" placeholder="请输入教师邮箱" />
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="教师姓名：" style="width: 220px;">
          <Input v-model="postData.realName" placeholder="请输入教师姓名" />
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="教师状态：" style="width: 220px;" placeholder="请选择教师状态" clearable>
          <Select v-model="postData.status">
            <Option :value="1">未审核</Option>
            <Option :value="2">已审核</Option>
          </Select>
        </FormItem>
        </Col>
      </Row>
      <Row>
        <Col :span="6">
        <FormItem label="所获学位：" style="width: 220px;" placeholder="请选择学位" clearable>
          <Select v-model="postData.degree">
            <Option :value="1">学士</Option>
            <Option :value="2">硕士</Option>
            <Option :value="3">博士</Option>
          </Select>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="注册日期：" style="width: 220px;">
          <DatePicker type="date" placeholder="请选择注册时间" v-model="createDate"></DatePicker>
        </FormItem>
        </Col>
        <Col :span="6">
        <Button type="primary" @click="search">搜索</Button>
        </Col>
      </Row>
    </Form>
    <Card>
      <Table :columns="columns" :data="teacherList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-index="postData.pageIndex"
        :page-size="postData.pageSize" style="margin-top: 10px" />
    </Card>
    <Modal v-model="lookDetailModal" title="教师详情">
      <p class="teacherDetailTitle">出生年月：<span>{{ teacherDetail.birthday }}</span></p>
      <p class="teacherDetailTitle">毕业院校：<span>{{ teacherDetail.school }}</span></p>
      <p class="teacherDetailTitle">可用时段</p>
      <Table :columns="columns1" :data="weekTime" border size="small" :disabled-hover="true"></Table>
      <div class="certificate">
        <p class="teacherDetailTitle">证书资质</p>
        <Avatar v-for="(item, index) in certificateUrls" class="item" size="large" shape="square" :src="item" :key="index" />
      </div>
      <p class="teacherDetailTitle">自我介绍</p>
      <Input type="textarea" :value="selfDesc" :rows="4" readonly/>
      <div slot="footer">
        <Button type="primary" @click="lookDetailModal=false">关闭</Button>
      </div>
    </Modal>
    <Modal title="课程维护" v-model="teachCodeModal" @on-ok="saveTeachCode">
      <Select v-model="secondCodes" multiple>
        <Option v-for="item in secondList" :value="item.code" :key="item.id">{{item.name}}</Option>
      </Select>
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
        createDate: '',
        columns: [
          { title: '教师编号', key: 'code', align: 'center' },
          { title: '邮箱', key: 'email', align: 'center' },
          { title: '教师姓名', key: 'realName', align: 'center' },
          {
            title: '性别', key: 'sex', align: 'center', render: (h, params) => {
              const sex = params.row.sex
              return h('div', {}, sex === 1 ? '男' : (sex === 2 ? '女' : '未知'))
            }
          },
          { title: '国籍', key: 'nationality', align: 'center' },
          { title: '所获学位', key: 'degree', align: 'center' },
          { title: '年龄', key: 'age', align: 'center' },
          {
            title: '教师状态', key: 'status', align: 'center', render: (h, params) => {
              const status = params.row.status
              return h('div', {}, status === 1 ? '未审核' : '已审核')
            }
          },
          { title: 'zoom code', align: 'center', key: 'zoomCode' },
          {
            title: '操作', key: 'actions', align: 'center', width: 215, render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                    disabled: params.row.status === 2
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px'
                  },
                  on: {
                    click: () => {
                      this.audit(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "audit" }
                  ]
                }, '审核'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px'
                  },
                  on: {
                    click: () => {
                      this.teacherListLookDetail(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "teacherListLookDetail" }
                  ]
                }, '查看更多'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px'
                  },
                  on: {
                    click: () => {
                      this.openFeeList(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "feeList" }
                  ]
                }, '收费标准'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginBottom: '3px'
                  },
                  on: {
                    click: () => {
                      this.teachCode(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "teachCode" }
                  ]
                }, '课程维护'),
              ])
            }
          },
        ],
        teacherList: this.getTeacherList(),
        total: 0,
        teacherDetail: {},
        titleActive: 0,
        columns1: [
          {
            title: '周一', key: '1'
            // , renderHeader: (h, params) => {
            //   return h('div', {
            //     class: this.titleActive===params.index ? 'active' : '',
            //     on: {
            //       click: () => {
            //         console.log('%c click', 'color:red;');
            //         this.titleActive = params.index
            //       }
            //     }
            //   }, '周一')
            // } 
          },
          { title: '周二', key: '2' },
          { title: '周三', key: '3' },
          { title: '周四', key: '4' },
          { title: '周五', key: '5' },
          { title: '周六', key: '6' },
          { title: '周日', key: '7' }
        ],
        weekTime: [],
        lookDetailModal: false,
        certificateUrls: [
          // 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1538636463586&di=8ec39d17c48af2f5eaaaf214f227f55b&imgtype=0&src=http%3A%2F%2Fimg4q.duitang.com%2Fuploads%2Fitem%2F201503%2F05%2F20150305153445_F5nRx.thumb.700_0.jpeg',
          // 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1181878726,1542446426&fm=27&gp=0.jpg',
          // 'https://i.loli.net/2017/08/21/599a521472424.jpg',
        ],
        selfDesc: '如果你无法简介的表达你的想法，那只说明你还不够了解他\n\n --爱因斯坦',
        teachCodeModal: false,
        secondList: [],
        teacherId: null,
        secondCodes: [],
      }
    },
    methods: {
      search() {
        this.createDate && (this.postData.createDate = formatDate('YYYY-MM-DD', this.createDate))
        this.getTeacherList(() => {
          this.$Message.success('查询成功！')
        })
      },
      getTeacherList(cb) {
        http.get({
          vm: this,
          url: '/manager/teacher/list',
          data: this.postData,
          success: res => {
            this.teacherList = res.data.list
            this.total = res.total
            cb && cb()
          }
        })
      },
      audit(row) {
        this.$Modal.confirm({
          title: '审核',
          content: '确定要将该教师变为已审核状态吗？',
          loading: true,
          onOk: () => {
            const { id, version } = row
            http.post({
              vm: this,
              url: '/manager/teacher/audit',
              data: { id, version, status: 2 },
              success: res => {
                this.$Message.success('审核成功！')
                this.getTeacherList()
                this.$Modal.remove()
              }
            })
          }
        })
      },
      teacherListLookDetail(row) {
        this.lookDetailModal = true
        http.get({
          vm: this,
          url: '/manager/teacher/detail',
          data: { id: row.id },
          success: res => {
            this.teacherDetail = res.data
            const weekTimeVOS = res.data.weekTimeVOS
            const weekTime = [
              { 1: '08:00', 2: '08:00', 3: '08:00', 4: '08:00', 5: '08:00', 6: '08:00', 7: '08:00', cellClassName: {} },
              { 1: '08:30', 2: '08:30', 3: '08:30', 4: '08:30', 5: '08:30', 6: '08:30', 7: '08:30', cellClassName: {} },
              { 1: '09:00', 2: '09:00', 3: "09:00", 4: '09:00', 5: '09:00', 6: '09:00', 7: '09:00', cellClassName: {} },
              { 1: '09:30', 2: '09:30', 3: "09:30", 4: '09:30', 5: '09:30', 6: '09:30', 7: '09:30', cellClassName: {} },
              { 1: '10:00', 2: '10:00', 3: "10:00", 4: '10:00', 5: '10:00', 6: '10:00', 7: '10:00', cellClassName: {} },
              { 1: '10:30', 2: '10:30', 3: "10:30", 4: '10:30', 5: '10:30', 6: '10:30', 7: '10:30', cellClassName: {} },
              { 1: '11:00', 2: '11:00', 3: "11:00", 4: '11:00', 5: '11:00', 6: '11:00', 7: '11:00', cellClassName: {} },
              { 1: '11:30', 2: '11:30', 3: "11:30", 4: '11:30', 5: '11:30', 6: '11:30', 7: '11:30', cellClassName: {} },
              { 1: '12:00', 2: '12:00', 3: "12:00", 4: '12:00', 5: '12:00', 6: '12:00', 7: '12:00', cellClassName: {} },
              { 1: '14:00', 2: '14:00', 3: "14:00", 4: '14:00', 5: '14:00', 6: '14:00', 7: '14:00', cellClassName: {} },
              { 1: '14:30', 2: '14:30', 3: "14:30", 4: '14:30', 5: '14:30', 6: '14:30', 7: '14:30', cellClassName: {} },
              { 1: '15:00', 2: '15:00', 3: "15:00", 4: '15:00', 5: '15:00', 6: '15:00', 7: '15:00', cellClassName: {} },
              { 1: '15:30', 2: '15:30', 3: "15:30", 4: '15:30', 5: '15:30', 6: '15:30', 7: '15:30', cellClassName: {} },
              { 1: '16:00', 2: '16:00', 3: "16:00", 4: '16:00', 5: '16:00', 6: '16:00', 7: '16:00', cellClassName: {} },
              { 1: '16:30', 2: '16:30', 3: "16:30", 4: '16:30', 5: '16:30', 6: '16:30', 7: '16:30', cellClassName: {} },
              { 1: '17:00', 2: '17:00', 3: "17:00", 4: '17:00', 5: '17:00', 6: '17:00', 7: '17:00', cellClassName: {} },
              { 1: '17:30', 2: '17:30', 3: "17:30", 4: '17:30', 5: '17:30', 6: '17:30', 7: '17:30', cellClassName: {} },
              { 1: '18:00', 2: '18:00', 3: "18:00", 4: '18:00', 5: '18:00', 6: '18:00', 7: '18:00', cellClassName: {} }
            ]
            weekTimeVOS.map(w => {
              weekTime.map(t => {
                if (t[w.weekNo] === w.timeStr.substr(0, 5)) {
                  t.cellClassName[w.weekNo] = 'active'
                }
              })
            })
            this.weekTime = weekTime
            // 此处注释待有数据返回时需放开
            this.certificateUrls = res.data.certificateUrls
            this.selfDesc = res.data.selfDesc
          }
        })
      },
      getSecondList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 2 },
          success: res => {
            this.secondList = res.data
          }
        })
      },
      teachCode({ id, code, teachCode }) {
        this.teachCodeModal = true
        this.teacherId = id
        this.secondCodes = typeof teachCode === 'string' && JSON.parse(teachCode) || []
        this.getSecondList()
      },
      saveTeachCode() {
        const { teacherId, secondCodes } = this
        http.post({
          vm: this,
          url: '/manager/teacher/saveTeachCode',
          data: { teacherId, secondCodes },
          success: res => {
            this.secondCodes = []
            this.getTeacherList()
            this.$Message.success('保存成功！')
          }
        })
      },
      openFeeList(row) {

      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getTeacherList(() => { this.$Message.success('查询成功！') })
      },
      changePageSize(pageSize) {
        this.postData.pageSize = pageSize
        this.getTeacherList(() => { this.$Message.success('查询成功！') })
      }
    }
  }
</script>