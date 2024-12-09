import { useState } from 'react'

import Link from 'next/link'
import { DownOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, Row, Select, type SelectProps, Switch } from 'antd'
import useResizeObserver from 'use-resize-observer'

import { IconText } from '@/components/IconText'
import type { ApiDetails } from '@/types'

const options = [
  { label: 'ws2_1', value: 'ws2_1' },
  { label: 'ws3_0', value: 'ws3_0' },
  { label: 'ws4_0', value: 'ws4_0' },
  { label: 'rf3_0', value: 'rf3_0' },
  { label: 'tqzc(天擎众创)', value: 'tqzc' },
  { label: 'kunlun(web通用/昆仑部门接口)', value: 'kunlun' },
]
const parserKeyOptions = [
  {
    label: <span>普通数据处理</span>,
    title: 'manager',
    options: [
      { label: 'parseJson:将接口数据所有的JSON字符串解析为JSON对象', value: 'parseJson' },
      {
        label: 'parseAnyPoint:将任意点数组转换为键值对数组,并增加中文天气描述',
        value: 'parseAnyPoint',
      },
    ],
  },
  {
    label: <span>站点数据处理</span>,
    title: 'zdz',
    options: [
      { label: 'int16ToJson:int16_ZDZ数据转JSON', value: 'int16ToJson' },
      { label: 'zdz_5:将key、value数组转换为键值对数组', value: 'zdz_5' },
      { label: 'zdz_base:用于无站点基础信息的数据解析', value: 'zdz_base' },
    ],
  },
  {
    label: <span>格点数据处理</span>,
    title: 'gird',
    options: [
      { label: 'nc:NC转JSON', value: 'nc' },
      { label: 'int16:int16转JSON', value: 'int16' },
      { label: 'micaps4:micaps4转JSON', value: 'micaps4' },
      { label: 'micaps14:micaps14转JSON', value: 'micaps14' },
    ],
  },
]
const statusOptions: SelectProps['options'] = options.map((item) => {
  return {
    value: item.value,
    label: (
      <span className="flex items-center">
        <span
          className="mr-2 inline-block size-[6px] rounded-full"
          style={{ backgroundColor: `var(#000})` }}
        />
        <span>{item.label}</span>
      </span>
    ),
  }
})

