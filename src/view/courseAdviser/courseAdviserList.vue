<template>
  <div>
    <Form :model="postData" :label-width="80" inline>
      <FormItem label="课程顾问：" style="width: 210px;">
        <Input type="text" v-model="postData.realName" placeholder="请输入课程顾问姓名" />
      </FormItem>
      <FormItem label="身份证号：" style="width: 230px;">
        <Input v-model="postData.idNo" placeholder="请输入课程顾问身份证号" />
      </FormItem>
      <FormItem label="顾问状态：" style="width: 200px;">
        <Select v-model="postData.status" clearable>
          <Option :value="1">正常</Option>
          <Option :value="0">停用</Option>
        </Select>
      </FormItem>
      <FormItem label="注册日期：" style="width: 220px;">
        <DatePicker type="date" placeholder="请选择注册时间" v-model="createDate"></DatePicker>
      </FormItem>
      <Button type="primary" @click="search" style="margin-left: 20px; margin-right: 10px;">搜索</Button>
      <Button type="primary" @click="courseAdviserExport">导出</Button>
    </Form>
    <Card style="margin-top: 10px;">
      <Table :data="courseAdviserList" :columns="columns"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-index="postData.pageIndex"
        :page-size="postData.pageSize" style="margin-top: 10px" />
    </Card>
    <Modal v-model="detailModal" title="完善资料" :closable="false" :mask-closable="false">
      <Form ref="updateDetailRef" :model="updateDetailData" :rules="updateDetailRules" :label-width="100">
        <FormItem label="课程顾问编号：" style="width: 300px;">
          <Input v-model="updateDetailData.code" disabled />
        </FormItem>
        <FormItem label="课程顾问：" style="width: 300px;">
          <Input v-model="updateDetailData.realName" disabled />
        </FormItem>
        <FormItem label="手机号码：" style="width: 300px;">
          <Input v-model="updateDetailData.mobilePhone" disabled />
        </FormItem>
        <FormItem prop="idNo" label="身份证号：" style="width: 300px;">
          <Input v-model="updateDetailData.idNo" />
        </FormItem>
        <FormItem prop="sex" label="性别：" style="width: 300px;" >
          <RadioGroup v-model="updateDetailData.sex">
            <Radio :label="1">男</Radio>
            <Radio :label="2">女</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem prop="age" label="年龄：" style="width: 300px;" >
          <Input v-model="updateDetailData.age" placeholder="请输入年龄" ></Input>
        </FormItem>
        <FormItem prop="rate" label="提成比例：" style="width: 320px;" >
          <Row><Input v-model="updateDetailData.rate" style="width: 200px;" /> %</Row>
        </FormItem>
        <FormItem prop="email" label="邮箱：" style="width: 300px;">
          <Input v-model="updateDetailData.email" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelUpdateDetail">取消</Button>
        <Button type="primary" @click="updateDetail">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from '@/libs/http';
  import { formatDate } from '@/libs/tools';
  export default {
    data() {
      const validateIdNo = (rule, value, cb) => {
        if(!value){
          cb(new Error('身份找号不能为空'))
        }else{
          http.get({
            vm: this,
            url: '/manager/course-adviser/valid	',
            data: { idNo: value, id: this.updateDetailData.id },
            success: res => {
              if(!res.data){
                 cb(new Error('身份证号已存在'))
              }else{
                this.updateDetailData.age = (new Date().getFullYear() - value.slice(6, 10)).toString()
                cb()
              }
            },
            error: err => {
              cb(new Error('出错了！'))
            }
          })
        }
      }
      const validateAge = (rule, value, cb) => {
        if(!value){
          cb(new Error('请输入年龄'))
        }else{
          if(!/^(?:[1-9][0-9]?|1[01][0-9]|100)$/.test(value)){
            cb(new Error('请输入正确的年龄'))
          }else{
            cb()
          }
        }
      }
      const validateRate = (rule, value, cb) => {
        if(!value){
          cb(new Error('请输入提成比例'))
        }else if(typeof Number(value) !== 'number'){
          cb(new Error('请输入数字'))
        }else{
          cb()
        }
      }
      return {
        postData: {
          pageIndex: 1,
          pageSize: 10
        },
        total: 0,
        createDate: '',
        columns: [
          { title: '课程顾问编号', key: 'code', align: 'center', },
          { title: '课程顾问', key: 'realName', align: 'center', },
          { title: '手机号码', key: 'mobilePhone', align: 'center', render: (h, params) => {
            const mobilePhone = params.row.mobilePhone
            return h('div', mobilePhone && mobilePhone.replace(mobilePhone.substr(3, 4), '****') || '')
          } },
          { title: '邮箱', key: 'email', align: 'center', },
          {
            title: '性别', key: 'sex', align: 'center', render: (h, params) => {
              const sex = params.row.sex
              return h('div', {}, sex === 1 ? '男' : (sex === 2 ? '女' : '未知'))
            }
          },
          { title: '年龄', key: 'age', align: 'center', },
          { title: '身份证号', key: 'idNo', align: 'center', render: (h, params) => {
            const idNo = params.row.idNo
            return h('div', idNo && idNo.replace(idNo.substr(7, 8), '********') || '')
          } },
          { title: '提成比例(%)', key: 'rate', align: 'center' },
          {
            title: '顾问状态', key: 'status', align: 'center', render: (h, params) => {
              const status = params.row.status
              return h('div', {}, status === 1 ? '正常' : '停用')
            }
          },
          { title: '注册时间', key: 'createTime', align: 'center', },
          {
            title: '操作', key: 'actions', align: 'center', render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                },
                on: {
                  click: () => {
                    this.openDetail(params.row)
                  }
                },
                directives: [
                  { name: 'hasPermission', value: "courseAdviserDetail" }
                ]
              }, '完善资料')
            }
          },
        ],
        courseAdviserList: [],
        detailModal: false,
        updateDetailData: {},
        updateDetailRules: {
          idNo: [
            { required: true, message: '身份证号不能为空', trigger: 'blur' },
            { type: 'string', message: '请输入有效的身份证号', pattern: /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/, trigger: 'blur' },
            { validator: validateIdNo, trigger: 'blur' }
          ],
          age: [
            { required: true, message: '请填写年龄', trigger: 'blur' },
            { type: 'string', message: '请输入正确的年龄', pattern: /^(?:[1-9][0-9]?|1[01][0-9]|100)$/ , trigger: 'blur' },
            // { validator: validateAge, trigger: 'blur' }
          ],
          rate: [
            { required: true, message: '请填写提成比例', trigger: 'blur' },
            { validator: validateRate, trigger: 'blur' }
          ],
          email: [
            { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
          ]
        },
      }
    },
    methods: {
      search() {
        this.getCourseAdviserList(() => {
          this.$Message.success('查询成功')
        })
      },
      getCourseAdviserList(cb) {
        this.postData.createDate = this.createDate ? formatDate('YYYY-MM-DD', this.createDate) : null
        http.get({
          vm: this,
          url: '/manager/course-adviser/list',
          data: this.postData,
          success: res => {
            this.courseAdviserList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },
      courseAdviserExport(){
        this.postData.createDate = this.createDate ? formatDate('YYYY-MM-DD', this.createDate) : null
        const { realName, status, idNo, createDate } = this.postData
        const formData = { realName, status, idNo, createDate }
        const paramsArr = []
        for (let k in formData) {
          if (formData[k] || formData[k]==0) {
            paramsArr.push(k + '=' + formData[k])
          }
        }
        const _params = paramsArr.join('&')
        const params = _params && '?' + _params
        window.open('http://www.zilongshu.com/manager/course-adviser/export' + params)
      },
      openDetail({ code, realName, mobilePhone, idNo, sex, age, rate, email, id}) {
        this.detailModal = true
        this.$refs['updateDetailRef'].resetFields()
        this.updateDetailData = { code, realName, mobilePhone, idNo, sex, age, rate: rate.toString(), email, id }
      },
      updateDetail() {
        this.$refs['updateDetailRef'].validate(valid => {
          if(valid){
            http.post({
              vm: this,
              url: '/manager/course-adviser/edit',
              data: this.updateDetailData,
              success: res => {
                this.$Message.success('更新成功！')
                this.detailModal = false
                this.updateDetailData = {}
                this.$refs['updateDetailRef'].resetFields()
                this.getCourseAdviserList()
              }
            })
          }
        })
      },
      cancelUpdateDetail() {
        this.detailModal = false
        this.updateDetailData = {}
        this.$refs['updateDetailRef'].resetFields()
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getCourseAdviserList()
      },
      changePageSize(pageSize) {
        this.postData.pageSize = pageSize
        this.getCourseAdviserList()
      }
    },
    mounted() {
      this.getCourseAdviserList()
    }
  }
</script>