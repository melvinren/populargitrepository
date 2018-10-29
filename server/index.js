const fetch = require('node-fetch')
const express = require('express')

const app = express();
app.use(express.static('./'));

const GH_Client_Id = 'ad9f2e585f757a7f4f83'
const GH_Client_Secret = 'd2b6a8c03024c15472178ae2478bea077b8f6462'

app.get('/github/login', (req, res)=>{
    const dataStr = (new Date()).valueOf();
    //重定向到认证接口,并配置参数
    let path = "https://github.com/login/oauth/authorize";
    path += '?client_id='+GH_Client_Id;
    path += '&scope=repo,user';
    path += '&state=' + dataStr;
    //转发到授权服务器
    res.redirect(path);
})

app.get('/gitauth', (req, res)=>{
    const code = req.query.code    
    let path = 'https://github.com/login/oauth/access_token';
    const params = {
        client_id: GH_Client_Id,
        client_secret: GH_Client_Secret,
        code: code
    }
    console.log(code);
    fetch(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
    .then(response => {        
        return response.text();
    })
    .then(body => {
        const args = body.split('&');
        let arg = args[0].split('=');
        const access_token = arg[1];        
        console.log(access_token);
        return access_token;        
    })
    .then((token) => {
        const url = ' https://api.github.com/user?access_token=' + token;        
        fetch(url)
            .then(res => {
                return res.json();
            })
            .then(content => {
                res.send(content);
            })
            .catch(e=>{
                console.log(e);
            })
    })
    .catch(e => {
        console.log(e);
    })
})

const port = 3333;
app.listen(port, function () {
    console.log('listening at http://localhost:' + port)
});
