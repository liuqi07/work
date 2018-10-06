<template>
  <div>
    <Row>
      <Col :span="18">
      <three-level :inline="true" @on_change="getThreeLevelData"></three-level>
      </Col>
      <Col :span="6">
      <Button type="primary" @click="query" style="margin-right: 10px;">查询</Button>
      <Button type="primary" @click="openAdd" v-hasPermission="'masterialAdd'">添加教材</Button>
      </Col>
    </Row>
    <Card>
      <Table :columns="columns" :data="materialList"></Table>
      <Page :total="total" show-total @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal title="教材基本信息" v-model="addMaterialModal" @on-ok="addMaterial">
      <Form :model="addData" :label-width="100">
        <FormItem label="教材名称：" style="width: 300px;" required>
          <Input type="textarea" v-model="addData.name" placeholder="可输入最多60个中文字符以内的商品名称" />
        </FormItem>
        <FormItem label="一级分类：" style="width: 300px;" required>
          <Select v-model="addData.firstCode" @on-change="firstChange" clearable>
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="二级分类：" style="width: 300px;" required>
          <Select v-model="addData.secondCode" @on-change="secondChange" clearable>
            <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="三级分类：" style="width: 300px;" required>
          <Select v-model="addData.thirdCode" @on-change="thirdChange" clearable>
            <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="课程名称：" style="width: 300px;" required>
          <Select v-model="addData.id" @on-change="courseChange" clearable>
            <Option v-for="item in courseList" :value="item.id" :key="item.id">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="适用等级：" style="width: 300px;" required>
          <Select v-model="addData.level" @on-change="levelChange" clearable>
            <Option v-for="item in LevelList" :value="item.level" :key="item.level">{{item.level}}</Option>
          </Select>
        </FormItem>
        <FormItem label="课时：" style="width: 300px;" required>
          <Select v-model="addData.hour" clearable>
            <Option v-for="item in hourList" :value="item.hour" :key="item.hour">{{item.hour}}</Option>
          </Select>
        </FormItem>
        <FormItem label="上传图片：" required>
          <input type="file" @change="handleFileChange">
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
  import http from '@/libs/http';
  import ThreeLevel from '@/view/course/components/threeLevel.vue';
  export default {
    components: {
      ThreeLevel,
    },
    data() {
      return {
        columns: [
          { title: '教材编码', key: 'code', algin: 'center' },
          { title: '教材名称', key: 'name', algin: 'center' },
          {
            title: '适用等级', key: 'level', algin: 'center', render: (h, params) => {
              return h('div', {}, "Level " + params.row.level)
            }
          },
          { title: '一级分类', key: 'firstName', algin: 'center' },
          { title: '二级分类', key: 'secondName', algin: 'center' },
          { title: '三级分类', key: 'thirdName', algin: 'center' },
          {
            title: '教材状态', key: 'status', algin: 'center', render: (h, params) => {
              return h('div', {}, params.row.status === 1 ? '有效' : '无效')
            }
          },
          { title: '上传时间', key: 'createTime', algin: 'center' },
          {
            title: '管理', key: 'actions', algin: 'center', render: (h, params) => {
              return h('Button', {
                props: {
                  type: params.row.status === 1 ? 'error' : 'success',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.masterialAudit(params.row)
                  }
                },
                directives: [
                  { name: 'hasPermission', value: "masterialAudit" }
                ]
              }, params.row.status === 1 ? '无效' : '有效')
            }
          },
        ],
        materialList: [],
        postData: { pageIndex: 1, pageSize: 10 },
        total: 0,
        addMaterialModal: false,
        thirdId: null,
        hour: null,
        addData: {},
        firstList: [],
        secondList: [],
        thirdList: [],
        courseList: [],
        LevelList: [],
        hourList: [],
      }
    },
    methods: {
      openAdd() {
        this.addMaterialModal = true
        this.getFirstList()
      },
      addMaterial() {

        const formData = new FormData()
        for (let k in this.addData) {
          k !== 'id' && formData.append(k, this.addData[k])
        }
        http._postwithupload({
          vm: this,
          url: '/manager/materials/upload',
          data: formData,
          success: res => {
            this.$Message.success('添加成功！')
          }
        })
      },
      query() {
        this.getMaterialList(()=>{
          this.$Message.success('查询成功！')
        })
      },
      getMaterialList(cb) {
        http.get({
          vm: this,
          url: '/manager/materials/list',
          data: this.postData,
          success: res => {
            this.materialList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },

      firstChange(val) {
        this.addData.secondCode = null
        this.addData.thirdCode = null
        this.addData.id = null
        this.addData.courseId = null
        this.addData.level = null
        this.addData.hour = null
        if (val) {
          const _firstId = this.firstList.find(f => f.code === val)
          this.addData.firstId = _firstId && _firstId.id || null
          this.getSecondList()
        } else {
          this.secondList = []
          this.thirdList = []
          this.courseList = []
          this.LevelList = []
          this.hourList = []
        }
      },
      secondChange(val) {
        this.addData.thirdCode = null
        this.addData.id = null
        this.addData.courseId = null
        this.addData.level = null
        this.addData.hour = null
        if (val) {
          const _secondId = this.secondList.find(s => s.code === val)
          this.addData.secondId = _secondId && _secondId.id || null
          this.getThirdList()
        } else {
          this.thirdList = []
          this.courseList = []
          this.LevelList = []
          this.hourList = []
        }
      },
      thirdChange(val) {
        this.addData.id = null
        this.addData.courseId = null
        this.addData.level = null
        this.addData.hour = null
        if (val) {
          const _thirdId = this.thirdList.find(item => item.code === val)
          this.addData.thirdId = _thirdId && _thirdId.id || null
          this.getCourseList()
        } else {
          this.courseList = []
          this.LevelList = []
          this.hourList = []
        }
      },
      courseChange(val) {
        this.addData.courseId = null
        this.addData.level = null
        this.addData.hour = null
        if (val) {
          this.addData.courseId = val
          this.getLevelList()
        } else {
          this.LevelList = []
          this.hourList = []
        }
      },
      levelChange(val) {
        this.addData.hour = null
        if (val) {
          const _hour = this.LevelList.find(item => item.level === val)
          this.hour = _hour && _hour.hour || 1
          this.getHourList()
        } else {
          this.addData.hour = null
          this.hourList = []
        }
        console.log('%c this.addData.hour', 'color:red;', this.addData.hour);
      },

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
          data: { type: 2, parentCode: this.addData.firstCode },
          success: res => {
            this.secondList = res.data
          }
        })
      },
      getThirdList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 3, parentCode: this.addData.secondCode },
          success: res => {
            this.thirdList = res.data
          }
        })
      },
      getCourseList() {
        http.get({
          vm: this,
          url: '/manager/course/listByThird',
          data: { thirdId: this.addData.thirdId },
          success: res => {
            this.courseList = res.data
          }
        })
      },
      getLevelList() {
        http.get({
          vm: this,
          url: '/manager/course/detail',
          data: { id: this.addData.id },
          success: res => {
            this.LevelList = res.data.levelHours
          }
        })
      },
      getHourList() {
        this.hourList = []
        for (let i = 0; i < this.hour; i++) {
          this.hourList.push({ hour: i + 1 })
        }
      },
      handleFileChange(e) {
        this.addData.file = e.target.files[0]
      },
      masterialAudit({ id, status, version }) {
        const content = status === 1 ? '无效' : '有效'
        this.$Modal.confirm({
          title: '操作',
          content: `确认对该教材执行${content}操作吗？`,
          loading: true,
          onOk: () => {
            http.post({
              vm: this,
              url: '/manager/materials/saveValid',
              data: { id, version, status: status === 1 ? 0 : 1 },
              success: res => {
                this.$Modal.remove()
                this.$Message.success('操作成功！')
                this.getMaterialList()
              }
            })
          }
        })
      },
      getThreeLevelData(postData){
        this.postData = {...this.postData, ...postData}
      },
      changePage(p){
        this.postData.pageIndex = p
        this.getMaterialList(()=>{this.$Message.success('查询成功！')})
      },
      changePageSize(s) {
        this.postData.pageSize = s
        this.getMaterialList(()=>{this.$Message.success('查询成功！')})
      }
    },
    mounted() {
      this.getMaterialList()
    }
  }
</script>