<template>
  <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="loginName">
      <Input v-model="form.loginName" placeholder="请输入用户名">
        <span slot="prepend">
          <Icon :size="16" type="ios-person"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input type="password" v-model="form.password" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="validCode">
      <Row :gutter="16">
        <Col span="16">
          <Input v-model="form.validCode" placeholder="请输入验证码">
            <span slot="prepend">
              <Icon :size="14" type="ios-barcode"></Icon>
            </span>
          </Input>
        </Col>
        <Col span="6">
          <p><img style="width: 70px; height: 32px;" :src="validCodeImg" @click="getValidCodeImg" alt='验证码'/></p>
        </Col>
      </Row>
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit" type="primary" long>登录</Button>
    </FormItem>
  </Form>
</template>
<script>
import md5 from 'md5';
import { getValidCode, logout } from '@/api/user';
import axios from 'axios';
// import { handleResponse } from '@/libs/util';
export default {
  name: 'LoginForm',
  props: {
    loginNameRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ]
      }
    },
    validCodeRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '验证码不能为空', trigger: 'blue' }
        ]
      }
    }
  },
  data () {
    return {
      form: {
        loginName: '',
        password: '',
        validCode: ''
      },
      validCodeImg: ''
    }
  },
  computed: {
    rules () {
      return {
        loginName: this.loginNameRules,
        password: this.passwordRules,
        validCode: this.validCodeRules
      }
    }
  },
  methods: {
    handleSubmit () {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$emit('on-success-valid', {
            loginName: this.form.loginName,
            password: md5(this.form.password),
            validCode: this.form.validCode
          })
        }
      })
    },
    getValidCodeImg () {
      getValidCode().then(res => {
        if(res.data.code===1){
          this.validCodeImg = res.data.data
        }
        else if(res.data.code===2){
          this.$Message.error(res.data.message);
        }
      })
    }
  },
  mounted(){
    this.getValidCodeImg()
  }
    
}
</script>
