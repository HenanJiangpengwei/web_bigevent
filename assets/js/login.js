$(function () {
    // 点击去注册账号链接时
    $("#link_reg").on('click', function () {
        $(".login-box").hide()
        $(".reg-box").show()
    })
    // 点击去登录链接时
    $("#link_login").on('click', function () {
        $(".reg-box").hide()
        $(".login-box").show()
    })

    // 自定义验证（从 layui 中获取 form 对象
    var form = layui.form
    var layer = layui.layer
    // 通过 form.verify() 函数来自定义校验规则
    form.verify({
        // 自定义了一个 pwd 校验规则
        'pwd': [/^[\S]{6,12}$/, '密码必须6到12位，且不能出现空格'],
        // 校验两次密码是否一致
        'repwd': function (value) {
            // 通过形参拿到的是确认密码框中的内容
            // 还需要拿到密码框的内容
            // 然后进行一次比较
            // 如果判断失败，则return一个提示消息
            var pwd = $(".reg-box [name=password]").val()
            if (pwd !== value) {
                return '两次密码不一致'
            }
        }
    })

    // 监听注册表单的提交事件
    $("#form_reg").on('submit', function (e) {
        // 1. 阻止默认行为
        e.preventDefault()
        // 2. 发起 ajax 请求
        var data = {
            username: $('#form_reg [name=username]').val(), password: $('#form_reg [name=password]').val()
        }
        $.post('/api/reguser', data, function (res) {
            if (res.status !== 0) {
                return layer.msg(res.message)
            }
            layer.msg('注册成功')
            // 模拟人的点击行为
            $("#link_login").click()
        }
        )
    })

    // 监听登录表单的提交事件
    $("#form_login").submit(function (e) {
        // 1. 阻止默认提交行为
        e.preventDefault()
        // 发送ajax请求
        $.ajax({
            method: 'POST',
            url: '/api/login',
            // 快速获取表单数据
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg(res.message)
                }
                layer.msg('登录成功')
                // 将登录成功得到的 token 字符串，保存到 localStorage 中
                localStorage.setItem('token', res.token)
                // 跳转到主页
                location.href = '/index.html'
            }
        })
    })

})