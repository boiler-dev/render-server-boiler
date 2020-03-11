import { ActionBoiler } from "boiler-dev"

export const install: ActionBoiler = async () => {
  const actions = []

  actions.push({
    action: "npmInstall",
    source: ["fs-extra", "globby"],
  })

  return actions
}

export const generate: ActionBoiler = async () => {
  const actions = []

  actions.push({
    action: "write",
    path: "src/renderServer.ts",
    sourcePath: "tsignore/renderServer.ts",
  })

  actions.push({
    action: "write",
    path: "test/renderServer.spec.ts",
    sourcePath: "tsignore/renderServer.spec.ts",
  })

  return actions
}
