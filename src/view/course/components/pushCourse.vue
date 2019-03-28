<template>
  <div>
    <Table :columns="columns" :data="courseList" @on-select="onSelect" @on-select-all="onSelectAll"
           @on-select-cancel="onSelectCancel" @on-select-all-cancel="onSelectAllCancel"/>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        columns: [
          {title: '课程编码', key: 'code', align: 'center', type: 'selection'},
          {title: '课程名称', key: 'name', align: 'center'},
          {title: '课程说明', key: 'courseDesc', align: 'center'},
          {title: '一级分类', key: 'firstName', align: 'center'},
          {title: '二级分类', key: 'secondName', align: 'center'},
          {title: '三级分类', key: 'thirdName', align: 'center'},
          // { title: '课程单价', key: '', align: 'center' },
          // { title: '每周课时', key: '', align: 'center' },
          {title: '总课时', key: 'allClassHour', align: 'center'},
          // { title: '课程总价', key: '', align: 'center' }, 
          {
            title: '课程状态', key: 'status', align: 'center', render: (h, params) => {
              return h('div', {}, '已上架')
            }
          },
          // { title: '已售出', key: '', align: 'center' },
          {
            title: '管理', key: 'actions', align: 'center', width: 200, render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                  },
                  on: {
                    click: () => {
                      this.courseLower(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "courseLower"}
                  ]
                }, '下架'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    // disabled: params.row.status===4 ? true : false
                  },
                  style: {
                    marginRight: '5px',
                    // display: params.row.status===2 ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.courseEdit(params.row)
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "courseEdit"}
                  ]
                }, '课程编辑'),
              ])
            }
          }
        ]
      }
    },
    props: ['courseList'],
    methods: {
      courseLower(row) {
        this.$emit('course_lower', row)
      },
      courseEdit(row) {
        this.$emit('course_edit', row)
      },
      courseDetele(row) {
        this.$emit('course_delete', row)
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
        this.$emit('on_select_all_cancel')
      }
    }
  }
</script>
