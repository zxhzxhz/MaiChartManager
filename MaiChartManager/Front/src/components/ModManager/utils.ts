import { capitalCase } from "change-case";

const sectionPanelOverrides = import.meta.glob('./sectionPanelOverride/*/index.tsx', { eager: true })
export const getSectionPanelOverride = (path: string) => {
  return (sectionPanelOverrides[`./sectionPanelOverride/${path}/index.tsx`] as any)?.default
}

export const getNameForPath = (path: string, name: string, nameBuiltin?: string | null) => {
  // if (comments.nameOverrides[path]) return comments.nameOverrides[path]
  return nameBuiltin || capitalCase(name)
}
