export function MDXProvider({ children }: { children: React.ReactNode }) { return children as any }
export function useMDXComponents<T extends Record<string, any>>(components?: T): T { return (components ?? ({} as any)) }
export default { MDXProvider, useMDXComponents }
