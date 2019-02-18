<style>
  .detailRow {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    margin-left: 40px;
  }

  .detailRow span {
    display: inline-block;
    width: 50%;
  }
</style>


<template>
  <div>
    <Form :label-width="80" inline :model="postData">
      <FormItem label="手机号：" :label-width="70" style="width: 200px;">
        <Input v-model="postData.mobilePhone" placeholder="请输入手机号"/>
      </FormItem>
      <FormItem label="订单号：" :label-width="70" style="width: 200px;">
        <Input v-model="postData.orderNo" placeholder="请输入订单号"/>
      </FormItem>
      <FormItem label="订单状态：" style="width: 200px;">
        <Select v-model="postData.status" clearable>
          <Option :value="1">未支付</Option>
          <Option :value="2">已支付/未分配顾问</Option>
          <Option :value="3">已支付/已分配顾问/未排课</Option>
          <Option :value="4">上课中</Option>
          <Option :value="5">退款中</Option>
          <Option :value="7">已完结</Option>
        </Select>
      </FormItem>
      <FormItem label="开始日期：" style="width: 220px;">
        <DatePicker type="datetime" placeholder="请选择开始时间" v-model="startDateTime"></DatePicker>
      </FormItem>
      <FormItem label="结束日期：" style="width: 220px;">
        <DatePicker type="datetime" placeholder="请选择结束时间" v-model="endDateTime"></DatePicker>
      </FormItem>
      <Button type="primary" @click="search" v-hasPermission="'search'" style="margin-left: 20px; margin-right: 10px;">
        查询
      </Button>
      <Button type="primary" @click="formalAdd" v-hasPermission="'formalAdd'" style="margin-right: 10px;">创建订单</Button>
      <Button type="primary" @click="formalExport" v-hasPermission="'formalExport'">导出</Button>
    </Form>
    <Card style="margin-top: 5px;">
      <Table :columns="columns" :data="formalList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize"
            :page-size="postData.pageSize"
            :page-index="postData.pageIndex" style="margin-top: 10px"/>
    </Card>
    <Modal title="分配/变更顾问" v-model="formalAllotModal">
      <Form :label-width="80">
        <FormItem label="选择顾问" style="width: 300px;">
          <Select v-model="formalAllotData.adviserId">
            <Option v-for="item in adviserList" :value="item.id" :key="item.id">{{item.realName}}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button type="primary" @click="saveFormalAllot">确定</Button>
      </div>
    </Modal>
    <Modal title="排课" v-model="formalArrangeModal">
      <Form :label-width="100">
        <FormItem label="课程名称：" required>
          <Input :value="formalArrangeData.name" disabled/>
        </FormItem>
        <FormItem label="上课时间：" required>
          <Row v-for="i in formalArrangeData.weekTimeCount" :key="i" style="margin-bottom: 5px;">
            <DatePicker type="date" v-model="formalArrangeData.dateList[i-1].date" @on-change="onDateChange"
                        :clearable="false" placeholder="选择日期"
                        style="width: 120px; margin-right: 5px;"></DatePicker>
            <TimePicker :steps="[1, 30, 60]" v-model="formalArrangeData.dateList[i-1].time" hide-disabled-options
                        :disabled-hours="[0,1,2,3,4,5,6,7,22,23]"
                        :clearable="false" placeholder="选择时间段" style="width: 100px; margin-right: 5px;"></TimePicker>
            <Input v-model="formalArrangeData.dateList[i-1].week" style="width: 80px;" placeholder="星期" readonly/>
          </Row>
        </FormItem>
        <FormItem label="可用教师：" required>
          <Select v-model="formalArrangeData.teacherId" style="width: 200px;">
            <Option v-for="item in teacherList" :value="item.id" :key="item.id">{{item.realName}} {{item.zoomCode}}
            </Option>
          </Select>
          <Button type="primary" @click="getTeacherList" style="margin-left: 10px;">查询可用教师</Button>
        </FormItem>
        <FormItem label="课程名称：" style="width: 300px;" required>
          <Select v-model="formalArrangeData.courseId" style="width: 200px;">
            <Option v-for="item in courseList" :value="item.id" :key="item.id">{{item.name}}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelFormalArrange">取消</Button>
        <Button type="primary" @click="saveFormalArrange">确定</Button>
      </div>
    </Modal>
    <Modal title="退款" v-model="formalRefundModal" :width="600">
      <div>
        <p class="detailRow">
          <span><b>订单编号：</b> {{formalRefundData.orderNo}}</span>
          <span></span>
        </p>
        <p class="detailRow">
          <span><b>学员姓名：</b> {{formalRefundData.studentRealName}}</span>
          <span><b>手机电话：</b> {{formalRefundData.studentMobilePhone}}</span>
        </p>
        <p class="detailRow">
          <span><b>套餐名称：</b> {{formalRefundData.name}}</span>
          <span></span>
        </p>
        <p class="detailRow">
          <span><b>课程顾问：</b> {{formalRefundData.sysUserRealName}}</span>
          <span><b>任课教师：</b> {{formalRefundData.teacherRealName}}</span>
        </p>
        <p class="detailRow">
          <span><b>消费课时：</b> {{formalRefundData.consumeClassHour}}</span>
          <span><b>剩余课时：</b> {{formalRefundData.surplusClassHour}}</span>
        </p>
        <p class="detailRow">
          <span><b>课程总价：</b> {{formalRefundData.allPrice}}</span>
          <span><b>实收金额：</b> {{formalRefundData.orderPrice}}</span>
        </p>
        <p class="detailRow">
          <span><b>优惠价格：</b> {{formalRefundData.discountAllPirce}}</span>
          <span><b>应退金额：</b> {{formalRefundData.shouldRefundAmt}}</span>
        </p>
      </div>
      <div slot="footer">
        <Button type="error" @click="cancelFormalRefund">取消</Button>
        <Button type="primary" @click="submitFormalRefund" :disabled="submitFormalRefundFlag">确定</Button>
      </div>
    </Modal>
    <Modal title="创建订单" v-model="formalAddModal">
      <Form :label-width="110" ref="formalAdd" :model="formalAddData" :rules="formalAddRules">
        <FormItem prop="firstCode" label="课程一级分类：" style="width: 300px;">
          <Select v-model="formalAddData.firstCode" @on-change="firstChange" @on-open-change="onFirstOpen">
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="secondCode" label="课程二级分类：" style="width: 300px;">
          <Select v-model="formalAddData.secondCode" @on-change="secondChange">
            <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="thirdCode" label="课程三级分类：" style="width: 300px;">
          <Select v-model="formalAddData.thirdCode" @on-change="thirdChange">
            <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="coursePackerId" label="套餐名称：" style="width: 300px;">
          <Select v-model="formalAddData.coursePackerId">
            <Option v-for="item in coursePackerList" :value="item.id" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="mobilePhone" label="学员手机号" style="width: 350px;">
          <Input v-model="formalAddData.mobilePhone" placeholder="请输入学员手机号" style="width: 120px; margin-right: 10px;"/>
          <Button type="primary" @click="queryStudent">查询</Button>
        </FormItem>
        <FormItem prop="realName" label="学员姓名" style="width: 300px;">
          <Input v-model="formalAddData.realName" :readonly="true" placeholder="请先查询学员"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button type="primary" @click="handleFormalAdd">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from '@/libs/http'
  import {formatDate, getWeek} from '@/libs/tools';

  export default {
    data() {
      return {
        postData: {pageIndex: 1, pageSize: 10},
        startDateTime: null,
        endDateTime: null,
        columns: [
          {title: '订单编号', key: 'orderNo', algin: 'center'},
          {title: '课程名称', key: 'name', algin: 'center'},
          {title: '学员姓名', key: 'studentRealName', algin: 'center'},
          {
            title: '手机号码', key: 'studentMobilePhone', algin: 'center'
          },
          {title: '订单状态', key: 'statusStr', algin: 'center'},
          {title: '课程总价', key: 'allPrice', algin: 'center'},
          {title: '优惠总价', key: 'realAmt', algin: 'center'},
          {title: '总课时', key: 'allHour', algin: 'center'},
          {title: '消费课时', key: 'consumeClassHour', algin: 'center'},
          {title: '剩余课时', key: 'surplusClassHour', algin: 'center'},
          {title: '课程顾问', key: 'sysUserRealName', algin: 'center'},
          {title: '任课教师', key: 'teacherRealName', algin: 'center'},
          {title: '推荐人', key: 'recommendPhone', algin: 'center'},
          {title: '下单时间', key: 'createTime', algin: 'center'},
          {
            title: '操作', key: 'actions', algin: 'center', width: 180, render: (h, params) => {
              const {status, consumeClassHour, surplusClassHour, isFree} = params.row;
              console.log(isFree);
              return h('div', [
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                    // disabled: status === 1 ? true : false
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: (status === 1 || status === 2) ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.formalAllot(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "formalAllot"}
                  ]
                }, '分配顾问'),
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                    // disabled: status === 7 ? true : false
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: (status === 3 || status === 4) ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.formalChange(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "formalChange"}
                  ]
                }, '变更顾问'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    // disabled: status === 1 ? true : false
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: (status === 3 || status === 4) ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.formalArrange(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "formalArrange"}
                  ]
                }, '排课'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    // disabled: (status === 7) ? true : false
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: (status === 4) ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      console.log(params.row);
                      this.formalArrangeAgain(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "formalArrangeAgain"}
                  ]
                }, '重新排课'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                    // disabled: (status === 1 || consumeClassHour > 3 || surplusClassHour === 0) ? true : false
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: ((status === 2 || status === 3 || status === 4) && !isFree) ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.formalRefund(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "formalRefund"}
                  ]
                }, '退款'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: status === 1 ? false : true
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: status === 1 ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.freePay(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "freePay"}
                  ]
                }, '免支付'),
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
        formalArrangeData: {dateList: []},
        teacherList: [],
        formalRefundModal: false,
        formalRefundData: {},
        submitFormalRefundFlag: true,
        courseList: [],
        formalAddModal: false,
        formalAddData: {},
        formalAddRules: {
          firstCode: [
            {required: true, message: '请选择一级分类', trigger: 'change'}
          ],
          secondCode: [
            {required: true, message: '请选择二级分类', trigger: 'change'}
          ],
          thirdCode: [
            {required: true, message: '请选择三级分类', trigger: 'change'}
          ],
          coursePackerId: [
            {required: true, type: 'number', message: '请选择套餐', trigger: 'change'}
          ],
          mobilePhone: [
            {required: true, message: '请输入学员手机号', trigger: 'blur'}
          ],
          realName: [
            {required: true, message: '请先通过学员电话查询', trigger: 'blur'}
          ]
        },
        firstList: [],
        secondList: [],
        thirdList: [],
        coursePackerList: [],
      }
    },
    methods: {
      //免支付
      freePay({orderId}) {
        this.$Modal.confirm({
          title: "Title",
          content: `确定对此正式订单进行免支付？`,
          loading: true,
          onOk: () => {
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            http._post({
              vm: this,
              url: "/manager/order-formal/freePay",
              data: params,
              success: res => {
                if (res.code === 1) {
                  this.$Message.success("免支付成功!");
                  this.$Modal.remove();
                  this.getFormalList();
                } else {
                  this.$Message.error(res.msg);
                }
              }
            });
          }
        });
      },
      search() {
        this.postData.startDateTime = this.startDateTime && formatDate('YYYY-MM-DD hh:mm:ss', this.startDateTime) || null
        this.postData.endDateTime = this.endDateTime && formatDate('YYYY-MM-DD hh:mm:ss', this.endDateTime) || null
        this.getFormalList(() => {
          this.$Message.success('查询成功！')
        })
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
        const {orderId, dateList} = this.formalArrangeData
        const datesStr = dateList.map(d => {
          if (d.date && d.time) {
            return formatDate('YYYY-MM-DD', d.date) + ' ' + d.time
          }
        })
        for (let i = 0; i < datesStr.length; i++) {
          if (!datesStr[i]) {
            this.$Message.error(`请完整填写第 ${i + 1} 组日期`)
            return
          }
        }
        this.formalArrangeData.datesStr = datesStr
        http.get({
          vm: this,
          url: '/manager/teacher/queryTeacherByTimes',
          data: {orderId, dateTimes: JSON.stringify(this.formalArrangeData.datesStr), classType: 3},
          success: res => {
            this.teacherList = res.data
            this.$Message.success('查询成功！')
          }
        })
      },
      getCourseList() {
        this.courseList = []
        http.get({
          vm: this,
          url: '/manager/course/listByThird',
          data: {thirdId: this.formalArrangeData.thirdId},
          success: res => {
            this.courseList = res.data
          }
        })
      },
      getTeacher(id) {
        http.get({
          vm: this,
          url: '/manager/teacher/detailSmall',
          data: {id: id},
          success: res => {
            this.teacherList.push(res.data)
            this.formalArrangeData.teacherId = res.data.id;
          }
        })
      },
      // 分配顾问
      formalAllot({orderId, version}) {
        this.formalAllotModal = true
        this.formalAllotData = {orderId, version}
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
            this.getFormalList()
            this.formalAllotModal = false
            this.formalAllotData = {}
          }
        })
      },
      cancel() {
        this.formalAllotModal = false
        this.formalAllotData = {}
        this.formalAddModal = false
        this.formalAddData = {}
        this.$refs['formalAdd'].resetFields()
      },
      // 变更顾问
      formalChange({orderId, version}) {
        this.formalAllotModal = true
        this.formalAllotData = {orderId, version}
      },
      // 排课
      formalArrange({orderId, weekTimeCount, name, thirdId, teacherId}) {
        this.formalArrangeData.dateList = []
        this.formalArrangeModal = true
        this.formalArrangeData.weekTimeCount = weekTimeCount
        this.formalArrangeData.name = name
        this.formalArrangeData.orderId = orderId
        this.formalArrangeData.thirdId = thirdId
        this.formalArrangeData.url = '/manager/order-formal/arrangeCourse'
        this.getCourseList()
        this.teacherList = []
        if (teacherId) {
          this.getTeacher(teacherId);
        }
        for (let i = 0; i < weekTimeCount; i++) {
          this.formalArrangeData.dateList.push({date: '', time: '', week: ''})
        }
      },
      // 重新排课
      formalArrangeAgain({orderId, name, weekTimeCount, thirdId, teacherId}) {
        this.formalArrangeData.dateList = []
        this.formalArrangeModal = true
        this.formalArrangeData.weekTimeCount = weekTimeCount
        this.formalArrangeData.name = name
        this.formalArrangeData.orderId = orderId
        this.formalArrangeData.thirdId = thirdId
        this.formalArrangeData.url = '/manager/order-formal/arrangeCourseAgain'
        this.getCourseList()
        this.teacherList = []
        if (teacherId) {
          this.getTeacher(teacherId);
        }
        for (let i = 0; i < weekTimeCount; i++) {
          this.formalArrangeData.dateList.push({date: '', time: '', week: ''})
        }
      },
      saveFormalArrange() {
        const {url, orderId, datesStr, teacherId, courseId = -1} = this.formalArrangeData
        console.log(this.formalArrangeData);
        if (!teacherId) {
          this.$Message.error({
            content: '请选择教师',
            duration: 5
          })
          return
        } else if (!courseId) {
          this.$Message.error({
            content: '请选择课程',
            duration: 5
          })
          return
        }
        http.post({
          vm: this,
          url,
          data: {orderId, datesStr, teacherId, courseId},
          success: res => {
            this.$Message.success('排课成功！')
            this.getFormalList()
            this.formalArrangeModal = false
          }
        })
      },
      cancelFormalArrange() {
        this.formalArrangeModal = false
      },
      // 打开退款弹框
      formalRefund({orderId}) {
        http.get({
          vm: this,
          url: '/manager/order-formal/refundDetail',
          data: {orderId},
          success: res => {
            if (res.code === 1) {
              this.formalRefundModal = true
              this.submitFormalRefundFlag = false
              this.formalRefundData = res.data
            }
          }
        })
      },
      cancelFormalRefund({orderId}) {
        this.formalRefundModal = false
        this.formalRefundData = {}
      },
      submitFormalRefund() {
        http.post({
          vm: this,
          url: '/manager/order-formal/refund',
          data: {orderId: this.formalRefundData.orderId},
          success: res => {
            this.submitFormalRefundFlag = false;
            this.$Message.success('退款申请提交成功!');
            this.getFormalList();
            this.formalRefundModal = false;
          },
          error: res => {
            this.submitFormalRefundFlag = false;
          }
        })
      },

      changePage(p) {
        this.postData.pageIndex = p
        this.getFormalList()
      },
      changePageSize(s) {
        this.postData.pageSize = s
        this.getFormalList()
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
        const {mobilePhone, status} = this.postData
        const {startDateTime, endDateTime} = this
        const formData = {
          mobilePhone,
          status,
          startDateTime: formatDate('YYYY-MM-DD hh:mm:ss', startDateTime),
          endDateTime: formatDate('YYYY-MM-DD hh:mm:ss', endDateTime)
        }
        const paramsArr = []
        for (let k in formData) {
          if (formData[k]) {
            paramsArr.push(k + '=' + formData[k])
          }
        }
        const _params = paramsArr.join('&')
        const params = _params && '?' + _params
        window.open('http://www.zilongshu.com/manager/order-formal/export' + params)
      },
      formalAdd() {
        this.formalAddModal = true
        this.formalAddData = {}
        this.$refs['formalAdd'].resetFields()
      },
      queryStudent() {
        this.formalAddData.realName = ''
        this.formalAddData.studentId = ''
        if (!this.formalAddData.mobilePhone) {
          this.$Message.error('请输入手机号后查询')
          return
        }
        http.get({
          vm: this,
          url: '/manager/student/list',
          data: {mobilePhone: this.formalAddData.mobilePhone, status: 1},
          success: res => {
            const studentList = res.data.list
            if (studentList.length > 0) {
              this.$Message.success('查询成功！')
              this.formalAddData = {
                ...this.formalAddData,
                realName: studentList[0].realName,
                studentId: studentList[0].id
              }
            } else {
              this.$Message.error('未查询到该学员！')
              this.formalAddData.realName = ''
              this.formalAddData.studentId = ''
            }
          }
        })
      },
      handleFormalAdd() {
        this.$refs['formalAdd'].validate(valid => {
          if (valid) {
            const {coursePackerId, studentId} = this.formalAddData
            http.post({
              vm: this,
              url: '/manager/order-formal/orderCreate',
              data: {coursePackerId, studentId},
              success: res => {
                this.$Message.success('创建成功！')
                this.formalAddModal = false
                this.formalAddData = {}
                this.getFormalList()
                this.$refs['formalAdd'].resetFields()
              }
            })
          }
        })
      },
      /* ---------  四级联动 ----------- */

      onFirstOpen() {
        this.getFirstList()
      },
      getFirstList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: {type: 1},
          success: res => {
            this.firstList = res.data
          }
        })
      },
      getSecondList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: {type: 2, parentCode: this.formalAddData.firstCode},
          success: res => {
            this.secondList = res.data
          }
        })
      },
      getThirdList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: {type: 3, parentCode: this.formalAddData.secondCode},
          success: res => {
            this.thirdList = res.data
          }
        })
      },
      getCoursePackerList() {
        http.get({
          vm: this,
          url: '/manager/course-package/listByThird',
          data: {code: this.formalAddData.thirdCode},
          success: res => {
            this.coursePackerList = res.data
          }
        })
      },
      firstChange(val) {
        this.formalAddData.secondCode = null
        this.formalAddData.thirdCode = null
        this.formalAddData.coursePackerId = null
        val && this.getSecondList()
      },
      secondChange(val) {
        this.formalAddData.thirdCode = null
        this.formalAddData.coursePackerId = null
        val && this.getThirdList()
      },
      thirdChange(val) {
        this.formalAddData.coursePackerId = null
        val && this.getCoursePackerList()
      },
    },
    mounted() {
      this.getFormalList()
      this.getAdviserList()
    }
  }
</script>
