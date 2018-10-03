<template>
  <div>
    <Form ref="sysUser" :model="postData" inline :label-width="80">
      <FormItem prop="realName" label="人员姓名：">
        <Input type="text" v-model="postData.realName" placeholder="请输入人员姓名" style="width: 100px" />
      </FormItem>
      <FormItem prop="roleName" label="角色名称：">
        <Select v-model="postData.roleId" clearable style="width: 100px">
          <Option v-for="item in roleList" :value="item.id" :key="item.roleId">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="search" style="margin-right: 10px;">搜索</Button>
        <Button type="primary" @click="openAddModal">添加</Button>
      </FormItem>
    </Form>
    <Card>
      <Table :columns="userColumns" :data="userList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-index="postData.pageIndex" :page-size="postData.pageSize"
        style="margin-top: 10px" />
    </Card>
    <!-- 添加管理人员 -->
    <Modal title="添加管理人员" v-model="addUserModal" @on-ok="addUser">
      <Form :label-width="80" ref="addUser" :model="addUserData" :rules="addUserRules">
        <FormItem prop="roleId" label="角色名称" required>
          <Select v-model="addUserData.roleId" style="width: 300px;">
            <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem prop="type" label="类型">
          <RadioGroup v-model="addUserData.type">
            <Radio :label="1">系统管理</Radio>
            <Radio :label="2">课程顾问</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem prop="userName" label="登录名：" required>
          <Input v-model="addUserData.userName" style="width:300px;" placeholder="请输入登录名"></Input>
        </FormItem>
        <FormItem prop="password" label="密码" required>
          <Input v-model="addUserData.password" style="width:300px;" placeholder="请设置6-20位，字母数字组合密码"></Input>
        </FormItem>
        <FormItem prop="realName" label="姓名" required>
          <Input v-model="addUserData.realName" style="width:300px;" placeholder="请输入管理人员真实姓名"></Input>
        </FormItem>
        <FormItem prop="email" label="邮箱">
          <Input v-model="addUserData.email" style="width:300px;" placeholder="请输入邮箱"></Input>
        </FormItem>
        <FormItem prop="mobilePhone" label="手机">
          <Input v-model="addUserData.mobilePhone" style="width:300px;" placeholder="请输入管理人员手机号码"></Input>
        </FormItem>
        <FormItem prop="seatPhone" label="座机">
          <Input v-model="addUserData.seatPhone" style="width:300px;" placeholder="请输入管理人员座机号码"></Input>
        </FormItem>
      </Form>
    </Modal>
    <!-- 编辑管理人员 -->
    <Modal title="编辑管理人员" v-model="editUserModal" @on-ok="editUser">
        <Form :label-width="80" ref="editUser" :model="editUserData" :rules="editUserRules">
          <FormItem prop="roleId" label="角色：" required>
            <Select v-model="editUserData.roleId" style="width: 300px;">
              <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name"></Option>
            </Select>
          </FormItem>
          <FormItem prop="userName" label="登录名：" required>
            <Input v-model="editUserData.userName" style="width:300px;" placeholder="请输入登录名"></Input>
          </FormItem>
          <FormItem prop="realName" label="姓名：" required>
            <Input v-model="editUserData.realName" style="width:300px;" placeholder="请输入管理人员真实姓名"></Input>
          </FormItem>
          <FormItem prop="email" label="邮箱：">
            <Input v-model="editUserData.email" style="width:300px;" placeholder="请输入邮箱"></Input>
          </FormItem>
          <FormItem prop="mobilePhone" label="手机：">
            <Input v-model="editUserData.mobilePhone" style="width:300px;" placeholder="请输入管理人员手机号码"></Input>
          </FormItem>
          <FormItem prop="seatPhone" label="座机：">
            <Input v-model="editUserData.seatPhone" style="width:300px;" placeholder="请输入管理人员座机号码"></Input>
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
          pageSize: 10
        },
        roleList: [],
        userColumns: [
          { type: 'index', title: '序号', },
          { title: '登录名', key: 'userName' },
          { title: '姓名', key: 'realName' },
          { title: '手机', key: 'mobilePhone' },
          { title: '角色', key: 'roleName' },
          {
            title: '状态', key: 'status', render: (h, params) => {
              return h('div', {}, params.row.status === 1 ? '使用中' : '停用')
            }
          },
          { title: '创建时间', key: 'createTime', width: 150 },
          {
            title: '管理', key: 'actions', width: 160, render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: params.row.status !== 1
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.openEditUser(params)
                    }
                  }
                }, '修改资料'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: params.row.status !== 1
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.disuse(params)
                    }
                  }
                }, '停用')
              ])
            }
          }
        ],
        userList: [],
        total: 0,
        addUserModal: false,
        addUserData: {
          type: 1
        },
        addUserRules: {
          userName: [{ required: true, message: '请输入登录名', trigger: 'blur' }],
          password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
          realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
          roleId: [{ required: true, message: '请选择一个角色', trigger: 'change' }]
        },
        editUserModal: false,
        editUserData: {},
        editUserRules: {}
      }
    },
    methods: {
      getRoleList() {
        http.get({
          vm: this,
          url: '/manager/sys-role/list-all',
          success: res => {
            this.roleList = res.data
          }
        })
      },
      getUserList(cb) {
        http.get({
          vm: this,
          url: '/manager/sys-user/list',
          data: this.postData,
          success: res => {
            this.userList = res.data.list
            this.total = res.total
            cb && cb()
          }
        })
      },
      search() {
        const cb = () => {
          this.$Message.success('查询成功')
        }
        this.getUserList(cb)
      },
      openAddModal () {
        this.addUserModal=true
        // this.getRoleList();
      },
      addUser() {
        http.post({
          vm: this,
          url: '/manager/sys-user/add',
          data: this.addUserData,
          success: res => {
            console.log('%c add res', 'color:red;', res);
          }
        })
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
      },
      changePageSize (pageSize) {
        this.postData.pageSize = pageSize
      },
      openEditUser(params) {
        console.log('%c params', 'color:red;', params);
        this.editUserModal = true;
        const row = params.row
        const { id, roleId, userName, realName, version, email, mobilePhone, seatPhone } = row
        this.editUserData = { id, roleId, userName, realName, version, email, mobilePhone, seatPhone }
      },
      editUser(){
        this.$refs['editUser'].validate((valid) => {
          if(valid){
            http.post({
              vm: this,
              url: '/manager/sys-user/edit',
              data: this.editUserData,
              success: res => {
                this.$Message.success(res.msg)
                this.getUserList()
              }
            })
          }else{
            this.$Message.error('Error');
          }
        })
        
      },
      disuse(params) {

      }
    },
    mounted() {
      this.getRoleList()
      this.getUserList()
    }
  }
</script>