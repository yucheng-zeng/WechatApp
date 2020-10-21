/* global getApp, Page */
import {
  uploadImage
} from "../../utils/index";
import regeneratorRuntime from "../../libs/runtime";
let imgUrl =
  "https://10.url.cn/eth/ajNVdqHZLLBn1TC6loURIX2GB5GB36NBNZtycXDXKGARFHnJwhHD8URMvyibLIRBTJrdcONEsVHc/";

Page({
  data: {
    title: "人脸检测与分析",
    fileID: null,
    hasUploaded: false,
    faceRects: [],
    resMap: {
      Gender: {
        label: "性别",
        valMap: 
        {
          0: "男",
          1: "女"
        }
      },
      Age: {
        label: "年龄"
      },
      Expression: {
        label: "微笑",
        valMap: {
          0: "否",
          1: "是"
        }
      },
      Emotion: {
        label: "表情",
        valMap: {
          0: "自然",
          1: "高兴",
          2: "惊讶",
          3: "生气",
          4: "悲伤",
          5: "厌恶",
          6: "害怕"
        }
      },
      Glass: {
        label: "是否有眼镜"
      },
      Beauty: {
        label: "魅力"
      },
      Hat: {
        label: "是否有帽子"
      },
      Mask: {
        label: "是否有口罩"
      },
      Score: {
        label: "质量分"
      },
      Sharpness: {
        label: "清晰分"
      },
      Brightness: {
        label: "光照分"
      }
    },
    resultToonify: {
      hasImg: false,
      hadden: true,
      url:"",
    },
  },

  async handleUploadTap() {
    await this.uploadImage();
  },

  async handleRecognizeTap() {
    await this.callFunction();
  },

  async handleFilterTap() {
    var app = getApp();
    app.globalData.fileID = this.data.fileID;
    app.globalData.temUrl = this.data.temUrl;
    app.globalData.rect = this.data.faceRects[0];

    wx.navigateTo({
      url: "/pages/filter/index"
    });
  },
  async uploadImage() {
    // 重新上传，清空结果
    this.setData({
      imgUrl,
      faceRects: []
    });
    wx.chooseImage({
      success: dRes => {
        let temUrl = dRes.tempFilePaths[0];
        this.setData({
          temUrl
        });

        wx.showLoading({
          title: "上传中"
        });

        uploadImage(temUrl).then(
          res => {
            this.setData({
                fileID: res.fileID,
                hasUploaded: true
              },
              () => {
                wx.hideLoading();
              }
            );
          },
          e => {
            wx.hideLoading();
            wx.showToast({
              title: "上传失败",
              icon: "none"
            });
          }
        );
      }
    });
  },

  async callFunction() {
    wx.showLoading({
      title: "识别中",
      icon: "none"
    });
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
  },

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
  handleFinish(e) {
    console.log('i am here')
    if (!e.detail) {
      return;
    }
    console.log(e.detail);
  },

  handleToonify: function()
  {
    let that = this
    wx.showLoading({
      title: '转换中',
    })
    wx.cloud.callFunction({
      name: "toonify",
      data: {
        FileID: this.data.fileID
      },
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
  },
  previewImgToonify: function (e) 
  {
    if(this.data.resultToonify.hasImg==false)
    {
      return
    }
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [this.data.resultToonify.url],
    })
  },
});