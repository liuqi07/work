<template>
    <div>
      <Card>
        <Tabs name="all" @on-click="handleTabs" style="min-height: 400px;">
          <TabPane label="全部套餐" name="all">
            <package-search-form :status="0" @handle_search="getPackageList" @handle_add_package="openAddPackage"></package-search-form>
            <all-package :packageList="packageList" @package_push="packagePush" @package_lower="packageLower" @package_edit="packageEdit" @package_delete="packageDelete"></all-package>
          </TabPane>
          <TabPane label="未上架" name="unpush">
            <package-search-form @handle_search="getPackageList" :status="1" @handle_add_package="openAddPackage" @batch_push="batchPush"></package-search-form>
            <un-push-package :packageList="packageList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel" @on_select_all_cancel="onSelectAllCancel" @package_push="packagePush" @package_lower="packageLower"
              @package_edit="packageEdit" @package_delete="packageDelete" :status="1"></un-push-package>
          </TabPane>
          <TabPane label="已上架" name="push">
            <package-search-form @handle_search="getPackageList" :status="2" @handle_add_package="openAddPackage" @batch_lower="batchLower"></package-search-form>
            <push-package :packageList="packageList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel" @on_select_all_cancel="onSelectAllCancel" @package_push="packagePush" @package_lower="packageLower"
              @package_edit="packageEdit" @package_delete="packageDelete" :status="2"></push-package>
          </TabPane>
          <TabPane label="已下架" name="lower">
            <package-search-form @handle_search="getPackageList" :status="3" @handle_add_package="openAddPackage" @batch_push="batchPush"></package-search-form>
            <lower-package :packageList="packageList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel" @on_select_all_cancel="onSelectAllCancel" @package_push="packagePush" @package_lower="packageLower"
              @package_edit="packageEdit" @package_delete="packageDelete" :status="3"></lower-package>
          </TabPane>
        </Tabs>
        <Page :total="total" show-total @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
          :page-index="postData.pageIndex" style="margin-top: 10px" />
      </Card>
      <Modal title="添加套餐" v-model="addPackageModal" @on-ok="addPackage">
        <Form :label-width="100" :model="addData" :rules="rules">
          <FormItem prop="name" label="套餐名称：" style="width: 300px;" required>
            <Input v-model="addData.name" placeholder="请输入套餐名称" />
          </FormItem>
          <FormItem prop="courseDesc" label="套餐介绍：" style="width: 300px;" required>
            <Input v-model="addData.courseDesc" placeholder="请输入套餐介绍" />
          </FormItem>
          <three-level :required="true" @on_change="onThreeLevelChange" :threeLevelData="addData.threeLevelData"></three-level>
          <FormItem prop="classType" label="套餐类型：" style="width: 300px;" required>
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
    // import SearchForm from './components/searchForm.vue';
    // import AllCourse from './components/allCourse.vue';
    // import UnPushCourse from './components/unPushCourse.vue';
    // import PushCourse from './components/pushCourse.vue';
    // import LowerCourse from './components/lowerCourse.vue';
    import PackageSearchForm from './components/packageSearchForm.vue';
    import AllPackage from './components/allPackage.vue';
    import UnPushPackage from './components/unPushPackage.vue';
    import PushPackage from './components/pushPackage.vue';
    import LowerPackage from './components/lowerPackage.vue';
    import ThreeLevel from './components/threeLevel.vue';
    export default {
      components: {
        // AllCourse,
        // SearchForm,
        // UnPushCourse,
        // PushCourse,
        // LowerCourse,
        PackageSearchForm,
        AllPackage,
        UnPushPackage,
        PushPackage,
        LowerPackage,
        ThreeLevel,
      },
      data() {
        return {
          postData: { pageIndex: 1, pageSize: 10 },
          packageList: [],
          total: 0,
          addPackageModal: false,
          addData: { oneToXArr: [], x: null, levelHour: [] },
          // x: null,
          // oneToXArr: [],
          // levelHour: [],
          rules: {
            name: [
              { required: true, message: '套餐名称不能为空', trigger: 'blur' }
            ],
            courseDesc: [
              { required: true, message: '套餐介绍不能为空', trigger: 'blur' }
            ]
          },
          batchList: [],
          packageEditUrl: ''
        }
      },
      methods: {
        getPackageList(postData = {}, action) {
          this.postData = Object.assign(this.postData, postData)
          http.get({
            vm: this,
            url: '/manager/course-package/list',
            data: this.postData,
            success: res => {
              this.packageList = res.data.list
              this.total = res.data.total
              action && this.$Message.success('查询成功！')
            }
          })
        },
        openAddPackage() {
          this.addPackageModal = true
          this.addData = { oneToXArr: [], levelHour: [], x: null }
          this.packageEditUrl = ''
        },
        addPackage() {
          const url = this.packageEditUrl || '/manager/course-package/add'
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
              this.getPackageList()
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
          this.getPackageList()
        },
        packagePush({ id, version }) {
          this.$Modal.confirm({
            title: '上架',
            content: '确认要上架此套餐吗？',
            loading: true,
            onOk: () => {
              http.post({
                vm: this,
                url: '/manager/course-package/push',
                data: { id, version },
                success: res => {
                  this.$Message.success('上架成功！')
                  this.getPackageList()
                  this.$Modal.remove()
                }
              })
            }
          })
        },
        packageLower({ id, version }) {
          this.$Modal.confirm({
            title: '下架',
            content: '确认要下架此套餐吗？',
            loading: true,
            onOk: () => {
              http.post({
                vm: this,
                url: '/manager/course-package/lower',
                data: { id, version },
                success: res => {
                  this.$Message.success('下架成功！')
                  this.getPackageList()
                  this.$Modal.remove()
                }
              })
            }
          })
        },
        packageEdit(packageData) {
          console.log('%c packageData', 'color:red;', packageData);
          const { oneToX, levelHourJsonStr } = packageData
          const oneToXArr = oneToX.toString().split(',')
          const levelHour = JSON.parse(levelHourJsonStr) || []
          this.addData = Object.assign({}, { oneToXArr, levelHour, x: null }, packageData)
          this.packageEditUrl = '/manager/course-package/edit'
          this.addPackageModal = true
        },
        packageDelete({ id, version }) {
          this.$Modal.confirm({
            title: '删除',
            content: '确认要删除此套餐吗？',
            loading: true,
            onOk: () => {
              http.post({
                vm: this,
                url: '/manager/course-package/delete',
                data: { id, version },
                success: res => {
                  this.$Message.success('删除成功！')
                  this.getPackageList()
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
              content: '确认批量上架所选套餐吗？',
              loading: true,
              onOk: () => {
                this.$Modal.remove()
                const batchPushJsonStr = batchList.map(item => ({ id: item.id, version: item.version }))
                http.post({
                  vm: this,
                  url: '/manager/course-package/batchPush',
                  data: { batchPushJsonStr: JSON.stringify(batchPushJsonStr) },
                  success: res => {
                    this.$Message.success('批量上架成功！')
                    this.getPackageList();
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
              content: '确认批量下架所选套餐吗？',
              loading: true,
              onOk: () => {
                this.$Modal.remove()
                const batchLowerJsonStr = batchList.map(item => ({ id: item.id, version: item.version }))
                http.post({
                  vm: this,
                  url: '/manager/course-package/batchLower',
                  data: { batchLowerJsonStr: JSON.stringify(batchLowerJsonStr) },
                  success: res => {
                    this.$Message.success('批量下架成功！')
                    this.getPackageList();
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
          this.getPackageList(undefined, 'change')
        },
        changePageSize(pageSize) {
          this.postData.pageSize = pageSize
          this.getPackageList(undefined, 'change')
        }
      },
      mounted() {
        this.getPackageList()
      }
    }
  </script>