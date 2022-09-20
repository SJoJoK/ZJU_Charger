// const axios = require('axios');
const axios = require('axios').default
const moment = require('moment')
const config = require('./config.json')

const beginningTime = moment('6:00am', 'h:mma')
const endTime = moment('11:59pm', 'h:mma')
const now = moment()

const campusLocations = {
    浙江大学玉泉校区: {
        lng: 120.12164443731308,
        lat: 30.258415072171623
    },
    浙江大学紫金港校区: {
        lng: 120.082144,
        lat: 30.295381
    }
}
const distanceLength = 6
const limit = 30
const campus = "浙江大学玉泉校区"
const areaNames = [
    '信电学院 原行政楼',
    '信电学院原行政楼A',
    '玉泉教三（光电）',
    '教二（电气）',
    '玉泉内单',
    '电机工程楼',
    '商贸（永谦活动中心对面）',
    '玉泉科工楼',
    '清真食堂',
    '尼普顿--玉泉',
    '玉泉热能所（原出版社楼）',
    '玉泉一食堂',
    '玉泉教六',
    '精工机械',
    '教十八',
    '生仪学院A区',
    '生仪学院B区',
    '玉泉-四食堂',
    '玉泉 教七',
    '玉泉硅材料',
    '玉泉 教十',
    '玉泉教八（化学系）',
    '玉泉物业宿舍',
    '员工宿舍A（教7后）',
    '玉泉 高分子A',
    '玉泉 高分子B',
    '铸工楼',
    '液压',
    '玉泉曹光彪A',
    '玉泉曹光彪B',
    '玉泉水电中心',
    '逸夫工商管理楼（数学系）',
    '玉泉水电中心',
    '建发宿舍',
    '信电系',
    '电气学院原电工厂',
    '31舍北',
    '玉泉石虎山',
    '西溪西七教学楼',
    '浙大西溪物业'
]
const processRes = () => {
        let text = ""
        if (res.data.code == 5001) {
            text = "token已过期，请联系管理员"
        }
        else {
            processList(res.data.data, campus)
        }
}
const processList = (list = []) => {
    const freeAreas = list.filter((info, index) => info.totalFreeNumber > 0 && config.blocks.indexOf(info.areaName) < 0)
                            .map((info, index) => ({ areaName: info.areaName, totalFreeNumber:info.totalFreeNumber}))
    console.log(freeAreas)
}
const reqInstance = axios.create({
    baseURL: 'https://gateway.hzxwwl.com/api/charging/pile/listCircleChargingArea',
    headers: {
        "REQ-NPD-TOKEN": config.token
    },
    params: {
        ...campusLocations["浙江大学玉泉校区"],
        distanceLength,
        limit
    },
})
const handler = (campus) => {
    reqInstance.get().then(processRes(campus))
}
reqInstance.get().then(processRes(campus))
// const interval = setInterval(() => { console.log(1) },config.period*1000)