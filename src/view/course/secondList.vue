<template>
  <div>
    <Form :label-width="100" inline>
      <FormItem label="一级分类：" style="width: 250px;">
        <Select v-model="postData.parentCode" clearable>
          <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <Button type="primary" @click="search" style="margin-left: 20px; margin-right: 10px;">查询</Button>
      <Button type="primary" v-hasPermission="'secondAdd'" @click="secondAdd">添加二级分类</Button>
    </Form>
    <Card style="margin-top: 10px;">
      <Table :columns="columns" :data="secondList"></Table>
      <Page :total="total" show-total @on-change="changePage" :page-index="postData.pageIndex" @on-page-size-change="changePageSize" show-sizer :page-size="postData.pageSize" style="margin-top: 10px" />
    </Card>
    <Modal title="添加二级分类" v-model="addModal" >
      <Form :label-width="120" :model="addData" :rules="addRules" ref="addData" >
        <FormItem prop="parentCode" label="一级分类名称：" style="width: 300px;">
          <Select v-model="addData.parentCode">
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="name" label="二级分类名称：" style="width: 300px;">
          <Input v-model="addData.name" placeholder="请输入二级分类名称" />
        </FormItem>
      </Form>
      <div slot="footer" >
        <Button @click="cancel">取消</Button>
        <Button @click="add" type="primary" >确定</Button>
      </div>
    </Modal>
    <Modal title="编辑" v-model="editModal">
      <Form :label-width="120" :model="editData" :rules="editRules" ref="editData" >
        <FormItem prop="name" label="二级分类名称：" style="width: 300px;" >
          <Input v-model="editData.name" required placeholder="请输入二级分类名称" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button type="primary" @click="edit">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import http from "@/libs/http"
export default {
  data() {
    const validateName = (rule, name, cb) => {
      if(!name){
        cb(new Error('二级分类名称不能为空'))
      }else{
        let data = { name }
        this.editModal && (data.id = this.editData.id)
        http.post({
          vm: this,
          url: "/manager/course-classification/valid",
          data,
          success: res => {
            res.data && cb() || cb(new Error('二级分类名已存在'))
          }
        })
      }
    }
    return {
      postData: {
        pageIndex: 1,
        pageSize: 20
      },
      firstList: [],
      total: 0,
      columns: [
        { title: "一级分类名称", key: "firstName", align: "center" },
        { title: "二级分类名称", key: "name", align: "center" },
        { title: "操作时间", key: "updateTime", align: "center" },
        { title: "操作人", key: "operateName", align: "center" },
        {
          title: "管理",
          key: "actions",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.secondEdit(params.row)
                    }
                  },
                  directives: [{ name: "hasPermission", value: "secondEdit" }]
                },
                "编辑"
              )
            ])
          }
        }
      ],
      secondList: [],
      addModal: false,
      editModal: false,
      addData: {},
      addRules: {
        parentCode: [
          { required: true, message: "一级分类不能为空", trigger: "change" }
        ],
        name: [
          { required: true, message: "二级分类名称不能为空", trigger: "blur" },
          { validator: validateName, trigger: 'blur' }
        ]
      },
      editData: {},
      editRules: {
        name: [
          { required: true, message: "二级分类名称不能为空", trigger: "blur" },
          { validator: validateName, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    search() {
      this.getSecondList(() => {
        this.$Message.success("查询成功！")
      })
    },
    secondAdd() {
      this.addData = {}
      this.$refs["addData"].resetFields()
      this.addModal = true
    },
    add() {
      this.$refs["addData"].validate(valid => {
        if (valid) {
          http.post({
            vm: this,
            url: "/manager/course-classification/second/add",
            data: this.addData,
            success: res => {
              this.$Message.success("添加成功！")
              this.addModal = false
              this.getSecondList()
              this.$refs["addData"].resetFields()
            }
          })
        }
      })
    },
    cancel() {
      this.addData = {}
      this.editData = {}
      this.addModal = false
      this.editModal = false
      this.$refs["addData"].resetFields()
      this.$refs["editData"].resetFields()
    },
    secondEdit(row) {
      this.$refs['editData'].resetFields()
      this.editModal = true
      this.editData.name = row.name
      this.editData.id = row.id
      this.editData.version = row.version
    },
    edit() {
      this.$refs['editData'].validate(valid => {
        if(valid){
          http.post({
            vm: this,
            url: "/manager/course-classification/second/edit",
            data: this.editData,
            success: res => {
              this.$Message.success("更新成功！")
              this.editData = {}
              this.$refs['editData'].resetFields()
              this.getSecondList()
            }
          })
        }
      })
    },
    getFirstList() {
      http.get({
        vm: this,
        url: "/manager/course-classification/getAll",
        data: { type: 1 },
        success: res => {
          this.firstList = res.data
          this.getSecondList()
        }
      })
    },
    getSecondList(cb) {
      http.get({
        vm: this,
        url: "/manager/course-classification/second/list",
        data: this.postData,
        success: res => {
          this.secondList = res.data.list
          this.total = res.data.total
          cb && cb()
        }
      })
    },
    changePage(pageIndex) {
      this.postData.pageIndex = pageIndex
      this.getSecondList()
    },
    changePageSize(s) {
      this.postData.pageSize = s
      this.getSecondList()
    }
  },
  mounted() {
    this.getFirstList()
    this.getSecondList()
  }
}
</script>