/**
 * Created by Administrator on 2018/11/17.
 */
const rp = require('request-promise-native');
const {writeFile, readFile} = require('fs');
const {appID, appsecret} = require('../config');


class Wechat {
    /**
     * 获取access_token
     * @return {Promise<result>}
     */
    async getAccessToken () {
        //定义请求地址
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
        //发送请求
        const result = await rp({method: 'GET', url, json: true});
        //设置access_token的过期时间, 提前5分钟刷新
        result.expires_in = Date.now() + 7200000 - 300000;
        //返回result
        return result;
    }

    /**
     * 保存access_token
     * @param filePath  要保存的文件路径
     * @param accessToken  要保存的凭据
     * @return {Promise<any>}
     */
    saveAccessToken (filePath, accessToken) {
        return new Promise((resolve, reject) => {
            //js对象没办法存储，会默认调用toString() --->  [object Object]
            //将js对象转化为json字符串
            writeFile(filePath, JSON.stringify(accessToken), err => {
                if (!err) {
                    resolve();
                } else {
                    reject('saveAccessToken方法出了问题：' + err);
                }
            })
        })
    }

    /**
     * 读取access_token
     * @param filePath 文件路径
     * @return {Promise<any>}
     */
    readAccessToken (filePath) {
        return new Promise((resolve, reject) => {
            readFile(filePath, (err, data) => {
                //读取的data数据  二进制数据，buffer
                if (!err) {
                    //先调用toString转化为json字符串
                    //在调用JSON.parse将json字符串解析为js对象
                    resolve(JSON.parse(data.toString()));
                } else {
                    reject('readAccessToken方法出了问题:' + err);
                }
            })
        })
    }

    /**
     * 判断access_token是否过期
     * @param accessToken
     * @return {boolean}
     */
    isValidAccessToken ({expires_in}) {
        /*if (Date.now() >= expires_in) {
         //说明过期了
         return false
         } else {
         //说明没有过期
         return true
         }*/
        return Date.now() < expires_in;
    }

    /**
     * 返回有效access_token的方法
     * @return {Promise<accessToken>}
     */
    fetchAccessToken () {
        if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
            console.log('进来了~');
            //说明access_token是有效的
            return Promise.resolve({access_token: this.access_token, expires_in: this.expires_in});
        }

        //最终目的返回有效access_token
        return this.readAccessToken('./accessToken.txt')
            .then(async res => {
                if (this.isValidAccessToken(res)) {
                    //没有过期，直接使用
                    //作为then函数返回值， promise对象包着res
                    return res;
                } else {
                    //过期了
                    const accessToken = await this.getAccessToken();
                    await this.saveAccessToken('./accessToken.txt', accessToken);
                    //作为then函数返回值， promise对象包着accessToken
                    return accessToken;
                }
            })
            .catch(async err => {
                const accessToken = await w.getAccessToken();
                await w.saveAccessToken('./accessToken.txt', accessToken);
                return accessToken;
            })
            .then(res => {
                //不管上面成功或者失败都会来到这
                this.access_token = res.access_token;
                this.expires_in = res.expires_in;

                return Promise.resolve(res);
            })

    }

}

(async () => {
    /*
     读取本地保存access_token（readAccessToken）
     - 有
     - 判断是否过期（isValidAccessToken）
     - 过期了, 重新发送请求，获取access_token（getAccessToken），保存下来（覆盖之前的）(saveAccessToken)
     - 没有过期, 直接使用
     - 没有
     - 发送请求，获取access_token，保存下来
     */
    const w = new Wechat();

    let result = await w.fetchAccessToken();
    console.log(result);
    result = await w.fetchAccessToken();
    console.log(result);

})()

















