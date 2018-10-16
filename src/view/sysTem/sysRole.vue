<template>
  <div>
    <Form ref="sysRole" :model="sysRole" inline :label-width="120">
      <FormItem label="可进行以下操作">
        <Button v-hasPermission="'addSysRole'" type="primary" @click="addSysRole()">添加角色</Button>
      </FormItem>
    </Form>
    <Card>
      <Table :columns="roleColumns" :data="roleList"></Table>
      <Page :total="total" show-total @on-change="changePage" :page-index="postData.pageIndex" :page-size="postData.pageSize" style="margin-top: 10px"
      />
    </Card>
    <!-- 添加角色 -->
    <Modal title="添加角色" v-model="addRoleModal">
      <Form :label-width="100" ref="addRoleData" :model="addRoleData">
        <FormItem label="角色名称：" prop="name" required>
          <Input v-model="addRoleData.name" style="width:300px;" placeholder="请输入角色名称"></Input>
        </FormItem>
        <FormItem label="角色编码：" prop="code" required>
          <Input v-model="addRoleData.code" style="width:300px;" placeholder="请输入角色编码"></Input>
        </FormItem>
        <FormItem label="角色描述：" prop="roleDesc">
          <Input type="textarea" v-model="addRoleData.roleDesc" style="width:300px;" placeholder="最多可输入60个字"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelAddRole">取消</Button>
        <Button type="primary" @click="addRole">确定</Button>
      </div>
    </Modal>
    <!-- 编辑角色 -->
    <Modal title="编辑角色" v-model="editRoleModal">
      <Form :label-width="80" ref="editRoleData" :model="editRoleData">
        <FormItem label="角色名称" required>
          <Input v-model="editRoleData.name" style="width:300px;" placeholder="请输入角色名称"></Input>
        </FormItem>
        <FormItem label="角色描述">
          <Input type="textarea" v-model="editRoleData.roleDesc" style="width:300px;" placeholder="最多可输入60个字"></Input>
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
        editRoleRules: {},
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
        this.addRoleModal = true
      },
      addRole() {
        const { code, name, roleDesc } = this.addRoleData
        if (!code || !name) {
          this.$Message.error({
            content: '标星内容不能为空！',
            duration: 5
          })
          return
        }
        http.post({
          vm: this,
          url: `/manager/sys-role/add`,
          data: this.addRoleData,
          success: res => {
            this.$Message.success('添加成功！');
            this.addRoleModal = false
            this.getRoleList()
            this.addRoleData = { code: '', name: '', roleDesc: '' }
          }
        })
      },
      cancelAddRole() {
        this.addRoleData = { code: '', name: '', roleDesc: '' }
        this.addRoleModal = false
      },
      openEditRole(params) {
        this.editRoleModal = true
        const row = params.row
        this.editRoleData = { name: row.name, roleDesc: row.roleDesc, version: row.version, id: row.id }
      },
      editRole() {
        const { name } = this.editRoleData
        if(!name){
          this.$Message.error({
            content: '标星内容不能为空，请检查后重新输入！',
            duration: 5
          })
          return
        }
        http.post({
          vm: this,
          url: '/manager/sys-role/edit',
          data: this.editRoleData,
          success: res => {
            this.$Message.success('编辑成功!');
            this.editRoleModal = false
            this.editRoleData = {}
            this.getRoleList()
          }
        })
      },
      cancelEdit(){
        this.editRoleModal = false
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
        console.log('%c resourceIds', 'color:red;', resourceIds.sort((a, b) => a - b));
        http.post({
          vm: this,
          url: '/manager/sys-role/auth',
          data: {
            id: this.currRoleId,
            resourceIds: resourceIds.sort((a, b) => a - b)
          },
          success: res => {
            this.$Message.success(res.msg)
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
                this.$Message.success(res.msg)
                this.$Modal.remove()
                this.getRoleList()
              }
            })
          }
        })
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex
        this.getRoleList(() => { this.$Message.success('查询成功！') })
      }
    },
    mounted() {
      this.getRoleList()
    }
  }
</script>