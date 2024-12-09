import { useCallback, useRef } from 'react'

import type { message } from 'antd'
import Clipboard from 'clipboard'

type MessageApi = ReturnType<typeof message.useMessage>[0]

function useCopy() {
  const clipboardRef = useRef<(Clipboard & { onClick?: (event: any) => void }) | null>(null)

  const copyText = useCallback((node: string, text: string, message?: MessageApi) => {
    if (clipboardRef.current) {
      clipboardRef.current.destroy() // 确保每次使用前销毁旧的实例
    }

    clipboardRef.current = new Clipboard(node, {
      text: () => text,
    })

    clipboardRef.current.on('success', (e) => {
      message?.success('成功复制到剪切板')
      e.clearSelection()
      clipboardRef.current?.destroy()
      clipboardRef.current = null
    })

    clipboardRef.current.on('error', (e) => {
      message?.error('复制失败')
      clipboardRef.current?.destroy()
      clipboardRef.current = null
    })
    if (clipboardRef.current.onClick) {
      clipboardRef.current.onClick({
        currentTarget: document.querySelector(node),
      })
    }
  }, [])

  return { copyText }
}

export default useCopy
