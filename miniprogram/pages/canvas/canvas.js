let utils = require("../../utils/util.js");
let config = require("../../utils/config");
let app = getApp();
Page({
  hasPic:false,
  oriScale:1,//原始缩放比例
  curScale:1,//当前缩放比例
  oriPos:{},//原始位置
  canOriPos:{x:0,y:0},//canvas原始位置
  canCurPos:{x:0,y:0},//canvas当前位置
  startDraw:false,//手指触摸屏幕
  rate:0,
  /**
   * 页面的初始数据
   */
  data: {
		labelsArr:[
			{label:"宝丽来",isSel:false},
			{label:"胶 卷",isSel:false},
			{label:"黑 白",isSel:false},
			{label:"Glitch",isSel:false},
			{label:"Blingbling",isSel:false}
		],
		showIpt:false,//是否显示输入框
  },
	//选择标签
	checkboxChange(e){
		let that = this;
		let checkedVal = e.detail.value;
		console.log("选中值",checkedVal);
		that.data.labelsArr.forEach((cur,index)=>{
			that.setData({
				["labelsArr["+index+"].isSel"]:checkedVal.indexOf(index.toString())!=-1
			})
		})
	},
	//添加更多标签
	addMore(){
		this.setData({
			showIpt:true
		})
	},
	//确定输入
	onIptConfirm(e){
		let addCon = e.detail.value;
		if(addCon){
			let labelsArr = this.data.labelsArr;
			labelsArr.push({label:addCon,isSel:true});
			this.setData({
				labelsArr,
				showIpt:false
			})
		}
	},
  //开始触摸屏幕
  onTouchStart(e){
    let that = this;
    if(!that.hasPic){return};
    that.startDraw = true;
    if(e.touches.length>=2){
      that.oriDis = utils.getDis(e.touches[0],e.touches[1]);
    }
    if(e.touches.length==1){
      that.oriPos = e.touches[0];
    }
  },
  //手指移动时
  onTouchMove(e){
    let that = this;
    if (!that.hasPic || !that.startDraw){return}
    if (e.touches.length >= 2){
      let curDis = utils.getDis(e.touches[0], e.touches[1]);
      let moveDis = curDis - that.oriDis;
      that.curScale = that.oriScale + moveDis / 250;
      that.curScale = that.curScale <= 0.1 ? 0.1 : that.curScale;
      console.log("当前缩放比例", that.curScale);
    }
    if (e.touches.length == 1){
      if(that.rate++%2==0){
        return;
      }
      let curPos = e.touches[0];
      that.canCurPos.x = that.canOriPos.x +(curPos.x - that.oriPos.x);
      that.canCurPos.y = that.canOriPos.y +(curPos.y - that.oriPos.y);
    }
    that.drawImg();
  },
  //触摸结束
  onTouchEnd(e){
    let that = this;
    that.startDraw = false;
    if (!that.hasPic){
      return ;
    }
    that.oriScale = that.curScale;
    let x = that.canCurPos.x;
    let y = that.canCurPos.y;
    that.canOriPos = {x,y};
  },
  //绘制图片封装
  drawImg(){
    let that = this;
    console.log("上一次位置",that.canOriPos);
    console.log("当前位置",that.canCurPos);
    console.log("图片最终宽高",that.finImgW,that.finImgH);
    that.ctx.clearRect(0, 0, that.canW, that.canH);
    that.ctx.translate(that.canW / 2 , that.canH / 2 );
    //双指移动控制缩放
    that.ctx.scale(that.curScale, that.curScale);
    //绘制图片
    that.ctx.drawImage(that.imgUrl, 0 - that.finImgW / 2 + that.canCurPos.x, 0 - that.finImgH / 2 + that.canCurPos.y, that.finImgW, that.finImgH);
    that.ctx.draw();
  },
  //选择图片
  choosePic(){
    let that = this;
    //初始化条件
    that.oriScale = that.curScale = 1;
    that.canOriPos = {x:0,y:0};
    that.canCurPos = { x: 0, y: 0 };
    wx.chooseImage({
      count:1,
      // sizeType: "original",
      success: function(res) {
        console.log(res);
        let imgUrl = res.tempFilePaths[0];
        wx.getImageInfo({
          src: imgUrl,
          success(e){
            console.log("图片信息",e);
            that.hasPic = true;//有图片了，可以触发触摸事件了
            let picW = e.width;
            let picH = e.height;
            that.picW = picW;
            that.picH = picH;
            let canW = that.canW;
            let canH = that.canH;
            let finImgW = picW,
            finImgH = picH;//默认图片缩放后宽高，放在canvas里面图片宽高
            let ratio = 1;//默认图片缩放比例
            let picR = picW/picH;//图片宽高比
            let canR = canW/canH;//canvas宽高比
            if (picR > canR && picW > canW){//图片宽高比更大
              //图片宽度大于canvas宽度
              //让图片宽100%显示计算缩放比例
              ratio = picW / canW;
              //图片在处理后的宽高
              finImgW = picW/ratio;
              finImgH = picH / ratio;
            }
            if (picR < canR && picH > canH){
              //让图片高100%显示
              ratio = picH / canH;
              finImgW = picW/ratio;
              finImgH = picH/ratio;
            }
            //开始绘制图片
            that.finImgW = finImgW;
            that.finImgH = finImgH;
            that.ratio = ratio;
            that.imgUrl = imgUrl;
            that.drawImg();
          }
        })
      },
    })
  },
  //还原
  backOri(){
    let that = this;
    that.oriScale = that.curScale = 1;
    that.canOriPos = that.canCurPos = {x:0,y:0};
    that.drawImg();
  },
  //生成图片
  proImg(){
		wx.showLoading({
			title:"Loading...",
			mask:true
		})
    let that = this;
    wx.canvasToTempFilePath({
      canvasId:"myCan",
      fileType:"png",
      quality:1,
      destWidth: that.canW*2,
      destHeight: that.canH*2,
      success(res){
        console.log("canvas生成图片",res.tempFilePath);
				let label_str = "";
				that.data.labelsArr.forEach(cur=>{
					if(cur.isSel){
						label_str+= (cur.label+"++");
					}
				})
        
        //上传图片
        wx.cloud.uploadFile({
          cloudPath: utils.getPicName(), //上传头像地址
          filePath: res.tempFilePath,
          success: function (res) {
            console.log("图片上传",res);
            let curPicID = res.fileID;
            console.log(curPicID, label_str)
            wx.cloud.callFunction({
              name:"addPic",
              data:{
                picID: curPicID,
                labelStr: label_str,
                nickName:app.globalData.userInfo.nickName
              },
              success(res){
                console.log("后台上传数据库",res);
                if(res.result._id){
                  wx.showToast({
                    title: "上传成功",
                    duration: 1500,
                    mask: true
                  });
                  setTimeout(()=>{
                    wx.switchTab({
                      url: '/pages/picWall/picWall',
                    })
                  },800)
                }else{
                  wx.showToast({
                    title: "上传失败",
                    icon:"none",
                    duration: 1500,
                    mask: true
                  });
                  console.error(res);
                }
              },
              fail(res){
                console.log("后台上传数据库失败",res);
              }
            })
          },
          fail(res) {
            utils.failFn();
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ctx = wx.createCanvasContext('myCan');
    // this.choosePic();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    var query = wx.createSelectorQuery();
    query.select('#myCan').boundingClientRect();
    query.exec(function (res) {
      console.log("canvas大小",res);
      that.canW = res[0].width;
      that.canH = res[0].height;
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})