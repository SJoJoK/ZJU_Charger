# ZJU_Charger
这是一个[Node.js](https://nodejs.org/en/)脚本，请先安装它

该项目使用[Yarn](https://yarnpkg.com/)进行包管理，请安装它，如果你的Node.js版本大于或等于16.10，则可以通过

`corepack enable`

使用Node.js内置的Yarn

## 下载项目

`git clone https://github.com/SJoJoK/ZJU_Charger.git`

`cd ZJU_Charger`


## 创建私密文件secret.json，例：

```json
{
    "token": "访问充电桩API的token",
    "Webhook": "不同群机器人的Webhook,下同",
    "Webhook2": "不同群机器人的Webhook,下同",
    "testWebhook":"不同群机器人的Webhook,下同",
    "YQWebhook":"不同群机器人的Webhook,下同",
    "ZJGWebhook":"不同群机器人的Webhook,下同",
    "admin":"群管理员手机号",
    "openid":"微信openid",
    "unionid":"微信unionid"
}
```

openid、unionid永久有效，token可自动获取，token测试有效时长为24h

## 修改配置文件config.json，例：

```json
{
    "blocks": [
        "员工宿舍A（教7后）",
        "清真食堂",
        "玉泉物业宿舍",
        "尼普顿--玉泉",
        "被屏蔽的充电区域"
    ],
    "period": "数字类型，机器人发信频率，单位为秒",
    "campusLocations": {
        "浙江大学玉泉校区": {
            "lng": 120.12742,
            "lat": 30.26587,
            "distanceLength": 2,
            "limit": 50
        },
        "浙江大学紫金港校区": {
            "lng": 120.08820,
            "lat": 30.30967,
            "distanceLength": 4,
            "limit": 50
        },
        "自定义校区":{
            "lng": "经度",
            "lat": "维度",
            "distanceLength": "查询半径",
            "limit": "查询数量上限"
        }
    },
    "test":"布尔类型，是否是测试模式"
}
```

## 安装相关依赖包

`yarn`

## 运行脚本

`node subscribe.js`
