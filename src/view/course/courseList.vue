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
      <Page :total="total" show-total @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal title="添加课程" v-model="addCourseModal">
      <Form :label-width="100" :model="addData" :rules="rules">
        <FormItem prop="name" label="课程名称：" style="width: 300px;" required>
          <Input v-model="addData.name" placeholder="请输入课程名称" />
        </FormItem>
        <FormItem prop="courseDesc" label="课程介绍：" style="width: 300px;" required>
          <Input v-model="addData.courseDesc" placeholder="请输入课程介绍" />
        </FormItem>
        <!-- <three-level :required="true" @on_change="onThreeLevelChange" :threeLevelData="addData.threeLevelData"></three-level> -->
        <FormItem label="一级分类：" style="width: 250px;" required>
          <Select v-model="addData.firstCode" @on-change="firstChange" clearable>
            <Option v-for="item in addData.firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="二级分类：" style="width: 250px;" required>
          <Select v-model="addData.secondCode" @on-change="secondChange" clearable>
            <Option v-for="item in addData.secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="三级分类：" style="width: 250px;" required>
          <Select v-model="addData.thirdCode" @on-change="thirdChange" clearable>
            <Option v-for="item in addData.thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="授课比例：" style="width: 300px;" required>
          <Select v-model="addData.oneToX" placeholder="请先选择三级分类" clearable>
            <Option v-for="item in addData.oneToXArr" :key="item" :value="item">{{item}}</Option>
          </Select>
        </FormItem>
        <FormItem label="平台：" style="width: 300px;" required>
          <Select v-model="addData.platform">
            <Option :value="1">百度云</Option>
          </Select>
        </FormItem>
        <FormItem prop="classType" label="课程类型：" style="width: 300px;" required>
          <RadioGroup v-model="addData.classType">
            <Radio :label="1">公开课</Radio>
            <Radio :label="2">试听课</Radio>
            <Radio :label="3">正式课</Radio>
          </RadioGroup>
        </FormItem>
        <!-- <FormItem label="授课比例xxxx：" required>
            <Button type="dashed" @click="addOneToX" size="small" style="margin-right: 10px;">增加</Button>
            <InputNumber v-model="addData.x" size="small" :min="1" style="width: 50px; margin-right: 10px;" />
            <Tag v-for="(item, index) in addData.oneToXArr" color="success" :key="index" :name="item" closable @on-close="closeOneToXTag">{{item}}</Tag>
          </FormItem> -->
        <FormItem label="级别：" style="width: 350px;" required>
          <Button type="dashed" size="small" @click="addLevelHour" long icon="md-add" style="margin-right: 10px;">Add Level</Button>
        </FormItem>
        <FormItem v-for="(item, index) in addData.levelHour" :key="index" required>
          <Row>
            <Col :span="6"> 等级
            <InputNumber :min="1" size="small" v-model="item.level" disabled style="width: 50px;" />
            </Col>
            <Col :span="6"> 课时
            <InputNumber :min="1" size="small" v-model="item.hour" style="width: 50px;" />
            </Col>
            <Col :span="6">
              <Button type="error" size="small" @click="removeLevelHour" >Remove Level {{index+1}}</Button>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="上传图片：" :required="fileIsRequire" >
          <input type="file" @change="handleFileChange">
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelAddCourse">取消</Button>
        <Button type="primary" @click="addCourse">确定</Button>
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
      return {
        postData: { pageIndex: 1, pageSize: 10 },
        courseList: [],
        total: 0,
        addCourseModal: false,
        addData: { oneToXArr: [], levelHour: [], firstList: [], secondList: [], thirdList: [] },
        rules: {
          name: [
            { required: true, message: '课程名称不能为空', trigger: 'blur' }
          ],
          courseDesc: [
            { required: true, message: '课程介绍不能为空', trigger: 'blur' }
          ]
        },
        batchList: [],
        courseEditUrl: '',
        fileIsRequire: false,
        addOrEdit: true,
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
        this.addData = { oneToXArr: [], levelHour: [], firstList: [], secondList: [], thirdList: [] }
        this.courseEditUrl = ''
        this.getFirstList()
      },
      addCourse() {
        const url = this.courseEditUrl || '/manager/course/add'
        const { levelHour } = this.addData
        levelHour.length > 0 && (this.addData.levelHourJsonStr = JSON.stringify(levelHour))
        const { id, name, courseDesc, firstId, secondId, thirdId, classType, oneToX, levelHourJsonStr, file, platform } = this.addData
        if (!(name && courseDesc && firstId && secondId && thirdId && classType && oneToX && levelHourJsonStr && (this.fileIsRequire ? file : true) && platform)) {
          this.$Message.error({
            content: '标星内容不能为空！',
            duration: 5
          })
          console.log('%c ----> ', 'color:red;', name, courseDesc, firstId, secondId, thirdId, classType, oneToX, levelHourJsonStr, file, platform);
          return
        }
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
            this.getCourseList()
          }
        })
      },
      cancelAddCourse() {
        this.addCourseModal = false
        this.addData = { oneToXArr: [], levelHour: [], firstList: [], secondList: [], thirdList: [] }
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
        console.log('%c coursePush ------------> id, version', 'color:red;', id, version);
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
              }
            })
          }
        })
      },
      // 编辑课程
      courseEdit(courseData) {
        this.fileIsRequire = false
        this.addOrEdit = false
        console.log('%c courseData', 'color:red;', courseData);
        const { firstId, secondId, thirdId, oneToX, id, platform } = courseData
        this.getFirstList(() => {
          const _firstCode = this.addData.firstList.find(f => f.id === firstId)
          const firstCode = _firstCode && _firstCode.code || ''
          this.addData = Object.assign({}, this.addData, { firstCode, firstId, platform })
          this.getSecondList(() => {
            const _secondCode = this.addData.secondList.find(s => s.id === secondId)
            const secondCode = _secondCode && _secondCode.code || ''
            this.addData = Object.assign({}, this.addData, { secondCode, secondId })
            this.getThirdList(() => {
              const _thirdCode = this.addData.thirdList.find(s => s.id === thirdId)
              const thirdCode = _thirdCode && _thirdCode.code || ''
              const oneToXArr = (_thirdCode && _thirdCode.oneToX && _thirdCode.oneToX.split(',') || []).map(i => parseInt(i))
              this.addData = Object.assign({}, this.addData, { thirdCode, thirdId, oneToXArr, oneToX })
              // console.log('%c firstList, secondList, thirdList', 'color:red;', this.addData.firstList, this.addData.secondList, this.addData.thirdList, oneToXArr, oneToX);
              this.getCourseDetail(id, ()=>{
                this.addData = Object.assign({}, courseData, this.addData)
              })
            })
          })
        })

        this.courseEditUrl = '/manager/course/edit'
        this.addCourseModal = true
      },
      getCourseDetail(id, cb) {
        http.get({
          vm: this,
          url: '/manager/course/detail',
          data: { id },
          success: res => {
            this.addData.levelHour = res.data.levelHours
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
        const levelHour = this.addData.levelHour
        const levelHourItem = { level: levelHour.length + 1, hour: 1 }
        levelHour.push(levelHourItem)
      },
      removeLevelHour(e) {
        const levelHour = this.addData.levelHour
        const index = e.target.innerText.substr(13) - 1
        levelHour.splice(index, 1)
      },
      handleFileChange(e) {
        this.addData.file = e.target.files[0]
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getCourseList(undefined, 'change')
      },
      changePageSize(pageSize) {
        this.postData.pageSize = pageSize
        this.getCourseList(undefined, 'change')
      },

      getFirstList(cb) {
        console.log('%c ----------', 'color:red;');
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
        if (val) {
          this.getThirdList()
        } else {
          this.addData.thirdList = []
          this.addData.oneToXArr = []
        }
      },
      thirdChange(val) {
        this.addData.oneToX = ''
        if (val) {
          const _thirdId = this.addData.thirdList.find(t => t.code === val)
          const thirdId = _thirdId && _thirdId.id || null
          const oneToXArr = _thirdId && _thirdId.oneToX && _thirdId.oneToX.split(',') || []
          console.log('%c oneToXArr, oneToX', 'color:red;', oneToXArr, _thirdId.oneToX);
          this.addData = Object.assign({}, this.addData, { thirdId, oneToXArr })
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