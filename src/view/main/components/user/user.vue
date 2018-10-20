<style>
  .info {
    font-weight: bold;
    margin: 10px 20px;
    position: relative;
    width: 200px;
  }

  .info span {
    position: absolute;
    left: 100px;
    text-align: right;
  }
</style>

<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <Avatar :src="userAvator" />
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="mine">个人中心</DropdownItem>
        <DropdownItem name="update">修改密码</DropdownItem>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal v-model="mine" draggable scrollable title="个人中心">
      <div>
        <p class="info">姓名：<span>{{ userInfo.realName }}</span></p>
        <p class="info">登录名：<span>{{ userInfo.userName }}</span></p>
        <p class="info">邮箱：<span>{{ userInfo.email }}</span></p>
        <p class="info">联系方式：<span>{{ userInfo.mobilePhone }}</span></p>
        <p class="info">角色：<span>{{ userInfo.roleName }}</span></p>
      </div>
    </Modal>
    <Modal title="修改密码" v-model="updateModal">
      <Form :label-width="120" ref="update" :model="postData" :rules="postRules">
        <FormItem prop="oldPassword" label="原密码：" style="width: 400px;">
          <Input type="password" placeholder="请输入原密码" v-model="postData.oldPassword" />
        </FormItem>
        <FormItem prop="newPassword" label="新密码：" style="width: 400px;">
          <Input type="password" placeholder="6-20位字符，字母数字组合" v-model="postData.newPassword" />
        </FormItem>
        <FormItem prop="newPasswordAgain" label="再次输入新密码：" style="width: 400px;">
          <Input type="password" placeholder="请再次输入新密码" v-model="postData.newPasswordAgain" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button type="primary" @click="updatePwd">保存</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import './user.less'
  import { mapActions } from 'vuex'
  import http from '@/libs/http';
  import md5 from 'md5';
  export default {
    name: 'User',
    props: {
      userAvator: {
        type: String,
        default: ''
      },
    },
    data() {
      const validateOldPwd = (rule, password, cb) => {
        if(!password){
          cb(new Error('密码不能为空'))
        }else{
          // 后台校验，待实现
          cb()
        }
      }
      const validateNewPwdAgain = (rule, newPasswordAgain, cb) => {
        if(!newPasswordAgain){
          cb(new Error('新密码不能为空'))
        }else{
          if(!this.postData.newPassword){
            cb(new Error('请先输入新密码'))
          }else if(this.postData.newPasswordAgain !== this.postData.newPassword){
            cb(new Error('两次密码输入不一致，请检查后输入'))
          }else{
            cb()
          }
        }
      }
      return {
        mine: false,
        userInfo: {},
        updateModal: false,
        updatePassword: {},
        oldPassword: '',
        newPassword: '',
        newPasswordAgain: '',
        postData: {},
        postRules: {
          oldPassword: [
            { required: true, message: '密码不能为空', trigger: 'blur' },
            { validator: validateOldPwd, trigger: 'blur' }
          ],
          newPassword: [
            { required: true, message: '新密码不能为空', trigger: 'blur' },
            { type: 'string', message: '请输入6-20位之间，字母和数字组合！', pattern: /^(?![0-9]*$)[a-zA-Z0-9]{6,20}$/, trigger: 'blur' }
          ],
          newPasswordAgain: [
            { required: true, message: '请再次输入新密码', trigger: 'blur' },
            { validator: validateNewPwdAgain, trigger: 'blur' }
          ]
        },
      }
    },
    methods: {
      updatePwd() {
        // if (!this.oldPassword || !this.newPassword || !this.newPasswordAgain) {
        //   this.$Message.error('标星内容不能为空！')
        // }
        // else if (this.newPassword && this.newPassword !== this.newPasswordAgain) {
        //   this.$Message.error('新旧密码不一致，请检查后重新尝试')
        // }
        // else if (!/^(?![0-9]*$)[a-zA-Z0-9]{6,20}$/.test(this.newPassword)) {
        //   this.$Message.error('密码输入不符合要求，请输入6-20位之间，字母和数字组合！')
        // } else {
          
        // }
        this.$refs['update'].validate(valid => {
          if(valid) {
            this.updatePassword = {
              oldPassword: md5(this.postData.oldPassword),
              newPassword: md5(this.postData.newPassword)
            }
            http.post({
              vm: this,
              url: '/manager/sys-user/modifyPassword',
              data: this.updatePassword,
              success: res => {
                this.$Message.success('密码修改成功！')
              }
            })
            this.postData = {}
            this.updatePassword = {}
            this.updateModal = false
            this.$refs['update'].resetFields()
          }
        })
      },
      cancel() {
        this.updateModal = false
        this.postData = {}
        this.updatePassword = {}
        this.$refs['update'].resetFields()
      },
      ...mapActions([
        'handleLogOut'
      ]),
      handleClick(name) {
        switch (name) {
          case 'mine':
            this.mine = true
            http.get({
              vm: this,
              url: '/manager/getCurrentInfo',
              success: res => {
                this.userInfo = res.data
              }
            })
            break;
          case 'update':
            this.updateModal = true
            break
          case 'logout':
            this.handleLogOut().then(() => {
              this.$router.push({
                name: 'login'
              })
            })
            break
        }
      }
    }
  }
</script>