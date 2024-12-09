import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'

import { Button, Form, type FormProps, Input, Select, type SelectProps, Space, theme } from 'antd'
import { nanoid } from 'nanoid'

import { PageTabStatus } from '@/components/ApiTab/ApiTab.enum'
import { useTabContentContext } from '@/components/ApiTab/TabContentContext'
import { InputUnderline } from '@/components/InputUnderline'
import { ApiRemoveButton } from '@/components/tab-content/api/ApiRemoveButton'
import { ResponseTab } from '@/components/tab-content/api/components/ResponseTab'
import { WsTypeFormItems } from '@/components/tab-content/api/components/WsTypeFormItems'
import { HTTP_METHOD_CONFIG } from '@/configs/static'
import { useGlobalContext } from '@/contexts/global'
import { useMenuHelpersContext } from '@/contexts/menu-helpers'
import { useMenuTabHelpers } from '@/contexts/menu-tab-settings'
import { initialCreateApiDetailsData } from '@/data/remote'
import { type ContentType, MenuItemType, ParamType } from '@/enums'
import type { ApiDetails } from '@/types'
import { isJSON } from '@/utils'

import { useGenerateCode as GenerateCode } from '../../../core/useGenerateCode.js'

import { BaseFormItems } from './components/BaseFormItems'
import { GroupTitle } from './components/GroupTitle'
import { CreateParamsTab } from './params/CreateParamsTab'

const { URLparse } = GenerateCode()
const DEFAULT_NAME = '未命名接口'

const methodOptions: SelectProps['options'] = Object.entries(HTTP_METHOD_CONFIG).map(
  ([method, { color }]) => {
    return {
      value: method,
      label: (
        <span className="font-semibold" style={{ color: `var(${color})` }}>
          {method}
        </span>
      ),
    }
  }
)

/**
 * API 「修改文档」部分。
 */
export function ApiDocEditing(props: { setPageTabActive?: Dispatch<SetStateAction<string>> }) {
  const { setPageTabActive } = props

  const [form] = Form.useForm<ApiDetails>()

  const { messageApi } = useGlobalContext()
  const msgKey = useRef<string>()

  const { menuRawList, addMenuItem, updateMenuItem } = useMenuHelpersContext()
  const { addTabItem } = useMenuTabHelpers()
  const { tabData } = useTabContentContext()

  const isCreating = tabData.data?.tabStatus === PageTabStatus.Create
  useEffect(() => {
    if (isCreating) {
      form.setFieldsValue(initialCreateApiDetailsData)
    } else {
      if (menuRawList) {
        const menuData = menuRawList.find(({ id }) => id === tabData.key)

        if (
          menuData &&
          (menuData.type === MenuItemType.ApiDetail || menuData.type === MenuItemType.HttpRequest)
        ) {
          const apiDetails = menuData.data

          if (apiDetails) {
            form.setFieldsValue(apiDetails)
          }
        }
      }
    }
  }, [form, menuRawList, isCreating, tabData.key])

  const handleFinish: FormProps<ApiDetails>['onFinish'] = (values) => {
    // const values: ApiDetails = form.getFieldsValue(true) // 获取所有值，包括未绑定的
    const menuName = values.name || DEFAULT_NAME
    if (isCreating) {
      const menuItemId = nanoid(6)

      addMenuItem({
        parentId: tabData.data?.id as string,
        id: menuItemId,
        name: menuName,
        type: MenuItemType.ApiDetail,
        data: { ...values, name: menuName },
      })

      addTabItem(
        {
          key: menuItemId,
          label: menuName,
          contentType: MenuItemType.ApiDetail,
        },
        { replaceTab: tabData.key }
      )
    } else {
      updateMenuItem({
        id: tabData.key,
        name: menuName,
        data: { ...values, name: menuName },
      })
      console.log('tabDatatabDatatabDatatabDatatabDatatabData', tabData, {
        id: tabData.key,
        name: menuName,
        data: { ...values, name: menuName },
      })
      messageApi.success('保存成功')
    }
  }

  function parserPath(url: string | undefined) {
    if (!url) {
      return
    }
    try {
      const newObj = URLparse(url)
      form.setFieldValue('requestParams', newObj)
      if (!msgKey.current) {
        msgKey.current = '__'
      }

      messageApi.info({
        key: msgKey.current,
        content: (
          <span>
            URL参数已自动提取，并填充到下方<strong>参数</strong>中
          </span>
        ),
        duration: 3,
        onClose: () => {
          msgKey.current = undefined
        },
      })
    } catch (err) {
      messageApi.error('无法解析')
      return false
    }
  }

  const handleValuesChange = (changedValues: Partial<ApiDetails>) => {
    const { path } = changedValues

    if (typeof path === 'string' && path) {
      parserPath(path)
    }
  }
  return (
    <>
      <Form<ApiDetails>
        className="flex h-full flex-col"
        form={form}
        initialValues={{
          requestParams: {
            wsType: 'ws2_1',
            parameters: {},
            requestName: '',
            interfaceAdder: '',
            rootURL: '',
            serviceUrl: '',
            httpProxyUrl: '',
            user: 'admin',
            password: '111',
            method: '',
            version: '1',
            type: 'GET',
            callType: 'json',
            returnType: 'json',
            parserKey: [],
            special: '',
            closeUP: false,
          },
          responseExamples: [],
        }}
        onFinish={(values) => {
          handleFinish(values)
        }}
        onValuesChange={handleValuesChange}
      >
        <div className="flex items-center px-tabContent py-3">
          <Space.Compact className="flex-1">
            <Form.Item noStyle name={['requestParams', 'type']}>
              <Select
                showSearch
                className="min-w-[110px]"
                options={methodOptions}
                popupClassName="!min-w-[120px]"
              />
            </Form.Item>
            <Form.Item noStyle name="path">
              <Input placeholder="填入接口URL可快速生成参数" />
            </Form.Item>
          </Space.Compact>

          <Space className="ml-auto pl-2">
            <Button htmlType="submit" type="primary">
              保存
            </Button>

            {!isCreating && (
              <>
                <Button
                  onClick={() => {
                    setPageTabActive?.('run')
                  }}
                >
                  运行
                </Button>
                <ApiRemoveButton tabKey={tabData.key} />
              </>
            )}
          </Space>
        </div>

        <div className="flex-1 overflow-y-auto p-tabContent">
          <Form.Item noStyle name="name">
            <InputUnderline placeholder={DEFAULT_NAME} />
          </Form.Item>
          <GroupTitle className="mt-2">接口说明</GroupTitle>
          <div className="pt-2">
            <BaseFormItems />
          </div>
          <GroupTitle className="mt-2">基础信息</GroupTitle>
          <div className="pt-2">
            <WsTypeFormItems />
          </div>

          <GroupTitle className="mt-2">请求参数</GroupTitle>
          <Form.Item noStyle name={['requestParams', 'parameters']}>
            <CreateParamsTab />
          </Form.Item>

          <GroupTitle className="mb-3 mt-8">返回响应</GroupTitle>
          <Form.Item noStyle name="responses">
            <ResponseTab />
          </Form.Item>
          <Form.Item hidden noStyle name="responseExamples"></Form.Item>
        </div>
      </Form>
    </>
  )
}
