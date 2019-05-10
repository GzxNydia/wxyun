let config = require("../../utils/config");
let utils = require("../../utils/util");
Page({
  /**
   * 页面的初始数据
   */
    data: {
      baseImgUrl:config.baseImgUrl,
      getType:1,
      page:0,
      listArr:[],
      curType:1,
      canRefresh:true,//是否要刷新列表
    },
    // 点赞
    onthumAction(e){
		let that = this;
		console.log(e.currentTarget.dataset.id);
    let picItemID = e.currentTarget.dataset.id;
    let curIdx = e.currentTarget.dataset.idx;
		wx.showLoading({
			mask:true
		});
    wx.cloud.callFunction({
      name:"thumbUp",
      data:{
        "picItemID": picItemID
      },
      success(res){
        wx.hideLoading();
        console.log("点赞返回",res)
        if(res.result.res==0){
          wx.showToast({
            title: '点赞失败',
            icon:"none"
          })
          return ;
        }
        let isLove = res.result.data.isLove;
        let thumb = that.data.listArr[curIdx].thumb;
        that.setData({
          ['listArr[' + curIdx +'].isLove']:isLove,
          ['listArr[' + curIdx + '].thumb']: thumb + (isLove?1:-1),          
        })
      },
      fail(res){
        console.log(res);
      }
    })

	},
	//获取数据
	getData(){
		let that = this;
		let page = this.data.page + 1;
		let get_type = this.data.getType;
		wx.showLoading({
			title:"loading...",
			mask:true,
		})
    // 获取数据
    wx.cloud.callFunction({
      name:"getPic",
      data:{
        curType: get_type,
        curLength: that.data.listArr.length
      },
      success(res){
        wx.hideLoading();
        console.log("请求数据",res);
        let curPageList = res.result;
        if (curPageList.length>0){
          let listArr = that.data.listArr.concat(curPageList);
          that.setData({
            listArr
          })
        }else{
          wx.showToast({
            title: "没有更多数据了",
            icon: "none",
            mask: true,
            duration: 800,
          })
        }
      }
    })
	},
	//切换排序方式
	switchType(e){
		let curType = e.currentTarget.dataset.type;
		this.setData({
			curType,
			listArr:[],
			page:0,
			getType:curType
		})
		this.getData();
	},
	// 预览图片
	preImg(e){
		let that =this;
		let curUrl = e.currentTarget.dataset.src;
		let urls = [];
		that.data.listArr.forEach((cur)=>{
      urls.push(cur.picID);
		})
		wx.previewImage({
			current:curUrl,
		  urls: urls, //需要预览的图片链接列表
		  success(){
			that.setData({
				canRefresh:false
			})
		  }
		});
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showTabBar();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
onShow: function () {
	//有些情况的onshow不需要刷新视图,例如预览图片回来
	if(this.data.canRefresh){
		this.setData({
			listArr:[],
			page:0
		})
		this.getData();
	}
	this.setData({
		canRefresh:true
	})
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
    console.log("触底了");
		this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})