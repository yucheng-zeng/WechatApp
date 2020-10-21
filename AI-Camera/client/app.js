// app.js
App({
  onLaunch: function() {
    wx.cloud.init({
      traceUser: true,
      envId: "learn-snoop"
    });
  },
  globalData: {
    userInfo: null,
    temUrl:'',
    fileID:'',
    rect: null,
    filterTemUrl:''
  }
});
