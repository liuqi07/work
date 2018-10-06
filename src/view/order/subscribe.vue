<template>
  <div>
    <Form :label-width="80" inline :model="postData">
      <FormItem label="手机号：" style="width: 220px;">
        <Input v-model="postData.mobilePhone" placeholder="请输入手机号" />
      </FormItem>
      <FormItem label="订单状态：" style="width: 220px;">
        <Select v-model="postData.status" clearable>
          <Option :value="1">预约中</Option>
          <Option :value="2">排课中</Option>
          <Option :value="3">试听中/待上课</Option>
          <Option :value="4">已完成/未转单</Option>
          <Option :value="5">已关闭</Option>
          <Option :value="6">已转单</Option>
        </Select>
      </FormItem>
      <FormItem label="开始日期：" style="width: 220px;">
        <DatePicker type="datetime" placeholder="请选择开始时间" v-model="startDateTime"></DatePicker>
      </FormItem>
      <FormItem label="结束日期：" style="width: 220px;">
        <DatePicker type="datetime" placeholder="请选择结束时间" v-model="endDateTime"></DatePicker>
      </FormItem>
      <Button type="primary" @click="search" style="margin-left: 20px;">搜索</Button>
    </Form>
    <Card>
      <Table :columns="columns" :data="subscribeList" border></Table>
      <Page :total="total" show-total @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal title="分配/变更顾问" v-model="subscribeAllotModal" @on-ok="saveSubscribeAllot">
      <Form :label-width="80">
        <FormItem label="选择顾问">
          <Select v-model="addSubscribeAllotData.adviserId" style="width: 300px;">
            <Option v-for="item in adviserList" :value="item.id" :key="item.id">{{item.realName}}</Option>
          </Select>
        </FormItem>
      </Form>
    </Modal>
    <Modal title="排课" v-model="subscribeArrangeModal" @on-ok="saveSubscribeArrange">
      <Form :label-width="80">
        <FormItem label="上课时间：">
          <Row>
            <DatePicker type="date" v-model="subscribeArrangeData.dateList[0].date" @on-change="onDateChange" :clearable="false" placeholder="选择日期"
              style="width: 120px; margin-right: 5px;"></DatePicker>
            <TimePicker :steps="[1, 30, 60]" v-model="subscribeArrangeData.dateList[0].time" :clearable="false" placeholder="选择时间段" style="width: 100px; margin-right: 5px;"></TimePicker>
            <Input :value="subscribeArrangeData.dateList[0].week" style="width: 80px;" placeholder="星期" readonly />
          </Row>
          <Row style="margin-top: 10px;">
            <DatePicker type="date" v-model="subscribeArrangeData.dateList[1].date" @on-change="onDateChange" :clearable="false" placeholder="选择日期"
              style="width: 120px; margin-right: 5px;"></DatePicker>
            <TimePicker :steps="[1, 30, 60]" v-model="subscribeArrangeData.dateList[1].time" :clearable="false" placeholder="选择时间段" style="width: 100px; margin-right: 5px;"></TimePicker>
            <Input :value="subscribeArrangeData.dateList[1].week" style="width: 80px;" placeholder="星期" readonly />
          </Row>
        </FormItem>
        <FormItem label="可用教师：">
          <Select v-model="subscribeArrangeData.teacherId" style="width: 200px;">
            <Option v-for="item in teacherList" :value="item.id" :key="item.id">{{item.realName}} {{item.zoomCode}}</Option>
          </Select>
          <Button type="primary" @click="getTeacherList" style="margin-left: 10px;">查询可用教师</Button>
        </FormItem>
      </Form>
    </Modal>
    <Modal title="转单" v-model="subscribeChangeOrderModal" >
      <Form :label-width="120" :model="subscribeChangeOrderData">
        <FormItem label="预约单号：" :label-width="100" style="width: 210px;" required>
          <Input :value="subscribeChangeOrderData.orderNo" disabled />
        </FormItem>
        <Row>
          <Col :span="10">
          <FormItem label="学员姓名：" :label-width="100" style="width: 210px;" required>
            <Input :value="subscribeChangeOrderData.studentName" />
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="手机电话：" :label-width="100" style="width: 210px;" required>
            <Input :value="subscribeChangeOrderData.studentMobilePhone" />
          </FormItem>
          </Col>
        </Row>
        <FormItem label="课程一级分类：" style="width: 300px;" required>
          <Select v-model="subscribeChangeOrderData.firstCode" @on-change="firstChange">
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="课程二级分类：" style="width: 300px;" required>
          <Select v-model="subscribeChangeOrderData.secondCode" @on-change="secondChange">
            <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="课程三级分类：" style="width: 300px;" required>
          <Select v-model="subscribeChangeOrderData.thirdCode" @on-change="thirdChange">
            <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem>
          <Select v-model="subscribeChangeOrderData.coursePackerId" @on-change="coursePackerChange">
            <Option v-for="item in coursePackerList" :value="item.id" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="error" @click="cancel">取消</Button>
        <Button type="primary" @click="handleSubmit">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from '@/libs/http';
  import { formatDate, getWeek } from '@/libs/tools';
  export default {
    data() {
      return {
        postData: { pageIndex: 1, pageSize: 10 },
        startDateTime: null,
        endDateTime: null,
        total: 0,
        columns: [
          { title: '预约订单编号', key: 'orderNo', align: 'center' },
          { title: '课程名称', key: 'courseName', align: 'center' },
          { title: '学员姓名', key: 'studentName', align: 'center' },
          { title: '手机号', key: 'studentMobilePhone', align: 'center' },
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
              return h('div', {}, statusStr)
            }
          },
          // { title: '课程总价', key: '', align: 'center' },
          { title: '消费课时', key: 'consumeClassHour', align: 'center' },
          { title: '剩余课时', key: 'surplusClassHour', align: 'center' },
          { title: '课程顾问', key: 'sysUserName', align: 'center' },
          { title: '任课教师', key: 'teacherName', align: 'center' },
          { title: '推荐人', key: 'recommendPhone', align: 'center' },
          { title: '下单时间', key: 'createTime', align: 'center' },
          {
            title: '操作', key: 'actions', width: 160, render: (h, params) => {
              const status = params.row.status
              return h('div', [
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: status === 1 ? 'inline-block' : 'none'
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
                    disabled: status === 5 ? true : false
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: status !== 1 ? 'inline-block' : 'none'
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
                    size: 'small',
                    disabled: (status === 1 || status === 5) ? true : false
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: (status === 1 || status === 2 || status === 5) ? 'inline-block' : 'none'
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
                    size: 'small',
                    disabled: status === 4 ? true : false
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: (status === 3 || status === 4) ? 'inline-block' : 'none'
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
                    size: 'small',
                    disabled: (status === 3 || status === 4) ? false : true
                  },
                  style: {
                    marginBottom: '3px'
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
            }
          },
        ],
        subscribeList: [],
        subscribeAllotModal: false,
        subscribeChangeModal: false, // 变更顾问
        adviserList: [],
        addSubscribeAllotData: [],
        subscribeArrangeModal: false, // 排课
        subscribeArrangeData: { dateList: [{}, {}] },
        teacherList: [],
        subscribeChangeOrderModal: false, // 转单
        subscribeChangeOrderData: {
          studentName: null,
          studentMobilePhone: null,
          orderNo: null,
          firstCode: null,
          secondCode: null,
          thirdCode: null,
          coursePackerId: null,
          orderId: null
        },
        firstList: [],
        secondList: [],
        thirdList: [],
        coursePackerList: []

      }
    },
    methods: {
      search() {
        this.postData.startDateTime = this.startDateTime && formatDate('YYYY-MM-DD hh:mm:ss', this.startDateTime) || null
        this.postData.endDateTime = this.endDateTime && formatDate('YYYY-MM-DD hh:mm:ss', this.endDateTime) || null
        this.getSubscribeList(() => { this.$Message.success('查询成功！') })
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

      getAdviserList() {
        http.get({
          vm: this,
          url: '/manager/course-adviser/getAll',
          data: {},
          success: res => {
            this.adviserList = res.data
          }
        })
      },
      // 查询可用教师
      getTeacherList() {
        const { orderId, dateList } = this.subscribeArrangeData
        this.subscribeArrangeData.dateTimes = dateList.map(d => {
          return formatDate('YYYY-MM-DD', d.date) + ' ' + d.time
        })
        http.get({
          vm: this,
          url: '/manager/teacher/queryTeacherByTimes',
          data: { orderId, dateTimes: JSON.stringify(this.subscribeArrangeData.dateTimes), classType: 2 },
          success: res => {
            this.teacherList = res.data
            this.$Message.success('查询成功！')
          }
        })
      },
      getClassBeginTime() {
        http.get({
          vm: this,
          url: '/manager/order-subscribe/getClassBeginTime',
          data: { orderId: this.subscribeArrangeData.orderId },
          success: res => {
            const dateList = res.data || []
            this.subscribeArrangeData.dateList = dateList.map((d, i) => {
              return {
                date: d.substr(0, 10),
                time: d.substr(11, 8),
                week: '星期 ' + new Date(d).getDay()
              }
            })
          }
        })
      },
      subscribeExport() { },
      // 分配顾问
      subscribeAllot({ orderId, version }) {
        this.subscribeAllotModal = true
        this.addSubscribeAllotData = {
          orderId, version
        }
      },
      saveSubscribeAllot() {
        if (!this.addSubscribeAllotData.adviserId) {
          this.$Message.error({
            content: '分配顾问失败，请先选择一个顾问！',
            duration: 5
          })
          return
        }
        http.post({
          vm: this,
          url: '/manager/order-subscribe/changeAdviser',
          data: this.addSubscribeAllotData,
          success: res => {
            this.$Message.success('分配顾问成功！')
            this.addSubscribeAllotData = {}
          }
        })
      },
      subscribeChange({ orderId, version }) {
        this.subscribeAllotModal = true
        this.addSubscribeAllotData = {
          orderId, version
        }
      },
      // 排课
      subscribeArrange({ orderId }) {
        this.subscribeArrangeData = { dateList: [{}, {}] }
        this.subscribeArrangeModal = true
        this.subscribeArrangeData.orderId = orderId
        this.subscribeArrangeData.url = '/manager/order-subscribe/arrangeCourse'
        this.teacherList = []
        this.getClassBeginTime()
      },
      saveSubscribeArrange() {
        const { orderId, teacherId, dateTimes: datesStr, url } = this.subscribeArrangeData
        if (datesStr.length !== 2) {
          this.$Message.error({
            content: '请选择排课日期后再进行操作！',
            duration: 5
          })
          return
        }
        else if (!teacherId) {
          this.$Message.error({
            content: '请选择教师后再进行操作！',
            duration: 5
          })
          return
        }
        http.post({
          vm: this,
          url,
          data: { orderId, teacherId, datesStr },
          success: res => {
            this.$Message.success('排课成功！')
            this.subscribeArrangeData = { dateList: [{}, {}] }
          }
        })
      },
      subscribeArrangeAgain({ orderId }) {
        this.subscribeArrangeData.teacherId = null
        this.subscribeArrangeModal = true
        this.subscribeArrangeData.orderId = orderId
        this.subscribeArrangeData.url = '/manager/order-subscribe/arrangeCourseAgain'
        this.teacherList = []
      },
      // 转单
      subscribeChangeOrder({ orderId, orderNo, studentName, studentMobilePhone }) {
        this.subscribeChangeOrderModal = true
        this.subscribeChangeOrderData = { ...this.subscribeChangeOrderData, orderId, orderNo, studentName, studentMobilePhone }
        this.getFirstList()
        // this.subscribeChangeOrderData
      },
      handleSubmit() {
        const data = this.subscribeChangeOrderData
        const errFlag = Object.keys(data).filter(item => !data[item])
        if (errFlag.length === 0) {
          http.post({
            vm: this,
            url: '/manager/order-formal/orderCreateBySubscribe',
            data: { orderId: data.orderId, coursePackerId: data.coursePackerId },
            success: res => {
              this.$Message.success('转单成功！')
              this.subscribeChangeOrderModal = false
              this.getSubscribeList()
            }
          })
        } else {
          this.$Message.error({
            content: '请检查标星内容不能为空！',
            duration: 5
          })
        }
      },
      onDateChange(date) {
        const dateList = this.subscribeArrangeData.dateList
        dateList.map(d => {
          d.week = getWeek(d.date)
        })
      },
      cancel() {
        this.subscribeChangeOrderModal = false
        this.subscribeChangeOrderData = {
          studentName: null,
          studentMobilePhone: null,
          orderNo: null,
          firstCode: null,
          secondCode: null,
          thirdCode: null,
          coursePackerId: null,
          orderId: null
        }
      },

      /* ---------  四级联动 ----------- */

      getFirstList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 1 },
          success: res => {
            this.firstList = res.data
          }
        })
      },
      getSecondList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 2, parentCode: this.subscribeChangeOrderData.firstCode },
          success: res => {
            this.secondList = res.data
          }
        })
      },
      getThirdList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 3, parentCode: this.subscribeChangeOrderData.secondCode },
          success: res => {
            this.thirdList = res.data
          }
        })
      },
      getCoursePackerList() {
        const _firstId = this.firstList.find(f => f.code === this.subscribeChangeOrderData.firstCode)
        const _secondId = this.secondList.find(s => s.code === this.subscribeChangeOrderData.secondCode)
        const _thirdId = this.thirdList.find(t => t.code === this.subscribeChangeOrderData.thirdCode)
        const firstId = _firstId && _firstId.id || null
        const secondId = _secondId && _secondId.id || null
        const thirdId = _thirdId && _thirdId.id || null
        http.get({
          vm: this,
          url: '/manager/course-package/list',
          data: { pageIndex: 1, pageSize: 1000, firstId, secondId, thirdId },
          success: res => {
            this.coursePackerList = res.data.list
          }
        })
      },
      firstChange(val) {
        this.subscribeChangeOrderData.secondCode = null
        this.subscribeChangeOrderData.thirdCode = null
        this.subscribeChangeOrderData.coursePackerId = null
        this.getSecondList()
      },
      secondChange(val) {
        this.subscribeChangeOrderData.thirdCode = null
        this.subscribeChangeOrderData.coursePackerId = null
        this.getThirdList()
      },
      thirdChange(val) {
        this.subscribeChangeOrderData.coursePackerId = null
        this.getCoursePackerList()
      },
      coursePackerChange() { },
      changePage(p) {
        this.postData.pageIndex = p
        this.getSubscribeList(()=>{this.$Message.success('查询成功！')})
      },
      changePageSize(s) {
        this.postData.pageSize = s
        this.getSubscribeList(()=>{this.$Message.success('查询成功！')})
      }

    },
    mounted() {
      this.getSubscribeList()
      this.getAdviserList()
    }
  }
</script>