<template>
  <div>
    <Form :label-width="80" inline :model="postData">
      <FormItem label="手机号：" style="width: 220px;">
        <Input v-model="postData.mobilePhone" placeholder="请输入手机号" />
      </FormItem>
      <FormItem label="订单状态：" style="width: 220px;">
        <Select v-model="postData.status" clearable>
          <Option :value="1">未支付</Option>
          <Option :value="2">已支付/未分配顾问</Option>
          <Option :value="3">已支付/已分配顾问/未排课</Option>
          <Option :value="4">上课中</Option>
          <Option :value="5">退款中</Option>
          <Option :value="6">退款完毕</Option>
          <Option :value="7">已完结</Option>
        </Select>
      </FormItem>
      <FormItem label="开始日期：" style="width: 220px;">
        <DatePicker type="datetime" placeholder="请选择开始时间" v-model="startDateTime"></DatePicker>
      </FormItem>
      <FormItem label="结束日期：" style="width: 220px;">
        <DatePicker type="datetime" placeholder="请选择结束时间" v-model="endDateTime"></DatePicker>
      </FormItem>
      <Button type="primary" @click="search" style="margin-left: 20px; margin-right: 10px;">搜索</Button>
      <Button type="primary" @click="formalExport" v-hasPermission="'formalExport'">导出</Button>
    </Form>
    <Card>
      <Table :columns="columns" :data="formalList"></Table>
      <Page :total="total" show-total @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal title="分配/变更顾问" v-model="formalAllotModal" @on-ok="saveFormalAllot">
      <Form :label-width="80">
        <FormItem label="选择顾问" style="width: 300px;">
          <Select v-model="formalAllotData.adviserId">
            <Option v-for="item in adviserList" :value="item.id" :key="item.id">{{item.realName}}</Option>
          </Select>
        </FormItem>
      </Form>
    </Modal>
    <Modal title="排课" v-model="formalArrangeModal">
      <Form :label-width="100">
        <FormItem label="课程名称：" required>
          <Input :value="formalArrangeData.name" disabled />
        </FormItem>
        <FormItem label="上课时间：" required>
          <Row v-for="i in formalArrangeData.weekTimeCount" :key="i" style="margin-bottom: 5px;">
            <DatePicker type="date" v-model="formalArrangeData.dateList[i-1].date" @on-change="onDateChange" :clearable="false" placeholder="选择日期"
              style="width: 120px; margin-right: 5px;"></DatePicker>
            <TimePicker :steps="[1, 30, 60]" v-model="formalArrangeData.dateList[i-1].time" :clearable="false" placeholder="选择时间段" style="width: 100px; margin-right: 5px;"></TimePicker>
            <Input v-model="formalArrangeData.dateList[i-1].week" style="width: 80px;" placeholder="星期" readonly />
          </Row>
        </FormItem>
        <FormItem label="可用教师：">
          <Select v-model="formalArrangeData.teacherId" style="width: 200px;">
            <Option v-for="item in teacherList" :value="item.id" :key="item.id">{{item.realName}} {{item.zoomCode}}</Option>
          </Select>
          <Button type="primary" @click="getTeacherList" style="margin-left: 10px;">查询可用教师</Button>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="error" @click="cancelFormalArrange">取消</Button>
        <Button type="primary" @click="saveFormalArrange">提交</Button>
      </div>
    </Modal>
    <Modal title="退款" v-model="formalRefundModal" :width="600">
      <Form :label-width="100">
        <FormItem label="订单编号：" style="width: 350px;" required>
          <Input :value="formalRefundData.orderNo" disabled />
        </FormItem>
        <Row>
          <Col :span="10">
          <FormItem label="学员姓名：" style="width: 250px;" required>
            <Input :value="formalRefundData.studentRealName" disabled />
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="手机电话：" style="width: 250px;" required>
            <Input :value="formalRefundData.studentMobilePhone" disabled />
          </FormItem>
          </Col>
        </Row>
        <FormItem label="课程名称：" style="width: 350px;" required>
          <Input :value="formalRefundData.name" disabled />
        </FormItem>
        <Row>
          <Col :span="10">
          <FormItem label="课程顾问：" style="width: 250px;" required>
            <Input :value="formalRefundData.sysUserRealName" disabled />
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="任课教师：" style="width: 250px;" required>
            <Input :value="formalRefundData.teacherRealName" disabled />
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="10">
          <FormItem label="消费课时：" style="width: 250px;" required>
            <Input :value="formalRefundData.consumeClassHour" disabled />
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="剩余课时：" style="width: 250px;" required>
            <Input :value="formalRefundData.surplusClassHour" disabled />
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="10">
          <FormItem label="课程总价：" style="width: 250px;" required>
            <Input :value="formalRefundData.allPrice" disabled />
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="优惠金额：" style="width: 250px;" required>
            <Input :value="formalRefundData.discountAllPrice" disabled />
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="10">
          <FormItem label="实收金额：" style="width: 250px;" required>
            <Input :value="formalRefundData.realRefundAmt" disabled />
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="应退金额：" style="width: 250px;" required>
            <Input :value="formalRefundData.shouldRefundAmt" disabled />
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="10">
          <FormItem label="实退金额：" style="width: 250px;" required>
            <Input value="" placeholder="输入实际退款金额" /> 元
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="退款人：" style="width: 250px;" required>
            <Input value="" placeholder="输入退款人姓名" />
          </FormItem>
          </Col>
        </Row>
        <FormItem label="退款方式：" style="width: 350px;" required>
          <Input value="" placeholder="输入退款方式" />
        </FormItem>
        <FormItem label="收款人姓名：" style="width: 350px;" required>
          <Input value="" placeholder="输入收款人姓名" />
        </FormItem>
        <FormItem label="收款人手机号：" style="width: 350px;" required>
          <Input value="" placeholder="输入收款人手机号" />
        </FormItem>
        <FormItem label="收款人账号：" style="width: 350px;" required>
          <Input value="" placeholder="输入收款人账号" />
        </FormItem>
        <FormItem label="上传退款凭证：" :label-width="120" style="width: 350px;" required>
          <input type="file" @change="handleFileChange" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="error" @click="cancelFormalRefund">取消</Button>
        <Button type="primary" @click="submitFormalRefund">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from '@/libs/http'
  import { formatDate, getWeek } from '@/libs/tools';
  import $ from 'jquery';
  export default {
    data() {
      return {
        postData: { pageIndex: 1, pageSize: 10 },
        startDateTime: null,
        endDateTime: null,
        columns: [
          { title: '订单编号', key: 'orderNo', algin: 'center' },
          { title: '课程名称', key: 'name', algin: 'center' },
          { title: '学员姓名', key: 'studentRealName', algin: 'center' },
          { title: '手机号码', key: 'studentMobilePhone', algin: 'center' },
          { title: '订单状态', key: 'statusStr', algin: 'center' },
          { title: '课程总价', key: 'allPrice', algin: 'center' },
          { title: '优惠总价', key: 'discountAllPrice', algin: 'center' },
          { title: '消费课时', key: 'consumeClassHour', algin: 'center' },
          { title: '剩余课时', key: 'surplusClassHour', algin: 'center' },
          { title: '课程顾问', key: 'sysUserRealName', algin: 'center' },
          { title: '任课教师', key: 'teacherRealName', algin: 'center' },
          { title: '推荐人', key: 'recommendPhone', algin: 'center' },
          { title: '下单时间', key: 'createTime', algin: 'center' },
          {
            title: '操作', key: 'actions', algin: 'center', width: 180, render: (h, params) => {
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
                  },
                  on: {
                    click: () => {
                      this.formalAllot(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "formalAllot" }
                  ]
                }, '分配顾问'),
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                  },
                  on: {
                    click: () => {
                      this.formalChange(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "formalChange" }
                  ]
                }, '变更顾问'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                  },
                  on: {
                    click: () => {
                      this.formalArrange(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "formalArrange" }
                  ]
                }, '排课'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                  },
                  on: {
                    click: () => {
                      this.formalArrangeAgain(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "formalArrangeAgain" }
                  ]
                }, '重新排课'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                  },
                  on: {
                    click: () => {
                      this.formalRefund(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "formalRefund" }
                  ]
                }, '退款'),
              ])
            }
          }
        ],
        formalList: [],
        adviserList: [],
        total: 0,
        formalAllotModal: false,
        formalAllotData: {},
        formalArrangeModal: false,
        formalArrangeData: { dateList: [] },
        teacherList: [],
        formalRefundModal: false,
        formalRefundData: {}

      }
    },
    methods: {
      search() {
        this.postData.startDateTime = this.startDateTime && formatDate('YYYY-MM-DD hh:mm:ss', this.startDateTime) || null
        this.postData.endDateTime = this.endDateTime && formatDate('YYYY-MM-DD hh:mm:ss', this.endDateTime) || null
        this.getFormalList(() => { this.$Message.success('查询成功！') })
      },
      getFormalList(cb) {
        http.get({
          vm: this,
          url: '/manager/order-formal/list',
          data: this.postData,
          success: res => {
            this.formalList = res.data.list
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
      getTeacherList() {
        const { orderId, dateList } = this.formalArrangeData
        this.formalArrangeData.datesStr = dateList.map(d => {
          return formatDate('YYYY-MM-DD', d.date) + ' ' + d.time
        })
        http.get({
          vm: this,
          url: '/manager/teacher/queryTeacherByTimes',
          data: { orderId, dateTimes: JSON.stringify(this.formalArrangeData.datesStr), classType: 3 },
          success: res => {
            this.teacherList = res.data
            this.$Message.success('查询成功！')
          }
        })
      },
      getCourseList() {
        // /manager/course/listByThird?thirdId
      },
      // 分配顾问
      formalAllot({ orderId, version }) {
        this.formalAllotModal = true
        this.formalAllotData = { orderId, version }
      },
      saveFormalAllot() {
        if (!this.formalAllotData.adviserId) {
          this.$Message.error({
            content: '分配顾问失败，请先选择一个顾问！',
            duration: 5
          })
          return
        }
        http.post({
          vm: this,
          url: '/manager/order-formal/changeAdviser',
          data: this.formalAllotData,
          success: res => {
            this.$Message.success('分配顾问成功！')
            this.formalAllotData = {}
          }
        })
      },
      // 变更顾问
      formalChange({ orderId, version }) {
        this.formalAllotModal = true
        this.formalAllotData = { orderId, version }
      },
      // 排课
      formalArrange({ orderId, weekTimeCount, name }) {
        this.formalArrangeModal = true
        this.formalArrangeData.weekTimeCount = weekTimeCount
        this.formalArrangeData.name = name
        this.formalArrangeData.orderId = orderId
        this.formalArrangeData.url = '/manager/order-formal/arrangeCourse'
        this.teacherList = []
        for (let i = 0; i < weekTimeCount; i++) {
          this.formalArrangeData.dateList.push({ date: '', time: '', week: '' })
        }
      },
      // 重新排课
      formalArrangeAgain({ orderId, name }) {
        this.formalArrangeData.url = '/manager/order-formal/arrangeCourseAgain'
        this.formalArrangeData.name = name
        this.formalArrangeData.orderId = orderId
        this.teacherList = []
      },
      saveFormalArrange() {
        const { url, orderId, datesStr, teacherId } = this.formalArrangeData
        if (!url || !orderId || !datesStr || !teacherId) {
          this.$Message.error({
            content: '标星内容不能为空，请填写后重新提交！',
            duration: 5
          })
          return
        }
        http.post({
          vm: this,
          url,
          data: { orderId, datesStr, teacherId },
          success: res => {
            this.$Message.success('排课成功！')
            this.formalArrangeModal = false
          }
        })
      },
      cancelFormalArrange() {
        this.formalArrangeModal = false
      },
      // 退款
      formalRefund(row) {
        this.formalRefundModal = true
      },
      cancelFormalRefund() {
        this.formalRefundModal = false
      },
      submitFormalRefund() { },

      changePage(p) {
        this.postData.pageIndex = p
        this.getFormalList(() => { this.$Message.success('查询成功！') })
      },
      changePageSize(s) {
        this.postData.pageSize = s
        this.getFormalList(() => { this.$Message.success('查询成功！') })
      },
      onDateChange() {
        const dateList = this.formalArrangeData.dateList
        dateList.map((d, i) => {
          d.week = d.date && getWeek(d.date) || ''
        })
      },
      handleFileChange(e) {
        this.formalRefundData.file = e.target.files[0]
      },
      formalExport() {
        // const form = $('form')
        // form.attr('style', 'display: none')
        // form.attr('method', 'post')
        // form.attr('action', '/manager/order-formal/export')
        const { mobilePhone, status } = this.postData
        const { startDateTime, endDateTime } = this
        const formData = { mobilePhone, status, startDateTime: formatDate('YYYY-MM-DD hh:mm:ss', startDateTime), endDateTime: formatDate('YYYY-MM-DD hh:mm:ss', endDateTime) }
        const paramsArr = []
        for(let k in formData){
          if(formData[k]){
            paramsArr.push( k + '=' + formData[k] )
          }
        }
        const _params = paramsArr.join('&')
        const params = _params && '?' + _params
        window.open('http://47.94.157.27:8001/manager/order-formal/export' + params)
      }
    },
    mounted() {
      this.getFormalList()
      this.getAdviserList()
    }
  }
</script>