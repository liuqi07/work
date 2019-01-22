<template>
  <div>
    <Form ref="sysUser" :model="postData" inline :label-width="80">
      <FormItem prop="realName" label="人员姓名：" style="width: 220px">
        <Input type="text" v-model="postData.realName" placeholder="请输入人员姓名"/>
      </FormItem>
      <FormItem prop="roleName" label="角色名称：" style="width: 220px">
        <Select v-model="postData.roleId" clearable>
          <Option v-for="item in roleList" :value="item.id" :key="item.roleId">{{item.name}}</Option>
        </Select>
      </FormItem>
      <Button type="primary" @click="search" v-hasPermission="'search'" style="margin:0 10px;">查询</Button>
      <Button type="primary" v-hasPermission="'addSysUser'" @click="openAddModal">添加</Button>
    </Form>
    <Card>
      <Table :columns="userColumns" :data="userList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize"
            :page-index="postData.pageIndex"
            :page-size="postData.pageSize" style="margin-top: 10px"/>
    </Card>
    <!-- 添加管理人员 -->
    <Modal title="添加管理人员" v-model="addUserModal">
      <Form ref="addUser" :model="addUserData" :rules="addUserRules" :label-width="100">
        <FormItem prop="roleId" label="角色名称：">
          <Select v-model="addUserData.roleId" style="width: 300px;">
            <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem prop="type" label="用户类型：">
          <RadioGroup v-model="addUserData.type">
            <Radio :label="1">系统管理</Radio>
            <Radio :label="2">课程顾问</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem prop="userName" label="登录名：">
          <Input v-model="addUserData.userName" style="width:300px;" placeholder="请输入登录名，要求20位以内"></Input>
        </FormItem>
        <FormItem prop="password" label="密码：">
          <Input type="password" v-model="addUserData.password" style="width:300px;"
                 placeholder="请设置6-20位，字母数字组合密码"></Input>
        </FormItem>
        <FormItem prop="realName" label="姓名：">
          <Input v-model="addUserData.realName" style="width:300px;" placeholder="请输入管理人员真实姓名"></Input>
        </FormItem>
        <FormItem prop="email" label="邮箱：">
          <Input v-model="addUserData.email" style="width:300px;" placeholder="请输入邮箱"></Input>
        </FormItem>
        <FormItem prop="mobilePhone" label="手机：">
          <Input v-model="addUserData.mobilePhone" style="width:300px;" placeholder="请输入管理人员手机号码"></Input>
        </FormItem>
        <FormItem prop="seatPhone" label="座机：">
          <Input v-model="addUserData.seatPhone" style="width:300px;" placeholder="请输入管理人员座机号码"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancelAddUser">取消</Button>
        <Button type="primary" @click="addUser">确定</Button>
      </div>
    </Modal>
    <!-- 编辑管理人员 -->
    <Modal title="编辑管理人员" v-model="editUserModal">
      <Form :label-width="80" ref="editUser" :model="editUserData" :rules="editUserRules">
        <FormItem prop="roleId" label="角色：">
          <Select v-model="editUserData.roleId" style="width: 300px;">
            <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem prop="userName" label="登录名：">
          <Input v-model="editUserData.userName" style="width:300px;" placeholder="请输入登录名"></Input>
        </FormItem>
        <FormItem prop="realName" label="姓名：">
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
      <div slot="footer">
        <Button @click="cancelEditUser">取消</Button>
        <Button @click="editUser" type="primary">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from "@/libs/http";
  import {filterNull} from '@/libs/tools'
  import md5 from "md5";

  export default {
    data() {
      const validateUserName = (rule, value, cb) => {
        if (!value) {
          cb(new Error('登录名不能为空'))
        } else {
          let data = {userName: value}
          this.editUserModal && (data.id = this.editUserData.id)
          http.post({
            vm: this,
            url: "/manager/sys-user/valid",
            data,
            success: res => {
              res.data && cb() || cb(new Error('登录名已存在'))
            }
          })
        }
      }
      const validateMobilePhone = (rule, value, cb) => {
        let data = {mobilePhone: value}
        this.editUserModal && (data.id = this.editUserData.id)
        if (!value) {
          cb()
        } else {
          http.post({
            vm: this,
            url: "/manager/sys-user/valid",
            data,
            success: res => {
              res.data && cb() || cb(new Error('手机号已存在'))
            }
          })
        }
      }
      const validateEmail = (rule, value, cb) => {
        let data = {email: value}
        this.editUserModal && (data.id = this.editUserData.id)
        if (!value) {
          cb()
        } else {
          http.post({
            vm: this,
            url: "/manager/sys-user/valid",
            data,
            success: res => {
              res.data && cb() || cb(new Error('邮箱已存在'))
            }
          });
        }
      }
      return {
        postData: {
          pageIndex: 1,
          pageSize: 10
        },
        roleList: [],
        userColumns: [
          {title: "登录名", key: "userName", align: "center"},
          {title: "姓名", key: "realName", align: "center"},
          {
            title: "手机", key: "mobilePhone", align: "center", render: (h, params) => {
              const mobilePhone = params.row.mobilePhone
              return h('div', mobilePhone && mobilePhone.replace(mobilePhone.substr(3, 4), '****') || '')
            }
          },
          {title: "角色", key: "roleName", align: "center"},
          {
            title: "状态",
            key: "status",
            align: "center",
            render: (h, params) => {
              return h("div", {}, params.row.status === 1 ? "使用中" : "停用");
            }
          },
          {title: "创建时间", key: "createTime", align: "center", width: 150},
          {
            title: "管理",
            key: "actions",
            align: "center",
            width: 220,
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small",
                      disabled: params.row.status !== 1
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.openEditUser(params.row);
                      }
                    },
                    directives: [{name: "hasPermission", value: "editSysUser"}]
                  },
                  "修改资料"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small",
                      disabled: params.row.status !== 1
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.resetPwd(params.row);
                      }
                    },
                    directives: [
                      {name: "hasPermission", value: "resetPassword"}
                    ]
                  },
                  "重置密码"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: params.row.status === 1 ? "error" : "success",
                      size: "small"
                      // disabled: params.row.status !== 1
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.disuse(params.row);
                      }
                    },
                    directives: [{name: "hasPermission", value: "openOrClose"}]
                  },
                  params.row.status === 1 ? "停用" : "启用"
                )
              ]);
            }
          }
        ],
        userList: [],
        total: 0,
        addUserModal: false,
        addUserData: {
          type: 2,
        },
        addUserRules: {
          userName: [
            {required: true, message: "请输入登录名", trigger: "blur"},
            {type: 'string', max: 20, message: "登录名要求在20位之间", trigger: "blur"},
            {validator: validateUserName, trigger: 'blur'}
          ],
          password: [
            {required: true, message: "请输入密码", trigger: "blur"},
            {type: 'string', message: '密码要求6-20位，字母数字组合密码', pattern: /^(?![0-9]*$)[a-zA-Z0-9]{6,20}$/, trigger: 'blur'}
          ],
          realName: [
            {required: true, message: "请输入真实姓名", trigger: "blur"}
          ],
          roleId: [
            {required: true, message: "请选择一个角色", pattern: /.+/, trigger: "change"}
          ],
          mobilePhone: [
            {required: true, message: "请输入手机号", trigger: "blur"},
            {type: 'string', message: '请输入正确的手机号', pattern: /^1[34578]\d{9}$/, trigger: 'blur'},
            {validator: validateMobilePhone, trigger: 'blur'}
          ],
          seatPhone: [
            {type: 'string', message: '请输入正确的座机号', pattern: /^0\d{2}-\d{7,8}$/, trigger: 'blur'},
          ],
          email: [
            {required: true, message: "请输入邮箱", trigger: "blur"},
            {type: 'email', message: '请输入正确的邮箱', trigger: 'blur'},
            {validator: validateEmail, trigger: 'blur'}
          ]
        },
        editUserModal: false,
        editUserData: {},
        editUserRules: {
          userName: [
            {required: true, message: "请输入登录名", trigger: "blur"},
            {type: 'string', max: 20, message: "登录名要求在20位之间", trigger: "blur"},
            {validator: validateUserName, trigger: 'blur'}
          ],
          realName: [
            {required: true, message: "真实姓名不能为空", trigger: "blur"}
          ],
          roleId: [
            {required: true, message: "请选择一个角色", pattern: /.+/, trigger: "change"}
          ],
          mobilePhone: [
            {required: true, message: "请输入手机号", trigger: "blur"},
            {type: 'string', message: '请输入正确的手机号', pattern: /^1[34578]\d{9}$/, trigger: 'blur'},
            {validator: validateMobilePhone, trigger: 'blur'}
          ],
          seatPhone: [
            {type: 'string', message: '请输入正确的座机号', pattern: /^0\d{2}-\d{7,8}$/, trigger: 'blur'},
          ],
          email: [
            {required: true, message: "请输入邮箱", trigger: "blur"},
            {type: 'email', message: '请输入正确的邮箱', trigger: 'blur'},
            {validator: validateEmail, trigger: 'blur'}
          ]
        }
      };
    },
    methods: {
      getRoleList() {
        http.get({
          vm: this,
          url: "/manager/sys-role/list-all",
          success: res => {
            this.roleList = res.data;
          }
        });
      },
      getUserList(cb) {
        http.get({
          vm: this,
          url: "/manager/sys-user/list",
          data: this.postData,
          success: res => {
            this.userList = res.data.list;
            this.total = res.data.total;
            cb && cb();
          }
        });
      },
      search() {
        const cb = () => {
          this.$Message.success("查询成功");
        };
        this.getUserList(cb);
      },
      openAddModal() {
        this.addUserModal = true;
        this.addUserData = {type: 2};
        this.$refs['addUser'].resetFields()
        // this.getRoleList();
      },
      addUser() {
        this.$refs['addUser'].validate((valid) => {
          if (valid) {
            const {type, roleId, userName, password, realName} = this.addUserData;
            this.addUserData.password = md5(password);
            http.post({
              vm: this,
              url: "/manager/sys-user/add",
              data: this.addUserData,
              success: res => {
                this.$Message.success("保存成功！");
                this.addUserModal = false;
                this.addUserData = {type: 2};
                this.$refs['addUser'].resetFields()
                this.getUserList();
              },
              error: err => {
                this.addUserData.password = "";
              }
            });
          }
        })
      },
      resetPwd({id}) {
        this.$Modal.confirm({
          title: "Title",
          content: "确认重置此用户的密码吗？",
          loading: true,
          onOk: () => {
            http.post({
              vm: this,
              url: "/manager/sys-user/resetPassword",
              data: {id},
              success: res => {
                this.$Message.success({
                  content:
                    "密码重置成功，初始密码为N5fa2mVG，请通知用户尽快修改！",
                  duration: 15
                });
                this.$Modal.remove();
              }
            });
          }
        });
      },
      cancelAddUser() {
        this.addUserModal = false;
        this.addUserData = {type: 2};
        this.$refs['addUser'].resetFields()
      },
      changePage(pageIndex) {
        this.postData.pageIndex = pageIndex;
        this.getUserList();
      },
      changePageSize(pageSize) {
        this.postData.pageSize = pageSize;
        this.getUserList();
      },
      openEditUser({id, roleId, userName, realName, version, email, mobilePhone, seatPhone}) {
        this.$refs['editUser'].resetFields()
        this.editUserModal = true;
        this.editUserData = {id, roleId, userName, realName, version, email, mobilePhone, seatPhone}
      },
      editUser() {
        this.$refs['editUser'].validate(valid => {
          if (valid) {
            const {roleId, userName, realName} = this.editUserData
            http.post({
              vm: this,
              url: "/manager/sys-user/edit",
              data: filterNull(this.editUserData),
              success: res => {
                this.$Message.success('修改成功！');
                this.editUserModal = false
                this.$refs['editUser'].resetFields()
                this.editUserData = {}
                this.getUserList();
              }
            });
          }
        })
      },
      cancelEditUser() {
        this.editUserModal = false
        this.editUserData = {}
        this.$refs['editUser'].resetFields()
      },
      disuse({id, status, version}) {
        const action = status === 1 ? "停用" : "启用";
        this.$Modal.confirm({
          title: "Title",
          content: `确定${action}此账号吗？`,
          loading: true,
          onOk: () => {
            http.post({
              vm: this,
              url: "/manager/sys-user/openOrClose",
              data: {id, status: status === 1 ? 0 : 1, version},
              success: res => {
                this.$Message.success("操作成功！");
                this.$Modal.remove();
                this.getUserList();
              }
            });
          }
        });
      }
    },
    mounted() {
      this.getRoleList();
      this.getUserList();
    }
  };
</script>
