import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

import { show } from '@ebay/nice-modal-react'
import { Button, Form, type FormProps, Input, Select, type SelectProps, Space, Tooltip } from 'antd'
import { debounce } from 'lodash-es'
import { nanoid } from 'nanoid'

import { PageTabStatus } from '@/components/ApiTab/ApiTab.enum'
import { useTabContentContext } from '@/components/ApiTab/TabContentContext'
import { InputUnderline } from '@/components/InputUnderline'
import { ModalSaveMenu } from '@/components/modals/ModalSaveMenu'
import { RunResponseTab } from '@/components/tab-content/api/components/RunResponseTab'
import { HTTP_METHOD_CONFIG } from '@/configs/static'
import { useGlobalContext } from '@/contexts/global'
import { useMenuHelpersContext } from '@/contexts/menu-helpers'
import { useMenuTabHelpers } from '@/contexts/menu-tab-settings'
import { initialCreateApiDetailsData } from '@/data/remote'
import { type ContentType, MenuItemType, ParamType } from '@/enums'
import type { ApiDetails, TabContentType } from '@/types'

import useCopy from '../../../core/useCopy'
import { useGenerateCode as GenerateCode } from '../../../core/useGenerateCode.js'

import { GroupTitle } from './components/GroupTitle'
import { WsTypeFormItems } from './components/WsTypeFormItems'
import { CreateParamsTab } from './params/CreateParamsTab'

const DEFAULT_NAME = '未命名接口'

const { generateCode, configGenerateRequestParams, URLparse, optionsParse, isJSON } = GenerateCode()
const methodOptions: SelectProps['options'] = Object.entries(HTTP_METHOD_CONFIG).map(
  ([method, { color }]) => {
    return {
      value: method,
      label: (
        <span className="font-semibold" style={{ color: `var(${color})` }}>
          {method.toUpperCase()}
        </span>
      ),
    }
  }
)

