// 云函数入口文件
const cloud = require('wx-server-sdk')
const deepai = require('deepai')
const Promise = require('promise');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var contentFileID = event.contentFileID
  const fileList = [contentFileID]
  const result = await cloud.getTempFileURL({
    fileList: fileList,
  })
  var contentURL = result.fileList[0].tempFileURL;
  var styleURL = event.styleURL
  
  await deepai.setApiKey('7841ba60-e47f-4d10-86d5-7045e2a729cb');
  var res = (async function () {
    var resp = await deepai.callStandardApi("fast-style-transfer", {
      content: contentURL,
      style: styleURL,
    });
    return resp
  })()
  return res
}