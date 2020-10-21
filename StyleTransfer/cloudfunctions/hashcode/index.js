// 云函数入口文件
const cloud = require('wx-server-sdk')
const md5 = require('md5');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => 
{
  var userInfo = event.userInfo
  var longstring = ''
  longstring += userInfo.nickName
  longstring += userInfo.gender
  longstring += userInfo.language
  longstring += userInfo.city
  longstring += userInfo.province
  longstring += userInfo.country
  longstring += userInfo.avatarUrl
  var hash = md5(longstring);
  console.log(hash)
  return {hashcode: hash}
}