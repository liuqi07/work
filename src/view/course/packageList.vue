<template>
  <div>
    <Card>
      <Tabs name="all" @on-click="handleTabs" style="min-height: 400px;">
        <TabPane label="全部套餐" name="all">
          <package-search-form :status="0" @handle_search="getPackageList" @handle_add_package="openAddPackage"></package-search-form>
          <all-package :packageList="packageList" @package_push="packagePush" @package_lower="packageLower" @package_edit="packageEdit"
            @package_delete="packageDelete"></all-package>
        </TabPane>
        <TabPane label="未上架" name="unpush">
          <package-search-form @handle_search="getPackageList" :status="1" @handle_add_package="openAddPackage" @batch_push="batchPush"></package-search-form>
          <un-push-package :packageList="packageList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel"
            @on_select_all_cancel="onSelectAllCancel" @package_push="packagePush" @package_lower="packageLower" @package_edit="packageEdit"
            @package_delete="packageDelete" :status="1"></un-push-package>
        </TabPane>
        <TabPane label="已上架" name="push">
          <package-search-form @handle_search="getPackageList" :status="2" @handle_add_package="openAddPackage" @batch_lower="batchLower"></package-search-form>
          <push-package :packageList="packageList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel"
            @on_select_all_cancel="onSelectAllCancel" @package_push="packagePush" @package_lower="packageLower" @package_edit="packageEdit"
            @package_delete="packageDelete" :status="2"></push-package>
        </TabPane>
        <TabPane label="已下架" name="lower">
          <package-search-form @handle_search="getPackageList" :status="3" @handle_add_package="openAddPackage" @batch_push="batchPush"></package-search-form>
          <lower-package :packageList="packageList" @on_select="onSelect" @on_select_all="onSelectAll" @on_select_cancel="onSelectCancel"
            @on_select_all_cancel="onSelectAllCancel" @package_push="packagePush" @package_lower="packageLower" @package_edit="packageEdit"
            @package_delete="packageDelete" :status="3"></lower-package>
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
        <FormItem label="授课比例：" style="width: 300px;" required>
          <Select v-model="addData.oneToX" placeholder="请先选择三级分类">
            <Option v-for="item in addData.oneToXArr" :key="item" :value="item">{{item}}</Option>
          </Select>
        </FormItem>
        <!-- <FormItem label="级别：" style="width: 300px;" required>
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
        </FormItem> -->
        <Row>
          <Col :span="10">
            <FormItem label="周数：" style="width: 300px;" required>
              <InputNumber v-model="addData.weekCount" :min="1" placeholder="请输入周数" />
            </FormItem>
          </Col>
          <Col :span="10">
            <FormItem label="每周课时数：" style="width: 300px;" required>
              <InputNumber v-model="addData.weekClassHour" :min="1" placeholder="请输入每周课时数" />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="10">
            <FormItem label="课时单价：" style="width: 300px;" required>
              <InputNumber v-model="addData.unitPrice" :min="1" placeholder="请输入课时单价" />
            </FormItem>
          </Col>
          <Col :span="10">
            <FormItem label="是否优惠:" style="width: 300px;" required>
              <RadioGroup v-model="addData.isDiscount" @on-change="onRadioChange">
                <Radio :label="1">是</Radio>
                <Radio :label="0">否</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
        <FormItem label="优惠课时单价：" style="width: 300px;" :label-width="110" :required="discountUnitPriceRequire">
          <InputNumber v-model="addData.discountUnitPrice" :min="0" placeholder="请输入优惠课时单价" :disabled="!discountUnitPriceRequire" />
        </FormItem>
        <FormItem label="套餐描述：" style="width: 300px;">
          <Input v-model="addData.coursePackageDesc" placeholder="请输入套餐描述" />
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
        // addData: { oneToXArr: [], x: null, levelHour: [] },
        addData: { oneToXArr: [] },
        rules: {
          name: [
            { required: true, message: '套餐名称不能为空', trigger: 'blur' }
          ],
          courseDesc: [
            { required: true, message: '套餐介绍不能为空', trigger: 'blur' }
          ]
        },
        batchList: [],
        packageEditUrl: '',
        discountUnitPriceRequire: false,

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
        this.addData = { oneToXArr: [] }
        this.packageEditUrl = ''
      },
      addPackage() {
        const url = this.packageEditUrl || '/manager/course-package/add'
        const { levelHour } = this.addData

        levelHour.length > 0 && (this.addData.levelHourJsonStr = JSON.stringify(levelHour))
        // 这三句待验证
        delete this.addData.oneToXArr
        delete this.addData.levelHour
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
            this.addData = { oneToXArr: [], levelHour: [] }
            this.addCourseModal = false
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
        // console.log('%c packageData', 'color:red;', packageData);
        // const { oneToX, levelHourJsonStr } = packageData
        // const levelHour = JSON.parse(levelHourJsonStr) || []
        // this.addData = Object.assign({}, { levelHour, x: null }, packageData)
        this.addData = Object.assign({}, packageData)
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
      onRadioChange(data) {
        this.discountUnitPriceRequire = data === 1 ? true : false
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
      onThreeLevelChange(data) {
        this.addData = Object.assign(this.addData, data)
        const { thirdId, oneToXArr } = data
        if (thirdId && oneToXArr && oneToXArr.length > 0) {
          this.addData.oneToXArr = oneToXArr
        }
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