// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let { picItemID, userInfo } = event;
    let count = await db.collection("thumbList").where({
      "picItemID": picItemID,
      "openId": userInfo.openId
    }).count();
    //这里没有直接采用remove是因为返回值stats总是空
    // removeRes.stats.removed==1 //为1删除成功,说明已经点赞了,这里要将点赞删了
    // return count;
    //let isLoved = removeRes.stats.removed == 1?true:false;
    let isLoved = count.total > 0 ? true : false;
    if (!isLoved) {//之前没有点赞,就点赞,添加到点赞列表
      await db.collection("thumbList").add({
        data: {
          "picItemID": picItemID,
          "openId": userInfo.openId
        }
      })
    } else {//之前点赞的,就删除点赞列表记录
      await db.collection("thumbList").where({
        "picItemID": picItemID,
        "openId": userInfo.openId
      }).remove();
    }
    // 修改picList中点赞的总数量
    await db.collection("picList").where({
      "_id": picItemID
    }).update({
      data: {
        thumb: _.inc(isLoved ? -1 : 1)
      }
    })
    return {res:1,msg:"点赞/取消点赞成功",data:{isLove:isLoved?0:1}}
  } catch (e) {
    return { res: 0, msg: "点赞/取消点赞失败"};
  }

}