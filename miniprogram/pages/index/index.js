//获取应用实例
const app = getApp()
let utils = require("../../utils/util");
Page({
  data: {
  
  },
  //当获取用户信息
  onGetInfo(e){
    console.log(e);
    if(e.detail.userInfo){
      app.globalData.userInfo = e.detail.userInfo;
      wx.switchTab({
        url: '/pages/ad/ad',
      })
    }
    
  },
  onLoad: function () {
		
  },
  onShareAppMessage(){
    
  }
})
