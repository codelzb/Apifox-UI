import { Form, Select, Tabs, theme, Typography } from 'antd'

import type { ApiDetails } from '@/types'

import { ParamsEditableTable } from '../ParamsEditableTable'

import { ParamsBody } from './ParamsBody'

function BadgeLabel(props: React.PropsWithChildren<{ count?: number }>) {
  const { token } = theme.useToken()

  const { children, count } = props

  return (
    <span>
      {children}

      {typeof count === 'number' && count > 0 ? (
        <span
          className="ml-1 inline-flex size-4 items-center justify-center rounded-full text-xs"
          style={{ backgroundColor: token.colorFillContent, color: token.colorSuccessActive }}
        >
          {count}
        </span>
      ) : null}
    </span>
  )
}

interface ParamsTabProps {
  value?: ApiDetails['parameters']
  onChange?: (value: ParamsTabProps['value']) => void
}

/**
 * 请求参数页签。
 */
export function CreateParamsTab(props: ParamsTabProps) {
  const { value, onChange } = props

  return (
    <Tabs
      animated={false}
      items={[
        {
          key: 'params',
          label: (
            <BadgeLabel count={(value?.query?.length || 0) + (value?.path?.length || 0)}>
              Params
            </BadgeLabel>
          ),
          children: (
            <div className="pt-2">
              {/* <div className="py-2">
                <Typography.Text type="secondary">Query 参数</Typography.Text>
              </div> */}
              <ParamsEditableTable
                value={value?.query}
                onChange={(query) => {
                  onChange?.({ ...value, query })
                }}
              />

              {/* {value?.path && value.path.length > 0 ? (
                <>
                  <div className="py-2">
                    <Typography.Text type="secondary">Path 参数</Typography.Text>
                  </div>
                  <ParamsEditableTable
                    isPathParamsTable
                    autoNewRow={false}
                    removable={false}
                    value={value.path}
                    onChange={(path) => {
                      onChange?.({ ...value, path })
                    }}
                  />
                </>
              ) : null} */}
            </div>
          ),
        },
        {
          key: 'headers',
          label: 'Headers',
          children: (
            <div className="pt-2">
              {/* <ParamsEditableTable
                value={value?.header}
                onChange={(header) => {
                  onChange?.({ ...value, header })
                }}
              /> */}
              <Form.Item
                label="requestHeader(请求头)"
                labelCol={{ span: 24 }}
                name={['requestParams', 'requestHeader']}
                rules={[{ required: false }]}
              >
                <Select
                  options={[
                    { label: '无', value: '' },
                    {
                      label: '[{"header":"Accept","value":"application/x-hwcalltypeint16"}]',
                      value: '[{"header":"Accept","value":"application/x-hwcalltypeint16"}]',
                    },
                    {
                      label: '[{"header":"Content-Type","value":"application/json"}]',
                      value: '[{"header":"Content-Type","value":"application/json"}]',
                    },
                    {
                      label: '[{"header":"Content-Type","value":"text/plain;charset=UTF-8"}]',
                      value: '[{"header":"Content-Type","value":"text/plain;charset=UTF-8"}]',
                    },
                    {
                      label:
                        '[{"header":"Content-Type","value":"application/x-www-form-urlencoded"}]',
                      value:
                        '[{"header":"Content-Type","value":"application/x-www-form-urlencoded"}]',
                    },
                    {
                      label: '[{"header":"Content-Type","value":"multipart/form-data"}]',
                      value: '[{"header":"Content-Type","value":"multipart/form-data"}]',
                    },
                  ]}
                />
              </Form.Item>
            </div>
          ),
        },
      ]}
    />
  )
}
