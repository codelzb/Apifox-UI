import { useEffect, useRef, useState } from 'react'

import { ClearOutlined } from '@ant-design/icons'
import { Form, Input, Modal, type ModalProps, Select, type SelectProps, theme } from 'antd'
import { BracesIcon, CopyIcon, ScanTextIcon } from 'lucide-react'

import { SchemaType } from '@/components/JsonSchema'
import { MonacoEditor, type MonacoEditorRef } from '@/components/MonacoEditor'
import { HTTP_CODE_CONFIG } from '@/configs/static'
import { useGlobalContext } from '@/contexts/global'
import { ContentType } from '@/enums'
import type { ApiDetails, ApiDetailsResponse, ApiDetailsResponseExample } from '@/types'
import { isJSON } from '@/utils'

import { UIButton } from '../../UIBtn'

interface ModalNewResponseProps extends ModalProps {
  onFinish?: (data: ApiDetailsResponseExample & { id?: string }) => void
  onMounted: () => ApiDetailsResponseExample | undefined
}

interface ParamsTabProps {
  value?: any
  onChange?: (value: any) => void
}

function JsonModal(props: ParamsTabProps) {
  const { token } = theme.useToken()
  const [jsonStr, setJsonStr] = useState<string>()
  const { value, onChange } = props
  const editorRef = useRef<MonacoEditorRef>(null)
  function format() {
    if (editorRef.current) {
      editorRef.current.formatJSON()
    }
  }

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
        language="json"
        value={value}
        onChange={(val) => {
          onChange?.(val)
        }}
      />
    </div>
  )
}
export function AddExmaple(props: ModalNewResponseProps) {
  const { onFinish, ...rest } = props
  const [form] = Form.useForm<ApiDetailsResponseExample>()
  useEffect(() => {
    const item = rest.onMounted()
    if (props.open) {
      if (item) {
        const data = isJSON(item.data || '')
          ? JSON.stringify(JSON.parse(item.data || ''), null, 2)
          : item.data
        setTimeout(() => {
          form.setFieldsValue({
            ...item,
            data: data,
          })
        }, 0)
      } else {
        form.setFieldsValue({
          name: '',
          data: '',
          id: '',
          responseId: '',
        })
      }
    }
  }, [props.open])
  return (
    <Modal
      {...rest}
      destroyOnClose
      className="h-auto w-[960px]"
      title="添加示例"
      width={1000}
      onOk={() => {
        form.validateFields().then((values) => {
          onFinish?.(values)
        })
      }}
    >
      <Form<ApiDetailsResponseExample> clearOnDestroy form={form} layout="vertical">
        <Form.Item label="示例名称" name="name" rules={[{ required: true }]}>
          <Input className="!mt-[5px]" />
        </Form.Item>
        <Form.Item label="返回数据" name="data">
          <JsonModal />
        </Form.Item>
        <Form.Item hidden name="id">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}
