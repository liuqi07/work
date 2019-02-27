<template>
  <div>
    <Form :label-width="80" inline :model="postData">
      <FormItem label="手机号：" style="width: 200px;">
        <Input v-model="postData.mobilePhone" placeholder="请输入手机号"/>
      </FormItem>
      <FormItem label="订单号：" style="width: 200px;">
        <Input v-model="postData.orderNo" placeholder="订单号"/>
      </FormItem>
      <FormItem label="订单状态：" style="width: 200px;">
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
      <Button type="primary" @click="search" v-hasPermission="'search'" style="margin-left: 20px; margin-right: 10px;">
        查询
      </Button>
      <Button type="primary" @click="subCreate" v-hasPermission="'subCreate'" style="margin-right: 10px;">创建订单</Button>
      <Button type="primary" @click="subscribeExport" v-hasPermission="'subscribeExport'">导出</Button>

    </Form>
    <Card>
      <Table :columns="columns" :data="subscribeList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize"
            :page-size="postData.pageSize"
            :page-index="postData.pageIndex" style="margin-top: 10px"/>
    </Card>
    <Modal title="创建订单" v-model="subCreateShow">
      <Form :label-width="110" ref="subCreateForm" :model="subCreateData" :rules="subCreateFormRules">
        <FormItem prop="firstCode" label="课程一级分类：" style="width: 300px;">
          <Select v-model="subCreateData.firstCode" @on-change="firstChange('create')" @on-open-change="getFirstList">
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="secondCode" label="课程二级分类：" style="width: 300px;">
          <Select v-model="subCreateData.secondCode" @on-change="secondChange('create')">
            <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="thirdCode" label="课程三级分类：" style="width: 300px;">
          <Select v-model="subCreateData.thirdCode" @on-change="thirdChange('create')">
            <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="courseId" label="课程名称：" style="width: 300px;">
          <Select v-model="subCreateData.courseId">
            <Option v-for="item in courseList" :value="item.id" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="mobilePhone" label="学员手机号" style="width: 350px;">
          <Input v-model="subCreateData.mobilePhone" placeholder="请输入学员手机号" style="width: 120px; margin-right: 10px;"/>
          <Button type="primary" @click="queryStudent">查询</Button>
        </FormItem>
        <FormItem prop="realName" label="学员姓名" style="width: 300px;">
          <Input v-model="subCreateData.realName" :readonly="true" placeholder="请先查询学员"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button type="primary" @click="handleSubCreateData" :loading="subCreateLoading">确定</Button>
      </div>
    </Modal>
    <Modal title="分配/变更顾问" v-model="subscribeAllotModal">
      <Form :label-width="80">
        <FormItem label="选择顾问">
          <Select v-model="addSubscribeAllotData.adviserId" style="width: 300px;">
            <Option v-for="item in adviserList" :value="item.id" :key="item.id">{{item.realName}}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button type="primary" @click="saveSubscribeAllot">确定</Button>
      </div>
    </Modal>
    <Modal :title="subscribeArrangeTitle" v-model="subscribeArrangeModal">
      <Form :label-width="80">
        <FormItem label="剩余课时数量：">
          <Input-number v-model="subscribeArrangeData.surplusClassHour"
                        @on-change="surplusClassHourChange"/>
        </FormItem>
        <FormItem label="上课时间：">
          <Row v-for="(item,index) in subscribeArrangeData.dateList">
            <DatePicker type="date" v-model="subscribeArrangeData.dateList[index].date" @on-change="onDateChange"
                        :clearable="false" placeholder="选择日期"
                        style="width: 120px; margin-right: 5px;"></DatePicker>
            <TimePicker :steps="[1, 30, 60]" v-model="subscribeArrangeData.dateList[index].time" hide-disabled-options
                        :disabled-hours="[0,1,2,3,4,5,6,7,22,23]" :clearable="false" placeholder="选择时间段"
                        style="width: 100px; margin-right: 5px;"></TimePicker>
            <Input :value="subscribeArrangeData.dateList[index].week" style="width: 80px;" placeholder="星期" readonly/>
          </Row>
        </FormItem>
        <FormItem label="可用教师：">
          <Select v-model="subscribeArrangeData.teacherId" style="width: 200px;">
            <Option v-for="item in teacherList" :value="item.id" :key="item.id">{{item.realName}} {{item.zoomCode}}
            </Option>
          </Select>
          <Button type="primary" @click="getTeacherList" style="margin-left: 10px;">查询可用教师</Button>
        </FormItem>
        <FormItem label="课程级别：">
          <Select v-model="subscribeArrangeData.level" style="width: 200px;" @on-change="levelChange">
            <Option v-for="item in levelList" :value="item" :key="item">{{item}}</Option>
          </Select>
        </FormItem>
        <FormItem label="课时：" style="width: 200px;" required>
          <Select v-model="subscribeArrangeData.hour" clearable>
            <Option v-for="item in hourList" :value="item.hour" :key="item.hour">{{item.hour}}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelSubscribeArrange">取消</Button>
        <Button type="primary" @click="saveSubscribeArrange">确定</Button>
      </div>
    </Modal>
    <Modal title="转单" v-model="subscribeChangeOrderModal">
      <Form :label-width="120" :model="subscribeChangeOrderData" :rules="subscribeChangeOrderRules"
            ref="subscribeChangeOrder">
        <FormItem prop="orderNo" label="预约单号：" :label-width="100" style="width: 210px;">
          <span>{{subscribeChangeOrderData.orderNo}}</span>
        </FormItem>
        <Row>
          <Col :span="10">
            <FormItem prop="studentName" label="学员姓名：" :label-width="100" style="width: 210px;">
              <Input :value="subscribeChangeOrderData.studentName" disabled/>
            </FormItem>
          </Col>
          <Col :span="10">
            <FormItem prop="studentMobilePhone" label="手机电话：" :label-width="100" style="width: 210px;">
              <Input :value="subscribeChangeOrderData.studentMobilePhone" disabled/>
            </FormItem>
          </Col>
        </Row>
        <FormItem prop="firstCode" label="课程一级分类：" style="width: 300px;">
          <Select v-model="subscribeChangeOrderData.firstCode" @on-change="firstChange('change')">
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="secondCode" label="课程二级分类：" style="width: 300px;">
          <Select v-model="subscribeChangeOrderData.secondCode" @on-change="secondChange('change')">
            <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="thirdCode" label="课程三级分类：" style="width: 300px;">
          <Select v-model="subscribeChangeOrderData.thirdCode" @on-change="thirdChange('change')">
            <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="coursePackerId" label="套餐名称：" style="width: 300px;">
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
  import {formatDate, getWeek} from '@/libs/tools';

  export default {
    data() {
      return {
        subCreateLoading: false,
        subCreateShow: false,
        subCreateData: {},
        subCreateFormRules: {
          firstCode: [
            {required: true, message: '请选择一级分类', trigger: 'change'}
          ],
          secondCode: [
            {required: true, message: '请选择二级分类', trigger: 'change'}
          ],
          thirdCode: [
            {required: true, message: '请选择三级分类', trigger: 'change'}
          ],
          courseId: [
            {required: true, type: 'number', message: '请选择课程', trigger: 'change'}
          ],
          mobilePhone: [
            {required: true, message: '请输入学员手机号', trigger: 'blur'}
          ],
          realName: [
            {required: true, message: '请先通过学员电话查询', trigger: 'blur'}
          ]
        },
        postData: {pageIndex: 1, pageSize: 10},
        startDateTime: null,
        endDateTime: null,
        total: 0,
        columns: [
          {title: '预约订单编号', key: 'orderNo', align: 'center'},
          {title: '课程名称', key: 'courseName', align: 'center'},
          {title: '学员姓名', key: 'studentName', align: 'center'},
          {
            title: '手机号', key: 'studentMobilePhone', align: 'center'
          },
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
          {title: '消费课时', key: 'consumeClassHour', align: 'center'},
          {title: '剩余课时', key: 'surplusClassHour', align: 'center'},
          {title: '课程顾问', key: 'sysUserName', align: 'center'},
          {title: '任课教师', key: 'teacherName', align: 'center'},
          {title: '推荐人', key: 'recommendPhone', align: 'center'},
          {title: '下单时间', key: 'createTime', align: 'center'},
          {
            title: '操作', key: 'actions', width: 160, render: (h, params) => {
              const status = params.row.status
              const sysUserName = params.row.sysUserName
              return h('div', [
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px',
                    display: status === 1 && !sysUserName ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.subscribeAllot(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "subscribeAllot"}
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
                    display: (status !== 5 || status !== 6) && sysUserName ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.subscribeChange(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "subscribeChange"}
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
                    {name: 'hasPermission', value: "subscribeArrange"}
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
                    {name: 'hasPermission', value: "subscribeArrangeAgain"}
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
                    {name: 'hasPermission', value: "subscribeChangeOrder"}
                  ]
                }, '转单'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: status < 4 ? false : true
                  },
                  style: {
                    marginBottom: '3px'
                  },
                  on: {
                    click: () => {
                      this.overStatus(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "over"}
                  ]
                }, '完结'),
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
        levelList: [],
        subscribeArrangeData: {dateList: [{}], surplusClassHour: 0},
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
        subscribeChangeOrderRules: {
          orderNo: [
            {required: true, message: '', trigger: 'blur'}
          ],
          studentName: [
            {required: true, message: '学院姓名不能为空', trigger: 'blur'}
          ],
          studentMobilePhone: [
            {required: true, message: '学院手机号不能为空', trigger: 'blur'}
          ],
          firstCode: [
            {required: true, message: '一级分类不能为空', trigger: 'change'}
          ],
          secondCode: [
            {required: true, message: '二级分类不能为空', trigger: 'change'}
          ],
          thirdCode: [
            {required: true, message: '三级分类不能为空', trigger: 'change'}
          ],
          coursePackerId: [
            {required: true, type: 'number', message: '套餐名称不能为空', trigger: 'change'}
          ]
        },
        firstList: [],
        secondList: [],
        thirdList: [],
        courseList: [],
        hourList:[],
        coursePackerList: [],
        subscribeArrangeTitle: '',
      }
    },
    methods: {
      handleSubCreateData() {
        this.$refs['subCreateForm'].validate(valid => {
          if (valid) {
            this.subCreateLoading = true;
            const params = new URLSearchParams();
            params.append('courseId', this.subCreateData.courseId);
            params.append('studentId', this.subCreateData.studentId);
            http._post({
              vm: this,
              url: '/manager/order-subscribe/orderCreate',
              data: params,
              success: res => {
                this.$Message.success('创建成功!');
                this.subCreateShow = false;
                this.getSubscribeList();
                this.subCreateLoading = false;
              },
              error: res => {
                this.subCreateLoading = false;
              }
            })
          }
        })
      },
      //根据三级分类查询学生
      queryStudent() {
        this.subCreateData.realName = ''
        this.subCreateData.studentId = ''
        if (!this.subCreateData.mobilePhone) {
          this.$Message.error('请输入手机号后查询')
          return
        }
        http.get({
          vm: this,
          url: '/manager/student/list',
          data: {mobilePhone: this.subCreateData.mobilePhone, status: 1},
          success: res => {
            const studentList = res.data.list
            if (studentList.length > 0) {
              this.$Message.success('查询成功！')
              this.subCreateData = {
                ...this.subCreateData,
                realName: studentList[0].realName,
                studentId: studentList[0].id
              }
            } else {
              this.$Message.error('未查询到该学员！')
              this.subCreateData.realName = ''
              this.subCreateData.studentId = ''
            }
          }
        })
      },
      //创建预约订单
      subCreate() {
        this.subCreateShow = true;
        this.subCreateData = {};
        this.$refs['subCreateForm'].resetFields()
      },
      //订单置换为完结状态
      overStatus({orderId}) {
        this.$Modal.confirm({
          title: "Title",
          content: `确定将此预约订单置换为完结状态？`,
          loading: true,
          onOk: () => {
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            params.append('status', '4');
            http._post({
              vm: this,
              url: "/manager/order-subscribe/dealOrderStatus",
              data: params,
              success: res => {
                if (res.code === 1) {
                  this.$Message.success("状态置换成功!");
                  this.$Modal.remove();
                  this.getSubscribeList();
                } else {
                  this.$Message.error(res.msg);
                }
              }
            });
          }
        });
      },
      surplusClassHourChange(value) {
        if (this.subscribeArrangeData.surplusClassHour > this.subscribeArrangeData.dateList.length) {
          this.subscribeArrangeData.dateList.push({date: null, time: null, week: null})
        } else if (this.subscribeArrangeData.surplusClassHour < this.subscribeArrangeData.dateList.length) {
          this.subscribeArrangeData.dateList.splice(value)
        }
      },
      search() {
        this.postData.startDateTime = this.startDateTime && formatDate('YYYY-MM-DD hh:mm:ss', this.startDateTime) || null
        this.postData.endDateTime = this.endDateTime && formatDate('YYYY-MM-DD hh:mm:ss', this.endDateTime) || null
        this.getSubscribeList(() => {
          this.$Message.success('查询成功！')
        })
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
        const {orderId, dateList, surplusClassHour} = this.subscribeArrangeData
        const dateTimes = dateList.map(d => {
          if (d.date && d.time) {
            return formatDate('YYYY-MM-DD', d.date) + ' ' + d.time
          }
        })
        if (!dateTimes[0]) {
          this.$Message.error('请完整填写预约时间')
          return
        }
        dateTimes.length = surplusClassHour
        this.subscribeArrangeData.dateTimes = dateTimes
        http.get({
          vm: this,
          url: '/manager/teacher/queryTeacherByTimes',
          data: {orderId, dateTimes: JSON.stringify(this.subscribeArrangeData.dateTimes), classType: 2},
          success: res => {
            this.teacherList = res.data
            this.$Message.success('查询成功！')
          },
          error: res => {
            this.teacherList = [];
          }
        })
      },
      getClassBeginTime() {
        http.get({
          vm: this,
          url: '/manager/order-subscribe/getClassBeginTime',
          data: {orderId: this.subscribeArrangeData.orderId},
          success: res => {
            const dateList = res.data || []
            this.subscribeArrangeData.dateList = dateList.map((d, i) => {
              return {
                date: d.substr(0, 10),
                time: d.substr(11, 8),
                week: getWeek(d)
              }
            })
          }
        })
      },
      subscribeExport() {
      },
      // 分配顾问
      subscribeAllot({orderId, version}) {
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
            this.subscribeAllotModal = false
            this.addSubscribeAllotData = {}
            this.getSubscribeList()
          }
        })
      },
      subscribeChange({orderId, version}) {
        this.subscribeAllotModal = true
        this.addSubscribeAllotData = {
          orderId, version
        }
      },
      // 排课
      subscribeArrange({orderId, surplusClassHour,courseId}) {
        let dateList = [];
        for (let i = 0; i < surplusClassHour; i++) {
          dateList.push({date: null, time: null, week: null});
        }
        this.subscribeArrangeData = {dateList: dateList};
        this.subscribeArrangeModal = true;
        this.subscribeArrangeData.orderId = orderId;
        this.subscribeArrangeData.courseId = courseId;
        this.subscribeArrangeData.surplusClassHour = surplusClassHour;
        this.subscribeArrangeTitle = '排课';
        this.subscribeArrangeData.url = '/manager/order-subscribe/arrangeCourse';
        this.teacherList = [];
        this.getClassBeginTime();
        this.getCourseLevels(orderId);
      },
      // 重新排课
      subscribeArrangeAgain({orderId, surplusClassHour,courseId}) {
        let dateList = [];
        for (let i = 0; i < surplusClassHour; i++) {
          dateList.push({date: null, time: null, week: null});
        }
        this.subscribeArrangeData = {dateList: dateList};
        this.subscribeArrangeData.teacherId = null;
        this.subscribeArrangeModal = true;
        this.subscribeArrangeData.orderId = orderId;
        this.subscribeArrangeData.courseId = courseId;
        this.subscribeArrangeData.surplusClassHour = surplusClassHour;
        this.subscribeArrangeTitle = '重新排课';
        this.subscribeArrangeData.url = '/manager/order-subscribe/arrangeCourseAgain';
        this.teacherList = [];
        this.getCourseLevels(orderId);
      },
      getCourseLevels(orderId) {
        const url = '/manager/course/getCourseLevels';
        http.get({
          vm: this,
          url,
          data: {orderId: orderId, classType: 2},
          success: res => {
            this.levelList = res.data;
          }
        })
      },
      saveSubscribeArrange() {
        const {orderId, teacherId, dateTimes: datesStr, url, level,hour,courseId} = this.subscribeArrangeData
        if (!teacherId) {
          this.$Message.error({
            content: '请选择教师后再进行操作！',
            duration: 5
          })
          return
        }
        http.post({
          vm: this,
          url,
          data: {orderId, teacherId, datesStr, level,hour,courseId},
          success: res => {
            this.$Message.success('排课成功！')
            this.subscribeArrangeModal = false
            this.getSubscribeList()
            this.subscribeArrangeData = {dateList: [{}]}
          }
        })
      },
      cancelSubscribeArrange() {
        this.subscribeArrangeModal = false
        this.subscribeArrangeData = {dateList: [{}]}
      },
      // 转单
      subscribeChangeOrder({orderId, orderNo, studentName, studentMobilePhone}) {
        this.subscribeChangeOrderModal = true
        this.subscribeChangeOrderData = {
          ...this.subscribeChangeOrderData,
          orderId,
          orderNo,
          studentName,
          studentMobilePhone
        }
        this.getFirstList()
        // this.subscribeChangeOrderData
      },
      handleSubmit() {
        this.$refs['subscribeChangeOrder'].validate(valid => {
          if (valid) {
            http.post({
              vm: this,
              url: '/manager/order-formal/orderCreateBySubscribe',
              data: this.subscribeChangeOrderData,
              success: res => {
                this.$Message.success('转单成功！')
                this.subscribeChangeOrderModal = false
                this.$refs['subscribeChangeOrder'].resetFields()
                this.getSubscribeList()
              }
            })
          }
        })
      },
      onDateChange() {
        const dateList = this.subscribeArrangeData.dateList
        dateList.map(d => {
          console.log(getWeek(d.date))
          d.week = getWeek(d.date)
        })
        this.subscribeArrangeData.dateList = dateList;
      },
      cancel() {
        this.subscribeChangeOrderModal = false
        this.subscribeAllotModal = false
        this.$refs['subscribeChangeOrder'].resetFields()
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
          data: {type: 1},
          success: res => {
            this.firstList = res.data
          }
        })
      },
      getSecondList(parentCode) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: {type: 2, parentCode: parentCode},
          success: res => {
            this.secondList = res.data
          }
        })
      },
      getThirdList(parentCode) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: {type: 3, parentCode: parentCode},
          success: res => {
            this.thirdList = res.data
          }
        })
      },
      getCoursePackerList() {
        http.get({
          vm: this,
          url: '/manager/course-package/listByThird',
          data: {code: this.subscribeChangeOrderData.thirdCode},
          success: res => {
            this.coursePackerList = res.data
          }
        })
      },
      firstChange(val) {
        let parentCode = null;
        if (val === 'create') {
          this.subCreateData.secondCode = null;
          this.subCreateData.thirdCode = null;
          this.subCreateData.courseId = null;
          parentCode = this.subCreateData.firstCode;
        } else if ('change') {
          this.subscribeChangeOrderData.secondCode = null;
          this.subscribeChangeOrderData.thirdCode = null;
          this.subscribeChangeOrderData.coursePackerId = null;
          parentCode = this.subscribeChangeOrderData.firstCode;
        }
        val && this.getSecondList(parentCode)
      },
      secondChange(val) {
        let parentCode = null;
        if (val === 'create') {
          this.subCreateData.thirdCode = null;
          this.subCreateData.courseId = null;
          parentCode = this.subCreateData.secondCode;
        } else if ('change') {
          this.subscribeChangeOrderData.thirdCode = null;
          this.subscribeChangeOrderData.coursePackerId = null;
          parentCode = this.subscribeChangeOrderData.secondCode;
        }
        val && this.getThirdList(parentCode)
      },
      thirdChange(val) {
        if (val === 'create') {
          this.subCreateData.courseId = null;
          val && this.getCourseList();
        } else if ('change') {
          this.subscribeChangeOrderData.coursePackerId = null;
          val && this.getCoursePackerList()
        }
      },
      getCourseList() {
        this.courseList = []
        http.get({
          vm: this,
          url: '/manager/course/listByThird',
          data: {code: this.subCreateData.thirdCode},
          success: res => {
            this.courseList = res.data
          }
        })
      },
      levelChange() {
        this.subscribeArrangeData.hour = null;
        this.getHourList(this.subscribeArrangeData.courseId, this.subscribeArrangeData.level)
      },
      getHourList(courseId, level) {
        console.log(this.subscribeArrangeData);
        if (courseId && level) {
          http.get({
            vm: this,
            url: '/manager/course/getHoursByCourseAndLevel',
            data: {courseId: courseId, level: level},
            success: res => {
              this.hourList = res.data;
            }
          })
        }
      },
      coursePackerChange() {
      },
      changePage(p) {
        this.postData.pageIndex = p
        this.getSubscribeList()
      },
      changePageSize(s) {
        this.postData.pageSize = s
        this.getSubscribeList()
      },
      subscribeExport() {
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
        window.open('http://www.zilongshu.com/manager/order-subscribe/export' + params)
      }

    },
    mounted() {
      this.getSubscribeList()
      this.getAdviserList()
    }
  }
</script>
