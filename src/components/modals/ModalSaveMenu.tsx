import { useEffect, useRef } from 'react'

import { create, useModal } from '@ebay/nice-modal-react'
import { Form, Input, type InputRef, Modal, type ModalProps } from 'antd'
import { nanoid } from 'nanoid'

import type { ApiMenuData } from '@/components/ApiMenu/ApiMenu.type'
import { SelectorCatalog } from '@/components/SelectorCatalog'
import { ROOT_CATALOG } from '@/configs/static'
import { useMenuHelpersContext } from '@/contexts/menu-helpers'
import { useMenuTabHelpers } from '@/contexts/menu-tab-settings'
import { MenuItemType } from '@/enums'

type FormData = ApiMenuData

export const ModalSaveMenu = create(
  (props: ApiMenuData & { onOk: (data: ApiMenuData) => void }) => {
    const { type } = props
    const modal = useModal()

    const [form] = Form.useForm<FormData>()

    useEffect(() => {
      form.setFieldsValue(props)
    }, [form, props])

    const { addMenuItem } = useMenuHelpersContext()
    const { addTabItem } = useMenuTabHelpers()
    const handleHide = () => {
      form.resetFields()
      void modal.hide()
    }

    const inputRef = useRef<InputRef>(null)

    return (
      <Modal
        title="保存到..."
        width={400}
        {...props}
        afterOpenChange={(...parmas) => {
          const opened = parmas.at(0)

          if (opened) {
            inputRef.current?.focus()
          }
        }}
        open={modal.visible}
        onCancel={(...parmas) => {
          handleHide()
        }}
        onOk={() => {
          form.validateFields().then((values) => {
            const data = {
              id: props.id,
              data: props.data,
              type: props.type,
              name: values.name,
              parentId: values.parentId === ROOT_CATALOG ? undefined : values.parentId,
            } as ApiMenuData
            addMenuItem(data)
            props.onOk(data)
            handleHide()
          })
        }}
      >
        <Form<FormData>
          form={form}
          initialValues={{
            parentId: ROOT_CATALOG,
          }}
          layout="vertical"
        >
          <Form.Item label="名称" name="name" rules={[{ required: true }]}>
            <Input ref={inputRef} />
          </Form.Item>

          <Form.Item label="目标目录" name="parentId" rules={[{ required: true }]}>
            <SelectorCatalog
              placeholder="保存到..."
              type={
                type === MenuItemType.ApiDetail || type === MenuItemType.ApiCase
                  ? MenuItemType.ApiDetailFolder
                  : type === MenuItemType.ApiSchema
                    ? MenuItemType.ApiSchemaFolder
                    : type
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    )
  }
)
