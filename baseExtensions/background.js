'use strict';

function Ajax(opt) {
  return new Promise(function(resolve,reject){
    var xhr = null;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject('Microsoft.XMLHTTP')
    }
    var type = opt.method.toUpperCase();
    var data = '';
    if(opt.dataType == 'json'){
      data = JSON.stringify(opt.data);
    }else{
      if (typeof opt.data == 'object') {
        var params = [];
        for (var key in opt.data) {
          params.push(key + '=' + opt.data[key]);
        }
        data = params.join('&');
      }
    }
    if (type == 'POST') {
      xhr.open(type, opt.url, true);
      if(opt.dataType != 'json'){
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      }
    }else{
      if(opt.dataType != 'json'){
        xhr.open(type, opt.url + (data ? ('?' + data) :'') , true);
        data = null;
      }else{
        xhr.open(type, opt.url , true);
      }
    }
    if(opt.dataType == 'json'){
      //设置请求头在send之后，open之前
      xhr.setRequestHeader("Content-type", "application/json");
    }
    xhr.send(data);
    // 处理返回数据
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if(xhr.status >= 200 && xhr.status <= 300){
          var type=xhr.getResponseHeader("Content-Type");
          if(type.match(/^application\/json/)){
            resolve(JSON.parse(xhr.responseText));
          }else{
            resolve(xhr.responseText);
          }
        }else{
          reject(xhr.status);
        }
      }
    }
  })
}
var token = '';
var gistId =  '';
function createGist(token,files,desc){
  return Ajax({
    method:'post',
    url:'https://api.github.com/gists?access_token=' + token,
    dataType:'json',
    data:{
      'description': desc || '',
      'public': true,
      'files': files
    }
  })
}

function getGist(token,gistId){
  return Ajax({
    method:'get',
    url:'https://api.github.com/gists/' + gistId,
    data:{
      access_token: token
    }
  })
}

function updateGist(token,gistId,files,desc){
  return Ajax({
    method:'patch',
    url:'https://api.github.com/gists/' + gistId + '?access_token=' + token,
    dataType:'json',
    data:{
      'description': desc || '',
      'files': files
    }
  })
}

//when receive message from content.js,request to get data
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
  console.log(request);
  sendResponse({
    action:'done'
  })
})

chrome.runtime.onInstalled.addListener(function () {
/*   chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          hostEquals: 'developer.chrome.com'
        },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  }); */
  
  //创建右键菜单
  chrome.contextMenus.create({
    "title": "Add into GistMark",
    "id": "parent"
  });
  
  chrome.storage.sync.get('bookToken',obj=>{
    token = obj.bookToken;
    chrome.storage.sync.get('bookGistId',obj=>{
      gistId = obj.bookGistId;
      if(token){
        if(gistId){
          //get existed data
          getGist(token,gistId).then(function(res){
            console.log(res);
            if(res.files){
              for(var name in res.files){
                chrome.contextMenus.create({
                  "title": name/* .slice(0,name.length-5) */,
                  "id": name,
                  "parentId": "parent"
                });
              }
            }
          }).catch(function(err){
            console.log(err);
          });
        }else{
          //create a new file
          chrome.contextMenus.create({
            "title": "默认",
            "id":'default_mark',
            "parentId": "parent"
          });
        }
      }
    })
  })
  //右键菜单事件
  chrome.contextMenus.onClicked.addListener(function (info, tab) {

    //向打开的tab发送事件，获取url和title
    chrome.tabs.query({
      currentWindow: true,
      active: true
    }, function (tabs) {
      if(info.menuItemId == 'parent'){
        return;
      }
      if(gistId){
        //modify
        getGist(token,gistId).then(function(res){
          if(res.files){
            var curFile = res.files[info.menuItemId] || {}
            var originContent = [];
            if(curFile.content){
              originContent = JSON.parse(curFile.content);
            }
            //no unique
            originContent.push({
              url: tabs[0].url, 
              title: tabs[0].title,
              date: new Date()
            })
            res.files[info.menuItemId] = {
              content: JSON.stringify(originContent)
            }
          }
          updateGist(token,gistId,res.files,res.description).then(function(res){
            console.log(res);
          })
        })
      }else{
        //create
        var files = {

        }
        files[info.menuItemId + '.json'] = {
          content: JSON.stringify([
            {
              url: tabs[0].url, 
              title: tabs[0].title,
              date: new Date()
            }
          ])
        }
        createGist(token,files).then(function(res){
          console.log('success')
          console.log(res);
        }).catch(function(err){
          console.log('fail')
          console.log(err);
        });        
      }
      console.log(tabs);
      console.log(info);
      console.log(tabs[0].url, tabs[0].title);
/*       Ajax({
        method:'get',
        url:'https://api.github.com/gists/d07d1cb8ee7317364aec324b1cd2b2db',
        data:{
          access_token: ''
        }
      }).then(function(res){
        console.log('success')
        console.log(res);
      }).catch(function(err){
        console.log('fail')
        console.log(err);
      }); */
/*       Ajax({
        method:'post',
        url:'https://api.github.com/gists?access_token=',
        dataType:'json',
        data:{
          "description": "Hello World Examples",
          "public": true,
          "files": {
            "hello_world.rb": {
              "content": "class HelloWorld\n   def initialize(name)\n      @name = name.capitalize\n   end\n   def sayHi\n      puts \"Hello !\"\n   end\nend\n\nhello = HelloWorld.new(\"World\")\nhello.sayHi"
            }
          }
        }
      }).then(function(res){
        console.log('success')
        console.log(res);
      }).catch(function(err){
        console.log('fail')
        console.log(err);
      }); */
/*       Ajax({
        method:'delete',
        url:'https://api.github.com/gists/b5671fa40297f408c6270217320a0128?access_token=',
        data:{
        }
      }).then(function(res){
        console.log('success')
        console.log(res);
      }).catch(function(err){
        console.log('fail')
        console.log(err);
      }); */

/*       Ajax({
        method:'patch',
        url:'https://api.github.com/gists/507b59eeff985d972e632083dbfb758f?access_token=',
        dataType:'json',
        data:{
          "description": "Hello World Examples",
          "files": {
            "hello_world.rb": {
              "content": "hello.sayHi"
            }
          }
        }
      }).then(function(res){
        console.log('success')
        console.log(res);
      }).catch(function(err){
        console.log('fail')
        console.log(err);
      }); */
    });
  });
});
