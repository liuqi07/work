<style>
  .detailRow {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    margin-left: 40px;
  }

  .detailRow span {
    display: inline-block;
    width: 50%;
  }
</style>

<template>
  <div>
    <Form :label-width="90" inline>
    <FormItem label="一级分类：" style="width: 220px;" required>
        <Select v-model="postData.firstCode" @on-change="firstChange" @on-open-change="onFirstOpen" clearable>
          <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="二级分类：" style="width: 220px;" required>
        <Select v-model="postData.secondCode" @on-change="secondChange" clearable>
          <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="三级分类：" style="width: 220px;" required>
        <Select v-model="postData.thirdCode" @on-change="thirdChange" clearable>
          <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <Button type="primary" @click="search" style="margin-left: 20px; margin-right: 10px;">查询</Button>
      <Button type="primary" @click="openAdd" style="margin-right: 10px;">添加</Button>
      <!-- <Button type="primary" @click="refundExport" v-hasPermission="'refundExport'">导出</Button> -->
    </Form>
    <Card>
      <Table :columns="columns" :data="questionList"></Table>
      <Page :total="total" show-total @on-change="changePage" :page-size="postData.pageSize"
        :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>

    <Modal title="添加" v-model="addModal" >

      <div slot="footer" >
        <Button @click="cancel" style="margin-right: 10px; margin-left: 20px;" >取消</Button>
        <Button type="primary" @click="saveQuestion" >确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from '@/libs/http';
  import { formatDate } from '@/libs/tools';
  export default {
    data() {
      return {
        postData: { pageIndex: 1, pageSize: 10 },
        columns: [

        ],
        questionList: [],
        firstList: [],
        secondList: [],
        thirdList: [],
        total: 0,
        addModal: false,
        
      }
    },
    methods: {
      search() {
        this.getQuestionList(()=>{this.$Message.success('查询成功！')})
      },
      openAdd() {},
      saveQuestion(){},
      cancel(){},
      getQuestionList(cb){
        http.get({
        vm: this,
        url: '/manager/course-question/list',
        data: this.postData,
        success: res => {
          this.questionList = res.data.list
          this.total = res.data.total
          cb && cb()
        }})
      },
      getFirstList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 1 },
          success: res => {
            this.firstList = res.data
            cb && cb()
          }
        })
      },
      getSecondList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 2, parentCode: this.postData.firstCode },
          success: res => {
            this.secondList = res.data
            cb && cb()
          }
        })
      },
      getThirdList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 3, parentCode: this.postData.secondCode },
          success: res => {
            this.thirdList = res.data
            cb && cb()
          }
        })
      },
      firstChange(val) {
        const _firstId = this.firstList.find(f => f.code === val)
        this.postData.firstId = _firstId && _firstId.id || null
        this.postData.secondCode = null
        this.postData.thirdCode = null
        if (val) {
          this.getSecondList()
        } else {
          this.secondList = []
          this.thirdList = []
        }
      },
      secondChange(val) {
        const _secondId = this.secondList.find(f => f.code === val)
        this.postData.secondId = _secondId && _secondId.id || null
        this.postData.thirdCode = null
        if (val) {
          this.getThirdList()
        } else {
          this.thirdList = []
        }
      },
      thirdChange(val) {
        // this.addData.oneToX = ''
        // if (val) {
        //   const _thirdId = this.thirdList.find(t => t.code === val)
        //   const thirdId = _thirdId && _thirdId.id || null
        //   const oneToXArr = _thirdId && _thirdId.oneToX && _thirdId.oneToX.split(',') || []
        //   console.log('%c oneToXArr, oneToX', 'color:red;', oneToXArr, _thirdId.oneToX);
        //   this.addData = Object.assign({}, this.addData, { thirdId, oneToXArr })
        // } else {
        //   this.addData.oneToXArr = []
        // }
      },
      changePage(p){
        this.postData.pageIndex = p
      },
      onFirstOpen(data){
        if(data){
          this.getFirstList();
        }
      }
    },
    mounted() {
      this.getQuestionList()
    }
  }
</script>