interface CreateRequest {
  contentType?: MenuItemType.ApiDetail | MenuItemType.ApiCase | MenuItemType.HttpRequest
}
export function ApiCreateRequest(props: CreateRequest) {
  const { contentType = MenuItemType.ApiDetail } = props
  const [form] = Form.useForm<ApiDetails>()

  const { messageApi } = useGlobalContext()
  const msgKey = useRef<string>()

  const { menuRawList, addMenuItem, updateMenuItem } = useMenuHelpersContext()
  const { addTabItem } = useMenuTabHelpers()
  const { tabData } = useTabContentContext()

  const isCreating = tabData.data?.tabStatus === PageTabStatus.Create
  useEffect(() => {
    if (isCreating) {
      if (contentType === MenuItemType.ApiCase) {
        form.setFieldsValue(tabData.data?.data as ApiDetails)
      } else {
        form.setFieldsValue(initialCreateApiDetailsData)
      }
    } else {
      if (menuRawList) {
        const menuData = menuRawList.find(({ id }) => id === tabData.key)
        if (
          menuData &&
          (menuData.type === MenuItemType.ApiDetail ||
            menuData.type === MenuItemType.HttpRequest ||
            menuData.type === MenuItemType.ApiCase)
        ) {
          const apiDetails = menuData.data

          if (apiDetails) {
            form.setFieldsValue(apiDetails)
          }
        }
      }
    }
  }, [form, menuRawList, isCreating, tabData.key, contentType])

  const [currentURL, setCurrentURL] = useState('')
  useEffect(() => {
    SU.Http.prototype.on('pendingPromise', (pendingPromise: { xhr: { responseURL: string } }) => {
      setCurrentURL(pendingPromise.xhr.responseURL)
    })
  })

  const [httpCode, setHttpCode] = useState('')
  const [insHttpCode, setInsHttpCode] = useState('')
  const [result, setResult] = useState(`提示: 请先发送请求`)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testRequest = (cb?: any) => {
    setResult(`提示: 正在请求中`)
    const values: ApiDetails = form.getFieldsValue(true)
    const requestParams = values['requestParams']
    if (!insHttpCode) {
      return
    }
    eval(`${insHttpCode}.then((res) => {
            console.log('接口返回的数据', res); 
            if(!res) {
                messageApi.error('错误:接口未返回数据');
                setResult(res)
            }else{
                if(requestParams.parserKey){
                  SU.addLoading({
                    imgPath: 'resources/images/loading.gif',
                    loadStyle: 2,
                    loadingText: '正在解析JSON...'
                  })
                }
                if(typeof(cb) === 'function')cb(res)
                if (res instanceof ArrayBuffer) {
                  setResult("提示:非JSON数据无法预览,请在F12中查看")
                }else{
                  setResult(res)
                }
                
                messageApi.success('请求完成，已在console中打印结果');
            }
            SU.removeLoading()
        }).catch((err) => {
            console.log('err', err);
            setResult({})
            messageApi.error('接口请求过程出现错误, F12查看');
    });`)
  }

  function parserPath() {
    const values = form.getFieldsValue()
    let newObj = {}
    interface UrlOption {
      method: string
      header: string
      body: string
    }
    let url: string = values.path || ''
    let httpCode = ''
    let insHttpCode = ''
    if (!url.includes('http')) {
      return
    }
    try {
      if (isJSON(url)) {
        url = url.replace(/\s+/g, ' ')
        newObj = configGenerateRequestParams(JSON.parse(url))
      } else if (/^\s*fetch\(/.test(url)) {
        const matchResult = url.replace(/\n/g, '').match(/fetch\(\s*[^,]+\s*,\s*(\{.*\})\s*\)/)
        const option: UrlOption = matchResult?.[1] ? JSON.parse(matchResult[1]) : null
        url = url.replace(/\n/g, '').match(/fetch\("([^"]+)"/)?.[1] || ''
        if (option.method === 'GET') {
          newObj = URLparse(values.path)
        } else if (option.method === 'POST') {
          newObj = optionsParse(url, option)
        }
      } else {
        newObj = URLparse(url)
      }

      httpCode = generateCode('http', newObj)
      insHttpCode = generateCode('insHttp', newObj)
      setHttpCode(httpCode)
      setInsHttpCode(insHttpCode)
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
      throw err
    }
    return {
      requestParams: newObj,
      httpCode,
      insHttpCode,
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deParserPath = useCallback(debounce(parserPath, 300, { leading: true, trailing: true }), [])
  const { copyText } = useCopy()
  function copy(node: string, text: string) {
    copyText(node, text, messageApi)
  }
  const handleFinish: FormProps<ApiDetails>['onFinish'] = (values) => {
    // 保存有三种,  接口保存/快捷请求保存/接口用例保存
    // const values: ApiDetails = form.getFieldsValue(true) // 获取所有值，包括未绑定的
    const menuName = values.name || DEFAULT_NAME
    const menuItemId = nanoid(6)
    if (isCreating) {
      if (contentType === MenuItemType.ApiCase) {
        void show(ModalSaveMenu, {
          id: menuItemId,
          name: menuName,
          type: MenuItemType.ApiDetail,
          data: { ...initialCreateApiDetailsData, ...values, name: menuName },
          onOk: (data) => {
            addTabItem(
              {
                key: data.id,
                label: data.name,
                contentType: data.type,
              },
              { replaceTab: data.parentId }
            )
          },
        })
        return
      }
      addMenuItem({
        parentId: tabData.data?.id as string,
        id: menuItemId,
        name: menuName,
        type: contentType,
        data: { ...values, name: menuName },
      })
      addTabItem(
        {
          key: menuItemId,
          label: menuName,
          contentType: contentType,
        },
        { replaceTab: tabData.key }
      )
      console.log('保存的数据', isCreating, {
        parentId: tabData.data?.id as string,
        id: tabData.key,
        name: menuName,
        type: contentType,
        data: { ...values, name: menuName },
      })
    } else {
      updateMenuItem({
        id: tabData.key,
        name: menuName,
        data: { ...values, name: menuName },
      })
      console.log('保存的数据', isCreating, {
        parentId: tabData.data?.id as string,
        id: tabData.key,
        name: menuName,
        type: contentType,
        data: { ...values, name: menuName },
      })
      messageApi.success('保存成功')
    }
  }
  const save = (type: string) => {
    const values: ApiDetails = form.getFieldsValue()
    const menuName = values.name || DEFAULT_NAME
    const menuItemId = nanoid(6)
    console.log('values=>>>', values)
    if (type === 'api') {
      void show(ModalSaveMenu, {
        id: menuItemId,
        name: menuName,
        type: MenuItemType.ApiDetail,
        data: { ...initialCreateApiDetailsData, ...values, name: menuName },
        onOk: (data) => {
          addTabItem(
            {
              key: data.id,
              label: data.name,
              contentType: data.type,
            },
            { replaceTab: data.parentId }
          )
        },
      })
    } else if (type === 'case') {
      addMenuItem({
        parentId: tabData.key,
        id: menuItemId,
        name: menuName,
        type: MenuItemType.ApiCase,
        data: { ...values, name: menuName },
      })
      addTabItem(
        {
          key: menuItemId,
          label: menuName,
          contentType: MenuItemType.ApiCase,
        },
        { replaceTab: tabData.key }
      )
    }
  }
  const handleValuesChange = (
    changedValues: Partial<ApiDetails>,
    allValues: { requestParams?: any }
  ) => {
    if ('requestParams' in changedValues) {
      console.log('allValues=>>>>>>>>>>>>', allValues)
      try {
        setHttpCode(generateCode('http', allValues.requestParams))
        setInsHttpCode(generateCode('insHttp', allValues.requestParams))
      } catch (err) {
        console.error(err)
      }
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deHandleValuesChange = useCallback(
    debounce(handleValuesChange, 300, { leading: true, trailing: true }),
    []
  )
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
        }}
        onFinish={(values) => {
          handleFinish(values)
        }}
        onValuesChange={deHandleValuesChange}
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
              <Input
                placeholder="可填入完整URL 或者 copy as fetch  或者 从接口管理平台复制"
                onChange={deParserPath}
              />
            </Form.Item>
          </Space.Compact>

          <Space className="ml-auto pl-2">
            <Button htmlType="button" type="primary" onClick={testRequest}>
              发送
            </Button>
            <Button htmlType="submit">保存</Button>
            {contentType === MenuItemType.ApiDetail && (
              <Button
                onClick={() => {
                  save('case')
                }}
              >
                保存为用例
              </Button>
            )}
            {contentType === MenuItemType.HttpRequest && (
              <Button
                onClick={() => {
                  save('api')
                }}
              >
                保存为接口
              </Button>
            )}
          </Space>
        </div>

        <div className="flex-1 overflow-y-auto p-tabContent">
          <Form.Item noStyle name="name">
            <InputUnderline placeholder={DEFAULT_NAME} />
          </Form.Item>
          <GroupTitle className="mt-2">基础信息</GroupTitle>
          <div className="pt-2">
            <WsTypeFormItems showAll={true} />
          </div>
          <GroupTitle className="mt-2">请求参数</GroupTitle>
          <Form.Item noStyle name={['requestParams', 'parameters']}>
            <CreateParamsTab />
          </Form.Item>
          <GroupTitle className="mb-3 mt-8 font-semibold">返回响应</GroupTitle>
          <div>
            <Tooltip title="双击复制URL">
              <span
                className="cursor-pointer"
                id="_currentURL"
                onDoubleClick={() => {
                  copy('#_currentURL', currentURL)
                }}
              >
                接口URL:{currentURL}
              </span>
            </Tooltip>
          </div>
          <Form.Item hidden noStyle name="responses"></Form.Item>
          <Form.Item noStyle name="responseExamples">
            <RunResponseTab
              contentType={contentType}
              httpCode={httpCode}
              insHttpCode={insHttpCode}
              result={result}
            />
          </Form.Item>
        </div>
      </Form>
    </>
  )
}
