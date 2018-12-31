<template>
  <div>
    <Form :model="postData" :label-width="90" inline>
      <FormItem label="二级分类：" style="width: 200px;">
        <Select v-model="postData.secondCode" @on-change="secondChange" @on-open-change="getSecondList" clearable>
          <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="三级分类：" style="width: 200px;">
        <Select v-model="postData.thirdCode" @on-change="thirdChange" clearable>
          <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="教师真实姓名：" style="width: 250px;" :label-width="110">
        <Input v-model="postData.teacherRealName" placeholder="教师真实姓名"/>
      </FormItem>
      <Button type="primary" @click="search" v-hasPermission="'search'" style="margin-left: 20px;">查询</Button>
    </Form>
    <Card>
      <Table :columns="columns" :data="teacherCourseList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize"
            :page-index="postData.pageIndex"
            :page-size="postData.pageSize" style="margin-top: 10px"/>
    </Card>
    <Modal :title="uploadTitle" v-model="uploadModal">
      <Button @click="openVideo" v-if="tvUrl" type="success" style="margin-right: 30px;">查看录播课</Button>
      <label for="file"
             style="display: inline-block; width: 80px; border: 1px solid #ccc; border-radius: 4px; line-height: 30px; text-align: center; cursor:pointer; margin-right: 10px;">
        {{uploadTitle2}}
      </label>
      <span>{{file&&file.name||''}}</span>
      <input type="file" id="file" accept=".mp4,.MPEG4" @change="handleFileChange" style="display: none;">
      <div slot="footer">
        <Button @click="cancel" style="margin-right: 10px;">取消</Button>
        <Button @click="uploadFile" type="primary" :loading="uploading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from "@/libs/http";
  import {formatDate, getWeek} from '@/libs/tools';

  export default {
    data() {
      return {
        postData: {pageIndex: 1, pageSize: 10},
        columns: [
          {title: '教师姓名', key: 'teacherName', align: 'center'},
          {title: '教师编号', key: 'teacherCode', align: 'center'},
          {title: '二级分类', key: 'secondName', align: 'center'},
          {title: '三级分类', key: 'thirdName', align: 'center'},
          {title: '课程名称', key: 'courseName', align: 'center'},
          {
            title: '上课日期', key: 'classBeginTime', align: 'center', render: (h, params) => {
              return h('div', formatDate('YYYY-MM-DD', params.row.classBeginTime))
            }
          },
          {
            title: '周', key: 'classBeginTime', align: 'center', render: (h, params) => {
              return h('div', getWeek(params.row.classBeginTime))
            }
          },
          {
            title: '上课时间', key: 'classBeginTime', align: 'center', render: (h, params) => {
              return h('div', formatDate('hh:mm', params.row.classBeginTime))
            }
          },
          {
            title: '状态', key: 'status', align: 'center', render: (h, params) => {
              const status = params.row.status
              const statusStr = status === 1 ? '未上课' : (status === 2 ? '已上课' : (status === 3 ? '已退款' : '已关闭'))
              return h('div', statusStr)
            }
          },
          {
            title: '操作', key: 'actions', align: 'center', width: 200, render: (h, params) => {
              const tvUrl = params.row.tvUrl
              return h('div', [
                h('Button', {
                  props: {
                    type: tvUrl ? 'success' : 'primary',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px',
                    marginBottom: '3px'
                  },
                  on: {
                    click: () => {
                      this.upload({...params.row, tvUrl})
                    }
                  },
                  directives: [
                    {name: 'hasPermission', value: "upload"}
                  ]
                }, tvUrl ? '查看/重新上传' : '上传录播课'),
              ])
            }
          }
        ],
        teacherCourseList: [],
        total: 0,
        secondList: [],
        thirdList: [],
        uploadModal: false,
        tableId: null,
        uploadTitle: '',
        tvUrl: null,
        uploading: false,
        uploadTitle2: '',
        file: null
      };
    },
    methods: {
      openVideo(){
        window.open(this.tvUrl);
      },
      uploadFile() {
        if (this.file) {
          this.uploading = true
          const formData = new FormData()
          formData.append('tableId', this.tableId)
          formData.append('file', this.file)
          http._postwithupload({
            vm: this,
            url: '/manager/teacher/uploadCourseTv',
            data: formData,
            success: res => {
              this.$Message.success('上传成功！')
              this.getTeacherCourseList()
              this.uploadModal = false
              this.uploading = false
            },
            error: err => {
              this.uploading = false
            }
          })
        } else {
          this.file = null
          this.$Message.error('请先选择文件后点击上传！')
        }
      },
      cancel(){
        this.file = null
        this.uploadModal = false
      },
      handleFileChange(e) {
        this.file = e.target.files[0]
      },
      upload({tableId, tvUrl}) {
        this.file = null
        this.tableId = tableId
        this.uploadModal = true
        this.tvUrl = tvUrl
        this.uploadTitle = tvUrl ? '查看/重新上传' : '上传录播课'
        this.uploadTitle2 = tvUrl ? '重新上传' : '上传录播课'
      },
      search() {
        this.getTeacherCourseList(() => {
          this.$Message.success("查询成功!");
        });
      },
      getTeacherCourseList(cb) {
        http.get({
          vm: this,
          url: "/manager/teacher/queryTeacherCourseTable",
          data: this.postData,
          success: res => {
            this.teacherCourseList = res.data.list;
            this.total = res.data.total;
            cb && cb();
          }
        });
      },
      getSecondList() {
        http.get({
          vm: this,
          url: "/manager/course-classification/getAll",
          data: {type: 2},
          success: res => {
            this.secondList = res.data;
          }
        });
      },
      getThirdList() {
        http.get({
          vm: this,
          url: "/manager/course-classification/getAll",
          data: {type: 3, parentCode: this.postData.secondCode},
          success: res => {
            this.thirdList = res.data;
          }
        });
      },
      secondChange(val) {
        this.postData.thirdCode = null;
        this.postData.thirdId = null;
        this.postData.secondId = null
        if (val) {
          const _secondId = this.secondList.find(s => s.code === val);
          this.postData.secondId = (_secondId && _secondId.id) || null;
          this.getThirdList();
        } else {
          this.thirdList = [];
        }
      },
      thirdChange(val) {
        this.postData.thirdId = null;
        if (val) {
          const _thirdId = this.thirdList.find(item => item.code === val);
          this.postData.thirdId = (_thirdId && _thirdId.id) || null;
        }
      },
      changePage(p) {
        this.postData.pageIndex = p;
        this.getTeacherCourseList();
      },
      changePageSize(s) {
        this.postData.pageSize = s;
        this.getTeacherCourseList();
      }
    },
    mounted() {
      this.getTeacherCourseList();
    }
  };
</script>
