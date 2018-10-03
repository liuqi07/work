<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <Avatar :src="userAvator"/>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="mine">个人中心</DropdownItem>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal v-model="mine" draggable scrollable title="个人中心">
      <div> This is the first modal </div>
    </Modal>
  </div>
</template>

<script>
import './user.less'
import { mapActions } from 'vuex'
export default {
  name: 'User',
  props: {
    userAvator: {
      type: String,
      default: ''
    },
    mine: false,
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    handleClick (name) {
      switch (name) {
        case 'mine': 
          this.mine = true
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
