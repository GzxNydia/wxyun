let config = require("./config");
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//请求失败的回调
function failFn(msg = "ERROR", dur = 2000) {
  console.log("失败的回调",msg);
  wx.showToast({
    title: msg, //提示的内容,
    image: "/assets/icons/errorIcon.png",
    duration: dur, //延迟时间,
    mask: true, //显示透明蒙层，防止触摸穿透,
    success: res => { }
  });
}

// 验证权限
function checkAuth(scope = "scope.userInfo", callBack = () => { }) {
  wx.getSetting({//这是一个异步操做
    success: res => {
      if (res.authSetting[scope]) {
        console.log("已经获取过" + scope + "权限");
        typeof callBack=="function" && callBack();
				return true;
      } else {
        console.log("未获取过" + scope + "权限");
				return false;
      }
    }
  })
}
//已经获取到授权，不需要点击按钮拿到token，这个函数放到app.js的onLaunch里面
//这里的代码因为要放到app.js的onLaunch里面,所以不能通过getApp获取app
function getInfoDirect(app){
	// if(wx.getStorageSync("token")){//如果token已经存在，就不需要再请求了
	// 	return;
	// }
	if(app.globalData.token){//
		return;
	}
	checkAuth("scope.userInfo",function(){
		//这里是已经授权过时触发
		wx.login({
			success:function(res){
				let code = res.code;
				wx.getUserInfo({
					withCredentials:true,//这里必须先有login登陆状态
					success:function(res){
						let userInfo = res;
						// wx.setStorageSync('userInfo', userInfo);//会导致enctypeData解密失败
						console.log("code和userInfo",code,userInfo);
						//这里执行获取token操作
						getToken(code,userInfo);
					},
					fail: failFn
				})
			},
			fail: failFn
		})
	});
}
//点击登陆按钮时获取权限，这个函数放到button.getuserinfo里面
/**
 * @param {Object} res button的getUserInfo的事件对象
 * @param {Function} callBack 获取token以后的回调
 */
function getInfoButton(res,callBack=()=>{}) {
	let app = getApp();
	let userInfo = res.detail;//{iv,enctypeData,userInfo}
  if (!userInfo.userInfo){//用户拒绝授权
		wx.showModal({
			title:"请授权！",
			content:"拒绝授权将导致部分功能不可用额！",
			showCancel:false,
			confirmText:"确定",
			success:function(){
        
			}
		})
		wx.removeStorageSync("token");//清除可能过期的token,如果把token放app.globalData,这里就没用了
		app.globalData.token = null;
		return;
	}
  // if (wx.getStorageSync("token")) {//如果token已经存在，就不需要再请求了
  //   typeof callBack == "function" && callBack();
  //   return;
	// }
	if (app.globalData.token) {//如果token已经存在，就不需要再请求了
    typeof callBack == "function" && callBack();
    return;
  }
  wx.login({
    success: res => {
      wx.hideLoading();
			let code = res.code;
      console.log("code和userInfo",code,userInfo);
			//这里执行获取token操作
      getToken(code,userInfo,callBack);
    },
    fail: failFn
  });
}
//获取token
/**
 * 
 * @param {*} code 
 * @param {*} userInfo 
 * @param {*} callBack 
 */
function getToken(code,userInfo,callBack=()=>{}){
	wx.request({
		url:config.loginUrl,
    method:"POST",
    data:{
      code,
      userInfo
    },
		success:function(res){
			console.log("自己服务器登陆结果",res);
      if(res.data.res == 1){
        typeof callBack == "function" && callBack();
        // wx.setStorage({
        //   key: 'token',
        //   data: res.data.data
				// });
				let app = getApp();
				app.globalData.token = res.data.data;
      }else{//登陆失败
        wx.showToast({
          title: res.data.msg,
          duration:1500,
          mask:true,
          image: "/assets/icons/errorIcon.png",
        })
      }
		},
		fail:failFn
	})
}
//没有token跳转到登陆
/**
 * @returns Bool
 */
function skipToLogin() {
	// let token = wx.getStorageSync("token");
	let app = getApp();
	let token = app.globalData.token;
  if (!token) {
    wx.showToast({
      title: '请先登陆', //提示的内容,
      duration: 2000, //延迟时间,
      icon: "none",
      mask: true, //显示透明蒙层，防止触摸穿透,
    });
    setTimeout(() => {
      wx.navigateTo({ url: '/pages/index/index' });
    }, 1000);
    return false;
  }
	return token;
}
//封装请求
/**
 * 
 * @param {*} url 
 * @param {*} data 
 * @param {*} success 
 * @param {*} method 
 * @param {*} needToken 
 */
function myReq(url,data,success=()=>{},method="GET",needToken = true){
	let token = null;
	if(needToken){
		token = skipToLogin();//返回toke或者false
		if(!token){
			return;
		}
	}
	wx.request({
		url,
		data:{
			access_token:token,
			...data
		},
		success,
		method,
		fail:failFn
	})
}
function reqCb(res,callBack=()=>{}){
	wx.hideLoading();
	if(res.data.res==1){
		callBack();
	}else{
		wx.showToast({
			title:res.data.msg,
			mask:true,
			image:"/assets/icons/errorIcon.png"
		});
		let app = getApp();
		wx.removeStorageSync("token");//这一句没有用了
		app.globalData.token = null;//防止token过期,
		wx.navigateTo({ url: '/pages/index/index' });
	}
}
// 两指直接距离
function getDis(a,b){
  return Math.sqrt(Math.pow((a.x-b.x),2)+Math.pow((a.y-b.y),2));
}

// 生成不重名的文件名
function getPicName(ext="png"){
  return new Date().getTime()+Math.floor(Math.random()*100000)+"."+ext;
}
module.exports = {
  formatTime,
  formatNumber,
	failFn,
  myReq,//封装的请求
	getInfoDirect,//app.js的lunch里面获取token
	getInfoButton,//button按钮获取token
	reqCb,//请求成功回调
	getDis,
  getPicName
}
