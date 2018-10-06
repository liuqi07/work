<template>
  <div>
    <Form inline v-model="postData" :label-width="80">
        <FormItem label="一级分类" style="width: 220px;">
          <Select v-model="firstCode" @on-change="firstChange" clearable>
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="二级分类" style="width: 220px;">
          <Select v-model="secondCode" @on-change="secondChange" clearable>
            <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="三级分类" style="width: 220px;">
          <Select v-model="thirdCode" clearable>
            <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="课程名称" style="width: 220px;">
          <Input v-model="postData.name" placeholder="请输入课程名称" />
        </FormItem>
          <Button type="primary" @click="handleSearch" style="margin: 0 10px 0 20px;">搜索</Button>
          <Button type="primary" v-hasPermission="'courseAdd'" @click="handleAddCourse" style="margin-right: 10px;">添加课程</Button>
          <Button type="success" v-show="status===1||status===3" v-hasPermission="'courseBatchPush'" @click="handleBatchPush" style="margin-right: 10px;">批量上架</Button>
          <Button type="error" v-show="status===2" v-hasPermission="'courseBatchLower'" @click="handleBatchLower">批量下架</Button>
    </Form>
  </div>
</template>

<script>
  import http from '@/libs/http';
  export default {
    data() {
      return {
        postData: {},
        firstList: [],
        secondList: [],
        thirdList: [],
        firstCode: null,
        secondCode: null,
        thirdCode: null,
      }
    },
    props: ['status'],
    methods: {
      handleSearch() {
        const _firstId = this.firstList.find(f => f.code === this.firstCode)
        const _secondId = this.secondList.find(s => s.code === this.secondCode)
        const _thirdId = this.thirdList.find(t => t.code === this.thirdCode)
        this.postData.firstId = _firstId && _firstId.id || null
        this.postData.secondId = _secondId && _secondId.id || null
        this.postData.thirdId = _thirdId && _thirdId.id || null

        this.$emit('handle_search', this.postData, 'action')
      },
      handleAddCourse() {
        this.$emit('handle_add_course')
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
          data: { type: 2, parentCode: this.firstCode },
          success: res => {
            this.secondList = res.data
          }
        })
      },
      getThirdList() {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 3, parentCode: this.secondCode },
          success: res => {
            this.thirdList = res.data
          }
        })
      },
      firstChange(val) {
        if (val) {
          this.secondCode = null
          this.thirdCode = null
          this.getSecondList()
        } else {
          this.secondList = []
          this.thirdList = []
          this.secondCode = null
          this.thirdCode = null
        }
      },
      secondChange(val) {
        if (val) {
          this.thirdCode = null
          this.getThirdList()
        } else {
          this.thirdList = []
          this.thirdCode = null
        }
      },
      handleBatchPush() {
        this.$emit('batch_push')
      },
      handleBatchLower() {
        this.$emit('batch_lower')
      }
    },
    mounted() {
      this.getFirstList()
    }
  }
</script>