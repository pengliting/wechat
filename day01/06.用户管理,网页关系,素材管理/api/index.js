/**
 * Created by Administrator on 2018/11/19.
 */
/*
 https://api.weixin.qq.com/cgi-bin/tags/get?access_token=ACCESS_TOKEN

* */

/**
 * 所有接口定义的模块
 * */

//公共地址前缀
const prefix = ' https://api.weixin.qq.com/cgi-bin/';

moduls.exports = {
    accessToken : '${prefix}token?grant_type=client_credential&',
    menu: {
        create: `${prefix}menu/create?`,
        delete: `${prefix}menu/delete?`
    },
    tag: {
        create: `${prefix}tags/create?`,
        getUsers: `${prefix}user/tag/get?`,
        batch: `${prefix}tags/members/batchtagging?`
    }
};
