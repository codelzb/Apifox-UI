import { show } from '@ebay/nice-modal-react'
import { Button, type ButtonProps, Space } from 'antd'
import { ArrowLeftToLine, ArrowRightToLine, GithubIcon, ShirtIcon } from 'lucide-react'

import { IconText } from '@/components/IconText'
import { ModalSettings } from '@/components/modals/ModalSettings'
import { useLayoutContext } from '@/contexts/layout-settings'

function SmallButton({ children, ...props }: React.PropsWithChildren<ButtonProps>) {
  return (
    <Button size="small" type="text" {...props}>
      {children}
    </Button>
  )
}

export function FooterBar() {
  const { panelRef, isSideMenuCollapsed } = useLayoutContext()

  return (
    <div className="flex h-full items-center pl-3 pr-6">
      {isSideMenuCollapsed ? (
        <SmallButton
          onClick={() => {
            panelRef.current?.expand()
          }}
        >
          <IconText icon={<ArrowRightToLine size={18} />} />
        </SmallButton>
      ) : (
        <SmallButton
          onClick={() => {
            panelRef.current?.collapse()
          }}
        >
          <IconText icon={<ArrowLeftToLine size={18} />} />
        </SmallButton>
      )}

      <Space className="ml-auto flex items-center" size={0}>
        <SmallButton
          onClick={() => {
            void show(ModalSettings)
          }}
        >
          <IconText icon={<ShirtIcon size={14} />} />
        </SmallButton>

        <SmallButton href="https://github.com/Codennnn/Apifox-UI" target="_blank">
          <IconText icon={<GithubIcon size={14} />} />
        </SmallButton>
      </Space>
    </div>
  )
}
