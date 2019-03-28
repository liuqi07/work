<template>
  <div>
    <Table :columns="columns" :data="courseList" />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        columns: [
          { title: '课程编码', key: 'code', align: 'center' },
          { title: '课程名称', key: 'name', align: 'center' },
          { title: '课程说明', key: 'courseDesc', align: 'center' },
          { title: '一级分类', key: 'firstName', align: 'center' },
          { title: '二级分类', key: 'secondName', align: 'center' },
          { title: '三级分类', key: 'thirdName', align: 'center' },
          // { title: '课程单价', key: '', align: 'center' },
          // { title: '每周课时', key: '', align: 'center' },
          { title: '总课时', key: 'allClassHour', align: 'center' },
          // { title: '课程总价', key: '', align: 'center' }, 
          {
            title: '课程状态', key: 'status', align: 'center', render: (h, params) => {
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
          // { title: '已售出', key: '', align: 'center' },
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
                      this.coursePush(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "coursePush" }
                  ]
                }, '上架'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    display: params.row.status===2 ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.courseLower(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "courseLower" }
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
                      console.log("编辑");
                      this.courseEdit(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "courseEdit" }
                  ]
                }, '课程编辑'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: params.row.status===4 ? true : false
                  },
                  style: {
                    display: params.row.status===2 ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.courseDetele(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "courseDetele" }
                  ]
                }, '删除')
              ])
            }
          }
      ]
    }
  },
  props: ['courseList'],
    methods: {
      coursePush(row) {
        this.$emit('course_push', row)
      },
      courseLower (row) {
        this.$emit('course_lower', row)
      },
      courseEdit (row) {
        this.$emit('course_edit', row)
      },
      courseDetele (row) {
        this.$emit('course_delete', row)
      }
  }
}
</script>
