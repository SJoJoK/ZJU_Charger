// const axios = require('axios');
const axios = require('axios').default
const moment = require('moment')
const secret = require('./secret.json')
const config = require('./config.json')
const campusLocations = config.campusLocations

const processRes = (res) => {
    let text = ""
    if (res.data.code == 5001) {
        text = "token已过期，请联系管理员"
    }
    else {
        text = processList(res.data.data)
            .sort((a, b) => (b.totalFreeNumber - a.totalFreeNumber))
            .map((info, index) => (info.areaName + ':' + info.totalFreeNumber + '\n')).toString().replaceAll(',', '')
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
    baseURL: secret.Webhook,
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
    return () => {
        handler(campus)
    }
}
getHandler("浙江大学玉泉校区")()
getHandler("浙江大学紫金港校区")()