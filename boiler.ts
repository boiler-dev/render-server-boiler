import {
  InstallBoiler,
  PromptBoiler,
  GenerateBoiler,
  UninstallBoiler,
} from "boiler-dev"

export const install: InstallBoiler = async ({
  cwdPath,
  files,
}) => {
  const actions = []
  return actions
}

export const prompt: PromptBoiler = async ({
  cwdPath,
  files,
}) => {
  const prompts = []
  return prompts
}

export const generate: GenerateBoiler = async ({
  cwdPath,
  answers,
  files,
}) => {
  const actions = []
  return actions
}

export const uninstall: UninstallBoiler = async ({
  cwdPath,
  answers,
  files,
}) => {
  const actions = []
  return actions
}
