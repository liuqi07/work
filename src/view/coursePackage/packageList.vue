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
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal title="添加套餐" v-model="addPackageModal">
      <Form :label-width="100" :model="addData" :rules="addRules" ref="addPackage">
        <FormItem prop="firstCode" label="一级分类：" style="width: 250px;" >
          <Select v-model="addData.firstCode" @on-change="firstChange" clearable>
            <Option v-for="item in addData.firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="secondCode" label="二级分类：" style="width: 250px;" >
          <Select v-model="addData.secondCode" @on-change="secondChange" clearable>
            <Option v-for="item in addData.secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="thirdCode" label="三级分类：" style="width: 250px;" >
          <Select v-model="addData.thirdCode" @on-change="thirdChange" clearable>
            <Option v-for="item in addData.thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="name" label="套餐名称：" style="width: 300px;" >
          <Input v-model="addData.name" placeholder="请输入套餐名称" />
        </FormItem>
        <FormItem label="套餐描述：" style="width: 300px;">
          <Input v-model="addData.coursePackageDesc" placeholder="请输入套餐描述" />
        </FormItem>
        <FormItem prop="oneToX" label="授课比例：" style="width: 300px;" >
          <Select v-model="addData.oneToX" placeholder="请先选择三级分类" clearable>
            <Option v-for="item in addData.oneToXArr" :key="item" :value="item">{{item}}</Option>
          </Select>
        </FormItem>
        <Row>
          <Col :span="10">
            <FormItem prop="weekCount" label="周数：" style="width: 300px;" >
              <InputNumber v-model="addData.weekCount" :min="1" placeholder="请输入周数" />
            </FormItem>
          </Col>
          <Col :span="10">
            <FormItem prop="weekClassHour" label="每周课时数：" style="width: 300px;" >
              <InputNumber v-model="addData.weekClassHour" :min="1" placeholder="请输入每周课时数" />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="10">
            <FormItem prop="unitPrice" label="课时单价：" style="width: 300px;" >
              <InputNumber v-model="addData.unitPrice" :min="1" placeholder="请输入课时单价" />
            </FormItem>
          </Col>
          <Col :span="10">
            <FormItem prop="isDiscount" label="是否优惠:" style="width: 300px;" >
              <RadioGroup v-model="addData.isDiscount" @on-change="onRadioChange">
                <Radio :label="1">是</Radio>
                <Radio :label="0">否</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
        <FormItem prop="discountUnitPrice" label="优惠课时单价：" style="width: 300px;" :label-width="110" :required="discountUnitPriceRequire">
          <InputNumber v-model="addData.discountUnitPrice" :min="0" placeholder="请输入优惠课时单价" :disabled="!discountUnitPriceRequire" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelAddPackage" style="margin-right: 10px;" >取消</Button>
        <Button type="primary" @click="addPackage" >确定</Button>
      </div>
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
  // import ThreeLevel from './components/threeLevel.vue';
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
      // ThreeLevel,
    },
    data() {
      const validateDiscountUnitPrice = (rule, value, cb) => {
        console.log(value)
        if(!value && this.discountUnitPriceRequire){
          cb(new Error('优惠金额不能为空'))
        }else if(typeof Number(value) !== 'number') {
          cb(new Error('请输入正确的金额'))
        }else{
          cb()
        }
      }
      return {
        postData: { pageIndex: 1, pageSize: 10 },
        packageList: [],
        total: 0,
        addPackageModal: false,
        addData: { oneToXArr: [], firstList: [], secondList: [], thirdList: [], isDiscount: 0, weekClassHour: 0, weekCount: 0, unitPrice: 0, discountUnitPrice: 0 },
        // addData: { oneToXArr: [] },
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
            { required: true, message: '套餐名称不能为空', trigger: 'blur' }
          ],
          oneToX: [
            { required: true, type: 'number', message: '授课比例不能为空', trigger: 'change' }
          ],
          weekCount: [
            { required: true, type: 'number', min: 1, message: '周数不能为0或空', trigger: 'blur' },
            { required: true, type: 'number', min: 1, message: '周数不能为0或空', trigger: 'change' }
          ],
          weekClassHour: [
            { required: true, type: 'number', min: 1, message: '每周课时数不能为0或空', trigger: 'blur' },
            { required: true, type: 'number', min: 1, message: '每周课时数不能为0或空', trigger: 'change' }
          ],
          unitPrice: [
            { required: true, type: 'number', min: 1, message: '课时单价不能为0或空', trigger: 'blur' },
            { required: true, type: 'number', min: 1, message: '课时单价不能为0或空', trigger: 'change' }
          ],
          isDiscount: [
            { required: true, type: 'number', trigger: 'change' }
          ],
          discountUnitPrice: [
            { validator: validateDiscountUnitPrice, trigger: 'blur'},
            { validator: validateDiscountUnitPrice, trigger: 'change'},
          ]
        },
        batchList: [],
        packageUrl: '',
        discountUnitPriceRequire: false,
        uploadIsShow: true,
        addOrEdit: true,
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
        this.uploadIsShow = true
        this.addData = { oneToXArr: [], firstList: [], secondList: [], thirdList: [], isDiscount: 0, weekClassHour: 0, weekCount: 0, unitPrice: 0, discountUnitPrice: 0 }
        this.packageUrl = '/manager/course-package/add'
        this.addOrEdit = true
        this.getFirstList()
      },
      addPackage() {
        const url = this.packageUrl
        const addOrEdit = this.addOrEdit
        const { id, name, coursePackageDesc, firstId, secondId, thirdId, weekClassHour, weekCount, unitPrice, isDiscount, oneToX, discountUnitPrice, version } = this.addData

        // if(!name || !firstId || !secondId || !thirdId || !weekClassHour || !weekCount || !unitPrice || !oneToX ) {
        //   this.$Message.error({
        //     content: '标星内容不能为空！',
        //     duration: 6
        //   })
        //   console.log('%c addPackage', 'color:red;', name, firstId, secondId, thirdId, weekClassHour, weekCount, unitPrice, isDiscount, oneToX );
        //   return
        // }
        // else if(isDiscount === 1 && !discountUnitPrice){
        //   this.$Message.error({
        //     content: '优惠金额不能为空！',
        //     duration: 6
        //   })
        //   return
        // }
        this.$refs['addPackage'].validate(valid => {
          if(valid) {
            const addData = { id, name, coursePackageDesc, firstId, secondId, thirdId, weekClassHour, weekCount, unitPrice, isDiscount, oneToX, discountUnitPrice, version }
            if(addOrEdit){
              delete addData.id
              delete addData.version
            }
            // const formData = new FormData()
            // for (let k in addData) {
            //   formData.append(k, addData[k])
            // }
            const msg = addOrEdit ? '添加成功！' : '编辑成功！'
            http.post({
              vm: this,
              url,
              data: addData,
              success: res => {
                this.$Message.success(msg)
                this.addData = { oneToXArr: [], firstList: [], secondList: [], thirdList: [], isDiscount: 0, weekClassHour: 0, weekCount: 0, unitPrice: 0, discountUnitPrice: 0 }
                this.discountUnitPriceRequire = false
                this.addPackageModal = false
                this.$refs['addPackage'].resetFields()
                this.getPackageList()
              }
            })
          }
        })
      },
      cancelAddPackage () {
        this.addPackageModal = false
        this.addData = { oneToXArr: [],firstList: [], secondList: [], thirdList: [], isDiscount: 0, weekClassHour: 0, weekCount: 0, unitPrice: 0, discountUnitPrice: 0 }
        this.$refs['addPackage'].resetFields()
        this.packageUrl = ''
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
        this.uploadIsShow = false
        this.addOrEdit = false
	      // console.log('%c packageData', 'color:red;', packageData)
        const { id, firstId, secondId, thirdId, oneToX, isDiscount=0, weekClassHour=0, weekCount=0, unitPrice=0, discountUnitPrice=0, version } = packageData
        this.discountUnitPriceRequire = isDiscount===1 ? true : false
        this.getFirstList(() => {
          const _firstCode = this.addData.firstList.find(f => f.id === firstId)
          const firstCode = _firstCode && _firstCode.code || ''
          this.addData = Object.assign({}, this.addData, { id, firstCode, firstId, isDiscount, weekClassHour, weekCount, unitPrice, discountUnitPrice, version })
          this.getSecondList(() => {
            const _secondCode = this.addData.secondList.find(s => s.id === secondId)
            const secondCode = _secondCode && _secondCode.code || ''
            this.addData = Object.assign({}, this.addData, { secondCode, secondId })
            this.getThirdList(() => {
              const _thirdCode = this.addData.thirdList.find(s => s.id === thirdId)
              const thirdCode = _thirdCode && _thirdCode.code || ''
              const oneToXArr = (_thirdCode && _thirdCode.oneToX && _thirdCode.oneToX.split(',') || []).map(i=>parseInt(i))
              this.addData = Object.assign({}, this.addData, { thirdCode, oneToXArr, oneToX, thirdId })
              // console.log('%c firstList, secondList, thirdList', 'color:red;', this.addData.firstList, this.addData.secondList, this.addData.thirdList, oneToXArr, oneToX);
            })
          })
        })

	      this.addData = Object.assign({}, packageData, this.addData)
        this.packageUrl = '/manager/course-package/edit'
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
      handleFileChange(e) {
        this.addData.file = e.target.files[0]
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getPackageList()
      },
      changePageSize(pageSize) {
        this.postData.pageSize = pageSize
        this.getPackageList()
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
      this.getPackageList()
    }
  }
</script>