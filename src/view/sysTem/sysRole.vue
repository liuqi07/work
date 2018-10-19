<template>
  <div>
    <Form ref="sysRole" :model="sysRole" inline :label-width="120">
      <Button v-hasPermission="'addSysRole'" type="primary" style="margin-left: 20px; margin-bottom: 5px" @click="addSysRole">添加角色</Button>
    </Form>
    <Card>
      <Table :columns="roleColumns" :data="roleList"></Table>
      <Page :total="total" show-total @on-change="changePage" :page-index="postData.pageIndex" :page-size="postData.pageSize" @on-page-size-change="changePageSize" show-sizer style="margin-top: 10px"
      />
    </Card>
    <!-- 添加角色 -->
    <Modal title="添加角色" v-model="addRoleModal">
      <Form :label-width="100" ref="addRole" :model="addRoleData" :rules="addRoleRules">
        <FormItem prop="name" label="角色名称：" >
          <Input :value="addRoleData.name" style="width:300px;" placeholder="请输入角色名称"></Input>
        </FormItem>
        <FormItem prop="code" label="角色编码：" >
          <Input :value="addRoleData.code" style="width:300px;" placeholder="请输入角色编码"></Input>
        </FormItem>
        <FormItem prop="roleDesc" label="角色描述：" >
          <Input type="textarea" :value="addRoleData.roleDesc" style="width:300px;" placeholder="最多可输入60个字"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelAddRole">取消</Button>
        <Button type="primary" @click="addRole">确定</Button>
      </div>
    </Modal>
    <!-- 编辑角色 -->
    <Modal title="编辑角色" v-model="editRoleModal">
      <Form :label-width="80" ref="editRole" :model="editRoleData" :rules="editRoleRules">
        <FormItem prop="name" label="角色名称">
          <Input :value="editRoleData.name" style="width:300px;" placeholder="请输入角色名称"></Input>
        </FormItem>
        <FormItem prop="roleDesc" label="角色描述">
          <Input type="textarea" :value="editRoleData.roleDesc" style="width:300px;" placeholder="最多可输入60个字"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelEdit">取消</Button>
        <Button type="primary" @click="editRole">确定</Button>
      </div>
    </Modal>
    <!-- 角色权限授权 -->
    <Modal title="角色授权" v-model="authRoleModal" @on-ok="authRole">
      <Tree :data="authRoleTree" ref="authRole" show-checkbox multiple></Tree>
    </Modal>
  </div>
</template>

