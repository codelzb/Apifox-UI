import { type Dispatch, type SetStateAction, useMemo, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { Viewer } from '@bytemd/react'
import {
  Button,
  Card,
  Col,
  Radio,
  type RadioChangeEvent,
  Row,
  Select,
  type SelectProps,
  Space,
  Tabs,
  theme,
  Tooltip,
} from 'antd'
import dayjs from 'dayjs'
import { ZapIcon } from 'lucide-react'

import { useTabContentContext } from '@/components/ApiTab/TabContentContext'
import { IconText } from '@/components/IconText'
import { JsonSchemaCard } from '@/components/JsonSchemaCard'
import { JsonViewer } from '@/components/JsonViewer'
import { API_STATUS_CONFIG, HTTP_METHOD_CONFIG } from '@/configs/static'
import { useGlobalContext } from '@/contexts/global'
import { useMenuHelpersContext } from '@/contexts/menu-helpers'
import { creator } from '@/data/remote'
import { useStyles } from '@/hooks/useStyle'
import type { ApiDetails, Parameter } from '@/types'
import { isJSON } from '@/utils'

import { GroupTitle } from './components/GroupTitle'

import { css } from '@emotion/css'

const statusOptions: SelectProps['options'] = Object.entries(API_STATUS_CONFIG).map(
  ([method, { text, color }]) => {
    return {
      value: method,
      label: (
        <span className="flex items-center">
          <span
            className="mr-2 inline-block size-[6px] rounded-full"
            style={{ backgroundColor: `var(${color})` }}
          />
          <span>{text}</span>
        </span>
      ),
    }
  }
)

function BaseInfoItem({ label, value }: { label: string; value?: string }) {
  const { token } = theme.useToken()

  return (
    <div>
      <span style={{ color: token.colorTextTertiary }}>{label}</span>
      <span className="ml-2" style={{ color: token.colorTextSecondary }}>
        {value || '-'}
      </span>
    </div>
  )
}

function ApiParameter({ param }: { param: Parameter }) {
  const { token } = theme.useToken()

  const isLongDesc = param.description?.includes('\n')

  return (
    <div>
      <Space>
        <span
          className="text-xs"
          style={{
            color: param.required ? token.colorWarning : token.colorTextDescription,
          }}
        >
          {param.required ? '必填' : '可选'}
        </span>
        <span
          className="inline-flex items-center text-xs font-semibold"
          style={{
            padding: `${token.paddingXXS}px ${token.paddingXS}px`,
            color: token.colorPrimary,
            backgroundColor: token.colorPrimaryBg,
            borderRadius: token.borderRadiusSM,
          }}
        >
          {param.name}
        </span>

        <span
          className="font-semibold"
          style={{
            color: token.colorTextSecondary,
          }}
        >
          {param.type}
        </span>

        {!isLongDesc && (
          <span
            className="text-xs"
            style={{
              color: token.colorTextDescription,
            }}
          >
            {param.description}
          </span>
        )}
      </Space>

      {isLongDesc && (
        <div
          className="mt-2 text-xs"
          style={{
            color: token.colorTextDescription,
          }}
        >
          <Viewer value={param.description || ''} />
        </div>
      )}

      <div className="ml-1 mt-2">
        <span className="text-xs">示例值：</span>
        <span
          className="text-xs"
          style={{
            padding: `0 ${token.paddingXXS}px`,
            color: token.colorTextDescription,
            backgroundColor: token.colorFillQuaternary,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusSM,
          }}
        >
          {param.example}
        </span>
      </div>
    </div>
  )
}

function BaseParameter({ param }: { param: { key: any; value: any } }) {
  const { token } = theme.useToken()
  return (
    <Col span={8}>
      <Space className="mb-3">
        <span
          className="inline-flex items-center text-xs font-semibold"
          style={{
            padding: `${token.paddingXXS}px ${token.paddingXS}px`,
            color: token.colorPrimary,
            backgroundColor: token.colorPrimaryBg,
            borderRadius: token.borderRadiusSM,
          }}
        >
          {param.key}
        </span>
        <span
          className="font-semibold"
          style={{
            color: token.colorTextSecondary,
          }}
        >
          {String(param.value)}
        </span>
      </Space>
    </Col>
  )
}
export function ApiDoc(props: { setPageTabActive: Dispatch<SetStateAction<string>> }) {
  const { setPageTabActive } = props
  const { token } = theme.useToken()

  const { messageApi } = useGlobalContext()
  const { menuRawList } = useMenuHelpersContext()
  const { tabData } = useTabContentContext()

  // 从原始数据中根据key(实际是ID)获取到具体数据
  const { docValue, methodConfig } = useMemo(() => {
    const apiDetails = menuRawList?.find(({ id }) => id === tabData.key)?.data as
      | ApiDetails
      | undefined

    let methodConfig

    if (apiDetails) {
      methodConfig = HTTP_METHOD_CONFIG[apiDetails.requestParams?.type || 'GET']
    }
    console.log('apiDetailsapiDetailsapiDetails', apiDetails)
    return { docValue: apiDetails, methodConfig }
  }, [menuRawList, tabData.key])

  const [currentExamplesId, setCurrentExamplesId] = useState('')
  const [activeCodeTabKey, setActiveCodeTabKey] = useState(docValue?.responses?.[0]?.id || '')
  const currentExamplesList = useMemo(() => {
    const currentExamples =
      docValue?.responseExamples?.filter((resE) => resE.responseId === activeCodeTabKey) || []
    if (currentExamples.length) {
      setCurrentExamplesId(currentExamples[0].data)
    }
    return currentExamples
  }, [activeCodeTabKey, docValue])

  const { styles } = useStyles(({ token }) => {
    return {
      card: css({
        '&.ant-card': {
          '> .ant-card-head': {
            minHeight: 'unset',
            fontWeight: 'normal',
            padding: `0 ${token.paddingSM}px`,
            fontSize: token.fontSize,

            '.ant-card-head-title': {
              padding: `${token.paddingXS}px 0`,
            },
          },
        },
      }),

      tabWithBorder: css({
        '.ant-tabs-content-holder': {
          border: `1px solid ${token.colorBorderSecondary}`,
          borderTop: 'none',
          borderBottomLeftRadius: token.borderRadius,
          borderBottomRightRadius: token.borderRadius,
        },
      }),
    }
  })

  if (!docValue || !methodConfig) {
    return null
  }

  return (
    <div className="h-full overflow-auto p-tabContent">
      <div className="flex items-center">
        <Space className="group/action">
          <h2 className="text-base font-semibold">{docValue.name}</h2>

          <Space className="opacity-0 group-hover/action:opacity-100" size="small">
            <Tooltip title="复制 ID">
              <Button
                size="small"
                type="link"
                onClick={() => {
                  navigator.clipboard.writeText(docValue.id).then(() => {
                    messageApi.success('已复制')
                  })
                }}
              >
                #{docValue.id}
              </Button>
            </Tooltip>
          </Space>
        </Space>

        <Space className="ml-auto pl-2">
          <Button
            type="primary"
            onClick={() => {
              setPageTabActive('run')
            }}
          >
            <IconText icon={<ZapIcon size={14} />} text="运行" />
          </Button>
        </Space>
      </div>

      <div className="mb-3">
        <span
          className="mr-2 px-2 py-1 text-xs/6 font-bold text-white"
          style={{
            backgroundColor: `var(${methodConfig.color})`,
            borderRadius: token.borderRadiusOuter,
          }}
        >
          {docValue.requestParams?.type}
        </span>
        <span className="mr-2">{docValue.path}</span>
        <Select options={statusOptions} value={docValue.status} variant="borderless" />
      </div>

      <div className="mb-3">
        <Space>
          {docValue.tags?.map((tag) => {
            return (
              <span
                key={tag}
                className="px-2 py-1 text-xs"
                style={{
                  color: token.colorPrimary,
                  backgroundColor: token.colorPrimaryBg,
                  borderRadius: token.borderRadiusXS,
                }}
              >
                {tag}
              </span>
            )
          })}
        </Space>
      </div>

      <div>
        <Space wrap size="large">
          <BaseInfoItem label="接口设计者" value={creator.name} />
          <BaseInfoItem label="接口开发者" value={creator.name} />
          <BaseInfoItem label="创建时间" value={dayjs(docValue.createdAt).format('YYYY年M月D日')} />
          <BaseInfoItem label="修改时间" value={dayjs(docValue.updatedAt).format('YYYY年M月D日')} />
          <BaseInfoItem label="修改者" value={creator.name} />
          <BaseInfoItem label="创建者" value={creator.name} />
        </Space>
      </div>

      {docValue.description ? (
        <div>
          <GroupTitle className="mt-3 font-semibold">接口说明</GroupTitle>
          <Viewer value={docValue.description} />
        </div>
      ) : (
        '暂无接口说明'
      )}

      <div>
        <GroupTitle className="my-3 font-semibold">请求参数</GroupTitle>
        {docValue.requestParams ? (
          <div className="flex flex-col gap-y-4">
            <Card className={styles.card} title="基础参数">
              <div className="flex flex-col gap-3">
                <Row gutter={16}>
                  {Object.keys(docValue.requestParams).map((key) => {
                    if (docValue.requestParams && !['parameters', 'data', 'type'].includes(key)) {
                      const ins = new SU.Http().defaults[docValue.requestParams.wsType as string]
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      if (ins[key] === docValue.requestParams[key]) {
                        return ''
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      } else if (ins[key] === undefined) {
                        return ''
                      } else if (
                        (key === 'special' || key === 'httpProxyUrl' || key === 'requestHeader') &&
                        !docValue.requestParams[key]
                      ) {
                        return ''
                      } else if (key === 'parserKey') {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        if (!docValue.requestParams[key]?.length) {
                          return ''
                        }
                      }
                      return (
                        <BaseParameter
                          key={key}
                          param={{ key: key, value: docValue.requestParams[key] }}
                        />
                      )
                    }
                  })}
                </Row>
              </div>
            </Card>
            {docValue.requestParams.parameters ? (
              <Card className={styles.card} title="Params 参数">
                <div className="flex flex-col gap-3">
                  {docValue.requestParams.parameters.query?.map((param) => (
                    <ApiParameter key={param.id} param={param} />
                  ))}
                </div>
              </Card>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
      </div>

      {!!docValue.responses && (
        <div>
          <GroupTitle className="my-3 font-semibold">返回响应</GroupTitle>
          <Tabs
            activeKey={activeCodeTabKey}
            className={styles.tabWithBorder}
            items={docValue.responses.map((res) => {
              return {
                key: res.id,
                label: `${res.name}(${res.code})`,
                children: (
                  <div>
                    <div className="flex flex-wrap items-center gap-4 p-3">
                      <span>
                        <span style={{ color: token.colorTextSecondary }}>HTTP 状态码：</span>
                        <span>{res.code}</span>
                      </span>

                      <span>
                        <span style={{ color: token.colorTextSecondary }}>内容格式：</span>
                        <span>{res.contentType}</span>
                      </span>
                    </div>
                    <div
                      className="flex overflow-hidden"
                      style={{ borderTop: '1px solid #f2f4f7' }}
                    >
                      <div className="flex-1">
                        <div
                          className="flex w-full items-center justify-between"
                          style={{
                            height: '41px',
                            padding: '8px 12px',
                            borderBottom: '1px solid #f2f4f7',
                          }}
                        >
                          <span className="font-medium">数据结构</span>
                        </div>
                        <div className="p-[16px]">
                          <JsonSchemaCard
                            editorProps={{ defaultExpandAll: true, readOnly: true }}
                            value={res.jsonSchema}
                          />
                        </div>
                      </div>
                      <div className="flex-1" style={{ borderLeft: '1px solid #f2f4f7' }}>
                        <div
                          className="flex w-full items-center"
                          style={{
                            height: '41px',
                            padding: '8px 12px',
                            borderBottom: '1px solid #f2f4f7',
                          }}
                        >
                          <span className="font-medium">示例</span>
                          {currentExamplesList.length > 1 && (
                            <Radio.Group
                              buttonStyle="solid"
                              className="!ml-3"
                              size="small"
                              value={currentExamplesId}
                              onChange={(ev: RadioChangeEvent) => {
                                setCurrentExamplesId(ev.target.value as string)
                              }}
                            >
                              {currentExamplesList.map((item) => {
                                return (
                                  <Radio.Button key={item.id} value={item.data}>
                                    {item.name}
                                  </Radio.Button>
                                )
                              })}
                            </Radio.Group>
                          )}
                        </div>
                        <div className="max-h-[1600px] overflow-y-auto p-[16px]">
                          {isJSON(currentExamplesId) ? (
                            <JsonViewer value={currentExamplesId} />
                          ) : (
                            <SyntaxHighlighter
                              wrapLongLines
                              customStyle={{ background: 'transparent' }}
                              language="json"
                              style={atomOneLight}
                            >
                              {currentExamplesId}
                            </SyntaxHighlighter>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              }
            })}
            type="card"
            onTabClick={(tabKey) => {
              setActiveCodeTabKey(tabKey)
            }}
          />
        </div>
      )}
    </div>
  )
}
