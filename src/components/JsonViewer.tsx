import JsonView from 'react18-json-view'

import useCopy from '@/core/useCopy'

import 'react18-json-view/src/style.css'

interface JsonViewerProps {
  value?: string
}

export function JsonViewer(props: JsonViewerProps) {
  const { value } = props
  const { copyText } = useCopy()
  if (!value) {
    return null
  }
  function copy(node: string, text: string) {
    copyText(node, text)
  }
  return (
    <JsonView
      className="_jsonViewForCustomCopy"
      customizeCopy={(node: any) => {
        copy('._jsonViewForCustomCopy', JSON.stringify(node))
      }}
      src={JSON.parse(value)}
    />
  )
}