export function WsTypeFormItems(props: { showAll?: boolean }) {
  const { showAll = false } = props
  const [containerSize, setContainerSize] = useState<'xs' | 'sm' | 'md' | 'lg'>()
  const [expand, setExpand] = useState(showAll)
  const { ref } = useResizeObserver<HTMLDivElement>({
    onResize: ({ width }) => {
      if (typeof width === 'number') {
        if (width >= 1000) {
          if (containerSize !== 'lg') {
            setContainerSize('lg')
          }
        } else if (width >= 700) {
          if (containerSize !== 'md') {
            setContainerSize('md')
          }
        } else if (width >= 500) {
          if (containerSize !== 'sm') {
            setContainerSize('sm')
          }
        } else {
          setContainerSize('xs')
        }
      }
    },
  })

  const colSpan =
    containerSize === 'lg' || containerSize === 'md' ? 6 : containerSize === 'sm' ? 12 : 24

  const form = Form.useFormInstance()
  const wsTypeValue = Form.useWatch(['requestParams', 'wsType'], form) as string
  return (
    <div ref={ref} className="relative">
      <Row gutter={16}>
        <Col span={colSpan}>
          <Form.Item
            label="wsType(接口类型)"
            labelCol={{ span: 24 }}
            name={['requestParams', 'wsType']}
            rules={[{ required: false }]}
          >
            <Select options={statusOptions} />
          </Form.Item>
        </Col>
        <Col span={colSpan}>
          <Form.Item
            label="rootURL(接口地址)"
            labelCol={{ span: 24 }}
            name={['requestParams', 'rootURL']}
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>
        </Col>
        {(wsTypeValue === 'ws2_1' || wsTypeValue === 'ws4_0') && (
          <Col span={colSpan}>
            <Form.Item
              label="serviceUrl(服务地址)"
              labelCol={{ span: 24 }}
              name={['requestParams', 'serviceUrl']}
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        )}
        <Col span={colSpan}>
          <Form.Item
            label="method(接口名称)"
            labelCol={{ span: 24 }}
            name={['requestParams', 'method']}
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>
        </Col>
        {!['ws4_0', 'kunlun'].includes(wsTypeValue) && (
          <Col span={colSpan}>
            <Form.Item
              label="version(接口版本)"
              labelCol={{ span: 24 }}
              name={['requestParams', 'version']}
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        )}
        <Col span={colSpan}>
          <Form.Item
            label="callType(访问数据类型)"
            labelCol={{ span: 24 }}
            name={['requestParams', 'callType']}
            rules={[{ required: false }]}
          >
            <Select
              options={[
                { label: 'json', value: 'json' },
                wsTypeValue !== 'kunlun'
                  ? { label: 'stream', value: 'stream' }
                  : { label: 'formData', value: 'formData' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={colSpan}>
          <Form.Item
            label="returnType(返回数据类型)"
            labelCol={{ span: 24 }}
            name={['requestParams', 'returnType']}
            rules={[{ required: false }]}
          >
            <Select
              options={[
                { label: 'json', value: 'json' },
                wsTypeValue === 'ws4_0'
                  ? { label: 'stream', value: 'stream' }
                  : { label: 'arraybuffer', value: 'arraybuffer' },
                { label: 'zip', value: 'zip' },
                wsTypeValue === 'ws2_1'
                  ? { label: 'bitJson(5:精简json返回)', value: 'bitJson' }
                  : null,
                wsTypeValue !== 'ws2_1' && wsTypeValue !== 'ws4_0'
                  ? { label: 'text', value: 'text' }
                  : null,
                wsTypeValue === 'ws4_0'
                  ? [
                      { label: 'int16', value: 'int16' },
                      { label: 'int16_zip', value: 'int16_zip' },
                      { label: 'int16_decode(将Int16数据解析为Json后返回)', value: 'int16_decode' },
                      { label: 'base64', value: 'base64' },
                      { label: 'base64_zip', value: 'base64_zip' },
                      { label: 'grid_micaps(网格返回micaps)', value: 'grid_micaps' },
                      { label: 'grid_netcdf(网格返回nc)', value: 'grid_netcdf' },
                      { label: 'grid_micaps_zip', value: 'grid_micaps_zip' },
                      { label: 'grid_netcdf_zip', value: 'grid_netcdf_zip' },
                      { label: 'grid_tile_gzip(网格返回分区压缩格式)', value: 'grid_tile_gzip' },
                    ]
                  : null,
              ]
                .flat()
                .filter((item) => item !== null)}
            />
          </Form.Item>
        </Col>
        {!['ws4_0', 'kunlun'].includes(wsTypeValue) && (
          <Col span={colSpan}>
            <Form.Item
              hidden={!expand}
              label="user(用户名)"
              labelCol={{ span: 24 }}
              name={['requestParams', 'user']}
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        )}
        {!['ws4_0', 'kunlun'].includes(wsTypeValue) && (
          <Col span={colSpan}>
            <Form.Item
              hidden={!expand}
              label="password(密码)"
              labelCol={{ span: 24 }}
              name={['requestParams', 'password']}
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        )}
        {/* <Col span={colSpan}>
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
                  label: '[{"header":"Content-Type","value":"application/x-www-form-urlencoded"}]',
                  value: '[{"header":"Content-Type","value":"application/x-www-form-urlencoded"}]',
                },
                {
                  label: '[{"header":"Content-Type","value":"multipart/form-data"}]',
                  value: '[{"header":"Content-Type","value":"multipart/form-data"}]',
                },
              ]}
            />
          </Form.Item>
        </Col> */}
        {wsTypeValue === 'ws4_0' && (
          <Col span={colSpan}>
            <Form.Item
              label="token"
              labelCol={{ span: 24 }}
              name={['requestParams', 'token']}
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        )}
        {wsTypeValue === 'tqzc' && (
          <Col span={colSpan}>
            <Form.Item
              label="serviceNodeId"
              labelCol={{ span: 24 }}
              name={['requestParams', 'serviceNodeId']}
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        )}
        {!['ws4_0', 'kunlun', 'tqzc'].includes(wsTypeValue) && (
          <Col span={colSpan}>
            <Form.Item
              hidden={!expand}
              label="httpProxyUrl(网络通信代理地址)"
              labelCol={{ span: 24 }}
              name={['requestParams', 'httpProxyUrl']}
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        )}
        {wsTypeValue === 'rf3_0' && (
          <Col span={colSpan}>
            <Form.Item
              hidden={!expand}
              label="special(特殊接口标识)"
              labelCol={{ span: 24 }}
              name={['requestParams', 'special']}
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        )}
        {!['ws4_0', 'kunlun'].includes(wsTypeValue) && (
          <Col span={colSpan}>
            <Form.Item
              hidden={!expand}
              label="closeUP(是否去除接口U、P参数)"
              labelCol={{ span: 24 }}
              name={['requestParams', 'closeUP']}
              rules={[{ required: false }]}
            >
              <Switch defaultChecked checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
          </Col>
        )}
        <Col span={23}>
          <Form.Item
            hidden={!expand}
            label="parserKey(数据解析key)"
            labelCol={{ span: 24 }}
            name={['requestParams', 'parserKey']}
            rules={[{ required: false }]}
          >
            <Select
              allowClear
              mode="multiple"
              options={parserKeyOptions}
              placeholder="可多选,会按照勾选的顺序对接口数据进行处理再返回"
            />
          </Form.Item>
        </Col>
      </Row>
      <a
        className="absolute bottom-7 right-0 inline-flex w-[80px] items-center justify-end"
        onClick={() => {
          setExpand(!expand)
        }}
      >
        <DownOutlined rotate={expand ? 180 : 0} size={14} /> {expand ? '收起' : '展开'}
      </a>
    </div>
  )
}
