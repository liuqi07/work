<style>
  .detail {
    margin: 10px 20px;
  }
  .detail>p {
    margin: 15px 0;
    position: relative;
    width: 400px;
  }
  .detail>p>span {
    position: absolute;
    left: 80px;
  }
</style>

<template>
  <div>
    <Form :label-width="90" inline>
      <FormItem label="一级分类：" style="width: 220px;" required>
        <Select v-model="postData.firstCode" @on-change="firstChange" @on-open-change="onFirstOpen" clearable>
          <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="二级分类：" style="width: 220px;" required>
        <Select v-model="postData.secondCode" @on-change="secondChange" clearable>
          <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="三级分类：" style="width: 220px;" required>
        <Select v-model="postData.thirdCode" @on-change="thirdChange" clearable>
          <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="级别：" style="width: 220px;" required>
        <Select v-model="postData.level" clearable>
          <Option v-for="item in levelList" :value="item" :key="item">{{item}}</Option>
        </Select>
      </FormItem>
      <Button type="primary" @click="search" v-hasPermission="'search'" style="margin-left: 20px; margin-right: 10px;">查询</Button>
      <Button type="primary" @click="openAdd" style="margin-right: 10px;" v-hasPermission="'questionAdd'">添加</Button>
      <Button type="primary" @click="openImport" v-hasPermission="'questionImport'" >导入</Button>
    </Form>
    <Card>
      <Table :columns="columns" :data="questionList"></Table>
      <Page :total="total" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" :page-size="postData.pageSize" :page-index="postData.pageIndex" style="margin-top: 10px"
      />
    </Card>

    <Modal title="添加" v-model="addModal">
      <Form :label-width="90" ref="postData" :model="postData" :rules="postRules">
        <FormItem prop="question" label="问题：" style="width: 300px;" >
          <Input v-model="postData.question" placeholder="请输入问题" />
        </FormItem>
        <FormItem prop="answer" label="答案：" style="width: 300px;" >
          <Input v-model="postData.answer" placeholder="请输入答案" />
        </FormItem>
        <FormItem prop="type" label="题型：" style="width: 300px;" >
          <RadioGroup v-model="postData.type" @on-change="changeType">
            <Radio :label="1">选择题</Radio>
            <Radio :label="2">填空题</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem prop="time" label="答题时间：" style="width: 300px;" >
          <Row>
            <InputNumber v-model="postData.time" placeholder="请输入答题时间，不超过300秒" style="width: 180px;" /> 秒
          </Row>
        </FormItem>
        <FormItem prop="firstCode" label="一级分类：" style="width: 300px;" >
          <Select v-model="postData.firstCode" @on-change="firstChange" @on-open-change="onFirstOpen" clearable>
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="secondCode" label="二级分类：" style="width: 300px;" >
          <Select v-model="postData.secondCode" @on-change="secondChange" clearable>
            <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="thirdCode" label="三级分类：" style="width: 300px;" >
          <Select v-model="postData.thirdCode" @on-change="thirdChange" clearable>
            <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="level" label="级别：" style="width: 300px;" >
          <Select v-model="postData.level" clearable>
            <Option v-for="item in levelList" :value="item" :key="item">{{item}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="options" label="选项：" style="width: 400px;" v-if="isSelect" >
          <Row v-for="(item, index) in postData.options" style="margin-bottom: 5px;" :key="item.code">
            <Col :span="4" style="margin-right: 10px;">
            <Input :value="item.code" disabled />
            </Col>
            <Col :span="16">
            <Input v-model="item.desc" placeholder="请输入选项内容" />
            </Col>
          </Row>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="cancel" style="margin-right: 10px; margin-left: 20px;">取消</Button>
        <Button type="primary" @click="saveQuestion">确定</Button>
      </div>
    </Modal>
    <Modal title="详情" v-model="detailModal" >
      <div class="detail">
        <p>问题：<span>{{detailData.question}}</span></p>
        <p>答案：<span>{{detailData.answer}}</span></p>
        <p>题型：<span>{{detailData.type===1 ? '选择题' : '填空题'}}</span></p>
        <p>答题时间：<span>{{detailData.time}}</span></p>
        <p>一级分类：<span>{{detailData.firstName}}</span></p>
        <p>二级分类：<span>{{detailData.secondName}}</span></p>
        <p>三级分类：<span>{{detailData.thirdName}}</span></p>
        <p>级别：<span>{{detailData.level}}</span></p>
        <p>选项：
          <p v-for="option in detailData.options" style="width: 200px; height: 20px; position: relative; top: -25px;" >
              <span>{{option.code}}：</span><span style="position: absolute; left: 100px; width: 300px;">{{option.desc}}</span>
          </p>
        </p>
      </div>
      <div slot="footer" >
        <Button type="primary" @click="detailAction">确定</Button>
      </div>
    </Modal>
    <Modal title="导入" v-model="importModal" >
      <Form :label-width="90" >
        <FormItem label="一级分类：" style="width: 220px;" required>
          <Select v-model="postData.firstCode" @on-change="firstChange" @on-open-change="onFirstOpen">
            <Option v-for="item in firstList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="二级分类：" style="width: 220px;" required>
          <Select v-model="postData.secondCode" @on-change="secondChange">
            <Option v-for="item in secondList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="三级分类：" style="width: 220px;" required>
          <Select v-model="postData.thirdCode" @on-change="thirdChange">
            <Option v-for="item in thirdList" :value="item.code" :key="item.code">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="级别：" style="width: 220px;" required>
          <Select v-model="postData.level">
            <Option v-for="item in levelList" :value="item" :key="item">{{item}}</Option>
          </Select>
        </FormItem>
        <FormItem label="上传图片：" >
          <input type="file" @change="handleFileChange">
        </FormItem>
      </Form>
      <div slot="footer" >
        <Button @click="cancel" >取消</Button>
        <Button @click="importFile" type="primary">确定</Button>
      </div>
    </Modal>
    
  </div>
</template>

<script>
  import http from '@/libs/http';
  import { formatDate } from '@/libs/tools';
  export default {
    data() {
      const validateOptions = (rule, options=[], cb) => {
        const arr = []
        for(let i=0; i<options.length; i++){
          if(!options[i].desc){
            arr.push(i+1)
          }
        }
        if(arr.length>0){
          cb(new Error(`第${arr.join('、')}道选项不能为空`))
        }else{
          cb()
        }
      }
      const validateAnswer = (rule, answer, cb) => {
        if(!answer){
          cb(new Error('答案不能为空'))
        }else if(this.isSelect && 'ABCD'.indexOf(answer.trim()) < 0){
          cb(new Error('选择题请输入A、B、C、D选项中的一个'))
        }else{
          cb()
        }
      }
      return {
        postData: { pageIndex: 1, pageSize: 10 },
        postRules: {
          question: [
            { required: true, message: '题目不能为空', trigger: 'blur' },
          ],
          answer: [
            { required: true, message: '答案不能为空', trigger: 'blur' },
            { validator: validateAnswer, trigger: 'blur' }
          ],
          type: [
            { required: true, type: 'number', message: '请选择题型', trigger: 'change' }
          ],
          time: [
            { required: true, type: 'number', message: '答题时间不能为空', trigger: 'blur'},
            { required: true, type: 'number', message: '答题时间不能为空', trigger: 'change'},
            { type: 'number', min: 1, max: 300, message: '答题时间应在1-300秒之间', trigger: 'blur'},
            { type: 'number', min: 1, max: 300, message: '答题时间应在1-300秒之间', trigger: 'change'}
          ],
          firstCode: [
            { required: true, message: '一级分类不能为空', trigger: 'change'}
          ],
          secondCode: [
            { required: true, message: '二级分类不能为空', trigger: 'change'}
          ],
          thirdCode: [
            { required: true, message: '三级分类不能为空', trigger: 'change'}
          ],
          level: [
            { required: true, type: 'number', message: '级别不能为空', trigger: 'change'}
          ],
          options: [
            { validator: validateOptions, trigger: 'blur' }
          ]
        },
        columns: [
          { title: '问题', key: 'question', align: 'center' },
          { title: '答案', key: 'answer', align: 'center' },
          {
            title: '题型', key: 'type', align: 'center', render: (h, params) => {
              return h('div', params.row.type === 1 ? '选择题' : '填空题')
            }
          },
          { title: '答题时间', key: 'time', align: 'center' },
          { title: '一级分类', key: 'firstName', align: 'center' },
          { title: '二级分类', key: 'secondName', align: 'center' },
          { title: '三级分类', key: 'thirdName', align: 'center' },
          { title: '级别', key: 'level', align: 'center' },
          {
            title: '选项', key: 'options', align: 'center', width: 200, render: (h, params) => {
              const options = params.row.options
              const type = params.row.type
              const _options = type === 1 && options && JSON.parse(options) || []
              return _options.map(option => {
                return h('div', {
                  style: {
                    marginTop: '3px',
                    marginBottom: '3px'
                  }
                }, [
                    h('span', {}, option.code + '. '),
                    h('span', {}, option.desc)
                  ])
              })
            }
          },
          {
            title: '操作', key: 'actions', align: 'center', width: 150, render: (h, params) => {
              return h('div', [
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
                      this.edit(params.row)
                    }
                  },
                  directives: [
                    { name: 'hasPermission', value: "questionEdit" }
                  ]
                }, '编辑'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.detail(params.row)
                    }
                  }
                }, '查看')
              ])
            }
          },
        ],
        questionList: [],
        firstList: [],
        secondList: [],
        thirdList: [],
        levelList: [],
        total: 0,
        addModal: false,
        isSelect: false,
        addOrEdit: true,
        questionUrl: '',
        detailModal: false,
        detailData: {},
        importModal: false,

      }
    },
    methods: {
      search() {
        // !this.postData.pageIndex && (this.postData.pageIndex = 1)
        // !this.postData.pageSize && (this.postData.pageSize = 10)
        this.getQuestionList(() => { this.$Message.success('查询成功！') })
      },
      openAdd() {
        this.addModal = true
        this.addOrEdit = true
        this.$refs['postData'].resetFields()
        const { pageIndex, pageSize } = this.postData
        this.postData = { pageIndex, pageSize, time: 1 }
        this.questionUrl = '/manager/course-question/add'
      },
      saveQuestion() {
        this.$refs['postData'].validate(valid => {
          if(valid){
            const { question, options } = this.postData
            this.postData.options = JSON.stringify(options)
            this.postData.question = encodeURIComponent(question)
            const msg = this.addOrEdit ? '添加成功！' : '编辑成功！'
            const url = this.questionUrl
            http.post({
              vm: this,
              url,
              data: this.postData,
              success: res => {
                this.$Message.success(msg)
                // this.postData = { pageIndex: 1, pageSize: 10 }
                const { pageIndex, pageSize, ...rest} = this.postData
                this.postData = { pageIndex, pageSize }
                this.$refs['postData'].resetFields()
                this.addModal = false
                this.getQuestionList()
              }
            })
          }
        })
      },
      cancel() {
        this.addModal = false
        this.importModal = false
        this.$refs['postData'].resetFields()
        // this.postData = { pageIndex: 1, pageSize: 10 }
        const { pageIndex, pageSize, ...rest} = this.postData
        this.postData = { pageIndex, pageSize }
        this.isSelect = false
      },
      edit({ id, question, answer, type, time, firstId, secondId, thirdId, level, options: _options }) {
        this.$refs['postData'].resetFields()
        this.addModal = true
        this.addOrEdit = false
        this.questionUrl = '/manager/course-question/edit'

        this.getFirstList(() => {
          const _firstCode = this.firstList.find(f => f.id === firstId)
          const firstCode = _firstCode && _firstCode.code || ''
          this.postData = Object.assign({}, this.postData, { id, firstCode, firstId, question, answer, type, time })
          this.getSecondList(() => {
            const _secondCode = this.secondList.find(s => s.id === secondId)
            const secondCode = _secondCode && _secondCode.code || ''
            this.postData = Object.assign({}, this.postData, { secondCode, secondId })
            this.getThirdList(() => {
              const _thirdCode = this.thirdList.find(s => s.id === thirdId)
              const thirdCode = _thirdCode && _thirdCode.code || ''
              const levelLen = _thirdCode && _thirdCode.level
              this.postData.thirdId = _thirdCode && _thirdCode.id || null
              for (let i = 0; i < levelLen; i++) {
                this.levelList.push(i + 1)
              }
              this.postData = Object.assign({}, this.postData, { thirdCode, thirdId, level })
            })
          })
        })


        this.postData.options = type===1 && _options && JSON.parse(_options) || []
        this.isSelect = type === 1 ? true : false
        // this.postData = { id, question, answer, type, time, firstId, secondId, thirdId, level, options }
      },
      detail({id}){
        this.detailModal = true
        http.get({
          vm: this,
          url: '/manager/course-question/detail',
          data: { id },
          success: res => {   
            const _options = res.data.options && JSON.parse(res.data.options) || []
            this.detailData = Object.assign({}, res.data, { options: _options })
          }
        })
      },
      detailAction(){
        this.detailModal = false
      },
      openImport(){
        this.importModal = true
        this.postData = {}
      },
      importFile(){
        const formData = new FormData()
        for (let k in this.postData) {
          formData.append(k, this.postData[k])
        }
        http._postwithupload({
          vm: this,
          url: '/manager/course-question/importFile',
          data: formData,
          success: res => {
            this.$Message.success('导入成功！')
            this.postData = { pageIndex: 1, pageSize: 10 }
            this.importModal = false
            this.getQuestionList()
          }
        })
      },
      handleFileChange(e) {
        this.postData.file = e.target.files[0]
      },
      getQuestionList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-question/list',
          data: this.postData,
          success: res => {
            this.questionList = res.data.list
            this.total = res.data.total
            cb && cb()
          }
        })
      },
      getFirstList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 1 },
          success: res => {
            this.firstList = res.data
            cb && cb()
          }
        })
      },
      getSecondList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 2, parentCode: this.postData.firstCode },
          success: res => {
            this.secondList = res.data
            cb && cb()
          }
        })
      },
      getThirdList(cb) {
        http.get({
          vm: this,
          url: '/manager/course-classification/getAll',
          data: { type: 3, parentCode: this.postData.secondCode },
          success: res => {
            this.thirdList = res.data
            cb && cb()
          }
        })
      },
      getLevelList() {

      },
      firstChange(val) {
        const _firstId = this.firstList.find(f => f.code === val)
        this.postData.firstId = _firstId && _firstId.id || null
        this.postData.secondCode = null
        this.postData.thirdCode = null
        if (val) {
          this.getSecondList()
        } else {
          this.secondList = []
          this.thirdList = []
        }
      },
      secondChange(val) {
        const _secondId = this.secondList.find(f => f.code === val)
        this.postData.secondId = _secondId && _secondId.id || null
        this.postData.thirdCode = null
        if (val) {
          this.getThirdList()
        } else {
          this.thirdList = []
        }
      },
      thirdChange(val) {
        delete this.postData.level
        if (val) {
          const _thirdId = this.thirdList.find(t => t.code === val)
          const levelLen = _thirdId && _thirdId.level
          this.postData.thirdId = _thirdId && _thirdId.id || null
          for (let i = 0; i < levelLen; i++) {
            this.levelList.push(i + 1)
          }
        } else {
          this.levelList = []
        }
      },
      changePage(p) {
        this.postData.pageIndex = p
        this.getQuestionList()
      },
      changePageSize(s){
        this.postData.pageSize = s
        this.getQuestionList()
      },
      onFirstOpen(data) {
        if (data) {
          this.getFirstList();
        }
      },
      changeType(data) {
        if (data === 1) {
          this.isSelect = true
          const options = [
            { code: 'A', desc: '', order: 1 },
            { code: 'B', desc: '', order: 2 },
            { code: 'C', desc: '', order: 3 },
            { code: 'D', desc: '', order: 4 }
          ]
          this.postData.options = options// = Object.assign({}, this.postData, { options })
        } else {
          this.isSelect = false
          delete this.postData.options
        }
      }
    },
    mounted() {
      this.getQuestionList()
    }
  }
</script>