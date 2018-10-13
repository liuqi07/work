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
    <Form :model="postData" :label-width="80" inline>
      <FormItem label="邮箱：" style="width: 220px;">
        <Input type="text" v-model="postData.email" placeholder="请输入教师邮箱" />
      </FormItem>
      <FormItem label="教师姓名：" style="width: 220px;">
        <Input v-model="postData.realName" placeholder="请输入教师姓名" />
      </FormItem>
      <FormItem label="教师状态：" style="width: 220px;" placeholder="请选择教师状态" clearable>
        <Select v-model="postData.status">
          <Option :value="1">未审核</Option>
          <Option :value="2">已审核</Option>
        </Select>
      </FormItem>
      <FormItem label="所获学位：" style="width: 220px;" placeholder="请选择学位" clearable>
        <Select v-model="postData.degree">
          <Option :value="1">学士</Option>
          <Option :value="2">硕士</Option>
          <Option :value="3">博士</Option>
        </Select>
      </FormItem>
      <FormItem label="注册日期：" style="width: 220px;">
        <DatePicker type="date" placeholder="请选择注册时间" v-model="createDate"></DatePicker>
      </FormItem>
      <Button type="primary" @click="search" style="margin-left: 20px;">搜索</Button>
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
    <Modal title="收费标准" v-model="feeListModal" :width="900">
      <Form :label-width="90" inline>
        <FormItem label="一级分类：" style="width: 200px;" required>
          <Select v-model="feeListData.firstCode" @on-change="firstChange" clearable>
            <Option v-for="item in firstList2" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="二级分类：" style="width: 200px;" required>
          <Select v-model="feeListData.secondCode" @on-change="secondChange" clearable>
            <Option v-for="item in secondList2" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="三级分类：" style="width: 200px;" required>
          <Select v-model="feeListData.thirdCode" @on-change="thirdChange" clearable>
            <Option v-for="item in thirdList2" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="课程名称：" style="width: 200px;" required>
          <Select v-model="feeListData.courseId" @on-change="courseChange" clearable>
            <Option v-for="item in courseList2" :value="item.id" :key="item.id">{{item.name}}</Option>
          </Select>
        </FormItem>
        <Button type="primary" @click="searchFee" style="margin: 0 10px 10px;">查询</Button>
        <Button type="primary" @click="addFee" style="margin-bottom: 10px;">收费标准</Button>
      </Form>
      <Table :columns="feeColumns" :data="feeList" size="small" :disabled-hover="true"></Table>
      <Page :total="total2" show-total @on-change="changePage2" :page-index="postData.pageIndex" :page-size="postData.pageSize"
        style="margin-top: 10px" />
    </Modal>
    <Modal v-model="feeModal" title="收费标准" @on-ok="saveFee" @on-cancel="cancelFee">
      <Form :label-width="90" inline>
        <FormItem label="一级分类：" style="width: 200px;" required>
          <Select v-model="feeListData.firstCode" @on-change="firstChange" clearable>
            <Option v-for="item in firstList2" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="二级分类：" style="width: 200px;" required>
          <Select v-model="feeListData.secondCode" @on-change="secondChange" clearable>
            <Option v-for="item in secondList2" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="三级分类：" style="width: 200px;" required>
          <Select v-model="feeListData.thirdCode" @on-change="thirdChange" clearable>
            <Option v-for="item in thirdList2" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="课程名称：" style="width: 200px;" required>
          <Select v-model="feeListData.courseId" @on-change="courseChange" clearable>
            <Option v-for="item in courseList2" :value="item.id" :key="item.id">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="授课学生数：" style="width: 250px;" :label-width="100" required>
          <Input v-model="feeListData.oneToX" placeholder="请先选择三级分类" disabled/>
        </FormItem>
        <FormItem label="收费标准：" style="width: 300px;" required>
          <Row>
            <Col :span="10">
            <Row>
              一对
              <Input size="small" v-model="feeListData.oneToX" style="width: 50px;" disabled />
            </Row>
            </Col>
            <Col :span="14">
            <Row>每课时
              <InputNumber :min="1" size="small" v-model="feeListData.fee" style="width: 50px;" /> 美元
            </Row>
            </Col>
          </Row>
        </FormItem>
      </Form>
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
        teacherList: [],
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
        selfDesc: '',
        teachCodeModal: false,
        secondList: [],
        teacherId: null,
        secondCodes: [],
        firstList2: [],
        secondList2: [],
        thirdList2: [],
        courseList2: [],
        feeListData: { pageIndex: 1, pageSize: 10 },
        feeListModal: false,
        total2: 0,
        feeColumns: [
          { title: '课程名称', key: 'courseName', align: 'center' },
          { title: '一级分类', key: 'firstName', align: 'center' },
          { title: '二级分类', key: 'secondName', align: 'center' },
          { title: '三级分类', key: 'thirdName', align: 'center' }
        ],
        feeList: [],
        feeModal: false,
        teacherId2: '',
      }
    },
    methods: {
      addFee() {
        this.feeModal = true
        this.secondList2 = []
        this.thirdList2 = []
        this.courseList2 = []
        this.feeListData = { teacherId: this.teacherId2, fee: 1 }
      },
      saveFee() {
        http.post({
          vm: this,
          url: '/manager/teacher/saveTeacherFee',
          data: this.feeListData,
          success: res => {
            this.$Message.success('新增成功')
            this.feeListModal = false
          }
        })
        this.secondList2 = []
        this.thirdList2 = []
        this.courseList2 = []
        this.feeListData = { pageIndex: 1, pageSize: 10 }
      },
      cancelFee() {
        this.secondList2 = []
        this.thirdList2 = []
        this.courseList2 = []
        this.feeListData = { pageIndex: 1, pageSize: 10 }
      },
      addOneToXFee() {
        this.feeListData.oneToXFeeList.push({})
      },
      search() {
        this.createDate && (this.postData.createDate = formatDate('YYYY-MM-DD', this.createDate))
        this.getTeacherList(() => {
          this.$Message.success('查询成功！')
        })
      },
      searchFee() {
        this.getFeeList(() => { this.$Message.success('查询成功！') })
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
      openFeeList({ id }) {
        this.feeListModal = true
        this.teacherId2 = id
        this.feeListData = { pageIndex: 1, pageSize: 10, teacherId: id }
        this.getFeeList()
        this._getFirstList()
      },
      getFeeList(cb) {
        http.get({
          vm: this,
          url: '/manager/teacher/listFee',
          data: this.feeListData,
          success: res => {
            this.feeList = res.data.list
            this.total2 = res.data.total
            cb && cb()
          }
        })
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getTeacherList(() => { this.$Message.success('查询成功！') })
      },
      changePageSize(pageSize) {
        this.postData.pageSize = pageSize
        this.getTeacherList(() => { this.$Message.success('查询成功！') })
      },

      firstChange(val) {
        this.feeListData.secondCode = null
        this.feeListData.thirdCode = null
        this.feeListData.courseId = null
        this.feeListData.firstId = null
        this.feeListData.secondId = null
        this.feeListData.thirdId = null
        this.feeListData.oneToX = null
        if (val) {
          const _firstId = this.firstList2.find(f => f.code === val)
          this.feeListData.firstId = _firstId && _firstId.id || null
          this._getSecondList()
        } else {
          this.secondList2 = []
          this.thirdList2 = []
          this.courseList2 = []
          this.courseList2 = []
        }
      },
      secondChange(val) {
        this.feeListData.thirdCode = null
        this.feeListData.courseId = null
        this.feeListData.secondId = null
        this.feeListData.thirdId = null
        this.feeListData.oneToX = null
        if (val) {
          const _secondId = this.secondList2.find(s => s.code === val)
          this.feeListData.secondId = _secondId && _secondId.id || null
          this._getThirdList()
        } else {
          this.thirdList2 = []
          this.courseList2 = []
        }
      },
      thirdChange(val) {
        this.feeListData.courseId = null
        this.feeListData.thirdId = null
        this.feeListData.oneToX = null
        if (val) {
          const _thirdId = this.thirdList2.find(item => item.code === val)
          this.feeListData.thirdId = _thirdId && _thirdId.id || null
          this._getCourseList()
        } else {
          this.courseList2 = []
        }
      },
      courseChange(val) {
        this.feeListData.courseId = val
        const _courseId = this.courseList2.find(item => item.id === val)
        this.feeListData = Object.assign({}, this.feeListData, { oneToX: _courseId && _courseId.oneToX }) //.oneToX = _courseId && _courseId.oneToX || null
      },
      _getFirstList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 1 },
          success: res => {
            this.firstList2 = res.data
          }
        })
      },
      _getSecondList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 2, parentCode: this.feeListData.firstCode },
          success: res => {
            this.secondList2 = res.data
          }
        })
      },
      _getThirdList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 3, parentCode: this.feeListData.secondCode },
          success: res => {
            this.thirdList2 = res.data
          }
        })
      },
      _getCourseList() {
        http.get({
          vm: this,
          url: '/manager/course/listByThird',
          data: { thirdId: this.feeListData.thirdId },
          success: res => {
            this.courseList2 = res.data
          }
        })
      },
      changePage2(pageIndex) {
        this.feeListData.pageIndex = pageIndex
        this.getFeeList(() => { this.$Message.success('查询成功！') })
      }
    },
    mounted() {
      this.getTeacherList()
    }
  }
</script>