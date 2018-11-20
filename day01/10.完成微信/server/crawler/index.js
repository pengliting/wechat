/**
 * Created by Administrator on 2018/11/19.
 */


//第一步引入
const puppeteer = require('puppeteer');

(async () => {
    //1. 打开浏览器
    const browser = await puppeteer.launch({
        //是否以 无头模式（没有界面显示） 运行浏览器
        headless: false
    });
    //2. 打开标签页
    const page = await browser.newPage();
    //3. 输入url地址
    await page.goto('https://movie.douban.com/coming', {waitUntil: 'load'});
    //4. 等待页面加载完成，开始爬取数据
    const result = await page.evaluate(() => {
        //定义一个容器
        let result = [];
        //开始爬取数据
        const $tds = $('.coming_list>tbody>tr').find('td:last');
        for (let i = 0; i < $tds.length; i++) {
            let $td = $($tds[i]);
            let num = +$td.text().split('人')[0];
            if (num >= 1000) {
                const href = $td.parent().find('td:nth(1)>a').attr('href');
                result.push(href);
            }
        }


        //将数据返回出去
        return result;
    });
    console.log(result);

    let movies = [];

    //开始第二次爬取
    for(var i = 0;i<result.length;i++){
        let item = result[i];
        try{
            //跳转新网址
            await page.goto(item,{waitUnil:'load'});
            //开始爬取
            const data = await page.evaluate(() => {
                const $video = $('related-pic-video');
                if (!$video.length){
                    return null;
                }
                const herf = $video.attr('herf');
                const cover = $video.css('background-image').split('"').split('?')[0];

                const title = $('[property="v:itemreviewed"]').text();
                const rating = $('[property="v:average"]').text();
                const director = $('[rel="directedBy"]').text();

                let casts = [];
                const $star = $('[rel="v:starring"]');
                const length = $star.length > 3 ? 3 :$star.length;
                for(var j = 0;j<length ;j++){
                    casts.push($($star[j]).text());
                }
                let genre = [];

                const $genre = $('[property="v:genre"]');
                for(var j = 0;j<$genre.length;j++){
                    genre.push($($genre[j]).text());
                }
                const releaseData = $($('[property="v:initialReleaseData"]')[0]).text();
                const image = $('[rel="v:image"]').attr('src');
                const summary = $('[property="v:summary"]').text().trim();

                return{
                    href,
                    cover,
                    title,
                    rating,
                    director,
                    casts,
                    genre,
                    releaseData,
                    image,
                    summary
                }

            })

            if(!data){
                continue;
            }
            data.doubanId = item.spilt('subject/')[1].split('/')[0];
            //保存数据
            movies.push(data);
        }catch(e){}
    }

    //第三次爬取
    for(var i = 0;i < movies.length;i++){
        let item = movies[i];
        await page.goto(item.href,{waitUnil:'load'});

        const data = await page.evaluate(() => {
            return $('video>source').attr('scr');
        })
        item.src = data;
        delete item.href;
    }

    console.log(movies);

    //5. 关闭浏览器
    await browser.close();
})();

/**
 * ## 豆瓣搜索电影接口
 * 请求方式
 * GET
 * 请求地址
 * http://api.douban.com/v2/movie/search
 * 请求参数
 * q 查询内容 string
 * count 查询数量 number
 * 返回值
 {
 "count": 5,
 "start": 0,
 "total": 20,
 "subjects": [
     {xxx},
     {xxx}
 ],
 "title": "搜索 \"黑客帝国\" 的结果"
 }
 * 注意，需要使用jsonp跨域
 * 调用示例：
 * http://api.douban.com/v2/movie/search?q=黑客帝国&count=5
 */

