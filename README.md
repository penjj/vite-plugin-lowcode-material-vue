# vite-plugin-lowcode-vue-material

用来构建适用于 @knxcloud/lowcode-engine-vue 项目物料的vite插件和项目结构示例项目。

## 示例项目如何使用？

```bash

git clone https://github.com/penjj/vite-plugin-lowcode-vue-material.git

corepack enable # 如果你没有运行过这行，需要node版本大于16

pnpm i

cd example

# 启动开发服务
pnpm dev
```

example/ 下关于配置方法有详细注释, 有疑问可以提ISSUE。方便的话给我点个Star, Thanks!

## Install

```bash
pnpm i vite-plugin-lowcode-vue-material -D
```

## Usage

```js
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import unocss from 'unocss/vite'
import { presetUno } from 'unocss'
import buildMaterial from 'vite-plugin-lowcode-material-vue'
import { version } from './package.json'
import { resolve } from 'node:path'

export default defineConfig(() => {
  const envDir = resolve('.env')
  return {
    envDir,
    clearScreen: false,
    plugins: [
      buildMaterial({
        plugins: () => [
          vue(),
          unocss({
            presets: [presetUno()],
          }),
        ],
        // 物料路径
        // 期望有入口 index.ts，内部需要导出所有组件。本插件会基于此配置构建 bundle.js
        // 每个文件夹下需导出一个meta.ts，里面为组件物料描述配置
        /**
         * src/
         *   background/
         *     Background.vue
         *     meta.ts
         *   componentB/
         *     xxx.vue
         *     meta.ts
         *  index.ts
         */
        materialFolder: resolve('src'),
        // 构建后拼接的路径前缀
        baseUrl: '/dist',
        // 组件版本
        version,
        // iife 全局名称，即挂载到window上的名字
        packageName: 'Demo',
        // 构建输出路径
        outDir: 'dist',
        // 运行 pnpm dev 后，请访问您的 http://localhost:8088 端口
        assetsPort: 8088,
        envDir: resolve('.env'),
        overrides: {},
      }),
    ],
  }
})
```

```json
// tsconfig.json
{
  // ...
  "compilerOptions": {
    // ...
    "types": ["vite/client", "vite-plugin-lowcode-material-vue/global"] // 内部定义了两个构建时的环境变量类型
  }
}
```
