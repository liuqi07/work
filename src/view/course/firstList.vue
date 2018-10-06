<template>
  <div>
    <Button type="primary" v-hasPermission="'firstAdd'" @click="firstAdd">添加一级分类</Button>
    <Card style="margin-top: 10px;">
      <Table :columns="columns" :data="firstList"></Table>
      <Page :total="total" show-total @on-change="changePage" :page-index="postData.pageIndex" style="margin-top: 10px" />
    </Card>
    <Modal :title="title" v-model="modal" @on-ok="save">
      <Form :label-width="100">
        <FormItem label="一级分类名称：" style="width: 300px;">
          <Input v-model="levelName" placeholder="请输入一级分类名称" />
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
        title: '',
        columns: [
          { title: '序号', type: 'index' },
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
        levelName: '',
        type: '',
        version: '',
        id: null,
      }
    },
    methods: {
      firstAdd() {
        this.modal = true
        this.title = '添加一级分类'
        this.type = 'add'
      },
      firstEdit(row) {
        this.modal = true
        this.title = '编辑'
        this.type = 'edit'
        this.levelName = row.name
        this.id = row.id
        this.version = row.version
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
      save(){
        const type = this.type
        let url = ''
        let msg = ''
        let data =  {}
        if(type==='add'){
          url = '/manager/course-classification/first/add'
          data = { name: this.levelName }
          msg = '添加成功'
        }else {
          url = '/manager/course-classification/first/edit'
          data = { name: this.levelName, id: this.id, version: this.version }
          msg = '更新成功'
        }
        http.post({
          vm: this,
          url,
          data,
          success: res => {
            this.$Message.success(msg)
            this.getFirstList()
            this.version = ''
            this.id = null
            this.levelName = ''
          }
        })
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getFirstList(() => {this.$Message.success('查询成功！')})
      }
    },
    mounted() {
      this.getFirstList()
    }
  }
</script>