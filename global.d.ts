// __IS_EDITOR_VERSION__ 变量是用来区分打包的是否为编辑器版本代码，可以通过这个环境变量来
// 做编辑器中的的js或css代码特殊处理，可以节省打包生产版本代码体积
declare const __IS_EDITOR_VERSION__: boolean

// 判断当前是不是运行在设计器中
declare const __IS_DESIGN_MODE__: boolean
