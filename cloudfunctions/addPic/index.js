// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init();
let db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  let { picID, labelStr, userInfo,nickName} = event;
  //event.userIno = {openId:xxxx,appId:xxx}

  /**
   * let result = await promise对象   resolve(gift)/reject
   * cosole.log("bggshenjiao")
   * ***/

  try {
    return await db.collection("picList").add({
      data: {
        "openId": userInfo.openId,
        "picID": picID,
        "labelStr": labelStr,
        "thumb":0,
        "nickName": nickName,
        "isLove":0,
        "addTime":db.serverDate()
      } 
    })
  }catch(e){
    return  "cuowu";
  }
 
}