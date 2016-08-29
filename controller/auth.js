/**
 * Created by megic on 2015/11/28 0028.
 */
module.exports = function ($this) {
    var main = {};
    main['_init'] = function *() {//先执行的公共函数
        //console.log(this.langs);
    };
    main['_after'] = function *() {//后行的公共函数
        //console.log('公共头部');
    };
    //**************************** 简易png验证码
    var captchapng = require('captchapng');
    main['captcha']=function *(){//图片验证码
        var num=parseInt(Math.random()*9000+1000);
        var p = new captchapng(80,30,num); // width,height,numeric captcha
        p.color(86, 172, 232);  // First color: background (red, green, blue, alpha)
        p.color(255, 255, 255, 255); // Second color: paint (red, green, blue, alpha)
        var img = p.getBase64();
        var imgbase64 = new Buffer(img,'base64');
        $this.session.ucenter_captcha = num;
        $this.type = 'image/png';
        $this.body = imgbase64;
    };//****************************
    //****************************
    main['checkLogin']=function *(){//判断用户是否已登录
        if ($this.isAuthenticated()){
            $this.success(this.req.user); //已经登录
        }else{
            $this.error(401);
        }
    };//****************************
    main['register'] = function *() {
        //验证码检测
        if(parseInt($this.POST['captcha'])!=$this.session.ucenter_captcha){$this.error($this.langs['captchaError']);return;}

        $this.POST['status']=1;
        $this.POST['groupId']=1;//默认用户组
        /*验证规则*/
        var rules = {
            name: {rule:'max:40',error:'用户名长度有误'},
            phone: {rule:'phone',error:'手机号码错误'},
            email: {rule:'email',error:'邮箱格式错误'},
            username: {rule:'between:3,30',error:'用户名长度不在3-30个字符内'},
            password: {rule:'required|between:6,32',error:'密码不能少于6个字符'},
            headimgurl: {rule:'max:250',error:'头像地址有误'},
            groupId: {rule:'required',error:'验证失败!'},
            status: {rule:'required',error:'用户状态必须填写'}};

        var check = $F.V.validate($this.POST, rules);//验证数据
        if($this.POST['phone']||$this.POST['email']||$this.POST['username']) {
            if (check.status) {/*通过验证*/
                var res, resData;
                var user = yield $D('member').findOne({
                    where: {
                        $or: [
                            {phone: $this.POST['phone']}, {email: $this.POST['email']}, {username: $this.POST['username']}
                        ]
                    }
                });
                if (!user) {
                    $this.POST['password'] = $F.encode.md5($this.POST['password']);
                    res = yield $D('member').build($this.POST).save();
                    yield $D('memberExtend').build({//填写用户扩展信息
                        memberId:res.id,extend:{}}
                    ).save();
                    resData = res;
                    yield $this.logIn(resData);
                    $this.success(resData);
                } else {
                    $this.error($this.langs['doubleUser']);//用户重复
                }

            } else {
                $this.error(rules[check.rejects[0].field].error);//数据验证有误
            }
        }else{
            $this.error($this.langs['erroField']);
        }
    };
    //****************************
    main['login']=function *(){//用户登录
        //验证码检测
        if(parseInt($this.POST['captcha'])!=$this.session.ucenter_captcha){$this.error($this.langs['captchaError']);return;}

        if ($this.isAuthenticated()){
            $this.error($this.langs['hasLogin']);//已经登录
        }else{
            if($this.POST['username']&&$this.POST['password']) {
                yield $M.passport.authenticate('local', function*(err, user) {
                    if (err) throw err;
                    if (user === false) {
                        $this.error($this.langs['errorInfo']);//帐号密码错误
                    } else {
                        yield $this.logIn(user);
                        $this.success(user);
                    }
                });
            }else{
                $this.error($this.langs['filedEmpty']);//不能为空
            }
        }

    };//***************************************************
    main['lgout']=function *(){//退出登录
        $this.logout();
        $this.error(401);//退出成功，返回401
    };//***************************************************

    return main;
};