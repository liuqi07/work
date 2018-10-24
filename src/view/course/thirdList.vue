<template>
  <div>
    <Form :label-width="90" inline>
      <FormItem label="一级分类" style="width: 220px;">
        <Select v-model="secondPostData.parentCode" @on-change="firstListChange" @on-open-change="firstListOpenChange" @on-clear="clearFirstList"
          clearable>
          <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="二级分类" style="width: 220px;">
        <Select v-model="postData.parentCode" @on-open-change="secondListOpenChange" clearable>
          <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <Button type="primary" @click="search" v-hasPermission="'search'" style="margin-left: 20px; margin-right: 10px;">查询</Button>
      <Button type="primary" v-hasPermission="'thirdAdd'" @click="thirdAdd">添加三级分类</Button>
    </Form>
    <Card style="margin-top: 10px;">
      <Table :columns="columns" :data="thirdList"></Table>
      <Page :total="total" show-total @on-change="changePage" :page-index="postData.pageIndex" @on-page-size-change="changePageSize" show-sizer :page-size="postData.pageSize" style="margin-top: 10px" />
    </Card>
    <Modal title="添加三级分类" v-model="addModal">
      <Form :label-width="120" ref="addData" :model="addData" :rules="addRules" >
        <FormItem label="一级分类名称：" style="width: 300px;" required>
          <Select v-model="secondPostData.parentCode" size="small" @on-change="firstListChange" @on-open-change="firstListOpenChange"
            @on-clear="clearFirstList" placeholder="请选择一级分类名称">
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="二级分类名称：" style="width: 300px;" required>
          <Select v-model="addData.parentCode" size="small" @on-open-change="secondListOpenChange" placeholder="请选择二级分类名称">
            <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="name" label="三级分类名称：" style="width: 300px;">
          <Input v-model="addData.name" size="small" placeholder="请输入三级分类名称" />
        </FormItem>
        <FormItem label="级别：" style="width: 500px;" required>
          <Button type="dashed" size="small" @click="addLevel" icon="md-add" style="margin-right: 15px;">添加级别</Button>
          <Button type="error" size="small" @click="removeLevel" icon="md-remove">删除级别</Button>
        </FormItem>
        <FormItem v-for="(item, index) in levelList" :key="index"  required>
          <Row>
            <Col :span="6"> 等级
            <InputNumber :min="1" size="small" v-model="item.level" disabled style="width: 50px;" />
            </Col>
            <Col :span="8"> 选择题数量
            <InputNumber :min="1" size="small" v-model="item.selectCount" style="width: 50px;" />
            </Col>
            <Col :span="8"> 填空题数量
            <InputNumber :min="1" size="small" v-model="item.blankCount" style="width: 50px;" />
            </Col>
          </Row>
        </FormItem>
        <FormItem label="授课比例：" required>
          <Button type="dashed" @click="addOneToX" size="small" style="margin-right: 10px;">增加</Button>
          <InputNumber v-model="x" size="small" :min="1" style="width: 50px; margin-right: 10px;" />
          <Tag v-for="(item, index) in oneToXArr" color="success" :key="index" :name="item" closable @on-close="closeOneToXTag">{{item}}</Tag>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel" >取消</Button>
        <Button @click="add" type="primary" >确定</Button>
      </div>
    </Modal>
    <Modal title="编辑" v-model="editModal" >
      <Form :label-width="110" ref="editData" :model="editData" :rules="editRules">
        <FormItem prop="name" label="三级分类名称：" style="width: 300px;">
          <Input v-model="editData.name" size="small" placeholder="请输入三级分类名称" />
        </FormItem>
        <FormItem label="级别：" style="width: 500px;">
          <Button type="dashed" size="small" @click="addLevel" icon="md-add" style="margin-right: 15px;">添加级别</Button>
          <Button type="error" size="small" @click="removeLevel" icon="md-remove">删除级别</Button>
        </FormItem>
        <FormItem v-for="(item, index) in levelList" :key="index">
          <Row>
            <Col :span="6"> 等级
            <InputNumber :min="1" size="small" v-model="item.level" disabled style="width: 50px;" />
            </Col>
            <Col :span="8"> 选择题数量
            <InputNumber :min="1" size="small" v-model="item.selectCount" style="width: 50px;" />
            </Col>
            <Col :span="8"> 填空题数量
            <InputNumber :min="1" size="small" v-model="item.blankCount" style="width: 50px;" />
            </Col>
          </Row>
        </FormItem>
        <FormItem label="授课比例：">
          <Button type="dashed" @click="addOneToX" size="small" style="margin-right: 10px;">增加</Button>
          <InputNumber v-model="x" :min="1" size="small" style="width: 50px; margin-right: 10px;" />
          <Tag v-for="(item, index) in oneToXArr" color="success" :key="index" :name="item" closable @on-close="closeOneToXTag">{{item}}</Tag>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button @click="edit" type="primary" >确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from '@/libs/http';
  export default {
      data() {
        const validateName = (rule, name, cb) => {
        if(!name){
          cb(new Error('三级分类名称不能为空'))
        }else{
          let data = { name }
          this.editModal && (data.id = this.editData.id)
          http.post({
            vm: this,
            url: "/manager/course-classification/valid",
            data,
            success: res => {
              res.data && cb() || cb(new Error('三级分类名已存在'))
            }
          })
        }
      }
      return {
        postData: {
          pageIndex: 1,
          pageSize: 20
        },
        total: 0,
        secondPostData: { type: 2 },
        firstList: [],
        secondList: [],
        thirdList: [],
        columns: [
          { title: '一级分类名称', key: 'firstName', algin: 'center' },
          { title: '二级分类名称', key: 'secondName', algin: 'center' },
          { title: '三级分类名称', key: 'name', algin: 'center' },
          { title: '操作时间', key: 'updateTime', algin: 'center' },
          { title: '操作人', key: 'opearteName', algin: 'center' },
          {
            title: '管理', key: 'actions', algin: 'center', render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                  },
                  on: {
                    click: () => {
                      this.thirdEdit(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "thirdEdit" }
                  ]
                }, '编辑')
              ])
            }
          },
        ],
        addModal: false,
        addData: {},
        addRules: {
          name: [
            { required: true, message: '三级名称不能为空', trigger: 'blur' },
            { validator: validateName, trigger: 'blur' }
          ]
        },
        levelList: [],
        x: null,
        oneToXArr: [],
        version: null,
        editData: {},
        editRules: {
          name: [
            { required: true, message: '三级名称不能为空', trigger: 'blur' },
            { validator: validateName, trigger: 'blur' }
          ]
        },
        editModal: false
      }
    },
    methods: {
      thirdAdd() {
        this.addModal = true
        this.secondPostData = { type: 2 }
        this.addData = {}
        this.levelList = []
        this.x = null
        this.$refs['addData'].resetFields()
      },
      search() {
        this.getThirdList(() => {
          this.$Message.success('查询成功！')
        })
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
          data: this.secondPostData,
          success: res => {
            this.secondList = res.data
          }
        })
      },
      getThirdList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/third/list',
          data: this.postData,
          success: res => {
            this.thirdList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },
      add() {
        this.addData.levelQuestions = JSON.stringify(this.levelList)
        this.addData.oneToX = this.oneToXArr.join(',')
        this.addData.level = this.levelList.length
        const { name, parentCode, level, oneToX, levelQuestions } = this.addData
        if(!name || !parentCode || !level || !oneToX || !levelQuestions){
          this.$Message.error({
            content: '标星内容不能为空！',
            duration: 6
          })
          return
        }
        http.post({
          vm: this,
          url: '/manager/course-classification/third/add',
          data: this.addData,
          success: res => {
            this.$Message.success('添加成功！')
            this.addModal = false
            this.$refs['addData'].resetFields()
            this.getThirdList()
            this.addData = {}
            this.levelList = []
            this.oneToXArr = []
          }
        })
      },
      cancel () {
        this.addModal = false
        this.editModal = false
        this.addData = {}
        this.levelList = []
        this.oneToXArr = []
        this.$refs['addData'].resetFields()
        this.$refs['editData'].resetFields()
      },
      addLevel() {
        const levelList = [...this.levelList]
        const levelObj = { level: levelList.length + 1, selectCount: 1, blankCount: 1 }
        levelList.push(levelObj);
        this.levelList = levelList
      },
      removeLevel(e){
        const levelList = this.levelList
        levelList.splice(levelList.length-1 ,1)
      },
      addOneToX() {
        this.x && this.oneToXArr.push(this.x)
        this.x = null
      },
      closeOneToXTag(event, name) {
        this.oneToXArr.splice(this.oneToXArr.indexOf(name), 1)
      },


      thirdEdit(row) {
        this.editModal = true
        this.$refs['editData'].resetFields()
        this.oneToXArr = row.oneToX.split(',') || []
        this.levelList = row.levelQuestions || []
        const { oneToX, levelQuestions: levelList, id, version, name } = row
        this.editData = { id, version, name }
      },
      edit() {
        this.editData.oneToX = this.oneToXArr.join(',')
        this.editData.levelQuestions = JSON.stringify(this.levelList)
        this.editData.level = this.levelList.length
        http.post({
          vm: this,
          url: '/manager/course-classification/third/edit',
          data: this.editData,
          success: res => {
            this.$Message.success('更新成功！')
            this.$refs['editData'].resetFields()
            this.levelList = []
            this.oneToXArr = []
            this.addData = {}
            this.editModal = false
            this.getThirdList()
          }
        })
      },
      firstListChange(value) {
        delete this.postData.parentCode
        this.secondPostData.parentCode = value
        this.addData.parentCode = null
        this.secondList = [];
        this.getSecondList()
        // value && this.getSecondList() || (this.secondList = [])
      },
      secondListOpenChange() {
        // this.getSecondList()
      },
      firstListOpenChange() {
        this.getFirstList()
      },
      clearFirstList() {
        this.secondList = []
        delete this.postData.parentCode
      },
      changePage(p) {
        this.postData.pageIndex = p
        this.getThirdList()
      },
      changePageSize(s){
        this.postData.pageSize = s
        this.getThirdList()
      }
    },
    mounted() {
      this.getThirdList()
    }
  }
</script>