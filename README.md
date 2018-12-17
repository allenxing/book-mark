# book-mark

> book mark using gist

## Build Setup

``` bash
# install dependencies
npm install

# build for production with minification
npm run build

```
## 目录
```
├─baseExtensions    
│  ├─images
|  ├─background.js
|  ├─manifest.json  
|  ├─options.js
|  ├─popup.js          
├─build             
├─config            
├─src               
│  ├─assets         
│  ├─components     
│  └─pages          
│      ├─options
|      |    ├─app.vue
|      |    ├─options.html  
|      |    ├─options.js      
│      ├─popup
|      |    ├─app.vue
|      |    ├─popup.html  
|      |    ├─popup.js        
└─static            
```

## vue-cli

修改配置文件:
webpack.prod.conf.js

```
增加watch,监听文件变化，自动打包
watch:true,

去掉原有的HtmlWebpackPlugin插件
new HtmlWebpackPlugin({
    filename: config.build.index,
    template: 'index.html',
    inject: true,
    minify: {
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true
    // more options:
    // https://github.com/kangax/html-minifier#options-quick-reference
    },
    // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    chunksSortMode: 'dependency'
})

生成html修改
function getEntry(globPath) {
  var entries = {},
    basename, tmp, pathname;
  if (typeof (globPath) != "object") {
    globPath = [globPath]
  }
  globPath.forEach((itemPath) => {
    glob.sync(itemPath).forEach(function (entry) {
      basename = path.basename(entry, path.extname(entry));
      console.log(basename);
      if (entry.split('/').length > 4) {
        console.log(entry)
        tmp = entry.split('/').splice(-3);
        console.log(tmp)
        // pathname = tmp.splice(0, 1) + '/' + basename; // 正确输出js和html的路径
        pathname = basename;
        console.log(pathname);
        entries[pathname] = entry;
      } else {
        entries[basename] = entry;
      }
    });
  });
  return entries;
}

var pages = getEntry(['./src/pages/**/*.html']);

for (var pathname in pages) {
  // 配置生成的html文件，定义路径等
  var conf = {
    filename: pathname + '.html',
    template: pages[pathname],   // 模板路径
    inject: true,              // js插入位置
    // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    chunksSortMode: 'dependency'
  };

  if (pathname in webpackConfig.entry) {
    conf.chunks = ['manifest', 'vendor', pathname];
    conf.hash = true;
  }

  webpackConfig.plugins.push(new HtmlWebpackPlugin(conf));
}

增加复制插件文件
// copy custom static assets
new CopyWebpackPlugin([
    {
    from: path.resolve(__dirname, '../static'),
    to: config.build.assetsSubDirectory,
    ignore: ['.*']
    },
    {//copy插件所需
    from: path.resolve(__dirname, '../baseExtensions'),
    to: config.build.assetsPublicPath,
    ignore: ['.*']
    }
])

```
webpack.base.js

```
//获取入口
function getEntry(globPath) {
  var entries = {},
    basename, tmp, pathname;

  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry));
    tmp = entry.split('/').splice(-3);
    pathname = tmp.splice(0, 1) + '/' + basename; 
    entries[pathname] = entry;
  });

  return entries;
}
let entries = getEntry('./src/pages/**/*.js'); 

入口修改
entry:entries,
```

config/index.js
```
assetsPublicPath: '/',
修改成
assetsPublicPath: './',
```

##

