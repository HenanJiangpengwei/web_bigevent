$(function () {

    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage

    //定义没花时间的过滤器
    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date(date)

        var y = dt.getFullYear()
        var m = dt.getMonth() + 1
        var d = dt.getDate()

        var hh = dt.getHours()
        var mm = dt.getMinutes()
        var ss = dt.getSeconds()

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }

    // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    // 定义一个查询的参数对象,将来请求数据的时候
    // 需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, // 页码值,默认请求第一页的数据
        pagesize: 2, // 每一页显示几条数据,默认显示2条
        cate_id: '', // 文章的分类 Id
        state: '', // 文章的发布状态
    }
    // 初始化 获取文章列表数据的方法
    initTable()
    // 初始化 文章分类的方法
    initCate()

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layui.msg("获取文章列表失败")
                }
                // 使用模板引擎渲染页面的数据
                var str = template('tpl-table', res)
                $("tbody").html(str)
                // 调用渲染分页的方法
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg("获取文章分类失败")
                }
                // 调用模板引擎渲染分类的可选项
                var str = template('tpl-cate', res)
                $('[name=cate_id]').html(str)
                // 通过 layui 重新渲染表单区域的 ui 结构
                form.render()
            }
        })
    }

    // 为筛选表单绑定 submit 事件
    $("#form-search").on('click', function (e) {
        // 阻止默认行为
        e.preventDefault()
        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        // 为查询参数对象 q 中对应的属性赋值
        q.cate_id = cate_id
        q.state = state
        // 根据最新的筛选条件，重新渲染表格数据
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage(total) {
        // 调用 laypage.render 方法来渲染分页的结构
        laypage.render({
            elem: 'pageBox',  // 分页容器的 id
            count: total,  // 总数居条数
            limit: q.pagesize,  // 每页显示多少条数据
            curr: q.pagenum,  // 设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],

            // 分页发生切换的时候，出发 jump 回调
            jump: function (obj, first) {
                // 可以通过first的值，来判断通过那种方式，出发的 jump 回调
                // 如果 first 的值是 true 就证明是通过方式2触发的
                // 反之 
                console.log(first);
                console.log(obj.curr);
                // 把最新的页码值，复制到 q 这个参数对象中
                q.pagenum = obj.curr
                // 把最新的条，赋值到 q 这个查询参数对象pagesize中
                q.pagesize = obj.limit
                // 根据最新的 q 重新获取数据列表，并渲染表格
                if (!first) {
                    initTable()
                }
            }
        })
    }

    // 通过代理的形式，为删除按钮绑定点击事件的处理函数
    $("tbody").on('click', '.btn-delete', function () {
        // 获取删除按钮的个数
        var len = $(".btn-delete").length
        console.log(len);
        // 获取当前文章的id
        var id = $(this).attr('data-id')
        // 询问用户是否删除
        layer.confirm('您确认要删除吗?', { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败')
                    }
                    layer.msg('删除文章成功')
                    // 当数据删除成功后，需要判断这一页中，是否还有剩余的数据
                    // 如果没有剩余的数据了则让页码值 -1 ，重新调用 initTable 这个方法
                    if (len === 1) {
                        // 如果 len 的值等于 1 则等于删除完毕，页面没有任何数据
                        // 页码值最小值必须等于1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                }
            })
            layer.close(index);
        });
    })
})