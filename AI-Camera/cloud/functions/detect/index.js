// 云函数入口文件
const cloud = require('wx-server-sdk')
const tencentcloud = require("tencentcloud-sdk-nodejs");

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  // 获取图片URL
  var FileID = event.FileID
  const fileList = [FileID]
  const result = await cloud.getTempFileURL({
    fileList: fileList,
  })
  var FileURL = result.fileList[0].tempFileURL;

  // 设置调用参数
  const IaiClient = tencentcloud.iai.v20200303.Client;
  const models = tencentcloud.iai.v20200303.Models;
  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;
  let cred = new Credential("AKIDbvxiHX0AbnnVv7p8G6biX7QjaNUenHfv", "INFyINF6kGE1Vk2Lq5B2b3EJRKzKOzHS");
  let httpProfile = new HttpProfile();
  httpProfile.endpoint = "iai.tencentcloudapi.com";
  let clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;
  let client = new IaiClient(cred, "ap-nanjing", clientProfile);
  let req = new models.DetectFaceAttributesRequest();
  let params = {
    Url: FileURL,
    FaceAttributesType: "Age,Beauty,Emotion,Gender,Smile",
  };
  req.from_json_string(JSON.stringify(params));

  // 调用并返回
  var promise = new Promise((resolve, reject) => {
    client.DetectFaceAttributes(req,
      function (errMsg, response) {
        if (errMsg) {
          console.log('err:',errMsg);
          reject({code: false, data:errMsg})
        } else 
        {
          console.log('success:',response);
          resolve({code: true, data:response})
        }
      });
  });
  return promise
}