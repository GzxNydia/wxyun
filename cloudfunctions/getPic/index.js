// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  let { curType, curLength, userInfo} = event;
  let sortStr = curType == 1 ?"addTime":"thumb";
  try{
    // let thumbList = await cloud.callFunction({name:"getThumbList",data:{}});
    // let picList = await db.collection("picList").orderBy(sortStr, "desc").skip(curLength).limit(3).get();
    // thumbList = thumbList.result.data;
    // picList = picList.data;
    //不用上面代码,而是使用promise.all提高响应速度
    let pro1 = cloud.callFunction({ name: "getThumbList", data: { openId: userInfo.openId} });;
    let pro2 = db.collection("picList").orderBy(sortStr, "desc").skip(curLength).limit(5).get();
    let allRes = await Promise.all([pro1, pro2]);
    // return allRes;
    let thumbList = allRes[0].result.data;
    let picList = allRes[1].data;
    //找到两个表里的_id与picItemID是否有值相同,相同说明当前用户已经点赞了
    for (let i = 0; i < picList.length;i++){
      for (let j = 0; j < thumbList.length;j++){
        if (picList[i]._id == thumbList[j].picItemID){
          picList[i].isLove = 1;
          break;
        }
      }
    }
    return picList;
  }catch(e){
    console.log(e);
    return "查询数据库错误";
  }
}