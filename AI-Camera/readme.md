# 开发设计思路

一、补全项目功能

​		通过阅读项目developer文件，源码，腾讯云SDK和微信开发者文档，将项目所缺代码补全，并且重写云函数

二、新增功能

​		在原本项目基础上新增人物头像开通化的功能



# 改造新增功能

## 一、改造项目

​	1、补全代码

​			阅读项目developer文件，并且补全detect页面，filter页面和util中所缺失的代码

​	2、依赖函数以及导入

```
npm i promise
npm i wx-server-sdk
npm install tencentcloud-sdk-nodejs --save
```

​	3、重写云函数

```js
  const cloud = require('wx-server-sdk')
  const tencentcloud = require("tencentcloud-sdk-nodejs");
  // 获取图片URL
  var FileID = event.FileID
  const fileList = [FileID]
  const result = await cloud.getTempFileURL({
    fileList: fileList,
  })
  var FileURL = result.fileList[0].tempFileURL;

  // 设置调用参数
  const IaiClient = tencentcloud.iai.v20200303.Client;
  const models = tencentcloud.iai.v20200303.Models;
  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;
  let cred = new Credential("****", "****");
  let httpProfile = new HttpProfile();
  httpProfile.endpoint = "iai.tencentcloudapi.com";
  let clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;
  let client = new IaiClient(cred, "ap-nanjing", clientProfile);
  let req = new models.DetectFaceAttributesRequest();
  let params = {
    Url: FileURL,
    FaceAttributesType: "Age,Beauty,Emotion,Gender,Smile",
  };
  req.from_json_string(JSON.stringify(params));

  // 调用并返回
  var promise = new Promise((resolve, reject) => {
    client.DetectFaceAttributes(req,
      function (errMsg, response) {
        if (errMsg) {
          console.log('err:',errMsg);
          reject({code: false, data:errMsg})
        } else 
        {
          console.log('success:',response);
          resolve({code: true, data:response})
        }
      });
  });
  return promise
```

​	4、人脸识别云函数调用

``` js
	try 
    {
      let {
        result
      } = await wx.cloud.callFunction({
        name: "detect",
        data: {
          FileID: this.data.fileID
        }
      });
      wx.hideLoading();
      if (result.code) {
        this.setData({
            faceRects: this.getFaceRects(result.data)
          },
          () => {
            this.triggerEvent("finish", result.data.FaceDetailInfos[0]);
          }
        );
      } else {
        throw result;
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({
        title: "识别失败",
        icon: "none"
      });
      console.log(e);
    }
```

​	5、数据解析

```js
  // 计算人脸位置
  getFaceRects(res) {
    var ImageWidth = res.ImageWidth
    var ImageHeight = res.ImageHeight
    var FaceInfos = res.FaceDetailInfos
    let item = FaceInfos[0];
    return [{
      imageWidth: ImageWidth,
      imageHeight: ImageHeight,
      rectX: item.FaceRect.X / ImageWidth,
      rectY: item.FaceRect.Y / ImageHeight,
      rectWidth: item.FaceRect.Width / ImageWidth,
      rectHeight: item.FaceRect.Height / ImageHeight,
      age: item.FaceDetailAttributesInfo.Age,
      beauty: item.FaceDetailAttributesInfo.Beauty,
      result: this.parseResult(item.FaceDetailAttributesInfo)
    }];
  },

  parseResult(data) 
  {
    var item = this.data.resMap
    var result = ""
    result += "年龄："+data.Age+"，"
    result += "性别："+item.Gender.valMap[data.Gender.Type]+"，"
    result += "颜值："+data.Beauty+"，"
    result += "表情："+item.Emotion.valMap[data.Emotion.Type]+"，"
    result += "笑容："+data.Smile+"分"
    return result
  },
```



## 二、新增功能

​	1、功能概述

​			识别人物头像，将其头像卡通化，并输出图片

​	2、依赖函数以及导入

```
npm install --save deepai
npm i promise
npm i wx-server-sdk
```

​	3、云函数

```js
  const cloud = require('wx-server-sdk')
  const deepai = require('deepai')
  // 通过文件ID获取待处理的文件URL
  var FileID = event.FileID
  const fileList = [FileID]
  const result = await cloud.getTempFileURL({
    fileList: fileList,
  })
  var FileURL = result.fileList[0].tempFileURL;
  // 调用并且返回
  await deepai.setApiKey('7841ba60-e47f-4d10-86d5-7045e2a729cb');
  var res = (async function () {
    var resp = await deepai.callStandardApi("toonify", {
      image: FileURL,
    });
    return resp;
  })()
  return res
```



​	4、云函数调用

```js
	let that = this
    wx.cloud.callFunction({
      name: "toonify",
      data: {
        FileID: this.data.fileID
      },
      // 数据处理
      success: res => 
      {
        console.log(res)
        that.setData({
          resultToonify:
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
    });
```

## 三、效果展示



<img src="D:\搜狗高速下载\1602765448009.gif" alt="1602765448009" style="zoom: 25%;" />





​			

​			

​			

​		

# 任务分工

​	单人完成

# 思考与感悟

​	1、小程序云开发是一种轻量级的开发，让开发者仅需要关注业务逻辑

​	2、函数依赖导入很方便，不像xml项目配置文件那样冗长

​	