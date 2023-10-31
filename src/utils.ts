import express from 'express'
import { getPort } from 'get-port-please'
import cors from 'cors'

/**
 * 创建静态文件服务器
 */
export async function createAssetsFileServer(port: number, staticPath: string) {
  const app = express()
  const availablePort = await getPort({ port })

  app.listen(availablePort, () => {
    console.log(
      `assets file in: http://localhost:${availablePort}/ms/assets.json`
    )
  })

  app.use(cors())
  app.use('/ms', express.static(staticPath))

  return availablePort
}
