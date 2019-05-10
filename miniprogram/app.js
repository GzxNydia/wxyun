//app.js
let utils = require("./utils/util");
App({
  onLaunch(){
    wx.cloud.init();
    wx.cloud.callFunction({
      name:"getData",
      success(res){
        console.log(res);
      },
      complete(res){
        console.log(res);
      }
    })


    wx.cloud.downloadFile({
      fileID: 'cloud://env-test-6f9a9f.656e-env-test-6f9a9f/色彩3.jpg',
      success: (res) => {
        // get temp file path
        console.log(111,res)  
      },
      fail: err => {
        // handle error
      }
    })
  },
  globalData: {
    userInfo: null,
    token:null,
  }
})