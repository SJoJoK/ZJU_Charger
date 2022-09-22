// const axios = require('axios');
const axios = require('axios').default
const moment = require('moment')
const secret = require('./secret.json')
const config = require('./config.json')
const campusLocations = config.campusLocations
const postWebhookInstances = {}

var token = true
const getResProcess = (campus) => {
    return (res) => {
        const prefix = "请热心同学将教职工专属充电区域发送至csjk@zju.edu.cn\n空桩信息(" + moment().utc().add(8, 'h').format("HH:mm") + "):\n"
        if (res.data.code == 5001) {
            token = false
            text = "token已过期，请联系管理员"
            postWebhookInstances[campus].forEach((instance) => {
                instance.post('', {
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
            })
        }
        else {
            text = getListProcess(campus)(res.data.data)
                .sort((a, b) => (b.totalFreeNumber - a.totalFreeNumber))
                .map((info, index) => (info.areaName + ':' + info.totalFreeNumber + '\n')).toString().replaceAll(',', '')
            postWebhookInstances[campus].forEach((instance) => {
                instance.post('', {
                    "msgtype": "text",
                    "text": {
                        "content": prefix + text
                    }
                })
            })
        }
    }
}


const getListProcess = (campus) => {
    return (list = []) => {
        const freeAreas = list.filter((info, index) => info.totalFreeNumber > 0 && config.blocks.indexOf(info.areaName) < 0 && info.chargingProjectName == campus)
            .map((info, index) => ({ areaName: info.areaName, totalFreeNumber: info.totalFreeNumber }))
        return freeAreas
    }
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

const reqTokenInstance = axios.create({
    baseURL: 'https://gateway.hzxwwl.com/api/auth/wx/mp',
    params: {
        openid: secret.openid,
        unionid:secret.unionid
    }
})

const getPostWebhookInstance = (webhook) => {
    return axios.create({
        baseURL: config.test ? secret.testWebhook : secret[webhook],
        headers: {
            "Content-Type": "application/json ;charset=utf-8"
        }
    })
}

postWebhookInstances.浙江大学玉泉校区 = []
postWebhookInstances.浙江大学玉泉校区.push(getPostWebhookInstance("Webhook"))
postWebhookInstances.浙江大学玉泉校区.push(getPostWebhookInstance("Webhook2"))
postWebhookInstances.浙江大学玉泉校区.push(getPostWebhookInstance("YQWebhook"))

postWebhookInstances.浙江大学紫金港校区 = []
postWebhookInstances.浙江大学紫金港校区.push(getPostWebhookInstance("Webhook"))
postWebhookInstances.浙江大学紫金港校区.push(getPostWebhookInstance("Webhook2"))
postWebhookInstances.浙江大学紫金港校区.push(getPostWebhookInstance("ZJGWebhook"))

const reqCampus = (campus) => {
    return reqChargerInstance.get('', {
        params: {
            ...campusLocations[campus]
        }
    })
}

const handler = (campus) => {
    const currentTime = moment().utc().add(8,'h')
    const beginningTime = moment().utc().add(8, 'h').startOf('d').add(6, 'h')
    if (currentTime.isAfter(beginningTime) && token) {
        reqCampus(campus).then(getResProcess(campus))
    }
}

const getHandler = (campus) => {

    return () => {
        handler(campus)
    }

}
getHandler("浙江大学玉泉校区")()
getHandler("浙江大学紫金港校区")()
const intervalYQ = setInterval(getHandler("浙江大学玉泉校区"), config.period * 1000)
const intervalZJG = setInterval(getHandler("浙江大学紫金港校区"), config.period * 1000)