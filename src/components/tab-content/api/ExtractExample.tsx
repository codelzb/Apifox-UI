import { useEffect, useMemo, useRef, useState } from 'react'

import { ClearOutlined } from '@ant-design/icons'
import {
  Col,
  Form,
  Input,
  Modal,
  type ModalProps,
  Radio,
  type RadioChangeEvent,
  Row,
  Select,
  type SelectProps,
  theme,
} from 'antd'

import { MonacoEditor, type MonacoEditorRef } from '@/components/MonacoEditor'
import { useGlobalContext } from '@/contexts/global'
import type { ApiDetails, ApiDetailsResponse, ApiDetailsResponseExample } from '@/types'
import { isJSON } from '@/utils'

import { UIButton } from '../../UIBtn'

interface ModalNewResponseProps extends ModalProps {
  onFinish?: (data: ApiDetailsResponseExample & { id?: string }) => void
  response: ApiDetailsResponse[]
  examples: ApiDetailsResponseExample[]
  result: string
}

interface ParamsTabProps {
  value?: any
  onChange?: (value: any) => void
  defaultValue?: any
}

function JsonModal(props: ParamsTabProps) {
  const { token } = theme.useToken()
  const { onChange, value } = props
  const editorRef = useRef<MonacoEditorRef>(null)
  function format() {
    if (editorRef.current) {
      editorRef.current.formatJSON()
    }
  }
  useEffect(() => {
    setTimeout(() => {
      onChange?.(value)
    }, 0)
  }, [])

  return (
    <div
      style={{
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorBorderSecondary}`,
        marginTop: '5px',
      }}
    >
      <div
        className="flex justify-end"
        style={{
          padding: `${token.paddingXS}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
        onClick={() => {
          format()
        }}
      >
        <UIButton>
          <span className="inline-flex items-center gap-1">
            <ClearOutlined size={12} />
            格式化
          </span>
        </UIButton>
      </div>

      <MonacoEditor
        ref={editorRef}
        className="h-[350px]"
        defaultLanguage="json"
        deserializeOnChange={false}
        initFormat={true}
        language="json"
        value={value}
        onChange={(val) => {
          onChange?.(val)
        }}
      />
    </div>
  )
}
export function ExtractExample(props: ModalNewResponseProps) {
  const { onFinish, response, examples, result, ...rest } = props
  const [form] = Form.useForm<ApiDetailsResponseExample>()
  const [status, setStatus] = useState('add')

  const parentform = Form.useFormInstance<ApiDetails>()

  // 使用第一条数据的 id 作为初始化状态
  const [examplesId, setExamplesId] = useState<string>('')

  useEffect(() => {
    // 如果 responseExamples 或 responses 改变，则更新 id
    if (examples.length) {
      setExamplesId(examples[0].id || '')
    }
  }, [examples])
  return (
    <Modal
      {...rest}
      centered
      destroyOnClose
      className="h-auto w-[720px]"
      title="提取到“响应示例”"
      width={720}
      onOk={() => {
        form.validateFields().then((values) => {
          onFinish?.({
            ...values,
            id: status === 'add' ? '' : examplesId,
          })
        })
      }}
    >
      <Form<ApiDetailsResponseExample>
        clearOnDestroy
        className="!mt-[20px]"
        form={form}
        initialValues={{ data: result }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Radio.Group
                value={status}
                onChange={(e: RadioChangeEvent) => {
                  setStatus(e.target.value as string)
                }}
              >
                {examples.length && (
                  <Radio value={'edit'}>
                    覆盖已有示例
                    {status === 'edit' && (
                      <span
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <Select
                          options={examples.map((item) => {
                            return {
                              label: item.name,
                              value: item.id,
                            }
                          })}
                          style={{ marginLeft: 8, width: 120 }}
                          value={examplesId}
                          onChange={(val) => {
                            setExamplesId(val)
                          }}
                        />
                      </span>
                    )}
                  </Radio>
                )}
                <Radio value={'add'}>新增示例</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="示例名称" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="返回响应" name="responseId" rules={[{ required: true }]}>
              {response.length && (
                <Select
                  className="min-w-[110px]"
                  options={response.map((resp) => {
                    return {
                      label: `${resp.name}(${resp.code})`,
                      value: resp.id,
                    }
                  })}
                  popupClassName="!min-w-[120px]"
                />
              )}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="" name="data">
              <JsonModal />
            </Form.Item>
          </Col>
          <Form.Item hidden name="id">
            <Input />
          </Form.Item>
        </Row>
      </Form>
    </Modal>
  )
}
