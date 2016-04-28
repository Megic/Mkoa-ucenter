/**
 * Created by megic on 2015/11/28 0028.
 */
module.exports = function ($this) {
    var main = {};
    main['_init'] = function *() {//先执行的公共函数
        console.log(this.langs);

    };
    main['_after'] = function *() {//后行的公共函数
        //console.log('公共头部');
    };
    //****************************
    main['checkLogin']=function *(){//判断用户是否已登录
        if (this.isAuthenticated()){
            $this.success(this.req.user); //已经登录
        }else{
            $this.error(401);
        }
    };//****************************
    main['register'] = function *() {

        $this.POST['status']=1;
        $this.POST['group']=1;//默认用户组
        /*验证规则*/
        var rules = {
            name: {rule:'max:40',error:'用户名长度有误'},
            phone: {rule:'phone',error:'手机号码错误'},
            email: {rule:'email',error:'邮箱格式错误'},
            username: {rule:'between:3,30',error:'用户名长度不在3-30个字符内'},
            password: {rule:'between:6,32',error:'密码不能少于6个字符'},
            group: {rule:'required',error:'验证失败!'},
            status: {rule:'required',error:'用户状态必须填写'}};

        var check = $F.V.validate($this.POST, rules);//验证数据

        if (check.status) {/*通过验证*/
            var res,resData;
            var user = yield $D('member').findOne({where:{
                    $or: [
                        {phone:$this.POST['phone']},{email:$this.POST['email']},{username:$this.POST['username']}
                    ]
             }});
                if(!user){
                    $this.POST['password']=$F.encode.md5($this.POST['password']);
                    res = yield $D('member').build($this.POST).save();
                    resData = res;
                    yield $this.logIn(resData);
                    $this.success(resData);
                }else{
                    $this.error('用户重复!');
                }

        } else {
            $this.error(rules[check.rejects[0].field].error);//数据验证有误
        }
    };
    //****************************
    main['login']=function *(){//用户登录
        if ($this.isAuthenticated()){
            $this.error('已经登录!');
        }else{
            yield $M.passport.authenticate('local', function*(err, user) {
                if (err) throw err;
                if (user === false) {
                   $this.error('帐号或者密码错误！');
                } else {
                    yield $this.logIn(user);
                    $this.success(user);
                }
            });
        }

    };//***************************************************
    main['lgout']=function *(){//退出登录
        this.logout();
        $this.success();
    };//***************************************************

    return main;
};