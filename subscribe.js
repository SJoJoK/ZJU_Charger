// const axios = require('axios');
const axios = require('axios').default
const moment = require('moment')

const secret = require('./secret.json')
const config = require('./config.json')

const campusLocations = config.campusLocations
const postWebhookInstances = {}

const webhookForYQ = ["Webhook", "Webhook2", "YQWebhook"]
const webhookForZJG = ["Webhook", "Webhook2", "ZJGWebhook"]

var tmpToken = ''
var hasToken = true

const getResProcess = (campus) => {
    const prefix = "空桩信息:\n"
    const postfix = "请热心同学将教职工专属充电区域发送至csjk@zju.edu.cn"
    return async (res) => {
        const resTime = "(查询时间:" + moment(res.headers.date).utc().add(8, 'h').format("HH:mm:ss") + ")\n"
        if (res.data.code == 5001) {
            hasToken = false
            text = "token已过期，请联系管理员"
        }
        else {
            const areaInfos = await Promise.all(getListProcess(campus)(res.data.data).sort((a, b) => (b.totalFreeNumber - a.totalFreeNumber)).map(async info =>
                info.totalFreeNumber >= 4 ? info :
                    {
                        ...info,
                        freePiles: await getReqChargerInstance(info.id).get().then(res => res.data.data.chargingPileList.filter(chargerInfo => chargerInfo.status == 0).map(chargerInfo => chargerInfo.pileNumber))
                    }
            ))
            oldtext = areaInfos.map((info, index) => (info.areaName + ':' + info.totalFreeNumber + '\n'))
                .toString()
                .replaceAll(',', '')
            text = areaInfos.map(info => info.totalFreeNumber >= 4 ? info.areaName + ': ' + info.totalFreeNumber + '个\n' :
                info.areaName + ': ' + info.freePiles.map((id,idx)=>idx==0?id:'、'+id)+'号\n')
                .toString().replaceAll(',', '')
        }
        postWebhookInstances[campus].forEach((instance) => {
            instance.post('', {
                "msgtype": "text",
                "text": {
                    "content": prefix + resTime + text + postfix
                }
            })
        })
    }
}


const getListProcess = (campus) => {
    return (list = []) => {
        const freeAreas = list.filter((info, index) => info.totalFreeNumber > 0 && config.blocks.indexOf(info.areaName) < 0 && info.chargingProjectName == campus)
            .map((info, index) => ({ areaName: info.areaName, totalFreeNumber: info.totalFreeNumber, id: info.id }))
        return freeAreas
    }
}

const reqCampusInstance = axios.create({
    baseURL: 'https://gateway.hzxwwl.com/api/charging/pile/listCircleChargingArea',
    params: {
        ...campusLocations["浙江大学玉泉校区"],
    },
})

const reqTokenInstance = axios.create({
    baseURL: 'https://gateway.hzxwwl.com/api/auth/wx/mp',
    params: {
        openid: secret.openid,
        unionid: secret.unionid
    }
})

const getReqChargerInstance = (areaId, token = tmpToken) => axios.create({
    baseURL: 'https://gateway.hzxwwl.com/api/charging/pile/listChargingPileDistByArea',
    headers: {
        "REQ-NPD-TOKEN": token
    },
    params: {
        chargingAreaId: areaId
    }
})

const getPostWebhookInstance = (webhook) => axios.create({
    baseURL: config.test ? secret.testWebhook : secret[webhook],
    headers: {
        "Content-Type": "application/json ;charset=utf-8"
    }
})

const reqCampus = (campus, token = tmpToken) => {
    return reqCampusInstance.get('', {
        headers: {
            "REQ-NPD-TOKEN": token
        },
        params: {
            ...campusLocations[campus]
        }
    })
}

const handler = (campus) => {
    const currentTime = moment().utc().add(8, 'h')
    const beginningTime = moment().utc().add(8, 'h').startOf('d').add(6, 'h')
    if (currentTime.isAfter(beginningTime)) {
        reqTokenInstance.get().then(res => {
            tmpToken = res.data.data.token
            reqCampus(campus, tmpToken).then(getResProcess(campus))
        })
    }
}

const getHandler = (campus) => {
    return () => {
        handler(campus)
    }
}


postWebhookInstances.浙江大学玉泉校区 = webhookForYQ.map(webhook => getPostWebhookInstance(webhook))

postWebhookInstances.浙江大学紫金港校区 = webhookForZJG.map(webhook => getPostWebhookInstance(webhook))

// getHandler("浙江大学玉泉校区")()
getHandler("浙江大学紫金港校区")()
// const intervalYQ = setInterval(getHandler("浙江大学玉泉校区"), config.period * 1000)
// const intervalZJG = setInterval(getHandler("浙江大学紫金港校区"), config.period * 1000)