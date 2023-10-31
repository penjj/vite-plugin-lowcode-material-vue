import type { IPublicTypeAssetsJson } from '@alilc/lowcode-types'
import type { InlineConfig, PluginOption, UserConfig } from 'vite'
import fs from 'fs-extra'
import { resolve } from 'node:path'

export interface PluginConfig {
  assetsPort: number
  /**
   * 构建所需 vite 插件
   * 因为有的插件内部维护了状态，如果直接从 vite config 中取 plugins，会出现状态无法清除
   * 造成打包产物出现问题的情况
   */
  plugins: () => PluginOption[] | undefined
  /**
   * 物料文件夹，默认为 ./src
   */
  materialFolder?: string
  /**
   * server 模式下不会读取此配置项，会使用  http://localhost:8080/dist/xxx.js
   * build 模式下将会使用配置项
   */
  baseUrl: string
  /**
   * 版本号，默认从package.json中读取
   */
  version?: string
  /**
   * 包名
   */
  packageName: string
  /**
   * 可以配置此项，来merge生成的配置
   * TODO 函数配置来实现更自定义化的配置
   */
  overrides: Partial<IPublicTypeAssetsJson> | undefined

  /**
   * 打包产物路径
   */
  outDir: string
  envDir: string
}

export type ResolvedPluginConfig = Required<PluginConfig>

export function resolveConfig(
  config: PluginConfig,
  cwd = process.cwd()
): Required<PluginConfig> {
  return {
    ...config,
    materialFolder: config.materialFolder || resolve(cwd, './src'),
    version: config.version || process.env.npm_package_version!,
  }
}

/**
 * 打包普通版本的配置
 */
export function createBundleConfig(config: ResolvedPluginConfig): InlineConfig {
  return {
    configFile: false,
    envFile: false,
    appType: 'custom',
    envDir: config.envDir,
    plugins: config.plugins(),
    define: {
      __IS_EDITOR_VERSION__: 'false',
      __IS_DESIGN_MODE__: 'false',
    },
    build: {
      // watch: {},
      cssCodeSplit: false,
      emptyOutDir: false,
      outDir: config.outDir,
      lib: {
        entry: './src/index.ts',
        formats: ['iife'],
        name: config.packageName,
        fileName: () => 'index.js',
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          assetFileNames: 'index.css',
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  }
}

/**
 * 打包在编辑器中使用的版本
 */
export function createEditorVersionBundleConfig(
  config: ResolvedPluginConfig
): InlineConfig {
  return {
    configFile: false,
    envFile: false,
    envDir: config.envDir,
    plugins: config.plugins(),
    appType: 'custom',
    define: {
      __IS_EDITOR_VERSION__: 'true',
      __IS_DESIGN_MODE__: 'window.__is_simulator_env__',
    },
    build: {
      // watch: {},
      cssCodeSplit: false,
      emptyOutDir: false,
      outDir: config.outDir,
      lib: {
        entry: 'src/index.ts',
        formats: ['iife'],
        name: config.packageName,
        fileName: () => 'index.editor.js',
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          assetFileNames: 'index.editor.css',
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  }
}

/**
 * 打包 meta 文件的配置
 * 入口文件是通过扫描 meta.ts 来自动生成的
 */
export function createMetaBundleConfig(
  config: ResolvedPluginConfig,
  entry: string
): InlineConfig {
  return {
    configFile: false,
    envFile: false,
    envDir: config.envDir,
    appType: 'custom',
    build: {
      // watch: {},
      emptyOutDir: false,
      outDir: config.outDir,
      lib: {
        entry: entry,
        formats: ['iife'],
        name: config.packageName + 'Meta',
        fileName: () => 'meta.js',
      },
    },
  }
}

/**
 * 打包的时候，如果没有entry/output 等配置，vite会报错，这里通过写一个假的入口文件，
 * 将原本为空的配置引导到不存在的地方，来阻止报错
 */
export function createNoopBundleConfig(config: UserConfig): UserConfig {
  const tempTsFilePath = resolve(
    process.cwd(),
    'node_modules/.noop-temp/noop.ts'
  )
  fs.ensureFileSync(tempTsFilePath)
  fs.writeFileSync(tempTsFilePath, '"Noop!"', {
    encoding: 'utf-8',
  })
  config.build = {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        dir: resolve(process.cwd(), 'node_modules/.noop-temp/dist'),
      },
    },
    lib: {
      entry: 'node_modules/.noop-temp/noop.ts',
      name: 'noop',
      formats: [],
    },
  }

  return config
}
