import 'uno.css'
import '@unocss/reset/tailwind.css?inline'

// __IS_EDITOR_VERSION__ 变量是用来区分打包的是否为编辑器版本代码，可以通过这个环境变量来
// 做编辑器中的的js或css代码特殊处理，可以节省打包生产版本代码体积
// __IS_DESIGN_MODE__ 在设计器中还是在预览模式中
if (__IS_EDITOR_VERSION__) {
  import('./editor.css')
}

export { default as Avatar } from './background/Background.vue'
