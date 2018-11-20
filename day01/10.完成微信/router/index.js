/**
 * Created by Administrator on 2018/11/20.
 */
const express = require('express');
const sha1 = require('sha1');
const {url, appID} = require('../config');
const Wechat = require('../wechat/wechat');
const Trailers = require('../models/trailers');
const Danmus = require('../models/danmus');

const wechat = new Wechat();

const router = new express.Router();

router.get('/search', async (req, res) => {

    //得到临时票据
    const {ticket} = await wechat.fetchTicket();
    //随机字符串
    const noncestr = Math.random().toString().split('.')[1];
    //时间戳
    const timestamp = parseInt(Date.now() / 1000);

    //将四个参数按照 key = value 方式组合一个数组
    const arr = [
        `noncestr=${noncestr}`,
        `jsapi_ticket=${ticket}`,
        `timestamp=${timestamp}`,
        `url=${url}/search`
    ];

    //排序，以&拼接成一个字符串, 再进行sha1加密，得到的就是加密签名
    const signature = sha1(arr.sort().join('&'));

    res.render('search', {
        signature,
        timestamp,
        noncestr,
        appID
    });
});

router.get('/movie', async (req, res) => {
    //去数据库中找到所有数据
    const movies = await Trailers.find({}, {_id: 0, __v: 0, image: 0, src: 0, cover: 0})

    res.render('movie', {movies});
});


router.post('/v3', async (req, res) => {
    //接受用户发送的弹幕信息
    const result = await new Promise((resolve, reject) => {
        let result = '';
        req
            .on('data', data => {
                result += data.toString();
            })
            .on('end', () => {
                resolve(JSON.parse(result));
            })
    });
    //保存在数据库中
    await Danmus.create({
        doubanId: result.id,
        author: result.author,
        time: result.time,
        text: result.text,
        color: result.color,
        type: result.type
    });
    //返回响应
    res.json({code: 0, data: {}});

});

router.get('/v3', async (req, res) => {
    //接受用户发送的id
    const {id} = req.query;
    //去数据库中找对应的弹幕数据
    const danmus = await Danmus.find({doubanId: id});
    //遍历原数组，生成新数组
    const data = danmus.map(item => [item.time, item.type, item.color, item.author, item.text]);
    //返回响应
    res.json({code: 0, data});
});

module.exports = router;