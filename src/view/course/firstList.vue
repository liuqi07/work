<template>
  <div>
    <!-- <Button type="primary" @click="search" style="margin-left: 50px; margin-right: 10px;">查询</Button> -->
    <Button type="primary" v-hasPermission="'firstAdd'" @click="firstAdd">添加一级分类</Button>
    <Card style="margin-top: 10px;">
      <Table :columns="columns" :data="firstList"></Table>
      <Page :total="total" show-total @on-change="changePage" :page-index="postData.pageIndex" @on-page-size-change="changePageSize" show-sizer :page-size="postData.pageSize" style="margin-top: 10px" />
    </Card>
    <Modal :title="title" v-model="modal" >
      <Form :label-width="120" ref="add" :model="addData" :rules="addRules" >
        <FormItem prop="name" label="一级分类名称：" style="width: 300px;" >
          <Input v-model="addData.name" placeholder="请输入一级分类名称" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button @click="save" type="primary">确定</Button>
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
          cb(new Error('一级分类名称不能为空'))
        }else{
          let data = { name }
          this.type==='edit' && (data.id = this.addData.id)
          http.post({
            vm: this,
            url: "/manager/course-classification/valid",
            data,
            success: res => {
              res.data && cb() || cb(new Error('一级分类名已存在'))
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
        title: '',
        columns: [
          { title: '一级分类名称', key: 'name', align: 'center' },
          { title: '操作时间', key: 'updateTime', align: 'center' },
          { title: '操作人', key: 'operateName', align: 'center' },
          {
            title: '管理', key: 'actions', align: 'center', render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                  },
                  on: {
                    click: () => {
                      this.firstEdit(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "firstEdit" }
                  ]
                }, '编辑')
              ])
            }
          },
        ],
        firstList: [],
        modal: false,
        addData: {},
        addRules: {
          name: [
            { required: true, message: '一级分类名称不能为空', trigger: 'blur' },
            { validator: validateName, trigger: 'blur' }
          ]
        },
        type: '',
      }
    },
    methods: {
      search() {
        this.getFirstList(()=>{this.$Message.success('查询成功！')})
      },
      firstAdd() {
        this.modal = true
        this.addData = {}
        this.title = '添加一级分类'
        this.type = 'add'
      },
      firstEdit({ id, version, name }) {
        this.modal = true
        this.title = '编辑'
        this.type = 'edit'
        this.addData = { id, version, name }
      },
      getFirstList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/first/list',
          data: this.postData,
          success: res => {
            this.firstList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },
      save() {
        this.$refs['add'].validate(valid => {
          if(valid){
            const type = this.type
            let url = ''
            let msg = ''
            if (type === 'add') {
              url = '/manager/course-classification/first/add'
              msg = '添加成功'
            } else {
              url = '/manager/course-classification/first/edit'
              msg = '更新成功'
            }
            http.post({
              vm: this,
              url,
              data: this.addData,
              success: res => {
                this.$Message.success(msg)
                this.getFirstList()
                this.$refs['add'].resetFields()
                this.addData = {}
                this.modal = false
              }
            })
          }
        })
      },
      cancel(){
        this.addData = {}
        this.$refs['add'].resetFields()
        this.modal = false
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getFirstList()
      },
      changePageSize(s){
        this.postData.pageSize = s
        this.getFirstList()
      }
    },
    mounted() {
      this.getFirstList()
    }
  }
</script>