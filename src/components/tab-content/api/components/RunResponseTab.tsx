import { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { Button, Form, Segmented, Tabs, Tooltip } from 'antd'
import { Upload } from 'lucide-react'
import { nanoid } from 'nanoid'

import { JsonViewer } from '@/components/JsonViewer'
import { ExtractExample } from '@/components/tab-content/api/ExtractExample'
import { useGlobalContext } from '@/contexts/global'
import useCopy from '@/core/useCopy'
import { MenuItemType } from '@/enums'
import { useStyles } from '@/hooks/useStyle'
import type { ApiDetails } from '@/types'
import { isJSON } from '@/utils'

import { css } from '@emotion/css'

interface ResponseTabProps {
  value?: ApiDetails['responses']
  onChange?: (value: ResponseTabProps['value']) => void
  result: any
  httpCode: string
  insHttpCode: string
  contentType: string
}

export function RunResponseTab(props: ResponseTabProps) {
  const { value, onChange, result, httpCode, insHttpCode, contentType } = props
  const form = Form.useFormInstance()
  const examples = (form.getFieldValue('responseExamples') as ApiDetails['responseExamples']) || []
  const response = (form.getFieldValue('responses') as ApiDetails['responses']) || []
  const { styles } = useStyles(({ token }) => {
    return {
      tabWithBorder: css({
        '.ant-tabs-content-holder': {
          border: `1px solid ${token.colorBorderSecondary}`,
          borderTop: 'none',
          borderBottomLeftRadius: token.borderRadius,
          borderBottomRightRadius: token.borderRadius,
        },
      }),
      tabCode: css({
        '.ant-tabs-content-holder': {
          border: 'none !important',
        },
      }),
    }
  })
  const { messageApi } = useGlobalContext()
  const { copyText } = useCopy()
  function copy(node: string, text: string) {
    copyText(node, text, messageApi)
  }

  const [addModalOpen, setAddModalOpen] = useState<boolean | string>(false)
  const [activeCodeTabKey, setActiveCodeTabKey] = useState<string>('http')
  return (
    <>
      <div className="mt-4 flex overflow-hidden" style={{ border: '1px solid #f2f4f7' }}>
        <div className="relative flex-1">
          <div
            className="flex w-full items-center justify-between"
            style={{
              height: '41px',
              padding: '8px 12px',
              borderBottom: '1px solid #f2f4f7',
            }}
          ></div>
          <div className="p-[16px]">
            <Tabs
              activeKey={activeCodeTabKey}
              animated={false}
              className={(styles.tabWithBorder, styles.tabCode)}
              items={[
                {
                  key: 'http',
                  label: `SU.Http代码`,
                  children: (
                    <>
                      <Button
                        id="_httpCode"
                        type="primary"
                        onClick={() => {
                          copy('#_httpCode', httpCode)
                        }}
                      >
                        复制代码
                      </Button>
                      <SyntaxHighlighter language="javascript" style={atomOneLight}>
                        {httpCode}
                      </SyntaxHighlighter>
                    </>
                  ),
                },
                {
                  key: 'insHttp',
                  label: `SU.insHttp代码`,
                  children: (
                    <>
                      <Button
                        id="_insHttpCode"
                        type="primary"
                        onClick={() => {
                          copy('#_insHttpCode', insHttpCode)
                        }}
                      >
                        复制代码
                      </Button>
                      <SyntaxHighlighter language="javascript" style={atomOneLight}>
                        {insHttpCode}
                      </SyntaxHighlighter>
                    </>
                  ),
                },
              ]}
              renderTabBar={() => {
                return (
                  <>
                    <Segmented
                      className="absolute left-[12px] top-[4px]"
                      options={[
                        { value: 'http', label: `SU.Http代码` },
                        { value: 'insHttp', label: `SU.insHttp代码` },
                      ]}
                      value={activeCodeTabKey}
                      onChange={(tabKey) => {
                        setActiveCodeTabKey(tabKey)
                      }}
                    />
                  </>
                )
              }}
              type="card"
              onTabClick={(tabKey) => {
                setActiveCodeTabKey(tabKey)
              }}
            />
          </div>
        </div>
        <div className="flex-1" style={{ borderLeft: '1px solid #f2f4f7' }}>
          <div
            className="flex w-full items-center justify-between"
            style={{
              height: '41px',
              padding: '8px 12px',
              borderBottom: '1px solid #f2f4f7',
            }}
          >
            <span className="font-medium">返回数据</span>
            {contentType === MenuItemType.ApiDetail && response.length && (
              <Tooltip title={`提取到"响应示例"`}>
                <Upload
                  className="cursor-pointer"
                  size={14}
                  onClick={() => {
                    setAddModalOpen(true)
                  }}
                />
              </Tooltip>
            )}
          </div>
          <div className="max-h-[1600px] overflow-y-auto p-[16px]">
            {typeof result === 'object' ? (
              <JsonViewer value={JSON.stringify(result)} />
            ) : (
              <p className="max-w-[800px]">{result}</p>
            )}
          </div>
        </div>
      </div>
      <ExtractExample
        examples={examples}
        open={!!addModalOpen}
        response={response}
        result={JSON.stringify(result)}
        onCancel={() => {
          setAddModalOpen(false)
        }}
        onFinish={(values) => {
          setAddModalOpen(false)
          const newResId = values.id || nanoid(6)
          if (values.id) {
            const list =
              (form.getFieldValue('responseExamples') as ApiDetails['responseExamples']) || []

            form.setFieldsValue({
              responseExamples: [
                ...list.map((item) => {
                  if (item.id === values.id) {
                    return { ...values, id: newResId }
                  } else {
                    return item
                  }
                }),
              ],
            })
          } else {
            form.setFieldsValue({
              responseExamples: [
                ...((form.getFieldValue('responseExamples') as ApiDetails['responseExamples']) ||
                  []),
                { ...values, id: newResId },
              ],
            })
          }
        }}
      />
    </>
  )
}
