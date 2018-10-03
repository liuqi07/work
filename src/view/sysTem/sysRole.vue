<template>
  <div>
    <Form ref="sysRole" :model="sysRole" inline :label-width="120">
      <FormItem label="可进行以下操作">
        <Button type="primary" @click="openAddRole()">添加角色</Button>
      </FormItem>
    </Form>
    <Card>
      <Table :columns="roleColumns" :data="roleList"></Table>
      <Page :total="total" show-total @on-change="changePage" :page-index="postData.pageIndex" :page-size="postData.pageSize" style="margin-top: 10px"
      />
    </Card>
    <!-- 添加角色 -->
    <Modal title="添加角色" v-model="addRoleModal" @on-ok="addRole">
      <Form :label-width="80" ref="addRoleData" v-model="addRoleData" :rules="addRoleRules">
        <FormItem label="角色名称" prop="name" required>
          <Input v-model="addRoleData.name" style="width:300px;" placeholder="请输入角色名称"></Input>
        </FormItem>
        <FormItem label="角色编码" prop="code" required>
          <Input v-model="addRoleData.code" style="width:300px;" placeholder="请输入角色编码"></Input>
        </FormItem>
        <FormItem label="角色描述" prop="roleDesc">
          <Input type="textarea" v-model="addRoleData.roleDesc" style="width:300px;" placeholder="最多可输入60个字"></Input>
        </FormItem>
      </Form>
    </Modal>
    <!-- 编辑角色 -->
    <Modal title="编辑角色" v-model="editRoleModal" @on-ok="editRole">
      <Form :label-width="80" ref="editRoleData" :model="editRoleData" :rules="editRoleRules">
        <FormItem prop="name" label="角色名称" required>
          <Input v-model="editRoleData.name" style="width:300px;" placeholder="请输入角色名称"></Input>
        </FormItem>
        <FormItem prop="roleDesc" label="角色描述">
          <Input type="textarea" v-model="editRoleData.roleDesc" style="width:300px;" placeholder="最多可输入60个字"></Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
  import { getRoleList } from '@/api/system';
  import http from '@/libs/http';
  export default {
    data() {
      return {
        sysRole: {},
        roleColumns: [
          { type: 'index', title: '序号' },
          { title: '角色名称', key: 'name' },
          { title: '角色描述', key: 'roleDesc' },
          { title: '状态', key: 'status', render: (h, params) => h('div', {}, params.row.status === 1 ? '使用中' : '停用') },
          { title: '管理', key: 'manager', render: (h, params) => {
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
                      this.openEditRole(params)
                    }
                  }
                }, '编辑'),
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
                      this.openEditAuth(params)
                    }
                  }
                }, '权限'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: params.row.status !== 1
                  },
                  on: {
                    click: () => {
                      this.deleteRole(params)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        roleList: [],
        total: 0,
        postData: {
          pageIndex: 1,
          pageSize: 10
        },
        addRoleModal: false,
        addRoleData: {
          name: '',
          code: '',
          roleDesc: ''
        },
        addRoleRules: {
          name: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' }
          ],
          code: [
            { required: true, message: '角色编码不能为空', trigger: 'blur' }
          ],
          roleDesc: [
            { type: 'string', max: 60, message: '角色描述最多不超过60个字', trigger: 'blur' }
          ]
        },
        editRoleModal: false,
        editRoleData: {},
        editRoleRules: {}
      }
    },
    methods: {
      getRoleList() {
        http.get({
          vm: this,
          url: '/manager/sys-role/list-page',
          data: this.postData,
          success: res => {
            this.roleList = res.data.list
            this.total = res.data.total
          }
        })
      },
      openAddRole() {
        this.addRoleModal = true
      },
      addRole() {
        this.$refs['addRoleData'].validate((valid) => {
          if (valid) {
            const { code, name, roleDesc } = this.addRoleData
            http.post({
              vm: this,
              url: `/manager/sys-role/add`,
              data: this.addRoleData,
              success: res => {
                this.$Message.success(res.msg);
                this.getRoleList()
              }
            })
          } else {
            this.$Message.error('Fail!');
          }
        })
      },
      openEditRole(params) {
        this.editRoleModal = true
        const row = params.row
        this.editRoleData = { name: row.name, roleDesc: row.roleDesc, version: row.version, id: row.id }
      },
      editRole() {
        http.post({
          vm: this,
          url: 'manager/sys-role/edit',
          data: this.editRoleData,
          success: res => {
            this.$Message.success(res.msg);
            this.getRoleList()
          }
        })
      },
      openEditAuth(params) {
        console.log('%c openEditAuth params', 'color:red;', params);
      },
      deleteRole(params) {
        this.$Modal.confirm({
          title: 'Title',
          content: '确认删除这个角色吗？',
          loading: true,
          onOk: () => {
            const row = params.row
            http.post({
              vm: this,
              url: '/manager/sys-role/delete',
              data: { id: row.id, version: row.version, status: 2 },
              success: res => {
                this.$Message.success(res.msg)
                this.$Modal.remove()
                this.getRoleList()
              }
            })
          }
        })
      },
      changePage(pageIndex) {
        console.log('%c pageIndex', 'color:red;', pageIndex);
        this.postData.pageIndex = pageIndex
      }
    },
    mounted() {
      this.getRoleList()
    }
  }
</script>