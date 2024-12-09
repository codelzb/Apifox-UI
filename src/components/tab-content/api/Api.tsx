import { useMemo, useState } from 'react'

import { Button, ConfigProvider, Tabs, type TabsProps, theme, Tooltip } from 'antd'
import { PanelRightIcon } from 'lucide-react'

import { PageTabStatus } from '@/components/ApiTab/ApiTab.enum'
import { ApiTabContentWrapper } from '@/components/ApiTab/ApiTabContentWrapper'
import { useTabContentContext } from '@/components/ApiTab/TabContentContext'
import { IconText } from '@/components/IconText'
import { ApiCreateRequest } from '@/components/tab-content/api/ApiCreateRequest'

import { ApiDoc } from './ApiDoc'
import { ApiDocEditing } from './ApiDocEditing'
import { ApiSidePanel } from './ApiSidePanel'

export function Api() {
  const { token } = theme.useToken()

  const { tabData } = useTabContentContext()

  const [panelOpen, setPanelOpen] = useState(false)

  const [pageTabActive, setPageTabActive] = useState('docEdit')
  const apiTabItems = useMemo<TabsProps['items']>(() => {
    return [
      {
        key: 'doc',
        label: '文档',
        children: (
          <ApiTabContentWrapper>
            <ApiDoc setPageTabActive={setPageTabActive} />
          </ApiTabContentWrapper>
        ),
      },
      {
        key: 'docEdit',
        label: '修改文档',
        children: (
          <ApiTabContentWrapper>
            <ApiDocEditing setPageTabActive={setPageTabActive} />
          </ApiTabContentWrapper>
        ),
      },
      {
        key: 'run',
        label: '运行',
        children: (
          <ApiTabContentWrapper>
            <ApiCreateRequest />
          </ApiTabContentWrapper>
        ),
      },
    ]
  }, [])

  return (
    <div className="h-full overflow-hidden">
      <ConfigProvider
        theme={{
          components: {
            Form: {
              labelColor: token.colorTextSecondary,
              verticalLabelPadding: 0,
            },
          },
        }}
      >
        {tabData.data?.tabStatus === PageTabStatus.Create ? (
          <ApiTabContentWrapper>
            <ApiDocEditing />
          </ApiTabContentWrapper>
        ) : (
          <div className="flex h-full overflow-hidden">
            <Tabs
              activeKey={pageTabActive}
              animated={false}
              className="api-details-tabs flex-1"
              items={apiTabItems}
              tabBarExtraContent={
                <>
                  <Tooltip placement="topLeft" title="历史记录、SEO 设置">
                    <Button
                      size="small"
                      style={{
                        backgroundColor: panelOpen ? token.colorFillSecondary : undefined,
                      }}
                      type="text"
                      onClick={() => {
                        setPanelOpen(!panelOpen)
                      }}
                    >
                      <IconText icon={<PanelRightIcon size={18} />} />
                    </Button>
                  </Tooltip>
                </>
              }
              onTabClick={(tabKey) => {
                setPageTabActive(tabKey)
              }}
            />

            <ApiSidePanel
              open={panelOpen}
              onClose={() => {
                setPanelOpen(false)
              }}
            />
          </div>
        )}
      </ConfigProvider>
    </div>
  )
}
