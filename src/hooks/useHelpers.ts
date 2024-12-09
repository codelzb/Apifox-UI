import { nanoid } from 'nanoid'

import type { ApiMenuData } from '@/components/ApiMenu/ApiMenu.type'
import { PageTabStatus } from '@/components/ApiTab/ApiTab.enum'
import type { ApiTabItem } from '@/components/ApiTab/ApiTab.type'
import { API_MENU_CONFIG } from '@/configs/static'
import { useMenuTabHelpers } from '@/contexts/menu-tab-settings'
import { CatalogType, MenuItemType } from '@/enums'

export function useHelpers() {
  const { addTabItem } = useMenuTabHelpers()

  const createApiDetails = (
    payload?: ApiMenuData,
    config?: { autoActive?: boolean; replaceTab?: ApiTabItem['key'] }
  ) => {
    const { newLabel } = API_MENU_CONFIG[CatalogType.Http]

    addTabItem(
      {
        key: nanoid(6),
        label: newLabel,
        contentType: MenuItemType.ApiDetail,
        data: { ...payload, tabStatus: PageTabStatus.Create },
      },
      config
    )
  }

  const createApiCase = (
    payload?: ApiMenuData, //Partial<ApiTabItem>,
    config?: { autoActive?: boolean; replaceTab?: ApiTabItem['key'] }
  ) => {
    const { newLabel } = API_MENU_CONFIG[MenuItemType.ApiCase]
    addTabItem(
      {
        key: nanoid(6),
        label: newLabel,
        contentType: MenuItemType.ApiCase,
        data: { ...payload, tabStatus: PageTabStatus.Create },
      },
      config
    )
  }

  const createApiRequest = (
    payload?: ApiMenuData,
    config?: { autoActive?: boolean; replaceTab?: ApiTabItem['key'] }
  ) => {
    const { newLabel } = API_MENU_CONFIG[CatalogType.Request]

    addTabItem(
      {
        key: nanoid(6),
        label: newLabel,
        contentType: MenuItemType.HttpRequest,
        data: { ...payload, tabStatus: PageTabStatus.Create },
      },
      config
    )
  }

  const createDoc = (
    payload?: ApiMenuData,
    config?: { autoActive?: boolean; replaceTab?: ApiTabItem['key'] }
  ) => {
    addTabItem(
      {
        key: nanoid(6),
        label: '新建 Markdown',
        contentType: MenuItemType.Doc,
        data: { ...payload, tabStatus: PageTabStatus.Create },
      },
      config
    )
  }

  const createApiSchema = (
    payload?: ApiMenuData,
    config?: { autoActive?: boolean; replaceTab?: ApiTabItem['key'] }
  ) => {
    const { newLabel } = API_MENU_CONFIG[CatalogType.Schema]

    addTabItem(
      {
        key: nanoid(6),
        label: newLabel,
        contentType: MenuItemType.ApiSchema,
        data: { ...payload, tabStatus: PageTabStatus.Create },
      },
      config
    )
  }

  return {
    createApiDetails,
    createApiRequest,
    createDoc,
    createApiSchema,

    createTabItem: (t: MenuItemType, payload?: ApiMenuData) => {
      console.log('新建tab类型', t, '参数', payload)
      switch (t) {
        case MenuItemType.ApiDetail:
          createApiDetails(payload)
          break
        case MenuItemType.ApiCase:
          createApiCase(payload)
          break

        case MenuItemType.HttpRequest:
          createApiRequest(payload)
          break

        case MenuItemType.Doc:
          createDoc(payload)
          break

        case MenuItemType.ApiSchema:
          createApiSchema(payload)
          break
      }
    },
  }
}
