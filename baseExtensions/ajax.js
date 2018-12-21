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
  function createGist(token,files){
    return Ajax({
      method:'post',
      url:'https://api.github.com/gists?access_token=' + token,
      dataType:'json',
      data:{
        'description': 'gist mark',
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
  
  function updateGist(token,gistId,files){
    return Ajax({
      method:'patch',
      url:'https://api.github.com/gists/' + gistId + '?access_token=' + token,
      dataType:'json',
      data:{
        'description': 'gist mark',
        'files': files
      }
    })
  }