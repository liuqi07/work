<template>
  <div>
    <Form :model="postData" :label-width="100">
      <Row>
        <Col :span="6">
        <FormItem label="手机号码：" style="width: 250px;">
          <Input type="text" v-model="postData.mobilePhone" placeholder="请输入学员手机号码" />
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="学员姓名：" style="width: 250px;">
          <Input v-model="postData.realName" placeholder="请输入学员姓名" />
        </FormItem>
        </Col>
        <!-- <Col :span="6">
          <FormItem label="课程等级：" style="width: 250px;">
            <Select v-model="postData.status">
              <Option :value="1"></Option>
              <Option :value="2"></Option>
            </Select>
          </FormItem>
          </Col> -->
      </Row>
      <Row>
        <!-- <Col :span="6">
          <FormItem label="所处阶段：" style="width: 250px;">
            
          </FormItem>
          </Col> -->
        <Col :span="6">
        <FormItem label="学员状态：" style="width: 250px;">
          <Select v-model="postData.status" placeholder="请选择学员状态" clearable>
            <Option :value="1">正常</Option>
            <Option :value="0">冻结</Option>
          </Select>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="注册日期：" style="width: 250px;">
          <DatePicker type="date" placeholder="请选择注册时间" v-model="createDate"></DatePicker>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem>
          <Button type="primary">搜索</Button>
        </FormItem>
        </Col>
      </Row>
    </Form>
    <Card>
      <Table :columns="columns" :data="studentList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-index="postData.pageIndex" :page-size="postData.pageSize"
      style="margin-top: 10px" />
    </Card>
  </div>
</template>

<script>
  import http from '@/libs/http';
  import { formatDate } from '@/libs/tools';
  export default {
    data() {
      return {
        postData: {
          pageIndex: 1,
          pageSize: 10
        },
        createDate: '',
        total: 0,
        columns: [
          { title: '学员编号', key: 'code' },
          { title: '学员姓名', key: 'realName' },
          { title: '手机号码', key: 'mobilePhone' },
          { title: '邮箱', key: 'email' },
          { title: '性别', key: 'sex', render: (h, params) => {
            const sex = params.row.sex
            return h('div', {}, sex === 1 ? '男' : (sex === 2 ? '女' : '未知'))
          } },
          { title: '年龄', key: 'age' },
          { title: '学员状态', key: 'status', render: (h, params) => {
            const status = params.row.status
            return h('div', {}, status === 1 ? '正常' : '冻结')
          } },
          { title: '注册时间', key: 'createTime' },
          { title: '操作', key: 'actions', width: 160, render: (h, params) => {
            return h('div', [
                h('Button', {
                  props: {
                    type: params.row.status !== 1 ? 'success' : 'error',
                    size: 'small',                  
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.frozenOrThaw(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "frozenOrThaw" }
                  ]
                }, params.row.status===1 ? '冻结' : '解冻'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.openLevelList(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "levelList" }
                  ]
                }, '等级列表')
              ])
          } },
        ],
        studentList: [],
      }
    },
    methods: {
      search(){
        this.postData.createDate = formatDate('YYYY-MM-DD', this.createDate)
        this.getStudentList(()=>{
          this.$Message.success('查询成功')
        })
      },
      getStudentList(cb){
        http.get({
          vm: this,
          url: '/manager/student/list',
          data: this.postData,
          success: res => {
            this.studentList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },
      frozenOrThaw(row) {
        const data = {id: row.id, version: row.version, status: row.status===1?0:1}
        const action = row.status === 1 ? '冻结' : '解冻'
        this.$Modal.confirm({
          title: 'Title',
          content: `确认${action}此学员吗？`,
          loading: true,
          onOk: () => {
            http.post({
              vm: this,
              url: '/manager/student/frozenOrThaw',
              data,
              success: res => {
                this.$Modal.remove()
                this.getStudentList()
                this.$Message.success(res.msg)
              }
            })
          }
        })
      },
      openLevelList(row) {
        console.log('%c openLevelList', 'color:red;');
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
      },
      changePageSize(pageSize) {
        this.postData.pageSize = pageSize
      }
    },
    mounted(){
      this.getStudentList()
    }
  }
</script>