export function liefcycleMixin(Vue) {
    Vue.prototype._update = function () {
        
    }
}

export function mountComponent(vm, el) {
    const options = vm.$options // render
    vm.$el = el // 真实的dom元素


    // Watcher 就是用来渲染的
    // vm._render 通过解析的render方法 渲染出虚拟dom
    // vm._update 通过虚拟dom 创建真实的dom

    // 渲染页面
    let updateComponent = () => { // 无论是渲染还是更新都会调用此方法
        // 返回的是虚拟dom
        vm._update(vm.render())
    }
    // 渲染watcher 每个组件都有一个watcher
    new Watcher(vm, updateComponent, ()=>{}, true) // true 表示它是一个渲染watcher
}