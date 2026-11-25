/** "Júlio Andrade" -> "@julio": primeiro nome, minúsculo e sem acentos. */
export function toHandle(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? ''
  const plain = firstName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
  return `@${plain}`
}
