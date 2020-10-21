// 云函数入口文件
const cloud = require('wx-server-sdk')
const deepai = require('deepai')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var FileID = event.FileID
  const fileList = [FileID]
  const result = await cloud.getTempFileURL({
    fileList: fileList,
  })
  var FileURL = result.fileList[0].tempFileURL;

  await deepai.setApiKey('7841ba60-e47f-4d10-86d5-7045e2a729cb');

  var res = (async function () {
    var resp = await deepai.callStandardApi("toonify", {
      image: FileURL,
    });
    return resp;
  })()
  return res
}