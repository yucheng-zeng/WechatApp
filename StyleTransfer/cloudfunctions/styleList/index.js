// 云函数入口文件
const cloud = require('wx-server-sdk')
const COS = require('cos-nodejs-sdk-v5');
const Promise = require('promise');

// 创建实例
const cos = new COS({
  SecretId: 'AKIDbvxiHX0AbnnVv7p8G6biX7QjaNUenHfv',
  SecretKey: 'INFyINF6kGE1Vk2Lq5B2b3EJRKzKOzHS',
});
// 云函数入口函数
const getUrl = function (key) {
  var url = cos.getObjectUrl({
    Bucket: 'yuchengzeng-1303825104',
    Region: 'ap-nanjing',
    Key: key,
    Sign: 'false'
  });
  return url
}

cloud.init()

exports.main = async (event, context) => {
    var promise = new Promise((resolve, reject) => 
    {
      cos.getBucket({
        Bucket: 'yuchengzeng-1303825104',
        Region: 'ap-nanjing',
        Prefix: 'style/s',
        Delimiter: '/',
        Sign: 'false',
      },
      function (err, data) 
      { 
        var urlList = []
        var objects = data.Contents
        for (var index in objects) {
          urlList.push(getUrl(objects[index].Key))
        }
        resolve({info:'success', data: urlList})    
      }
    );
    });
    return promise
}

