import { useEffect, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { EditOutlined } from '@ant-design/icons'

import { Button, Form, Input, Popconfirm, Select, Tabs, theme, Tooltip } from 'antd'
import { InfoIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { nanoid } from 'nanoid'

import { IconText } from '@/components/IconText'
import { JsonSchemaCard } from '@/components/JsonSchemaCard'
import { JsonViewer } from '@/components/JsonViewer'
import { AddExmaple } from '@/components/tab-content/api/AddExmaple'
import {
  contentTypeOptions,
  httpCodeOptions,
  ModalNewResponse,
} from '@/components/tab-content/api/ModalNewResponse'
import type { ContentType } from '@/enums'
import { getContentTypeString } from '@/helpers'
import { useStyles } from '@/hooks/useStyle'
import type { ApiDetails } from '@/types'
import { isJSON } from '@/utils'

import { css } from '@emotion/css'

interface ResponseTabProps {
  value?: ApiDetails['responses']
  onChange?: (value: ResponseTabProps['value']) => void
  defaultActiveResTabKey?: string
}

export function ResponseTab(props: ResponseTabProps) {
  const { value, onChange, defaultActiveResTabKey } = props
  const form = Form.useFormInstance()
  const { token } = theme.useToken()

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
      tabExmapleExtra: css({
        '.ant-tabs-extra-content': {
          position: 'relative',
        },
      }),
    }
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState<boolean | string>(false)
  const [activeResTabKey, setActiveResTabKey] = useState(defaultActiveResTabKey)
  const [activeExmapleTabKey, setActiveExmapleTabKey] = useState<string>()

  useEffect(() => {
    const examples: ApiDetails['responseExamples'] = form.getFieldValue(['responseExamples'])
    const newExamples =
      examples?.filter((_, i) => {
        return _.responseId === activeResTabKey
      }) || []
    setActiveExmapleTabKey(newExamples.at(0)?.id)
  }, [activeResTabKey])

  return (
    <>
      <Tabs
        activeKey={activeResTabKey}
        animated={false}
        className={styles.tabWithBorder}
        items={value?.map((resp, idx) => {
          const onlyOneRes = value.length === 1

          return {
            key: resp.id,
            label: `${resp.name}(${resp.code})`,
            children: (
              <div className="p-tabContent">
                <div className="mb-tabContent flex gap-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <Form.Item
                      label="HTTP 状态码"
                      name={['responses', idx, 'code']}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        optionRender={({ label, data }) => (
                          <span className="group flex items-center">
                            {label}
                            <span className="ml-3 font-normal opacity-65">
                              {data.text as string}
                            </span>
                            <Tooltip title={`${data.desc as string}。`}>
                              <InfoIcon
                                className="ml-auto mr-1 opacity-0 transition-opacity group-hover:opacity-100"
                                size={14}
                              />
                            </Tooltip>
                          </span>
                        )}
                        options={httpCodeOptions}
                        popupClassName="min-w-[350px]"
                      />
                    </Form.Item>
                    <Form.Item
                      label="名称"
                      name={['responses', idx, 'name']}
                      style={{ marginBottom: 0 }}
                    >
                      <Input style={{ width: '88px' }} />
                    </Form.Item>
                    <Form.Item
                      label="内容格式"
                      name={['responses', idx, 'contentType']}
                      style={{ marginBottom: 0 }}
                    >
                      <Select options={contentTypeOptions} style={{ width: '130px' }} />
                    </Form.Item>
                    <Form.Item
                      dependencies={['responses', idx, 'contentType']}
                      label="Content-Type"
                      style={{ marginBottom: 0 }}
                    >
                      {({ getFieldValue: getFieldValue1 }) => {
                        const contentType: ContentType = getFieldValue1([
                          'responses',
                          idx,
                          'contentType',
                        ])

                        return <span>{getContentTypeString(contentType)}</span>
                      }}
                    </Form.Item>
                  </div>

                  {!onlyOneRes && (
                    <div className="ml-auto pt-1">
                      <Popconfirm
                        title={
                          <span>
                            确定删除？确定后点击右上角<strong>保存</strong>按钮生效
                          </span>
                        }
                        onConfirm={() => {
                          const newResponses = value.filter((_, i) => i !== idx)

                          onChange?.(newResponses)

                          setActiveResTabKey(newResponses.at(0)?.id)
                        }}
                      >
                        <Button
                          size="small"
                          style={{
                            color: token.colorTextSecondary,
                          }}
                          type="text"
                        >
                          <IconText icon={<TrashIcon size={14} />} />
                        </Button>
                      </Popconfirm>
                    </div>
                  )}
                </div>

                <Form.Item noStyle name={['responses', idx, 'jsonSchema']}>
                  <JsonSchemaCard editorProps={{ defaultExpandAll: true }} />
                </Form.Item>

                <Form.Item noStyle dependencies={['responseExamples']}>
                  {({ getFieldValue: getFieldValue2 }) => {
                    const examples: ApiDetails['responseExamples'] = getFieldValue2([
                      'responseExamples',
                    ])
                    const targetExamples = examples?.filter(
                      ({ responseId }) => responseId === resp.id
                    )

                    if (Array.isArray(targetExamples) && targetExamples.length > 0) {
                      return (
                        <Tabs
                          activeKey={activeExmapleTabKey}
                          className={(styles.tabWithBorder, styles.tabExmapleExtra)}
                          items={targetExamples.map((it) => {
                            const targetIdx = examples?.findIndex((itt) => itt.id === it.id)

                            return {
                              key: it.id,
                              label: it.name,
                              children:
                                typeof targetIdx === 'number' && targetIdx !== -1 ? (
                                  <div className="p-tabContent">
                                    <Form.Item
                                      noStyle
                                      name={['responseExamples', targetIdx, 'data']}
                                    >
                                      <SyntaxHighlighter
                                        wrapLongLines
                                        customStyle={{ background: 'transparent' }}
                                        language="json"
                                        style={atomOneLight}
                                      >
                                        {isJSON(it.data)
                                          ? JSON.stringify(JSON.parse(it.data), null, 2)
                                          : it.data}
                                      </SyntaxHighlighter>
                                    </Form.Item>
                                  </div>
                                ) : null,
                            }
                          })}
                          tabBarExtraContent={
                            <>
                              <Button
                                icon={<PlusIcon size={16} />}
                                type="text"
                                onClick={() => {
                                  setActiveResTabKey(resp.id)
                                  setAddModalOpen(true)
                                }}
                              >
                                添加
                              </Button>
                              {
                                <div className="absolute right-[20px] top-[50px] z-[999]">
                                  <Button
                                    size="small"
                                    style={{
                                      color: token.colorTextSecondary,
                                    }}
                                    type="text"
                                    onClick={() => {
                                      setActiveResTabKey(resp.id)
                                      setAddModalOpen('edit')
                                    }}
                                  >
                                    <EditOutlined size={14} />
                                  </Button>
                                  <Popconfirm
                                    title={
                                      <span>
                                        确定删除？确定后点击右上角<strong>保存</strong>
                                        按钮生效
                                      </span>
                                    }
                                    onConfirm={() => {
                                      const newExamples =
                                        examples?.filter((_, i) => {
                                          return _.id !== activeExmapleTabKey
                                        }) || []
                                      form.setFieldValue('responseExamples', newExamples)
                                      setActiveExmapleTabKey(newExamples.at(0)?.id)
                                    }}
                                  >
                                    <Button
                                      size="small"
                                      style={{
                                        color: token.colorTextSecondary,
                                      }}
                                      type="text"
                                    >
                                      <IconText icon={<TrashIcon size={14} />} />
                                    </Button>
                                  </Popconfirm>
                                </div>
                              }
                            </>
                          }
                          type="card"
                          onTabClick={(tabKey) => {
                            setActiveExmapleTabKey(tabKey)
                          }}
                        />
                      )
                    }

                    return (
                      <div className="flex h-32 items-center justify-center rounded border border-solid border-[#eaecf0]">
                        <Button
                          type="primary"
                          onClick={() => {
                            setActiveResTabKey(resp.id)
                            setAddModalOpen(true)
                          }}
                        >
                          添加示例
                        </Button>
                      </div>
                    )
                  }}
                </Form.Item>
              </div>
            ),
          }
        })}
        tabBarExtraContent={
          <>
            <Button
              icon={<PlusIcon size={16} />}
              type="text"
              onClick={() => {
                setModalOpen(true)
              }}
            >
              添加
            </Button>
          </>
        }
        type="card"
        onTabClick={(tabKey) => {
          setActiveResTabKey(tabKey)
        }}
      />

      <ModalNewResponse
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
        }}
        onFinish={(values) => {
          setModalOpen(false)

          const newResId = nanoid(6)
          form.setFieldsValue({
            responses: [
              ...((form.getFieldValue('responses') as ApiDetails['responses']) || []),
              { ...values, id: newResId },
            ],
          })

          setActiveResTabKey(newResId)
        }}
      />
      <AddExmaple
        open={!!addModalOpen}
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
                    return { ...values, id: newResId, responseId: activeResTabKey }
                  } else {
                    return item
                  }
                }),
              ],
            })

            console.log('=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>onFinish', {
              responseExamples: [
                ...list.map((item) => {
                  if (item.id === values.id) {
                    return { ...values, id: newResId, responseId: activeResTabKey }
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
                { ...values, id: newResId, responseId: activeResTabKey },
              ],
            })
            console.log('=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>onFinish', {
              responseExamples: [
                ...((form.getFieldValue('responseExamples') as ApiDetails['responseExamples']) ||
                  []),
                { ...values, id: newResId, responseId: activeResTabKey },
              ],
            })
          }
          setActiveExmapleTabKey(newResId)
        }}
        onMounted={() => {
          if (addModalOpen === 'edit') {
            const list =
              (form.getFieldValue('responseExamples') as ApiDetails['responseExamples']) || []
            const id = activeExmapleTabKey || list[0].id
            const item = list.find((item) => item.id === id)
            console.log('=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', item)
            return item
          }
        }}
      />
    </>
  )
}
