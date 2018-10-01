<template>
  <div>
    <div style="margin-bottom: 15px;">
      <Input v-model="value" placeholder="Enter something..." style="width: 300px; margin-right: 15px;" />
      <Button v-hasPermission="'edit'" type="primary">搜索</Button>
    </div>
    <Table stripe :columns="columns1" :data="data1"></Table>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        value: '',
        columns1: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        data1: [
          {
            name: 'John Brown',
            age: 18,
            address: 'New York No. 1 Lake Park',
            date: '2016-10-03'
          },
          {
            name: 'Jim Green',
            age: 24,
            address: 'London No. 1 Lake Park',
            date: '2016-10-01'
          },
          {
            name: 'Joe Black',
            age: 30,
            address: 'Sydney No. 1 Lake Park',
            date: '2016-10-02'
          },
          {
            name: 'Jon Snow',
            age: 26,
            address: 'Ottawa No. 2 Lake Park',
            date: '2016-10-04'
          }
        ]
      }
    }
  }
</script>