<template>
  <div>
    <Form inline v-model="postData" :label-width="100">
      <FormItem label="一级分类" style="width: 250px;">
        <Select v-model="firstCode" @on-change="firstChange" clearable>
          <Option v-for="item in firstList" :value="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="二级分类" style="width: 250px;">
        <Select v-model="secondCode" @on-change="secondChange" clearable>
          <Option v-for="item in secondList" :value="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="三级分类" style="width: 250px;">
        <Select v-model="thirdCode" clearable>
          <Option v-for="item in thirdList" :value="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleSearch">搜索</Button>
      </FormItem>
    </Form>
  </div>
</template>

<script>
  import http from '@/libs/http';
  export default {
    data () {
      return {
        postData: { pageIndex: 0, pageSize: 10 },
        firstList: [],
        secondList: [],
        thirdList: [],
        firstCode: null,
        secondCode: null,
        thirdCode: null,
      }
    },
    methods: {
      handleSearch () {
        const firstId = this.firstList.find(f => f.code===this.firstCode).id || null
        const secondId = this.secondList.find(s => s.code===this.secondCode).id || null
        const thirdId = this.thirdList.find(t => t.code===this.thirdCode).id || null
        console.log('%c firstId', 'color:red;', firstId);
      },
      getFirstList () {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 1 },
          success: res => {
            this.firstList = res.data
            this.getSecondList()
          }
        })
      },
      getSecondList () {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 2, parentCode: this.firstCode },
          success: res => {
            this.secondList = res.data
            this.getThirdList()
          }
        })
      },
      getThirdList () {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 3, parentCode: this.secondCode },
          success: res => {
            this.thirdList = res.data
          }
        })
      },
      firstChange (val) {
        if(val){
          this.secondCode = null
          this.thirdCode = null
          this.getSecondList()
        }else {
          this.secondList = []
          this.thirdList = []
          this.secondCode = null
          this.thirdCode = null
        }
      },
      secondChange (val) {
        if(val) {
          this.thirdCode = null
          this.getThirdList()
        }else{
          this.thirdList = []
          this.thirdCode = null
        }
      }
    },
    mounted () {
      this.getFirstList()
    }
  }
</script>