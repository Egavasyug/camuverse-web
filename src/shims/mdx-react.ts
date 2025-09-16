import type React from "react"

export type MDXComponents = Record<string, React.ComponentType<unknown>>

export function MDXProvider(
  { children }: { children: React.ReactNode; components?: MDXComponents }
): React.ReactNode {
  return children as React.ReactNode
}

export function useMDXComponents<T extends MDXComponents>(components?: T): T {
  return (components ?? ({} as T))
}

const mdxReact = { MDXProvider, useMDXComponents }
export default mdxReact
