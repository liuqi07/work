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
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal v-model="mine" draggable scrollable title="个人中心">
      <div>
        <p class="info">姓名：<span>{{ userInfo.realName }}</span></p>
        <p class="info">登录名：<span>{{ userInfo.loginName }}</span></p>
        <p class="info">邮箱：<span>{{ userInfo.email }}</span></p>
        <p class="info">联系方式：<span>{{ userInfo.mobilePhone }}</span></p>
        <p class="info">角色：<span>{{ userInfo.roleName }}</span></p>
      </div>
    </Modal>
  </div>
</template>

<script>
  import './user.less'
  import { mapActions } from 'vuex'
  import http from '@/libs/http';
  export default {
    name: 'User',
    props: {
      userAvator: {
        type: String,
        default: ''
      },
    },
    data() {
      return {
        mine: false,
        userInfo: {}
      }
    },
    methods: {
      ...mapActions([
        'handleLogOut'
      ]),
      handleClick(name) {
        switch (name) {
          case 'mine':
            this.mine = true
            http.get({
              vm: this,
              url: '/manager/sys-user/detail',
              data: { id: 1 },
              success: res => {
                this.userInfo = res.data
              }
            })
            break;
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