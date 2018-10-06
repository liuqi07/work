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
            <un-push-course :courseList="courseList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel" @on_select_all_cancel="onSelectAllCancel" @course_push="coursePush" @course_lower="courseLower"
              @course_edit="courseEdit" @course_delete="courseDelete" :status="1"></un-push-course>
          </TabPane>
          <TabPane label="已上架" name="push">
            <search-form @handle_search="getCourseList" :status="2" @handle_add_course="openAddCourse" @batch_lower="batchLower"></search-form>
            <push-course :courseList="courseList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel" @on_select_all_cancel="onSelectAllCancel" @course_push="coursePush" @course_lower="courseLower"
              @course_edit="courseEdit" @course_delete="courseDelete" :status="2"></push-course>
          </TabPane>
          <TabPane label="已下架" name="lower">
            <search-form @handle_search="getCourseList" :status="3" @handle_add_course="openAddCourse" @batch_push="batchPush"></search-form>
            <lower-course :courseList="courseList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel" @on_select_all_cancel="onSelectAllCancel" @course_push="coursePush" @course_lower="courseLower"
              @course_edit="courseEdit" @course_delete="courseDelete" :status="3"></lower-course>
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
          <three-level :required="true" @on_change="onThreeLevelChange" :threeLevelData="addData.threeLevelData"></three-level>
          <FormItem prop="classType" label="课程类型：" style="width: 300px;" required>
            <RadioGroup v-model="addData.classType">
              <Radio :label="1">公开课</Radio>
              <Radio :label="2">试听课</Radio>
              <Radio :label="3">正式课</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="授课比例：" required>
            <Button type="dashed" @click="addOneToX" size="small" style="margin-right: 10px;">增加</Button>
            <InputNumber v-model="addData.x" size="small" :min="1" style="width: 50px; margin-right: 10px;" />
            <Tag v-for="(item, index) in addData.oneToXArr" color="success" :key="index" :name="item" closable @on-close="closeOneToXTag">{{item}}</Tag>
          </FormItem>
          <FormItem label="级别：" style="width: 300px;" required>
            <Button type="dashed" size="small" long @click="addLevelHour" icon="md-add">Add Level</Button>
          </FormItem>
          <FormItem v-for="(item, index) in addData.levelHour" :key="index" required>
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
            <input type="file" @change="handleFileChange">
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
          postData: { pageIndex: 1, pageSize: 10 },
          courseList: [],
          total: 0,
          addCourseModal: false,
          addData: { oneToXArr: [], x: null, levelHour: [] },
          // x: null,
          // oneToXArr: [],
          // levelHour: [],
          rules: {
            name: [
              { required: true, message: '课程名称不能为空', trigger: 'blur' }
            ],
            courseDesc: [
              { required: true, message: '课程介绍不能为空', trigger: 'blur' }
            ]
          },
          batchList: [],
          courseEditUrl: ''
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
          this.addCourseModal = true
          this.addData = { oneToXArr: [], levelHour: [], x: null }
          this.courseEditUrl = ''
        },
        addCourse() {
          const url = this.courseEditUrl || '/manager/course/add'
          const { oneToXArr, levelHour } = this.addData
          oneToXArr.length > 0 && (this.addData.oneToX = oneToXArr.join(','))
          levelHour.length > 0 && (this.addData.levelHourJsonStr = JSON.stringify(levelHour))
          // 这三句待验证
          delete this.addData.oneToXArr
          delete this.addData.levelHour
          delete this.addData.x
          const formData = new FormData()
          for (let k in this.addData) {
            formData.append(k, this.addData[k])
          }
          http._postwithupload({
            vm: this,
            url,
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
        courseEdit(courseData) {
          console.log('%c courseData', 'color:red;', courseData);
          const { oneToX, levelHourJsonStr } = courseData
          const oneToXArr = oneToX.toString().split(',')
          const levelHour = JSON.parse(levelHourJsonStr) || []
          this.addData = Object.assign({}, { oneToXArr, levelHour, x: null }, courseData)
          this.courseEditUrl = '/manager/course/edit'
          this.addCourseModal = true
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
        onSelectCancel(selection){
          this.batchList = selection
        },
        onSelectAllCancel(selection){
          this.batchList = selection
        },
        onThreeLevelChange(data) {
          this.addData = Object.assign(this.addData, data)
        },
        addOneToX() {
          this.addData.x && this.addData.oneToXArr.push(this.addData.x)
          this.addData.x = null
        },
        closeOneToXTag(event, name) {
          const oneToXArr = this.addData.oneToXArr
          oneToXArr.splice(oneToXArr.indexOf(name), 1)
        },
        addLevelHour() {
          const levelHour = this.addData.levelHour
          const levelHourItem = { level: levelHour.length + 1, hour: 1 }
          levelHour.push(levelHourItem)
        },
        handleFileChange(e) {
          this.addData.file = e.target.files[0]
        },
        changePage(pageIndex) {
          this.postData.pageIndex = pageIndex
          console.log('%c pageIndex', 'color:red;', pageIndex);
          this.getCourseList('change')
        },
        changePageSize(pageSize) {
          this.postData.pageSize = pageSize
          this.getCourseList('change')
        }
      },
      mounted() {
        this.getCourseList()
      }
    }
  </script>