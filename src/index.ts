import fs from 'fs-extra'
import chokidar from 'chokidar'

import { build, type Plugin } from 'vite'

import {
  type PluginConfig,
  type ResolvedPluginConfig,
  resolveConfig,
  createBundleConfig,
  createMetaBundleConfig,
  createEditorVersionBundleConfig,
  createNoopBundleConfig,
} from './config.ts'
import { createAssetsFileServer } from './utils.ts'
import { resolve } from 'node:path'

// 插件名
const PLUGIN_IDENTIFIER = 'vite-plugin-lowcode-material-vue'

const scanAllMeta = async (entry: string) => {
  const folders = await fs.readdir(entry)
  const meta = []
  for (const sub of folders) {
    const maybeMetaFile = resolve(entry, sub, 'meta.ts')
    if (await fs.exists(maybeMetaFile)) {
      meta.push(maybeMetaFile)
    }
  }
  return meta
}

function createMetaEntryContent(meta: string[], pkgName: string) {
  return `
    ${meta
      .map((src, index) => {
        return `import meta_${index} from '${src}';`
      })
      .join('\n')}

    import {version} from '${resolve('package.json')}';

    const meta = {
      components: [${meta.map((_, index) => `meta_${index}`).join(',')}],
      version,
    };

    meta.components.forEach(item => {
      if (!item.npm) {
        item.npm = {
          package: '${pkgName}',
          version,
          destructuring: true,
        }
      }
    })

    export default meta
  `
}

async function buildMeta(config: ResolvedPluginConfig) {
  const entry = resolve(process.cwd(), 'node_modules/.temp/meta.ts')

  const writeEntryFile = async () => {
    const meta = await scanAllMeta(config.materialFolder)
    const content = createMetaEntryContent(meta, config.packageName)

    fs.ensureFileSync(entry)
    fs.writeFileSync(entry, content, { encoding: 'utf-8' })
  }

  await writeEntryFile()

  chokidar
    .watch('./src', {
      persistent: true,
    })
    .on('all', (event, path) => {
      if (path.endsWith('meta.ts') && ['unlink', 'add'].includes(event)) {
        setTimeout(writeEntryFile)
      }
    })

  return build(createMetaBundleConfig(config, entry))
}

async function buildAssets(
  config: ResolvedPluginConfig,
  base: string,
  output: string
) {
  const assets = {
    version: config.version,
    packages: [
      {
        package: config.packageName,
        version: config.version,
        library: config.packageName,
        urls: [`${base}/index.css`, `${base}/index.js`],
        editUrls: [`${base}/index.editor.css`, `${base}/index.editor.js`],
      },
    ],
    components: [
      {
        exportName: config.packageName + 'Meta',
        url: `${base}/meta.js`,
        package: {
          npm: config.packageName,
        },
      },
    ],
    sort: {
      groupList: [],
      categoryList: [],
    },
  }
  fs.ensureFileSync(output)
  await fs.writeFile(output, JSON.stringify(assets))
}

async function getModeConfig(
  isWatchMode: boolean,
  config: ResolvedPluginConfig
) {
  const port = isWatchMode
    ? await createAssetsFileServer(config.assetsPort, 'node_modules/.temp/dist')
    : undefined
  if (isWatchMode) {
    return {
      base: `http://localhost:${port}/ms`,
      output: './node_modules/.temp/dist',
    }
  }
  return {
    base: config.baseUrl,
    output: config.outDir,
  }
}

export default function pluginBuildMaterial(
  pluginConfig: PluginConfig
): Plugin {
  const config = resolveConfig(pluginConfig)
  let isWatchMode: boolean

  return {
    name: PLUGIN_IDENTIFIER,
    configResolved(resolved) {
      isWatchMode = resolved.build.watch != null
    },
    config(userConfig) {
      if (userConfig.build && Object.keys(userConfig.build).length) {
        return
      }
      // 把原来的build引导到不存在的地方去
      return createNoopBundleConfig(userConfig)
    },
    closeBundle: async () => {
      const { base, output } = await getModeConfig(isWatchMode, config)

      config.outDir = output

      await Promise.all([
        build(createBundleConfig(config)),
        build(createEditorVersionBundleConfig(config)),
        buildAssets(config, base, resolve(output, 'assets.json')),
        buildMeta(config),
      ])

      if (!isWatchMode) {
        process.exit(0)
      }
    },
  }
}
