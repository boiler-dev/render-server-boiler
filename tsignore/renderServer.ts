import { join } from "path"
import { readFile } from "fs-extra"
import globby from "globby"

import loaded from "./loaded"
import router from "./router"
import ssr from "./ssr"

export const EXT_REGEX = /(.+)(\.[^\.]+)$/

export interface App {
  router: typeof router
}

export interface RenderRequest {
  headers: Record<string, string>
  path: string
  method: string
  files: Record<string, any>
  params: Record<string, any>
  user?: string
}

export interface RenderResponse {
  code?: number
  body?: string
  type?: string
}

export class RenderServer {
  app: App = null
  libs: typeof loaded.libs = null
  ssr: typeof ssr = null

  async route(
    root: string,
    request: RenderRequest,
    response: RenderResponse = {}
  ): Promise<RenderResponse> {
    const { path } = request
    const asset = await this.assetFromRequest(root, path)

    if (asset) {
      return asset
    }

    const componentName = this.app.router.route(path)
    const bodyComponent = this.libs[componentName]
    const headComponent = this.libs[bodyComponent.head]

    const layout = await this.ssr.layout(
      headComponent,
      bodyComponent,
      request,
      response
    )

    return {
      code: response.code || 200,
      body: response.body || layout,
      type: response.type || "text/html",
    }
  }

  async assetFromRequest(
    root: string,
    path: string
  ): Promise<RenderResponse | void> {
    const match = path.match(EXT_REGEX)

    if (!match || !match[2]) {
      return
    }

    let [, name, ext] = match
    let map = ""

    if (ext === ".map") {
      map = ext
      ;[, name, ext] = name.match(EXT_REGEX)
    }

    const nameExt = process.env.STAGE ? "" : "-*"

    const glob = [
      join(root, path),
      join(root, `${name}${nameExt}${ext}${map}`),
      join(root, `${name}.js${map}`),
    ]

    const paths = await globby(glob)

    if (paths[0]) {
      const mjs = await readFile(paths[0])

      let contentType = "text/javascript"

      if (ext === ".css") {
        contentType = "text/css"
      }

      if (ext === ".ts") {
        contentType = "application/typescript"
      }

      if (map) {
        contentType = "application/json"
      }

      return {
        code: 200,
        body: mjs.toString(),
        type: contentType,
      }
    }
  }

  async assetsForClient(
    paths: Record<string, string>
  ): Promise<Record<string, string>> {
    const filled = {}
    const promises = []

    for (const id in paths) {
      const nodeModule = paths[id].includes(
        "/node_modules/"
      )

      const mjs = process.env.STAGE || nodeModule
      const name = mjs ? `${id}-*` : id

      const type = ["Component", "Model"].find(
        type => id.includes(type) && !mjs
      )

      const subdir = type ? type.toLowerCase() + "s/" : ""

      const dir = mjs ? "mjs" : "esm"
      const ext = mjs ? "mjs" : "js"

      promises.push(
        (async (): Promise<void> => {
          const glob = [
            paths[id],
            dir,
            `${subdir}${name}.${ext}`,
          ].join("/")

          filled[id] = (await globby(glob))[0]
            .replace(".js", ".mjs")
            .slice(1)
        })()
      )
    }

    await Promise.all(promises)

    return filled
  }
}

export default new RenderServer()
