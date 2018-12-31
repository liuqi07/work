<template>
  <div>
    <Card>
      <Tabs name="all" @on-click="handleTabs" style="min-height: 400px;">
        <TabPane label="全部课程" name="all">
          <search-form :status="0" @handle_search="getCourseList" @handle_add_course="openAddCourse"></search-form>
          <all-course :courseList="courseList" @course_push="coursePush" @course_lower="courseLower" @course_edit="courseEdit" @course_delete="courseDelete"></all-course>
        </TabPane>
        <TabPane label="未上架" name="unpush">
          <search-form @handle_search="getCourseList" :status="1" @handle_add_course="openAddCourse" @batch_push="batchPush"></search-form>
          <un-push-course :courseList="courseList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel"
            @on_select_all_cancel="onSelectAllCancel" @course_push="coursePush" @course_lower="courseLower" @course_edit="courseEdit"
            @course_delete="courseDelete" :status="1"></un-push-course>
        </TabPane>
        <TabPane label="已上架" name="push">
          <search-form @handle_search="getCourseList" :status="2" @handle_add_course="openAddCourse" @batch_lower="batchLower"></search-form>
          <push-course :courseList="courseList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel"
            @on_select_all_cancel="onSelectAllCancel" @course_push="coursePush" @course_lower="courseLower" @course_edit="courseEdit"
            @course_delete="courseDelete" :status="2"></push-course>
        </TabPane>
        <TabPane label="已下架" name="lower">
          <search-form @handle_search="getCourseList" :status="3" @handle_add_course="openAddCourse" @batch_push="batchPush"></search-form>
          <lower-course :courseList="courseList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel"
            @on_select_all_cancel="onSelectAllCancel" @course_push="coursePush" @course_lower="courseLower" @course_edit="courseEdit"
            @course_delete="courseDelete" :status="3"></lower-course>
        </TabPane>
      </Tabs>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal :title="courseTitle" v-model="addCourseModal" >
      <Form :label-width="100" :model="addData" :rules="addRules" ref="addData">
        <FormItem prop="firstCode" label="一级分类：" style="width: 300px;" >
          <Select v-model="addData.firstCode" @on-change="firstChange" clearable>
            <Option v-for="item in addData.firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="secondCode" label="二级分类：" style="width: 300px;" >
          <Select v-model="addData.secondCode" @on-change="secondChange" clearable>
            <Option v-for="item in addData.secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="thirdCode" label="三级分类：" style="width: 300px;" >
          <Select v-model="addData.thirdCode" @on-change="thirdChange" clearable>
            <Option v-for="item in addData.thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="name" label="课程名称：" style="width: 300px;" >
          <Input v-model="addData.name" placeholder="请输入课程名称" />
        </FormItem>
        <FormItem prop="courseDesc" label="课程介绍：" style="width: 320px;" >
          <Input type="textarea" v-model="addData.courseDesc" placeholder="请输入课程介绍，不超过100字" />
        </FormItem>
        <!-- <three-level :="true" @on_change="onThreeLevelChange" :threeLevelData="addData.threeLevelData"></three-level> -->
        <FormItem prop="oneToX" label="授课比例：" style="width: 300px;" >
          <Select v-model="addData.oneToX" placeholder="请选择" clearable>
            <Option v-for="item in addData.oneToXArr" :key="item" :value="parseInt(item)">{{item}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="platform" label="平台：" style="width: 300px;" >
          <Select v-model="addData.platform">
            <Option :value="1">百度云</Option>
            <Option :value="2">Zoom</Option>
            <Option :value="3">录播课</Option>
          </Select>
        </FormItem>
        <FormItem prop="classType" label="课程类型：" style="width: 300px;" >
          <RadioGroup v-model="addData.classType">
            <Radio :label="1">公开课</Radio>
            <Radio :label="2">试听课</Radio>
            <Radio :label="3">正式课</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="级别：" style="width: 350px;" required >
          <Button type="dashed" size="small" @click="addLevelHour" icon="md-add" style="margin-right: 10px;">添加级别</Button>
          <Button type="error" size="small" @click="removeLevelHour" icon="md-remove" >删除级别</Button>
        </FormItem>
        <FormItem prop="levelHour" v-for="(item, index) in addData.levelHour" :key="index" >
          <Row>
            <Col :span="6"> 等级
            <InputNumber :min="1" size="small" v-model="item.level" disabled style="width: 50px;" />
            </Col>
            <Col :span="6"> 课时
            <InputNumber :min="1" size="small" v-model="item.hour" style="width: 50px;" />
            </Col>
          </Row>
        </FormItem>
        <FormItem prop="file" label="上传图片：" :required="fileIsRequire" v-if="fileReload">
          <input type="file" @change="handleFileChange">
        </FormItem>
        <FormItem label="查看图片：" v-if="fileIsExist" style="width: 300px;">
          <Button long type="primary" @click="handleView(addData.courseFileSrc)">查看</Button>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelAddCourse">取消</Button>
        <Button type="primary" @click="addCourse">确定</Button>
      </div>
    </Modal>
    <Modal title="图片预览" v-model="courseFileModal">
      <img :src="courseFileSrc" style="width: 100%;" />
      <div slot="footer">
        <Button type="primary" @click="handleCloseView">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from '@/libs/http';
  import axios from 'axios';
  import $ from 'jquery';
  import SearchForm from './components/searchForm.vue';
  import AllCourse from './components/allCourse.vue';
  import UnPushCourse from './components/unPushCourse.vue';
  import PushCourse from './components/pushCourse.vue';
  import LowerCourse from './components/lowerCourse.vue';
  import ThreeLevel from './components/threeLevel.vue';
  export default {
    components: {
      AllCourse,
      SearchForm,
      UnPushCourse,
      PushCourse,
      LowerCourse,
      ThreeLevel,
    },
    data() {
      const validateFile = (rule, value, cb) => {
        if(!value && this.addOrEdit){
          cb(new Error('请选择需要上传的文件'))
        }else{
          cb()
        }
      }
      const validateName = (rule, name, cb) => {
        if(!name){
          cb(new Error('课程名称不能为空'))
        }else{
          let data = { name }
          !this.addOrEdit && (data.id = this.addData.id)
          http.post({
            vm: this,
            url: "/manager/course/valid",
            data,
            success: res => {
              res.data && cb() || cb(new Error('课程名称已存在'))
            }
          })
        }
      }
      const validateLevelHour = (rule, levelHour, cb) => {
        console.log(levelHour)
        if(!levelHour || levelHour.length<=0){
          cb(new Error('级别不能为空'))
        }else{
          for(let i=0; i<levelHour.length; i++){
            if(!levelHour[i].hour){
              cb(new Error(`第${i+1}项级别输入有误`))
              return
            }
          }
          cb()
        }
      }
      return {
        postData: { pageIndex: 1, pageSize: 10 },
        courseList: [],
        total: 0,
        addCourseModal: false,
        addData: { oneToXArr: [], levelHour: [], firstList: [], secondList: [], thirdList: [] },
        addRules: {
          firstCode: [
            { required: true, message: '一级分类不能为空', trigger: 'change' }
          ],
          secondCode: [
            { required: true, message: '二级分类不能为空', trigger: 'change' }
          ],
          thirdCode: [
            { required: true, message: '三级分类不能为空', trigger: 'change' }
          ],
          name: [
            { required: true, message: '课程名称不能为空', trigger: 'blur' },
            { validator: validateName, trigger: 'blur' }
          ],
          courseDesc: [
            { required: true, message: '课程介绍不能为空', trigger: 'blur' },
            { type: 'string', max: 100, message: '课程介绍不能超过100字', trigger: 'blur' }
          ],
          oneToX: [
            { required: true, type: 'number', message: '授课比例不能为空', trigger: 'change' }
          ],
          platform: [
            { required: true, type: 'number', message: '平台不能为空', trigger: 'change' }
          ],
          classType: [
            { required: true, type: 'number', message: '课程类型不能为空', trigger: 'change' }
          ],
          levelHour: [
            // { required: true, type: 'array', min: 1, message: '级别不能为空', trigger: 'change' },
            { validator: validateLevelHour, trigger: 'change' }
          ],
          file: [
            { validator: validateFile, trigger: 'change' }
          ]
        },
        batchList: [],
        courseEditUrl: '',
        fileIsRequire: false,
        addOrEdit: true,
        fileReload: true,
        courseTitle: '',
        fileIsExist: false,
        courseFileSrc: '',
        courseFileModal: false,
      }
    },
    methods: {
      getCourseList(postData = {}, action) {
        this.postData = Object.assign(this.postData, postData)
        http.get({
          vm: this,
          url: '/manager/course/list',
          data: this.postData,
          success: res => {
            this.courseList = res.data.list
            this.total = res.data.total
            action && this.$Message.success('查询成功！')
          }
        })
      },
      openAddCourse() {
        this.fileIsRequire = true
        this.addCourseModal = true
        this.addOrEdit = true
        this.fileIsExist = false
        this.fileReload = false
        setTimeout(() => {
          this.fileReload = true
        }, 0);
        this.courseTitle = '添加课程'
        this.addData = { oneToXArr: [], levelHour: [], firstList: [], secondList: [], thirdList: [] }
        this.courseEditUrl = ''
        this.$refs['addData'].resetFields()
        this.getFirstList()
      },
      addCourse() {
        this.$refs['addData'].validate(valid => {
          if(valid){
            const { levelHour=[] } = this.addData
            if(levelHour.length<=0){
              this.$Message.error('级别不能为空')
              return
            }
            const url = this.courseEditUrl || '/manager/course/add'
            levelHour.length > 0 && (this.addData.levelHourJsonStr = JSON.stringify(levelHour))
            const { id, name, courseDesc, firstId, secondId, thirdId, classType, oneToX, levelHourJsonStr, file, platform } = this.addData
            const addData = { id, name, courseDesc, firstId, secondId, thirdId, classType, oneToX, levelHourJsonStr, file, platform }
            if(!id){ delete addData.id }
            const formData = new FormData()
            for (let k in addData) {
              formData.append(k, addData[k])
            }
            const msg = this.addOrEdit ? '添加成功' : '编辑成功'
            http._postwithupload({
              vm: this,
              url,
              data: formData,
              success: res => {
                this.$Message.success(msg)
                this.addData = { oneToXArr: [], levelHour: [], firstList: [], secondList: [], thirdList: [] }
                this.addCourseModal = false
                this.$refs['addData'].resetFields()
                this.getCourseList()
              }
            })
          }
        })
      },
      cancelAddCourse() {
        this.addCourseModal = false
        this.addData = { oneToXArr: [], levelHour: [], firstList: [], secondList: [], thirdList: [] }
        this.$refs['addData'].resetFields()
      },
      handleTabs(name) {
        let status = null;
        switch (name) {
          case 'all':
            status = null
            break;
          case 'unpush':
            status = 1
            break;
          case 'push':
            status = 2
            break;
          case 'lower':
            status = 3
            break;
        }
        this.postData.status = status
        this.getCourseList()
      },
      coursePush({ id, version }) {
        this.$Modal.confirm({
          title: '上架',
          content: '确认要上架此商品吗？',
          loading: true,
          onOk: () => {
            http.post({
              vm: this,
              url: '/manager/course/push',
              data: { id, version },
              success: res => {
                this.$Message.success('上架成功！')
                this.getCourseList()
                this.$Modal.remove()
              }
            })
          }
        })
      },
      courseLower({ id, version }) {
        this.$Modal.confirm({
          title: '下架',
          content: '确认要下架此商品吗？',
          loading: true,
          onOk: () => {
            http.post({
              vm: this,
              url: '/manager/course/lower',
              data: { id, version },
              success: res => {
                this.$Message.success('下架成功！')
                this.getCourseList()
                this.$Modal.remove()
              },
              error: err => {
                this.$Modal.remove()
              }
            })
          }
        })
      },
      // 编辑课程
      courseEdit(courseData) {
        this.$refs['addData'].resetFields()
        this.fileIsRequire = false
        this.addOrEdit = false
        this.fileIsExist = true
        // this.fileReload = false
        // setTimeout(() => {
        //   this.fileReload = true
        // }, 0);
        const { firstId, secondId, thirdId, oneToX, id, platform, name, courseDesc, classType } = courseData
        this.getFirstList(() => {
          const _firstCode = this.addData.firstList.find(f => f.id === firstId)
          const firstCode = _firstCode && _firstCode.code || ''
          this.addData = Object.assign({}, this.addData, { firstCode, firstId, platform, name, courseDesc, classType })
          this.getSecondList(() => {
            const _secondCode = this.addData.secondList.find(s => s.id === secondId)
            const secondCode = _secondCode && _secondCode.code || ''
            this.addData = Object.assign({}, this.addData, { secondCode, secondId })
            this.getThirdList(() => {
              const _thirdCode = this.addData.thirdList.find(s => s.id === thirdId)
              const thirdCode = _thirdCode && _thirdCode.code || ''
              const levelLen = _thirdCode && _thirdCode.level || 0
              const oneToXArr = (_thirdCode && _thirdCode.oneToX && _thirdCode.oneToX.split(',') || []).map(i => parseInt(i))
              this.addData = Object.assign({}, this.addData, { thirdCode, thirdId, oneToXArr, oneToX, levelLen })
              this.getCourseDetail(id, ()=>{
                this.addData = Object.assign({}, courseData, this.addData)
              })
            })
          })
        })
        this.courseTitle = '编辑课程'
        this.courseEditUrl = '/manager/course/edit'
        this.addCourseModal = true
      },
      handleView() {
        this.courseFileModal = true
      },
      handleCloseView(){
        this.courseFileSrc = ''
        this.courseFileModal = false
      },
      getCourseDetail(id, cb) {
        http.get({
          vm: this,
          url: '/manager/course/detail',
          data: { id },
          success: res => {
            this.addData.levelHour = res.data.levelHours
            this.courseFileSrc = res.data.courseFile
            cb && cb()
          }
        })
      },
      courseDelete({ id, version }) {
        this.$Modal.confirm({
          title: '删除',
          content: '确认要删除此商品吗？',
          loading: true,
          onOk: () => {
            http.post({
              vm: this,
              url: '/manager/course/delete',
              data: { id, version },
              success: res => {
                this.$Message.success('删除成功！')
                this.getCourseList()
                this.$Modal.remove()
              }
            })
          }
        })
      },
      batchPush() {
        const batchList = this.batchList
        if (batchList.length > 0) {
          this.$Modal.confirm({
            title: '批量上架',
            content: '确认批量上架所选课程吗？',
            loading: true,
            onOk: () => {
              this.$Modal.remove()
              const batchPushJsonStr = batchList.map(item => ({ id: item.id, version: item.version }))
              http.post({
                vm: this,
                url: '/manager/course/batchPush',
                data: { batchPushJsonStr: JSON.stringify(batchPushJsonStr) },
                success: res => {
                  this.$Message.success('批量上架成功！')
                  this.getCourseList();
                }
              })
            }
          })
        } else {
          this.$Message.error('请选择后再进行操作！')
        }
      },
      batchLower() {
        const batchList = this.batchList
        if (batchList.length > 0) {
          this.$Modal.confirm({
            title: '批量下架',
            content: '确认批量下架所选课程吗？',
            loading: true,
            onOk: () => {
              this.$Modal.remove()
              const batchLowerJsonStr = batchList.map(item => ({ id: item.id, version: item.version }))
              http.post({
                vm: this,
                url: '/manager/course/batchLower',
                data: { batchLowerJsonStr: JSON.stringify(batchLowerJsonStr) },
                success: res => {
                  this.$Message.success('批量下架成功！')
                  this.getCourseList();
                }
              })
            }
          })
        } else {
          this.$Message.error('请选择后再进行操作！')
        }
      },
      onSelect(selection) {
        this.batchList = selection
      },
      onSelectAll(selection) {
        this.batchList = selection
      },
      onSelectCancel(selection) {
        this.batchList = selection
      },
      onSelectAllCancel(selection) {
        this.batchList = selection
      },
      addLevelHour() {
        const { levelHour, levelLen } = this.addData
        if(typeof levelLen === 'number' && levelHour.length >= levelLen){
          this.$Message.error(`此课程不能超过${levelLen}级！`)
          return
        }else if(typeof levelLen !== 'number') {
          this.$Message.error(`请先选择三级分类！`)
          return
        }
        const levelHourItem = { level: levelHour.length + 1, hour: 1 }
        levelHour.push(levelHourItem)
      },
      removeLevelHour(e) {
        const levelHour = this.addData.levelHour
        // const index = e.target.innerText.substr(13) - 1
        levelHour.pop()
      },
      handleFileChange(e) {
        this.addData.file = e.target.files[0]
        this.addData.file1 = 'isUpload'
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getCourseList()
      },
      changePageSize(pageSize) {
        this.postData.pageSize = pageSize
        this.getCourseList()
      },

      getFirstList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 1 },
          success: res => {
            this.addData.firstList = res.data
            cb && cb()
          }
        })
      },
      getSecondList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 2, parentCode: this.addData.firstCode },
          success: res => {
            this.addData.secondList = res.data
            cb && cb()
          }
        })
      },
      getThirdList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 3, parentCode: this.addData.secondCode },
          success: res => {
            this.addData.thirdList = res.data
            cb && cb()
          }
        })
      },
      firstChange(val) {
        const _firstId = this.addData.firstList.find(f => f.code === val)
        this.addData.firstId = _firstId && _firstId.id || null
        this.addData.secondCode = null
        this.addData.thirdCode = null
        this.addData.oneToX = null
        this.addData.levelLen = null
        if (val) {
          this.getSecondList()
        } else {
          this.addData.secondList = []
          this.addData.thirdList = []
          this.addData.oneToXArr = []
        }
      },
      secondChange(val) {
        const _secondId = this.addData.secondList.find(f => f.code === val)
        this.addData.secondId = _secondId && _secondId.id || null
        this.addData.thirdCode = null
        this.addData.oneToX = null
        this.addData.levelLen = null
        if (val) {
          this.getThirdList()
        } else {
          this.addData.thirdList = []
          this.addData.oneToXArr = []
        }
      },
      thirdChange(val) {
        this.addData.oneToX = ''
        this.addData.levelLen = null
        if (val) {
          const _thirdId = this.addData.thirdList.find(t => t.code === val)
          const thirdId = _thirdId && _thirdId.id || null
          const oneToXArr = _thirdId && _thirdId.oneToX && _thirdId.oneToX.split(',') || []
          const levelLen = _thirdId && _thirdId.level || 0
          this.addData = Object.assign({}, this.addData, { thirdId, oneToXArr, levelLen })
        } else {
          this.addData.oneToXArr = []
        }
      }
    },
    mounted() {
      this.getCourseList()
    }
  }
</script>
