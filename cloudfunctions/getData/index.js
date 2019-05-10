// 云函数入口文件
const cloud = require('wx-server-sdk');
const request = require("request");
cloud.init()

const pro =  new Promise(function(resolve){
    request({
      method: "GET",
      uri: 'https://bluej.ke.qq.com/cgi-bin/agency_new/get_courses?count=30&page=0&category=-1&aid=40088&preview=0&bkn=1921953727&r=0.2956324607498695',
      headers: {
        "referer": "https://bluej.ke.qq.com/?tuin=384c7c68",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
      }
    },
    function (err, res) {
      console.log(res.request.req.res.body);
      resolve(res.request.req.res.body)
    })

})



// 云函数入口函数
exports.main = async (event, context) => {
 return  await pro;
}