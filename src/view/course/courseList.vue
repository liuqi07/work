<template>
  <div>
    <Card>
      <Tabs name="all" @on-click="handleTabs" style="min-height: 400px;">
        <TabPane label="全部课程" name="all">
          <search-form :status="0" @handle_search="getCourseList" @handle_add_course="openAddCourse"></search-form>
          <all-course :courseList="courseList" @course_push="coursePush" @course_lower="courseLower" @course_edit="courseEdit" @course_delete="courseDelete" ></all-course>
        </TabPane>
        <TabPane label="未上架" name="unpush">
          <search-form @handle_search="getCourseList" :status="1" @handle_add_course="openAddCourse" @batch_push="batchPush"></search-form>
          <un-push-course :courseList="courseList" @on_select="onSelect" @on_select_all="onSelectAll" @course_push="coursePush" @course_lower="courseLower" @course_edit="courseEdit" @course_delete="courseDelete"  :status="1"></un-push-course>
        </TabPane>
        <TabPane label="已上架" name="push">
          <search-form @handle_search="getCourseList" :status="2" @handle_add_course="openAddCourse" @batch_lower="batchLower"></search-form>
          <push-course :courseList="courseList" @on_select="onSelect" @on_select_all="onSelectAll" @course_push="coursePush" @course_lower="courseLower" @course_edit="courseEdit" @course_delete="courseDelete"  :status="2"></push-course>
        </TabPane>
        <TabPane label="已下架" name="lower">
          <search-form @handle_search="getCourseList" :status="3" @handle_add_course="openAddCourse" @batch_push="batchPush"></search-form>
          <lower-course :courseList="courseList" @on_select="onSelect" @on_select_all="onSelectAll" @course_push="coursePush" @course_lower="courseLower" @course_edit="courseEdit" @course_delete="courseDelete"  :status="3"></lower-course>
        </TabPane>
      </Tabs>
      <Page :total="total" show-total @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal title="添加课程" v-model="addCourseModal" @on-ok="addCourse">
      <Form :label-width="100" :model="addData" :rules="rules">
        <FormItem prop="name" label="课程名称：" style="width: 300px;" required>
          <Input v-model="addData.name" placeholder="请输入课程名称" />
        </FormItem>
        <FormItem prop="courseDesc" label="课程介绍：" style="width: 300px;" required>
          <Input v-model="addData.courseDesc" placeholder="请输入课程介绍" />
        </FormItem>
        <three-level @on_change="onThreeLevelChange"></three-level>
        <FormItem prop="classType" label="课程类型：" style="width: 300px;" required>
          <RadioGroup v-model="addData.classType">
            <Radio :label="1">公开课</Radio>
            <Radio :label="2">试听课</Radio>
            <Radio :label="3">正式课</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="授课比例：" required>
          <Button type="dashed" @click="addOneToX" size="small" style="margin-right: 10px;">增加</Button>
          <InputNumber v-model="x" size="small" :min="1" style="width: 50px; margin-right: 10px;" />
          <Tag v-for="(item, index) in oneToXArr" color="success" :key="index" :name="item" closable @on-close="closeOneToXTag">{{item}}</Tag>
        </FormItem>
        <FormItem label="级别：" style="width: 300px;" required>
          <Button type="dashed" size="small" long @click="addLevelHour" icon="md-add">Add Level</Button>
        </FormItem>
        <FormItem v-for="(item, index) in levelHour" :key="index" required>
          <Row>
            <Col :span="6"> 等级
            <InputNumber :min="1" size="small" v-model="item.level" disabled style="width: 50px;" />
            </Col>
            <Col :span="8"> 课时
            <InputNumber :min="1" size="small" v-model="item.hour" style="width: 50px;" />
            </Col>
          </Row>
        </FormItem>
        <FormItem label="上传图片：" required>
            <!-- <Upload multiple action="//jsonplaceholder.typicode.com/posts/"
            accept="image/*" @on-error="onUpLoadError">
            <Button icon="ios-cloud-upload-outline">Upload files</Button> -->
            <input type="file" @change="handleFileChange" multiple>
        </Upload>
        </FormItem>
      </Form>
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
        postData: { pageIndex: 0, pageSize: 10 },
        courseList: [],
        total: 0,
        addCourseModal: false,
        addData: {},
        x: null,
        oneToXArr: [],
        levelHour: [],
        rules: {
          name: [
            { required: true, message: '课程名称不能为空', trigger: 'blur' }
          ],
          courseDesc: [
            { required: true, message: '课程介绍不能为空', trigger: 'blur' }
          ]
        },
        file: null,
      }
    },
    methods: {
      getCourseList(postData = {}) {
        this.postData = Object.assign(this.postData, postData)
        http.get({
          vm: this,
          url: '/manager/course/list',
          data: this.postData,
          success: res => {
            this.courseList = res.data.list
            this.total = res.data.total
          }
        })
      },
      openAddCourse() {
        this.addCourseModal = true
      },
      addCourse() {
        this.oneToXArr.length > 0 && (this.addData.oneToX = this.oneToXArr.join(','))
        this.levelHour.length > 0 && (this.addData.levelHourJsonStr = JSON.stringify(this.levelHour))
        const formData = new FormData()
        for(let k in this.addData){
          formData.append(k, this.addData[k])
        }
        http._postwithupload({
          vm: this,
          url: '/manager/course/add',
          data: formData,
          success: res => {
            this.$Message.success('添加成功！')
            this.getCourseList()
          }
        })
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
      coursePush({id, version}) {
        
      },
      courseLower() {},
      courseEdit() {},
      courseDelete() {},
      batchPush() { },
      batchLower() { },
      onSelect(selection) {
        console.log('%c selection', 'color:red;', selection);
      },
      onSelectAll(selection) {
        console.log('%c selection', 'color:red;', selection);
      },
      onThreeLevelChange(data) {
        this.addData = Object.assign(this.addData, data)
      },
      addOneToX() {
        this.x && this.oneToXArr.push(this.x)
        this.x = null
      },
      closeOneToXTag(event, name) {
        this.oneToXArr.splice(this.oneToXArr.indexOf(name), 1)
      },
      addLevelHour() {
        const levelHourItem = { level: this.levelHour.length+1, hour: 1 }
        this.levelHour.push(levelHourItem)
      },
      handleFileChange(e){
        this.addData.file = e.target.files[0]
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
      },
      changePageSize(pageSize) {
        this.postData.pageSize = pageSize
      }
    },
    mounted(){
      this.getCourseList()
    }
  }
</script>