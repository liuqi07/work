<template>
    <div>
      <Form inline="inline" :model="postData" :label-width="100" :rules="rules">
          <FormItem prop="firstCode" label="一级分类：" style="width: 250px;" required>
            <Select v-model="firstCode" @on-change="firstChange" clearable>
              <Option v-for="item in firstList" :value="item.code">{{item.name}}</Option>
            </Select>
          </FormItem>
          <FormItem label="二级分类：" style="width: 250px;" required>
            <Select v-model="secondCode" @on-change="secondChange" clearable>
              <Option v-for="item in secondList" :value="item.code">{{item.name}}</Option>
            </Select>
          </FormItem>
          <FormItem label="三级分类：" style="width: 250px;" required>
            <Select v-model="thirdCode" @on-change="thirdChange" clearable>
              <Option v-for="item in thirdList" :value="item.code">{{item.name}}</Option>
            </Select>
          </FormItem>
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
          rules: {
            firstCode: [
              { required: true, message: '请输入内容', trigger: 'blur'}
            ]
          }
        }
      },
      props: ['inline'],
      methods: {
        onChange() {
          const _firstId = this.firstList.find(f => f.code === this.firstCode)
          const _secondId = this.secondList.find(s => s.code === this.secondCode)
          const _thirdId = this.thirdList.find(t => t.code === this.thirdCode)
          this.postData.firstId = _firstId && _firstId.id || null
          this.postData.secondId = _secondId && _secondId.id || null
          this.postData.thirdId = _thirdId && _thirdId.id || null
  
          this.$emit('on_change', this.postData)
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
          this.onChange()
        },
        secondChange(val) {
          if (val) {
            this.thirdCode = null
            this.getThirdList()
          } else {
            this.thirdList = []
            this.thirdCode = null
          }
          this.onChange()
        },
        thirdChange(val) {
          this.onChange()
        }
      },
      mounted() {
        this.getFirstList()
      }
    }
  </script>