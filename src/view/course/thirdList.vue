<template>
  <div>
    <Form :label-width="100" inline>
      <FormItem label="一级分类" style="width: 300px;">
        <Select v-model="secondPostData.parentCode" @on-change="firstListChange" @on-open-change="firstListOpenChange" @on-clear="clearFirstList"
          clearable>
          <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="二级分类" style="width: 300px;">
        <Select v-model="postData.parentCode" @on-open-change="secondListOpenChange" clearable>
          <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem>
        <Button type="primary" v-hasPermission="'thirdAdd'" @click="thirdAdd">添加三级分类</Button>
        <Button type="primary" @click="query" style="margin-left: 10px;">查询</Button>
      </FormItem>
    </Form>
    <Card style="margin-top: 10px;">
      <Table :columns="columns" :data="thirdList"></Table>
      <Page :total="total" show-total @on-change="changePage" :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal title="添加三级分类" v-model="addModal" @on-ok="add">
      <Form :label-width="100">
        <FormItem label="一级分类名称：" style="width: 300px;">
          <Select v-model="secondPostData.parentCode" size="small" @on-change="firstListChange" @on-open-change="firstListOpenChange" @on-clear="clearFirstList"
            placeholder="请选择一级分类名称">
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="二级分类名称：" style="width: 300px;">
          <Select v-model="addData.parentCode" size="small" @on-open-change="secondListOpenChange" placeholder="请选择二级分类名称">
            <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="三级分类名称：" style="width: 300px;">
          <Input v-model="addData.name" size="small" placeholder="请输入三级分类名称" />
        </FormItem>
        <FormItem label="级别：" style="width: 300px;">
          <Button type="dashed" size="small" long @click="addLevel" icon="md-add">Add Level</Button>
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
        <FormItem label="1:x">
          <Button type="dashed" @click="addOneToX" size="small" style="margin-right: 10px;">增加</Button>
          <InputNumber v-model="x" size="small" :min="1" style="width: 50px; margin-right: 10px;" />
          <Tag v-for="(item, index) in oneToXArr" color="success" :key="index" :name="item" closable @on-close="closeOneToXTag">{{item}}</Tag>
        </FormItem>
      </Form>
    </Modal>
    <Modal title="编辑" v-model="editModal" @on-ok="edit">
      <Form :label-width="100">
        <FormItem label="三级分类名称：" style="width: 300px;">
          <Input v-model="editData.name" size="small" placeholder="请输入三级分类名称" />
        </FormItem>
        <FormItem label="级别：" style="width: 300px;">
          <Button type="dashed" size="small" long @click="addLevel" icon="md-add">Add Level</Button>
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
        <FormItem label="1:x">
          <Button type="dashed" @click="addOneToX" size="small" style="margin-right: 10px;">增加</Button>
          <InputNumber v-model="x" :min="1" size="small" style="width: 50px; margin-right: 10px;" />
          <Tag v-for="(item, index) in oneToXArr" color="success" :key="index" :name="item" closable @on-close="closeOneToXTag">{{item}}</Tag>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
  import http from '@/libs/http';
  export default {
    data() {
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
          { title: '序号', type: 'index', algin: 'center' },
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
        levelList: [],
        x: null,
        oneToXArr: [],
        version: null,
        editData: {},
        editModal: false
      }
    },
    methods: {
      thirdAdd() {
        this.addModal = true
      },
      query() {
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
        console.log('%c this.addData', 'color:red;', this.addData);
        http.post({
          vm: this,
          url: '/manager/course-classification/third/add',
          data: this.addData,
          success: res => {
            this.$Message.success('添加成功！')
            this.getThirdList()
            this.addData = {}
          }
        })
      },
      addLevel() {
        const levelList = [...this.levelList];
        const levelObj = { level: levelList.length + 1, selectCount: 1, blankCount: 1 }
        levelList.push(levelObj);
        this.levelList = levelList;
      },
      addOneToX() {
        this.x && this.oneToXArr.push(this.x)
        this.x = null
      },
      closeOneToXTag(event, name) {
        this.oneToXArr.splice(this.oneToXArr.indexOf(name), 1)
      },


      thirdEdit(row) {
        console.log('%c row', 'color:red;', row);
        this.editModal = true
        this.oneToXArr = row.oneToX.split(',') || []
        this.levelList = row.levelQuestions || []
        const { oneToX, levelQuestions: levelList, id, version, name } = row
        this.editData = { id, version, name }
      },
      edit(){
        this.editData.oneToX = this.oneToXArr.join(',')
        this.editData.levelQuestions = JSON.stringify(this.levelList)
        this.editData.level = this.levelList.length
        http.post({
        vm: this,
        url: '/manager/course-classification/third/edit',
        data: this.editData,
        success: res => {
          this.$Message.success('更新成功！')
          this.getThirdList()
        }})
      },
      firstListChange(value) {
        if(value){
          delete this.postData.parentCode
          this.getSecondList()
        }else{
          delete this.postData.parentCode
          this.secondList = [];
        }
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
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
      }
    },
    mounted() {
      this.getThirdList()
    }
  }
</script>