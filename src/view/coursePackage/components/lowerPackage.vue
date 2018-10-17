<template>
    <div>
      <Table :columns="columns" :data="packageList" @on-select="onSelect" @on-select-all="onSelectAll" @on-select-cancel="onSelectCancel" @on-select-all-cancel="onSelectAllCancel" />
    </div>
  </template>
  
  <script>
    export default {
      data() {
        return {
          columns: [
            { title: '套餐编码', key: 'code', align: 'center', type: 'selection' },
            { title: '套餐名称', key: 'name', align: 'center' },
            { title: '套餐说明', key: 'coursePackageDesc', align: 'center' },
            { title: '一级分类', key: 'firstName', align: 'center' },
            { title: '二级分类', key: 'secondName', align: 'center' },
            { title: '三级分类', key: 'thirdName', align: 'center' },
            { title: '套餐单价', key: 'unitPrice', align: 'center' },
            { title: '每周课时', key: 'weekClassHour', align: 'center' },
            { title: '总课时', key: 'allHour', align: 'center' },
            { title: '套餐总价', key: 'allPrice', align: 'center' }, 
            {
              title: '套餐状态', key: 'status', align: 'center', render: (h, params) => {
                return h('div', {}, '已下架')
              }
            },
            { title: '已售出', key: 'sellCount', align: 'center' },
            {
              title: '管理', key: 'actions', align: 'center', width: 200, render: (h, params) => {
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'success',
                      size: 'small',
                    },
                    style: {
                      marginRight: '5px',
                      display: params.row.status === 1 ? 'none' : 'inline-block'
                    },
                    on: {
                      click: () => {
                        this.packagePush(params.row)
                      }
                    },
                    directives: [
                      { name: 'hasPermission', value: "packagePush" }
                    ]
                  }, '上架'),
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.packageEdit(params.row)
                      }
                    },
                    directives: [
                      { name: 'hasPermission', value: "packageEdit" }
                    ]
                  }, '套餐编辑'),
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.packageDelete(params.row)
                      }
                    },
                    directives: [
                      { name: 'hasPermission', value: "packageDelete" }
                    ]
                  }, '删除')
                ])
              }
            }
          ]
        }
      },
      props: ['packageList'],
      methods: {
        packagePush(row) {
          this.$emit('package_push', row)
        },
        packageEdit(row) {
          this.$emit('package_edit', row)
        },
        packageDelete(row) {
          this.$emit('package_delete', row)
        },
        onSelect(selection, row) {
          this.$emit('on_select', selection)
        },
        onSelectAll(selection) {
          this.$emit('on_select_all', selection)
        },
        onSelectCancel(selection) {
          this.$emit('on_select_cancel', selection)
        },
        onSelectAllCancel(selection) {
          this.$emit('on_select_all_cancel', selection)
        }
      }
    }
  </script>