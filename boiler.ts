import { join } from "path"
import { GenerateBoiler, InstallBoiler } from "boiler-dev"

export const install: InstallBoiler = async () => {
  const actions = []

  actions.push({
    action: "npmInstall",
    source: ["fs-extra", "globby"],
  })

  return actions
}

export const generate: GenerateBoiler = async ({
  cwdPath,
  files,
}) => {
  const actions = []

  for (const file of files) {
    const { name, source } = file

    if (name === "renderServer.ts") {
      actions.push({
        action: "write",
        path: join(cwdPath, "src", name),
        source,
      })
    }

    if (name === "renderServer.spec.ts") {
      actions.push({
        action: "write",
        path: join(cwdPath, "test", name),
        source,
      })
    }
  }

  return actions
}
