<style>
  .comment-detail-title {
    margin-top: 10px;
  }
</style>

<template>
  <div>
    <Form :model="postData" :label-width="80" inline>
      <FormItem label="手机号码：" style="width: 210px;">
        <Input v-model="postData.studentMobilePhone" placeholder="请输入学员手机号码" />
      </FormItem>
      <FormItem label="学员姓名：" style="width: 210px;">
        <Input v-model="postData.studentRealName" placeholder="请输入学员姓名" />
      </FormItem>
      <FormItem label="任课教师：" style="width: 210px;">
        <Input v-model="postData.teacherRealName" placeholder="请输入任课教师姓名" />
      </FormItem>
      <FormItem label="二级分类：" style="width: 210px;">
          <Select v-model="postData.secondCode" @on-change="secondChange" @on-open-change="secondOpenChange" clearable>
            <Option v-for="item in postData.secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="三级分类：" style="width: 210px;">
          <Select v-model="postData.thirdCode" @on-change="thirdChange" clearable>
            <Option v-for="item in postData.thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
      <Button type="primary" @click="query" style="margin-left: 20px;">查询</Button>
    </Form>
    <Card>
      <Table :columns="columns" :data="courseList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal v-model="detailModal" :width="600">
      <p class="comment-detail-title">课程等级： <span>{{lookCommentData.courseLevel}}</span></p>
      <p class="comment-detail-title">教师评语：</p>
      <Tag class="comment-detail-title" v-for="(item, index) in lookCommentData.labels" :color="item.color" :key="index">{{item.desc}}</Tag>
      <Input class="comment-detail-title" type="textarea" :value="lookCommentData.commentDesc" :rows="3" readonly disabled />
      <div slot="footer">
        <Button type="primary" @click="detailModal=false">关闭</Button>
      </div>
    </Modal>
    <Modal title="考试结果" v-model='lookExamModal' :width="860">
      <Row>
        <Col :span="8"> 星级：
        <Rate disabled v-model="lookExamData.result" allow-half :count="3" />
        </Col>
        <Col :span="8"> 分数：
        <Input :value="lookExamData.score" style="width: 100px;" readonly />
        </Col>
      </Row>
      <Card style="margin-top: 10px;">
        <Table border :columns="lookExamColumns" :data="lookExamData.details"></Table>
      </Card>
      <div slot="footer">
        <Button type="primary" @click="lookExamModal=false">关闭</Button>
      </div>
    </Modal>
    <Modal :title="uploadTitle" v-model="uploadModal">
      <Button @click="openVideo" v-if="uploadPlayBack" type="success" style="margin-right: 50px;">查看回放</Button>
      <input type="file" accept=".mp4,.MPEG4" @change="handleFileChange">
      <div slot="footer" >
        <Button @click="cancel" style="margin-right: 10px;">取消</Button>
        <Button @click="uploadFile" type="primary" >确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from '@/libs/http';
  import { formatDate } from '@/libs/tools'
  export default {
    data() {
      return {
        postData: { pageIndex: 1, pageSize: 10, secondList: [], thirdList: [] },
        columns: [
          { title: '学员编号', key: 'studentCode', align: 'center' },
          { title: '学员姓名', key: 'studentRealName', align: 'center' },
          { title: '手机号码', key: 'studentMobilePhone', align: 'center', render: (h, params) => {
            const studentMobilePhone = params.row.studentMobilePhone
            return h('div', studentMobilePhone && studentMobilePhone.replace(studentMobilePhone.substr(3, 4), '****') || '')
          }  },
          { title: '二级分类', key: 'secondName', align: 'center' },
          { title: '三级分类', key: 'thirdName', align: 'center' },
          { title: '课程名称', key: 'courseName', align: 'center' },
          {
            title: '上课日期', key: 'classBeginTime', align: 'center', render: (h, params) => {
              return h('div', {}, params.row.classBeginTime.substr(0, 10))
            }
          },
          {
            title: '星期', key: 'classBeginTime', align: 'center', render: (h, params) => {
              const weekNum = new Date(params.row.classBeginTime).getDay()
              let week = ''
              switch (weekNum) {
                case 1: week = '周一'; break;
                case 2: week = '周二'; break;
                case 3: week = '周三'; break;
                case 4: week = '周四'; break;
                case 5: week = '周五'; break;
                case 6: week = '周六'; break;
                case 7: week = '周日'; break;
              }
              return h('div', {}, week)
            }
          },
          {
            title: '上课时间', key: 'classBeginTime', align: 'center', render: (h, params) => {
              return h('div', {}, params.row.classBeginTime.substr(11, 5))
            }
          },
          { title: '任课教师', key: 'teacherRealName', align: 'center' },
          { title: '课程顾问 ', key: 'sysUserRealName', align: 'center' },
          {
            title: '状态', key: 'status', align: 'center', render: (h, params) => {
              let statusStr = ''
              switch (params.row.status) {
                case 1:
                  statusStr = '未上课'
                  break;
                case 2:
                  statusStr = '已上课'
                  break;
                case 3:
                  statusStr = '已退款'
                  break;
              }
              return h('div', {}, statusStr)
            }
          },
          {
            title: '操作', key: 'actions', align: 'center', width: 200, render: (h, params) => {
              const uploadPlayBack = params.row.uploadPlayBack
              return h('div', [
                h('Button', {
                  props: {
                    type: uploadPlayBack ? 'success' : 'primary',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px'
                  },
                  on: {
                    click: () => {
                      this.upload({...params.row, uploadPlayBack})
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "upload" }
                  ]
                }, uploadPlayBack ? '查看课程回放' : '上传课程回放'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px'
                  },
                  on: {
                    click: () => {
                      this.lookComment(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "lookComment" }
                  ]
                }, '查看评价'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px'
                  },
                  on: {
                    click: () => {
                      this.lookTask(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "lookTask" }
                  ]
                }, '查看作业'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                  },
                  style: {
                    marginBottom: '3px'
                  },
                  on: {
                    click: () => {
                      this.lookExam(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "lookExam" }
                  ]
                }, '查看试卷')
              ])
            }
          }
        ],
        courseList: [],
        total: 0,
        lookCommentData: {},
        detailModal: false,
        lookTaskModal: false,
        // lookExamData: {"details":[{"optionList":[{"code":"A","desc":"yes,he is right","order":1},{"code":"B","desc":"yes,he is right","order":2},{"code":"C","desc":"yes,he is right","order":3},{"code":"D","desc":"yes,he is right","order":4}],"question":"Are you a gog?","rightAnswer":"A","status":1,"type":1},{"answer":"C","optionList":[{"code":"A","desc":"yes,he is right","order":1},{"code":"B","desc":"yes,he is right","order":2},{"code":"C","desc":"yes,he is right","order":3},{"code":"D","desc":"yes,he is right","order":4}],"rightAnswer":"D","status":2,"type":1},{"answer":"Yes","optionList":[],"question":"Are you a gog?","rightAnswer":"Yes","status":3,"type":2}],"result":2,"score":67.0},
        lookExamData: {},
        lookExamModal: false,
        lookExamColumns: [
          { title: '序号', type: 'index', align: 'center', width: 60 },
          {
            title: '题型', key: 'type', align: 'center', width: 80, render: (h, params) => {
              return h('div', {}, params.row.type === 1 ? '选择题' : '填空题')
            }
          },
          { title: '问题', key: 'question', align: 'center', width: 200 },
          {
            title: '选项', key: 'optionList', align: 'center', width: 200, render: (h, params) => {
              const { optionList: list, type } = params.row
              return list.map(item => {
                return h('div', {
                  style: {
                    marginTop: '3px',
                    marginBottom: '3px'
                  }
                }, [
                    h('span', {}, item.code + '. '),
                    h('span', {}, item.desc)
                  ])
              })
            }
          },
          { title: '正确答案', key: 'rightAnswer', align: 'center', width: 90 },
          { title: '学生答案', key: 'answer', align: 'center', width: 90 },
          {
            title: '状态', key: 'status', align: 'center', width: 70, render: (h, params) => {
              let statusStr = ''
              switch (params.row.status) {
                case 1: statusStr = '未做'; break;
                case 2: statusStr = '错误'; break;
                case 3: statusStr = '正确'; break;
              }
              return h('div', {}, statusStr)
            }
          }
        ],
        file: null,
        uploadModal: false,
        tableId: null,
        uploadTitle: '',
        uploadPlayBack: null,
      }
    },
    methods: {
      query() {
        this.getCourseList(() => {
          this.$Message.success('查询成功！')
        })
      },
      getCourseList(cb) {
        const { pageIndex, pageSize, studentMobilePhone, studentRealName, teacherRealName, secondId, thirdId } = this.postData
        http.get({
          vm: this,
          url: '/manager/student/queryStudentCourseTable',
          data: { pageIndex, pageSize, studentMobilePhone, studentRealName, teacherRealName, secondId, thirdId },
          success: res => {
            this.courseList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },
      changePage(p) {
        this.postData.pageIndex = p
        this.getCourseList()
      },
      changePageSize(s) {
        this.postData.pageSize = s
        this.getCourseList()
      },
      lookComment({ courseLevel, labels = [], commentDesc }) {
        this.lookCommentData = { courseLevel, labels, commentDesc }
        this.detailModal = true;
      },
      lookTask({ tableId }) {
        http.get({
          vm: this,
          url: '/manager/student/lookTaskFile',
          data: { tableId },
          success: res => {
            const data = res.data
            if (data.type) {
              this.$Notice.open({
                title: '提示',
                desc: '已为您加载PDF，若未自动打开，请点击浏览器地址栏中提示消息手动跳转'
              });
              window.open(data.url)
            } else if (data.type) {
              window.open(data.url)
            }
          }
        })
      },
      lookExam({ tableId }) {
        http.get({
          vm: this,
          url: '/manager/student/lookExam',
          data: { tableId },
          success: res => {
            this.lookExamModal = true
            this.lookExamData = res.data
          }
        })
      },
      upload({ tableId, uploadPlayBack }) {
        this.file = null
        this.tableId = tableId
        this.uploadModal = true
        this.uploadPlayBack = uploadPlayBack
        this.uploadTitle = uploadPlayBack ? '查看课程回放' : '上传课程回放'
      },
      uploadFile() {
        if (this.file) {
          const formData = new FormData()
          formData.append('tableId', this.tableId)
          formData.append('file', this.file)
          http._postwithupload({
            vm: this,
            url: '/manager/student/uploadCoursePlayBack',
            data: formData,
            success: res => {
              this.$Message.success('上传成功！')
              this.getCourseList()
              this.uploadModal = false
            }
          })
        } else {
          this.$Message.error('请先选择文件后点击上传！')
        }
      },
      openVideo(){
        http.get({
          vm: this,
          url: '/manager/student/lookCourseBack',
          data: { tableId: this.tableId },
          success: res => {
            window.open(res.data)
            this.uploadModal = true
          }
        })
      },
      cancel(){
        this.file = null
        this.uploadModal = false
      },
      handleFileChange(e) {
        this.file = e.target.files[0]
      },
      secondOpenChange(action){
        action && this.getSecondList()
      },
      getSecondList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 2 },
          success: res => {
            this.postData.secondList = res.data
            cb && cb()
          }
        })
      },
      getThirdList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 3, parentCode: this.postData.secondCode },
          success: res => {
            this.postData.thirdList = res.data
            cb && cb()
          }
        })
      },
      secondChange(val) {
        const _secondId = this.postData.secondList.find(f => f.code === val)
        this.postData.secondId = _secondId && _secondId.id || null
        this.postData.thirdCode = null
        if (val) {
          this.getThirdList()
        } else {
          this.postData.thirdList = []
        }
      },
      thirdChange(val) {
        const _thirdId = this.postData.thirdList.find(t => t.code === val)
        this.postData.thirdId = _thirdId && _thirdId.id || null
      }
    },
    mounted() {
      this.getCourseList()
    }
  }
</script>