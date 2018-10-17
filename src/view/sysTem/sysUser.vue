<template>
  <div>
    <Form ref="sysUser" :model="postData" inline :label-width="80">
      <FormItem prop="realName" label="人员姓名：" style="width: 220px">
        <Input type="text" v-model="postData.realName" placeholder="请输入人员姓名" />
      </FormItem>
      <FormItem prop="roleName" label="角色名称：" style="width: 220px">
        <Select v-model="postData.roleId" clearable>
          <Option v-for="item in roleList" :value="item.id" :key="item.roleId">{{item.name}}</Option>
        </Select>
      </FormItem>
        <Button type="primary" @click="search" style="margin:0 10px;">搜索</Button>
        <Button type="primary" v-hasPermission="'addSysUser'" @click="openAddModal">添加</Button>
    </Form>
    <Card>
      <Table :columns="userColumns" :data="userList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-index="postData.pageIndex"
        :page-size="postData.pageSize" style="margin-top: 10px" />
    </Card>
    <!-- 添加管理人员 -->
    <Modal title="添加管理人员" v-model="addUserModal" >
      <Form ref="addUserData" :model="addUserData" :label-width="100">
        <FormItem prop="roleId" label="角色名称：">
          <Select v-model="addUserData.roleId" style="width: 300px;">
            <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem prop="type" label="类型：">
          <RadioGroup v-model="addUserData.type">
            <Radio :label="1">系统管理</Radio>
            <Radio :label="2">课程顾问</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem prop="userName" label="登录名：">
          <Input v-model="addUserData.userName" style="width:300px;" placeholder="请输入登录名"></Input>
        </FormItem>
        <FormItem prop="password" label="密码：">
          <Input type="password" v-model="addUserData.password" style="width:300px;" placeholder="请设置6-20位，字母数字组合密码"></Input>
        </FormItem>
        <FormItem prop="realName" label="姓名：">
          <Input v-model="addUserData.realName" style="width:300px;" placeholder="请输入管理人员真实姓名"></Input>
        </FormItem>
        <FormItem label="邮箱：">
          <Input v-model="addUserData.email" style="width:300px;" placeholder="请输入邮箱"></Input>
        </FormItem>
        <FormItem label="手机：">
          <Input v-model="addUserData.mobilePhone" style="width:300px;" placeholder="请输入管理人员手机号码"></Input>
        </FormItem>
        <FormItem label="座机：">
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
      <Form :label-width="80" ref="editUser" :model="editUserData">
        <FormItem label="角色：" required>
          <Select v-model="editUserData.roleId" style="width: 300px;">
            <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="登录名：" required>
          <Input v-model="editUserData.userName" style="width:300px;" placeholder="请输入登录名"></Input>
        </FormItem>
        <FormItem label="姓名：" required>
          <Input v-model="editUserData.realName" style="width:300px;" placeholder="请输入管理人员真实姓名"></Input>
        </FormItem>
        <FormItem label="邮箱：">
          <Input v-model="editUserData.email" style="width:300px;" placeholder="请输入邮箱"></Input>
        </FormItem>
        <FormItem label="手机：">
          <Input v-model="editUserData.mobilePhone" style="width:300px;" placeholder="请输入管理人员手机号码"></Input>
        </FormItem>
        <FormItem label="座机：">
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
import { filterNull } from '@/libs/tools'
import md5 from "md5";
export default {
  data() {
    const validateUserName = (rule, value, callback) => {
      console.log(rule, value, callback)
        if (value) {
            callback(new Error('Please enter your password'));
        } else {
            callback();
        }
    };
    return {
      formInline: {
        user: "",
        password: ""
      },
      ruleInline: {
        user: [
          {
            required: true,
            message: "Please fill in the user name",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "Please fill in the password.",
            trigger: "blur"
          },
          {
            type: "string",
            min: 6,
            message: "The password length cannot be less than 6 bits",
            trigger: "blur"
          }
        ]
      },
      postData: {
        pageIndex: 1,
        pageSize: 10
      },
      roleList: [],
      userColumns: [
        { type: "index", title: "序号" },
        { title: "登录名", key: "userName", align: "center" },
        { title: "姓名", key: "realName", align: "center" },
        { title: "手机", key: "mobilePhone", align: "center" },
        { title: "角色", key: "roleName", align: "center" },
        {
          title: "状态",
          key: "status",
          align: "center",
          render: (h, params) => {
            return h("div", {}, params.row.status === 1 ? "使用中" : "停用");
          }
        },
        { title: "创建时间", key: "createTime", align: "center", width: 150 },
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
                  directives: [{ name: "hasPermission", value: "editSysUser" }]
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
                    { name: "hasPermission", value: "resetPassword" }
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
                  directives: [{ name: "hasPermission", value: "openOrClose" }]
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
          { validator: validateUserName, trigger: 'blur' },
          { required: true, message: "请输入登录名", trigger: "blur" },
          { type: 'string', min: 8, message: "登录名最少输入8位", trigger: "blur" },
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        realName: [
          { required: true, message: "请输入真实姓名", trigger: "blur" }
        ],
        roleId: [
          { required: true, message: "请选择一个角色", pattern: /.+/, trigger: "change" }
        ]
      },
      editUserModal: false,
      editUserData: {},
      editUserRules: {}
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
      // this.getRoleList();
    },
    addUser() {
      // this.$refs['addUserData'].validate((valid) => {
      //     if (valid) {
      //         this.$Message.success('Success!');
      //     } else {
      //         this.$Message.error('Fail!');
      //     }
      // })
      const { type, roleId, userName, password, realName } = this.addUserData;
      if (!type || !roleId || !userName || !password || !realName) {
        this.$Message.error({
          content: "标星内容不能为空，请填写后重新提交！",
          duration: 5
        });
        return;
      }
      if (!/^(?![0-9]*$)[a-zA-Z0-9]{6,20}$/.test(password)) {
        this.$Message.error({
          content: "密码输入不符合要求，请输入6-20位之间，字母和数字组合！",
          duration: 5
        });
        return;
      }
      this.addUserData.password = md5(password);
      http.post({
        vm: this,
        url: "/manager/sys-user/add",
        data: this.addUserData,
        success: res => {
          this.$Message.success("保存成功！");
          this.addUserModal = false;
          this.addUserData = {
            type: 2,
            roleId: "",
            userName: "",
            password: "",
            realName: ""
          };
          this.getUserList();
        },
        error: err => {
          this.addUserData.password = "";
        }
      });
    },
    resetPwd({ id }) {
      this.$Modal.confirm({
        title: "Title",
        content: "确认重置此用户的密码吗？",
        loading: true,
        onOk: () => {
          http.post({
            vm: this,
            url: "/manager/sys-user/resetPassword",
            data: { id },
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
      this.addUserData = {
        type: 2,
        roleId: "",
        userName: "",
        password: "",
        realName: ""
      };
    },
    changePage(pageIndex) {
      this.postData.pageIndex = pageIndex;
      this.getUserList();
    },
    changePageSize(pageSize) {
      this.postData.pageSize = pageSize;
      this.getUserList();
    },
    openEditUser({
      id,
      roleId,
      userName,
      realName,
      version,
      email,
      mobilePhone,
      seatPhone
    }) {
      this.editUserModal = true;
      this.editUserData = {
        id,
        roleId,
        userName,
        realName,
        version,
        email,
        mobilePhone,
        seatPhone
      };
    },
    editUser() {
      const { roleId, userName, realName } = this.editUserData
      if(!roleId || !userName || !realName){
        this.$Message.error({
          content: '标星内容不能为空，请检查后输入！',
          duration: 5
        })
        return
      }
      http.post({
        vm: this,
        url: "/manager/sys-user/edit",
        data: filterNull(this.editUserData),
        success: res => {
          this.$Message.success('修改成功！');
          this.editUserModal = false
          this.editUserData = {}
          this.getUserList();
        }
      });
      // this.$refs['editUser'].validate((valid) => {
      //   if (valid) {
      //     http.post({
      //       vm: this,
      //       url: '/manager/sys-user/edit',
      //       data: this.editUserData,
      //       success: res => {
      //         this.$Message.success(res.msg)
      //         this.getUserList()
      //       }
      //     })
      //   } else {
      //     this.$Message.error('Error');
      //   }
      // })
    },
    cancelEditUser() {
      this.editUserModal = false
      this.editUserData = {}
    },
    disuse({ id, status, version }) {
      const action = status === 1 ? "停用" : "启用";
      this.$Modal.confirm({
        title: "Title",
        content: `确定${action}此账号吗？`,
        loading: true,
        onOk: () => {
          http.post({
            vm: this,
            url: "/manager/sys-user/openOrClose",
            data: { id, status: status === 1 ? 0 : 1, version },
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