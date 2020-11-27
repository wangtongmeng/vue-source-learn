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


function start (tagName, attrs) {
    console.log('开始标签是', tagName, '属性是', attrs)
}
function end(tagName) {
    // 复杂节点这里没有处理，例如注释、doctype节点，只处理核心逻辑
    console.log('结束标签', tagName)
}
function chars(text) {
    console.log('文本', text)
}
function parseHTML(html) {
    // 不停地解析html字符串(截取)
    while (html) {
        let textEnd = html.indexOf('<')
        if (textEnd == 0) {
            // 如果当前索引为0 肯定是一个标签 开始标签 结束标签
            let startTagMatch = parseStartTag() // 获取tagName,attrs
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue // 如果开始标签匹配完毕后 继续下一次匹配
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }
        let text
        if (textEnd >=0) {
            text = html.substring(0, textEnd)
        }
        if (text){
            advance(text.length)
            chars(text)
        }
    }
    function advance(n) {
        html = html.substring(n)
    }
    function parseStartTag() {
        let start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length) // 删除标签
            let end,attr
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                // 解析属性
                advance(attr[0].length) // 删除属性
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
            }
            if (end) { // 去掉开始标签的 >
                advance(end[0].length)
                return match
            }
        }
    }
}

export function compileToFunction(template) {
    let root = parseHTML(template)
    return function render() {

    }
}


