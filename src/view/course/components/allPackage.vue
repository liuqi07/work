<template>
    <div>
      <Table :columns="columns" :data="packageList" />
    </div>
  </template>
  
  <script>
    export default {
      data() {
        return {
          columns: [
            { title: '套餐编码', key: 'code', align: 'center' },
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
                let statusDesc = ''
                switch (params.row.status) {
                  case 1:
                    statusDesc = '未上架'
                    break;
                  case 2:
                    statusDesc = '已上架'
                    break;
                  case 3:
                    statusDesc = '已下架'
                    break;
                  case 4:
                    statusDesc = '已删除'
                    break;
                }
                return h('div', {}, statusDesc)
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
                      display: (params.row.status===1||params.row.status===3) ? 'inline-block' : 'none'
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
                      type: 'error',
                      size: 'small',
                    },
                    style: {
                      marginRight: '5px',
                      display: params.row.status===2 ? 'inline-bloc' : 'none'
                    },
                    on: {
                      click: () => {
                        this.packageLower(params.row)
                      }
                    },
                    directives: [
                      { name: 'hasPermission', value: "packageLower" }
                    ]
                  }, '下架'),
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small',
                      disabled: params.row.status===4 ? true : false
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
                  }, '课程编辑'),
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small',
                      disabled: params.row.status===4 ? true : false
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
        packageLower (row) {
          this.$emit('package_lower', row)
        },
        packageEdit (row) {
          this.$emit('package_edit', row)
        },
        packageDetele (row) {
          this.$emit('package_delete', row)
        }
    }
  }
  </script>