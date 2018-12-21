<template>
  <div id="app">
    <el-menu mode="horizontal" @select="switchMenu" :default-active="menu">
      <el-menu-item index="token">
        TOKEN管理
      </el-menu-item>
      <el-menu-item index="mark">
        书签管理
      </el-menu-item>
    </el-menu>
    <div v-if="menu == 'token'" class="book-content-wrap">
      <el-tabs value="token" tab-position="left">
        <el-tab-pane label="添加/重置" name="token">
          <el-form size="small" label-width="100px" class="book-form-wrap" >
            <el-form-item label="TOKEN" prop="token">
              <el-input v-model="nToken"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addToken" v-if="!token">添加</el-button>
              <el-button type="primary" @click="addToken" v-else>重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="GISTID" name="gistId">
          <el-form size="small" label-width="100px" class="book-form-wrap" >
            <el-form-item label="GISTID" prop="GISTID">
              <el-input v-model="nGistId"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addGistId" v-if="!gistId">添加</el-button>
              <el-button type="primary" @click="addGistId" v-else>重置</el-button>
              <el-button type="primary" @click="createGist" >重新生成</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div v-if="menu == 'mark'" class="book-content-wrap">
      <el-tabs value="token" @tab-click="handleClick" tab-position="left">
        <el-tab-pane label="添加书签" name="nMark">
          <el-form size="small" label-width="100px" class="book-form-wrap" >
            <el-form-item label="书签名称" prop="nMark">
              <el-input v-model="nMark"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addMark" >添加</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="书签查看" name="label">
          <div class="book-table-wrap">
            <div>
              <el-form :inline="true" :model="formInline" class="demo-form-inline" size="small">
                <el-form-item label="">
                  <el-select filterable placeholder="请选择" @change="switchMark" v-model="value">
                    <el-option
                      v-for="item in options"
                      :key="item.name"
                      :label="item.name"
                      :value="item.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="onDelete">删除</el-button>
                </el-form-item>
              </el-form>
            </div>
            <el-table
              ref="multipleTable"
              :data="dataList"
              tooltip-effect="dark"
              style="width: 100%"
              border
              stripe
              v-loading="loading"
              element-loading-text="加载中"
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(0, 0, 0, 0.8)"
              @selection-change="handleSelectionChange">
              <el-table-column
                type="selection"
                width="55">
              </el-table-column>
              <el-table-column
                prop="title"
                label="title"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="url"
                label="地址"
                show-overflow-tooltip>
                <template slot-scope="scope"><a :href="scope.row.url" target="blank">{{ scope.row.url }}</a></template>
              </el-table-column>
              <el-table-column
                prop="date"
                label="添加日期"
                show-overflow-tooltip>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
  export default {
    components: {
    },
    data(){
      return {
        token:'',
        nToken:'',
        gistId:'',
        nGistId:'',
        menu:'token',
        options:[],
        marks:{},
        dataList : [],
        multipleSelection:[],
        value:'',
        nMark:'',
        loading:false
      }
    },
    methods:{
      addToken(){
        //创建右键菜单
        chrome.contextMenus.create({
          "title": "js",
          "id":'test',
          "parentId": "parent"
        });
        if(this.nToken){
          chrome.storage.sync.set({
            bookToken: this.nToken
          }, ()=>{
            this.$message({
              type:'success',
              message:'保存成功'
            })
          });
        }else{
          this.$message({
            type:'warning',
            message:'请填写正确的token'
          })
        }
      },
      addGistId(){
        if(this.nGistId){
          chrome.storage.sync.set({
            bookGistId: this.nGistId
          }, ()=>{
            this.$message({
              type:'success',
              message:'保存成功'
            })
          });
        }else{
          this.$message({
            type:'warning',
            message:'请填写正确的gistid'
          })
        }
      },
      addMark(){
        if(this.nMark){
          if(this.token && this.gistId){
            getGist(this.token,this.gistId).then(res => {
              if(res.files){
                res.files[this.nMark] = {
                  content:JSON.stringify([])
                }
                updateGist(this.token,this.gistId,res.files).then(res=>{
                  console.log(res);
                  this.$message({
                    type:'success',
                    message:'添加成功'
                  })
                  if(res.files){
                    chrome.contextMenus.removeAll();
                    chrome.contextMenus.create({
                      "title": "Add into GistMark",
                      "id": "parent"
                    });
                    for(var name in res.files){
                      chrome.contextMenus.create({
                        "title": name/* .slice(0,name.length-5) */,
                        "id": name,
                        "parentId": "parent"
                      });
                    }
                  }
                }).catch(e=>{
                  this.$message({
                    type:'error',
                    message:'添加失败'
                  })    
                })
              }
            })
          }
        }
      },
      createGist(){
        if(this.token){
          let files = {
            'default_mark':{
              content: JSON.stringify([])
            }
          }
          createGist(this.token,files).then(res=>{
            if(res.id){
              this.nGistId = res.id;
              this.gistId = res.id;
              chrome.storage.sync.set({
                bookGistId: this.nGistId
              }, ()=>{
                this.$message({
                  type:'success',
                  message:'已生成gistid'
                })
              });
              if(res.files){
                chrome.contextMenus.removeAll();
                chrome.contextMenus.create({
                  "title": "Add into GistMark",
                  "id": "parent"
                });
                for(var name in res.files){
                  chrome.contextMenus.create({
                    "title": name/* .slice(0,name.length-5) */,
                    "id": name,
                    "parentId": "parent"
                  });
                }
              }
            }
          }).catch(e => {
            console.log(e);
            this.$message({
              type:'error',
              message:'添加失败'
            }) 
          })
        }else{
          this.$message({
            type:'warning',
            message:'请填写token'
          })
        }
      },
      switchMenu(key,path){
        this.menu = key;
      },
      handleClick(tabItem){
        if(tabItem.name == 'label'){
          //get the data
          if(this.token && this.gistId){
            this.loading = true;
            getGist(this.token,this.gistId).then(res=>{
              console.log(res)
              let options = [];
              let marks = {}
              this.files = res.files;
              for(let name in res.files){
                options.push({
                  name:name
                })
                marks[name] = JSON.parse(res.files[name].content);
              }
              this.options = options;
              this.marks = marks;
              if(options.length > 0){
                this.value = options[0].name
                this.dataList = marks[options[0].name]
              }
              this.loading = false;
            }).catch(e => {
              this.loading = false;
            })
          }
        }
      },
      switchMark(item){
        this.multipleSelection = [];
        this.dataList = this.marks[item] || [];
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      onDelete(){
        if(this.files && this.dataList && this.value){
          let newContent = this.dataList.filter(item => this.multipleSelection.findIndex(it=>{
            return (it.title==item.title && it.url == item.url && it.date == item.date)
          }) == -1)
          this.files[this.value].content = JSON.stringify(newContent);
          updateGist(this.token,this.gistId, this.files).then(res =>{
            console.log(res);
            let options = [];
            let marks = {}
            this.files = res.files;
            for(let name in res.files){
              options.push({
                name:name
              })
              marks[name] = JSON.parse(res.files[name].content);
            }
            this.options = options;
            this.marks = marks;
            this.dataList = marks[this.value]
          })
        }
      }
    },
    mounted(){
      chrome.storage.sync.get('bookToken',obj=>{
        this.token = obj.bookToken;
        this.nToken = obj.bookToken;
      })
      chrome.storage.sync.get('bookGistId',obj=>{
        this.gistId = obj.bookGistId;
        this.nGistId = obj.bookGistId;
      })
      console.log(chrome.contextMenus);
    },
  }
</script>

<style>
  .book-form-wrap{
    width:500px;
  }
  .book-content-wrap{
    margin: 20px 0;
  }
  .book-table-wrap{
    margin: 0 30px;
  }
</style>