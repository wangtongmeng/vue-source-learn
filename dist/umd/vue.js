(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  // 重写数组的方法 push shift unshift pop reverse sort splice 会导致数组本身发生变化
  var oldArrayMethods = Array.prototype; // value.__proto__ = arrayMethods // 劫持的方法会去arrayMethods找（原型链查找机制，向上查找，先找重写的，重写的没有继续向上查找）
  // arrayMethods.__proto__ = oldArrayMethods // slice 会去oldArrayMethods找

  var arrayMethods = Object.create(oldArrayMethods);
  var methods = ['push', 'shift', 'unshift', 'pop', 'sort', 'splice', 'reverse'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      console.log('用户调用了push方法'); // AOP 切片编程

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayMethods[method].apply(this, args); // 调用原生的数组方法
      // push unshift 添加的元素可能还是一个对象

      var inserted; // 当前用户插入的元素

      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          // 3个 新增的属性 splice 有删除 新增的功能 arr.splice(0, 1, {name: 1})
          inserted = args.slice(2);
      }

      if (inserted) ob.observerArray(inserted); // 将新增属性继续观测

      return result;
    };
  });

  /**
   * 
   * @param {*} data 当前数据是不是对象
   */
  function isObject(data) {
    return _typeof(data) === 'object' && data !== null;
  }
  function def(data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false,
      configurable: false,
      value: value
    });
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      // vue 如果数据的层次过多 需要递归的解析对象中的属性，依次增加set和get方法
      // value.__ob__ = this // 我给每一个监控过的对象都增加一个__ob__属性，由于__ob__也是对象所以会递归观测，导致observerArray重复调用，造成死循环
      def(value, '__ob__', this);

      if (Array.isArray(value)) {
        // 如果数组的话并不会对索引进行观测 因为会导致性能问题
        // 前端开发很少会操作索引 一般会使用 push shift unshift...
        // 重写数组方法
        value.__proto__ = arrayMethods; // 如果数组里放的是对象再进行监控

        this.observerArray(value);
      } else {
        this.walk(value);
      }
    }

    _createClass(Observer, [{
      key: "observerArray",
      value: function observerArray(value) {
        value.forEach(function (item) {
          observe(item);
        });
      }
    }, {
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data);
        keys.forEach(function (key) {
          defineReactive(data, key, data[key]); // 定义响应式数据
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    observe(value); // 递归实现深度监测（数据越深，递归越多，从而导致性能浪费，所以写代码时，层级不要太多）

    Object.defineProperty(data, key, {
      get: function get() {
        // 获取值时做一些操作
        return value;
      },
      set: function set(newValue) {
        // 设置值时也可以做一些操作
        console.log('更新');
        if (newValue === value) return;
        observe(newValue); // 继续劫持用户设置的值，因为有可能用户设置的值是一个对象

        value = newValue;
      }
    });
  }

  function observe(data) {
    var isObj = isObject(data);
    if (!isObj) return;
    return new Observer(data); // 用来观测数据
  }

  function initState(vm) {
    var opts = vm.$options; // vue的数据来源 属性 方法 数据 计算属性 watch

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    // 数据初始化工作
    var data = vm.$options.data; // 用户传递的data

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // 对象劫持 用户改变了数据 通知 => 刷新页面
    // MVVM模式 数据变化可以驱动视图变化
    // Object.defineProperty() 给属性增加get方法和set方法
    // Object.defineProperty 不能兼容ie8及以下 vue2无法兼容ie8版本

    observe(data); // 响应式处理
  }

  // ast语法树 是用对象来描述原生语法的
  // 虚拟dom 是用对象来描述dom节点的
  // ?: 匹配不捕获
  // arguments[0] = 匹配到的标签 arguments[1] 匹配到的标签名字
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // abc-aaa

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // <aaa:bbb>

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 <div> <div />

  function start(tagName, attrs) {
    console.log('开始标签是', tagName, '属性是', attrs);
  }

  function end(tagName) {
    // 复杂节点这里没有处理，例如注释、doctype节点，只处理核心逻辑
    console.log('结束标签', tagName);
  }

  function chars(text) {
    console.log('文本', text);
  }

  function parseHTML(html) {
    // 不停地解析html字符串(截取)
    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        // 如果当前索引为0 肯定是一个标签 开始标签 结束标签
        var startTagMatch = parseStartTag(); // 获取tagName,attrs

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue; // 如果开始标签匹配完毕后 继续下一次匹配
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      var text = void 0;

      if (textEnd >= 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text);
      }
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); // 删除标签

        var _end, attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // 解析属性
          advance(attr[0].length); // 删除属性

          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          // 去掉开始标签的 >
          advance(_end[0].length);
          return match;
        }
      }
    }
  }

  function compileToFunction(template) {
    var root = parseHTML(template);
    return function render() {};
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // 数据劫持
      var vm = this; // vue中使用 this.$options 指代的就是用户传递的属性

      vm.$options = options; // 初始化状态

      initState(vm); // 分割代码
      // 如果用户传入了el属性 需要将页面渲染出来
      // 如果用户传入了el 就要实现挂载流程

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el); // 默认会先查找有没有render方法，没有render会采用tempalte，template也没有就用el中的内容

      if (!options.render) {
        // 对模板进行编译
        var template = options.template; // 取出模板

        if (!template && el) {
          template = el.outerHTML; // 兼容性问题，可以创建一个div，取innerHTML
        }

        var render = compileToFunction(template);
        options.render = render; // 我们需要将template 转化成 render方法
      }
    };
  }

  function Vue(options) {
    // 进行Vue的初始化操作
    this._init(options);
  } // 通过引入文件的方式 给Vue原型上添加方法


  initMixin(Vue); // 给Vue原型上添加一个_init方法

  return Vue;

})));
//# sourceMappingURL=vue.js.map
