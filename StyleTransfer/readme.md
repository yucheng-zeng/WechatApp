# 简要介绍

​	图像的艺术风格迁移，算是一个简单有趣，而且一般人都能看得到效果的算法。图像艺术风格迁移，简单的理解，就是找一个照片作为内容，然后把这个照片换成例如梵高或者毕加索等制定的风格。风格迁移的大概思路是：我们需要准备两张图片。一张是我们将要输出的内容图片，另外一张是我们需要模仿的风格图片。我们需要输出一张图片，让输出的这张图片的内容和内容图片相近，让输出图片的风格和风格图片的风格相近。

# 开发设计思路

## 1、建立图床

​	在腾讯云上申请一个对象存储COS，存储风格图片

​	![image-20201016094450912](C:\Users\www12\Desktop\图床\image-20201016094450912.png)

## 2、获取风格图片的URL

​	通过cos-nodejs-sdk-v5调用cos.getBucket和cos.getObjectUrl接口，获取风格图片的URL

### 安装依赖

```shell
npm i cos-nodejs-sdk-v5 --save
npm i promise
npm i wx-server-sdk
```



### 云函数

```js
// 云函数入口文件
const cloud = require('wx-server-sdk')
const COS = require('cos-nodejs-sdk-v5');
const Promise = require('promise');

// 创建实例
const cos = new COS({
  SecretId: '***',
  SecretKey: '***',
});
// 云函数入口函数
const getUrl = function (key) {
  var url = cos.getObjectUrl({
    Bucket: 'yuchengzeng-1303825104',
    Region: 'ap-nanjing',
    Key: key,
    Sign: 'false'
  });
  return url
}

cloud.init()

exports.main = async (event, context) => {
    var promise = new Promise((resolve, reject) => 
    {
      cos.getBucket({
        Bucket: '*****',
        Region: 'ap-nanjing',
        /* 存储桶所在地域，必须字段 */
        Prefix: 'style/s',
        Delimiter: '/',
        Sign: 'false',
      },
      function (err, data) 
      {
        // 未完成 
        var urlList = []
        var objects = data.Contents
        for (var index in objects) {
          urlList.push(getUrl(objects[index].Key))
        }
        resolve({info:'success', data: urlList})    
      }
    );
    });
    await Promise.all[promise]
    return promise
}


```

### 调用云函数

```js
loadSytleList: function () {
    let that = this
    var time = 0
    wx.cloud.callFunction({
      name: 'styleList',
      data: {},
      success: res => {
        that.setData({
          imglist: res.result.data
        })
      },
      fail: err => {
        if (time != 2) {
          that.loadSytleList()
          time += 1
        }
      }
    })
  },
```

## 3、设置轮播组件，展示风格图片

```html
<scroll-view class="scroll-container">
    <swiper class='swiper' indicator-dots="true" duration="500" bindchange="swiperChange">
      <block wx:for="{{imglist}}" wx:key="*this">
        <swiper-item>
          <image bindtap="previewImgSwiper" src="{{item}}" class='img' />
        </swiper-item>
      </block>
    </swiper>
  </scroll-view>
```

效果

![2020-10-16-10-02-59](E:\视频\2020-10-16-10-02-59.gif)



## 4、上传内容图片

```js
doUpload: function () {
    let that = this
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        const cloudPath = 'my-image' + that.data.hashcode + filePath.match(/\.[^.]+?$/)[0]
        // 调用云函数
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            that.setData({
              uploadImg: {
                hasImg: true,
                fileID: res.fileID,
                cloudPath: cloudPath,
                filePath: filePath
              },
              avatarUrl: filePath,
            })
            wx.showToast({
              icon: 'none',
              title: '上传成功',
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()

          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
```



## 5、风格转换

### 安装依赖

```shell
npm install --save deepai
npm i promise
npm i wx-server-sdk
```



### 云函数

```js
// 云函数入口文件
const cloud = require('wx-server-sdk')
const deepai = require('deepai')
const Promise = require('promise');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var contentFileID = event.contentFileID
  const fileList = [contentFileID]
  const result = await cloud.getTempFileURL({
    fileList: fileList,
  })
  var contentURL = result.fileList[0].tempFileURL;
  var styleURL = event.styleURL
  
  await deepai.setApiKey('7841ba60-e47f-4d10-86d5-7045e2a729cb');
  var res = (async function () {
    var resp = await deepai.callStandardApi("fast-style-transfer", {
      content: contentURL,
      style: styleURL,
    });
    return resp
  })()
  return res
}
```



### 调用云函数

```js
wx.cloud.callFunction({
      name: 'transfer',
      data: {
        contentFileID: this.data.uploadImg.fileID,
        styleURL: this.data.imglist[this.data.swiperCurrent]
      },
      success: res => {
        that.setData({
          result:
          {
            url:res.result.output_url,
            hasImg: true,
            hadden: false
          } 
        })
        wx.showLoading({
          title: '转换成功',
        })

      },
      fail: err => {
        console.log(err)
        wx.showLoading({
          title: '转换失败，请重试',
        })
      },
      complete: res => {
        wx.hideLoading()
      }
    })
```





# 项目功能

### 前端整体架构

![image-20201016105917898](C:\Users\www12\Desktop\图床\image-20201016105917898.png)

### 风格图片

![style1](C:\Users\www12\Desktop\图床\style1.jpg)

### 内容图片

![哈尔滨工业大学](C:\Users\www12\Desktop\图床\哈尔滨工业大学.jpg)

### 结果

![output](C:\Users\www12\Desktop\图床\output.png)



详情请看演示视频

# 任务分工

​	单人完成

# 思考与感悟

​	1、小程序云开发是一种轻量级的开发，让开发者仅需要关注业务逻辑

​	2、函数依赖导入很方便，不像xml项目配置文件那样冗长



​	