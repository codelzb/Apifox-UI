import { Tooltip } from 'antd'
import { MoreHorizontalIcon, PlusIcon } from 'lucide-react'

import { DropdownActions } from '@/components/ApiMenu/DropdownActions'
import { API_MENU_CONFIG } from '@/configs/static'
import { MenuItemType } from '@/enums'
import { getCatalogType, getCreateType } from '@/helpers'
import { useHelpers } from '@/hooks/useHelpers'

import type { ApiMenuData } from './ApiMenu.type'
import { MenuActionButton } from './MenuActionButton'

/**
 * 菜单项的文件夹操作(添加和更多)。
 * 如果不是接口详情 才显示添加
 */
export function FolderAction(props: { catalog: ApiMenuData; isCaseFolder: boolean }) {
  const { catalog, isCaseFolder = false } = props

  const catalogType = getCatalogType(catalog.type)
  const { tipTitle } = API_MENU_CONFIG[catalogType]

  const { createTabItem } = useHelpers()

  return (
    <>
      {catalog.type !== MenuItemType.ApiDetail && (
        <Tooltip title={tipTitle}>
          <MenuActionButton
            icon={<PlusIcon size={14} />}
            onClick={(ev) => {
              ev.stopPropagation()
              createTabItem(getCreateType(catalog.type), catalog)
            }}
          />
        </Tooltip>
      )}

      <DropdownActions isFolder catalog={catalog} isCaseFolder={isCaseFolder}>
        <MenuActionButton
          icon={<MoreHorizontalIcon size={14} />}
          onClick={(ev) => {
            ev.stopPropagation()
          }}
        />
      </DropdownActions>
    </>
  )
}
