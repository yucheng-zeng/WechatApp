//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    hashcode: '',
    logged: false,
    takeSession: false,
    requestResult: '',
    imglist: [],
    swiperCurrent: 0,
    uploadImg: {
      hasImg: false,
      fileID: '',
      cloudPath: '',
      filePath: '',
    },
    result:{
      url:'',
      hadden: true,
      hasImg: false,
    }
  },


  onLoad: function () {
    // 获取用户信息
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              that.setData({
                userInfo: res.userInfo
              })
            },
            fail: res => {
              console.log('加载用户信息失败')
            }
          })
        } else {
          // 未完成
        }
      }
    })
    this.loadSytleList()
  },

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

  // 上传图片
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

  previewImgUploader: function (e) {
    if (this.data.uploadImg.hasImg == false) {
      return
    }
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [this.data.uploadImg.filePath],
    })
  },

  previewImgSwiper: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.imglist,
    })
  },

  previewImgResult: function (e) 
  {
    if(this.data.result.hasImg==false)
    {
      return
    }
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [this.data.result.url],
    })
  },

  testFunction: function () {
    if (this.data.uploadImg.hasImg == false) {
      return
    }
    wx.showLoading({
      title: '转换中',
    })
    let that = this
    wx.cloud.callFunction({
      name: 'transfer',
      data: {
        contentFileID: this.data.uploadImg.fileID,
        styleURL: this.data.imglist[this.data.swiperCurrent]
      },
      success: res => 
      {
        console.log(res.result.output_url)
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
  },

  swiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current //获取当前轮播图片的下标
    })
  },
})