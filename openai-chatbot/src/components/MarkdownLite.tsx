import Link from 'next/link'
import { Fragment } from 'react'

const MarkdownLite = function ({ text }: { text: string }) {
  const linkRegex = /\[(.+?)\]\((.+?)\)/g
  const parts = []

  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    const [fullMatch, linkText, linkUrl] = match
    const matchStart = match.index
    const matchEnd = matchStart + fullMatch.length

    if (lastIndex < matchStart) {
      parts.push(text.slice(lastIndex, matchStart))
    }

    parts.push(
      <Link
        target="_blank"
        rel="noopener noreferrer"
        className="break-words underline underline-offset-2 text-blue"
        key={linkUrl}
        href={linkUrl}
      >
        {linkText}
      </Link>
    )

    lastIndex = matchEnd
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>{part}</Fragment>
      ))}
    </>
  )
}

export default MarkdownLite
