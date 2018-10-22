<template>
    <div>
      <Table :columns="columns" :data="packageList"  @on-select="onSelect" @on-select-all="onSelectAll" @on-select-cancel="onSelectCancel" @on-select-all-cancel="onSelectAllCancel" />
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
            { title: '优惠单价', key: 'discountUnitPrice', align: 'center' },
            { title: '每周课时', key: 'weekClassHour', align: 'center' },
            { title: '总课时', key: 'allHour', align: 'center' },
            { title: '套餐总价', key: 'allPrice', align: 'center' }, 
            {
              title: '套餐状态', key: 'status', align: 'center', render: (h, params) => {
                return h('div', {}, '已上架')
              }
            },
            { title: '已售出', key: 'sellCount', align: 'center' },
            {
              title: '管理', key: 'actions', align: 'center', render: (h, params) => {
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'error',
                      size: 'small',
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.packageLower(params.row)
                      }
                    },
                    directives: [
                      { name: 'hasPermission', value: "packageLower" }
                    ]
                  }, '下架')
                ])
              }
            }
          ]
        }
      },
      props: ['packageList'],
      methods: {
        packageLower(row) {
          this.$emit('package_lower', row)
        },
        packageEdit(row) {
          this.$emit('package_edit', row)
        },
        packageDelete(row) {
          this.$emit('package_delete', row)
        },
        onSelect (selection, row) {
          this.$emit('on_select', selection)
        },
        onSelectAll (selection) {
          this.$emit('on_select_all', selection)
        },
        onSelectCancel(selection) {
          this.$emit('on_select_cancel', selection)
        },
        onSelectAllCancel(selection){
          this.$emit('on_select_all_cancel')
        }
      }
    }
  </script>