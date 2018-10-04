<template>
  <div>
    <Card>
      <Tabs name="name1" style="min-height: 400px;">
        <TabPane label="全部课程" name="all">
          <search-form></search-form>
          <all-course></all-course>
        </TabPane>
        <TabPane label="未上架" name="name2" :status="1">标签二的内容</TabPane>
        <TabPane label="已上架" name="name3" :status="2">标签三的内容</TabPane>
        <TabPane label="已下架" name="name4" :status="3">标签四的内容</TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<script>
  import AllCourse from './components/allCourse.vue';
  import SearchForm from './components/searchForm.vue';
  export default {
    components: {
      AllCourse,
      SearchForm,
    },
    data() {
      return {
        
      }
    }
  }
</script>