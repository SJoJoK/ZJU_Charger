// const axios = require('axios');
const axios = require('axios').default
const moment = require('moment')
const secret = require('./secret.json')
const config = require('./config.json')
const campusLocations = config.campusLocations
var token = true
const processRes = (res) => {
    const prefix = "请热心同学将教职工专属充电区域发送至csjk@zju.edu.cn\n空桩信息(" + moment().utc().add(8, 'h').format("HH:mm") + "):\n"
    if (res.data.code == 5001) {
        token = false
        text = "token已过期，请联系管理员"
        postWebhookInstance.post('', {
            "msgtype": "text",
            "text": {
                "content": prefix + text
            },
            "at": {
                "atMobiles": [
                    secret.admin
                ]
            },
        })
        postWebhookInstance2.post('', {
            "msgtype": "text",
            "text": {
                "content": prefix + text
            },
            "at": {
                "atMobiles": [
                    secret.admin
                ]
            },
        })
    }
    else {
        text = processList(res.data.data)
            .sort((a, b) => (b.totalFreeNumber - a.totalFreeNumber))
            .map((info, index) => (info.areaName + ':' + info.totalFreeNumber + '\n')).toString().replaceAll(',', '')
        postWebhookInstance.post('', {
            "msgtype": "text",
            "text": {
                "content": prefix + text
            }
        })
        postWebhookInstance2.post('', {
            "msgtype": "text",
            "text": {
                "content": prefix + text
            }
        })

    }


}
const processList = (list = []) => {
    const freeAreas = list.filter((info, index) => info.totalFreeNumber > 0 && config.blocks.indexOf(info.areaName) < 0)
        .map((info, index) => ({ areaName: info.areaName, totalFreeNumber: info.totalFreeNumber }))
    return freeAreas
}
const reqChargerInstance = axios.create({
    baseURL: 'https://gateway.hzxwwl.com/api/charging/pile/listCircleChargingArea',
    headers: {
        "REQ-NPD-TOKEN": secret.token
    },
    params: {
        ...campusLocations["浙江大学玉泉校区"],
    },
})
const postWebhookInstance = axios.create({
    baseURL: config.test ? secret.testWebhook : secret.Webhook,
    headers: {
        "Content-Type": "application/json ;charset=utf-8"
    }
})

const postWebhookInstance2 = axios.create({
    baseURL: config.test ? secret.testWebhook : secret.Webhook2,
    headers: {
        "Content-Type": "application/json ;charset=utf-8"
    }
})

const reqCampus = (campus) => {
    return reqChargerInstance.get('', {
        params: {
            ...campusLocations[campus]
        }

    })
}
const handler = (campus) => {
    reqCampus(campus).then(processRes)
}
const getHandler = (campus) => {
    let currentTime = moment().utc();
    let beginningTime = moment().utc().startOf('d').subtract(2, 'h')
    let endTime = moment().utc().startOf('d').add(16, 'h')
    if (currentTime.isBefore(endTime) && currentTime.isAfter(beginningTime) && token) {
        return () => {
            handler(campus)
        }
    }
    return () => { }

}
getHandler("浙江大学玉泉校区")()
getHandler("浙江大学紫金港校区")()
const intervalYQ = setInterval(getHandler("浙江大学玉泉校区"), config.period * 1000)
const intervalZJG = setInterval(getHandler("浙江大学紫金港校区"), config.period * 1000)