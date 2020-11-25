// ast语法树 是用对象来描述原生语法的
// 虚拟dom 是用对象来描述dom节点的
// ?: 匹配不捕获
// arguments[0] = 匹配到的标签 arguments[1] 匹配到的标签名字
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // abc-aaa
const qnameCapture = `((?:${ncname}\\:)?${ncname})` // <aaa:bbb>
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性
const startTagClose = /^\s*(\/?)>/ // 匹配标签结束的 <div> <div />
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export function compileToFunction(template) {
    console.log(template)
    return function render() {

    }
}