<script>
  import { getRoleList } from '@/api/system';
  import http from '@/libs/http';
  export default {
    data() {
      const validateName = (rule, value, cb) => {
        let data = { name: value }
        this.editRoleModal && (data.id = this.editRoleData.id)
        if (!value) {
          cb(new Error('角色名不能为空'))
        }else{
          http.post({
            vm: this,
            url: "/manager/sys-role/valid",
            data,
            success: res => {
              res.data && cb() || cb(new Error('角色名已存在'))
            }
          })
        }
      }
      const validateCode = (rule, value, cb) => {
        let data = { code: value }
        this.editRoleModal && (data.id = this.editRoleData.id)
        if (!value) {
          cb()
        }else{
          http.post({
            vm: this,
            url: "/manager/sys-role/valid",
            data,
            success: res => {
              res.data && cb() || cb(new Error('角色编码已存在'))
            }
          })
        }
      }
      return {
        sysRole: {},
        roleColumns: [
          { type: 'index', title: '序号' },
          { title: '角色名称', key: 'name' },
          { title: '角色描述', key: 'roleDesc' },
          { title: '状态', key: 'status', render: (h, params) => h('div', {}, params.row.status === 1 ? '使用中' : '停用') },
          {
            title: '管理', key: 'manager', width: 200, render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: params.row.status !== 1,
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.openEditRole(params)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "editSysRole" }
                  ]
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
                  },
                  directives: [
                    { name: 'hasPermission', value: "authSysRole" }
                  ]
                }, '角色授权'),
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
                  },
                  directives: [
                    { name: 'hasPermission', value: "deleteSysRole" }
                  ]
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
            { required: true, message: '角色名称不能为空', trigger: 'blur' },
            { type: 'string', min: 2, max: 20, message: '角色名要求2-20位之间', trigger: 'blur' },
            { validator: validateName, trigger: 'blur' }
          ],
          code: [
            { required: true, message: '角色编码不能为空', trigger: 'blur' },
            { type: 'string', min: 8, max: 20, message: '角色编码要求8-20位之间', trigger: 'blur' },
            { validator: validateCode, trigger: 'blur' }
          ],
          roleDesc: [
            { type: 'string', max: 60, message: '角色描述最多不超过60个字', trigger: 'blur' }
          ]
        },
        editRoleModal: false,
        editRoleData: {},
        editRoleRules: {
          name: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' },
            { type: 'string', min: 2, max: 20, message: '角色名要求2-20位之间', trigger: 'blur' },
            { validator: validateName, trigger: 'blur' }
          ],
          roleDesc: [
            { type: 'string', max: 60, message: '角色描述最多不超过60个字', trigger: 'blur' }
          ]
        },
        authRoleModal: false,
        authRoleTree: [],
        currRoleId: '',
      }
    },
    methods: {
      getRoleList(cb) {
        http.get({
          vm: this,
          url: '/manager/sys-role/list-page',
          data: this.postData,
          success: res => {
            this.roleList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },
      addSysRole() {
        this.$refs['addRole'].resetFields()
        this.addRoleModal = true
      },
      addRole() {
        this.$refs['addRole'].validate(valid => {
          if(valid){
            const { code, name, roleDesc } = this.addRoleData
            http.post({
              vm: this,
              url: `/manager/sys-role/add`,
              data: this.addRoleData,
              success: res => {
                this.$Message.success('添加成功！')
                this.addRoleModal = false
                this.$refs['addRole'].resetFields()
                this.getRoleList()
                this.addRoleData = { code: '', name: '', roleDesc: '' }
              }
            })
          }
        })
      },
      cancelAddRole() {
        this.addRoleData = { code: '', name: '', roleDesc: '' }
        this.$refs['addRole'].resetFields()
        this.addRoleModal = false
      },
      openEditRole(params) {
        this.$refs['editRole'].resetFields()
        this.editRoleModal = true
        const row = params.row
        this.editRoleData = { name: row.name, roleDesc: row.roleDesc, version: row.version, id: row.id }
      },
      editRole() {
        this.$refs['editRole'].validate(valid => {
          if(valid){
            const { name } = this.editRoleData
            http.post({
              vm: this,
              url: '/manager/sys-role/edit',
              data: this.editRoleData,
              success: res => {
                this.$Message.success('编辑成功!');
                this.editRoleModal = false
                this.$refs['editRole'].resetFields()
                this.editRoleData = {}
                this.getRoleList()
              }
            })
          }
        })
      },
      cancelEdit(){
        this.editRoleModal = false
        this.$refs['editRole'].resetFields()
        this.editRoleData = {}
      },
      openEditAuth(params) {
        this.authRoleModal = true
        this.currRoleId = params.row.id
        http.get({
          vm: this,
          url: '/manager/sys-role/getAuth',
          data: { id: this.currRoleId },
          success: res => {
            const treeData = [res.data]
            treeData[0].expand = true
            this.authRoleTree = treeData
          }
        })
      },
      authRole() {
        const treeData = this.authRoleTree;
        const resourceIds = [];
        const fn = t => {
          if (t.indeterminate || t.checked) {
            resourceIds.push(t.id)
          }
        }
        treeData.map(t => {
          (t.indeterminate || t.checked) && resourceIds.push(t.id)
          t.children && t.children.length > 0 && t.children.map(c => {
            (c.indeterminate || c.checked) && resourceIds.push(c.id)
            c.children && c.children.length > 0 && c.children.map(d => {
              (d.indeterminate || d.checked) && resourceIds.push(d.id)
              d.children && d.children.length > 0 && d.children.map(e => {
                (e.indeterminate || e.checked) && resourceIds.push(e.id)
              })
            })
          })
        })
        http.post({
          vm: this,
          url: '/manager/sys-role/auth',
          data: {
            id: this.currRoleId,
            resourceIds: resourceIds.sort((a, b) => a - b)
          },
          success: res => {
            this.$Message.success('授权成功！')
          }
        })
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
                this.$Message.success('删除成功！')
                this.$Modal.remove()
                this.getRoleList()
              }
            })
          }
        })
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getRoleList()
      },
      changePageSize(s) {
        this.postData.pageSize = s
        this.getRoleList()
      }
    },
    mounted() {
      this.getRoleList()
    }
  }
</script>