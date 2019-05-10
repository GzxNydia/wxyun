// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
// 云函数入口函数,async一定会返回一个promse
exports.main = async (event, context) => {
  //云函数间调用时不会注入userInfo
  //let {userInfo} = event;
  let openId = event.openId;
  // return openId;
  return await db.collection("thumbList").field({ picItemID:true}).where({
    "openId": openId
  }).get();
}