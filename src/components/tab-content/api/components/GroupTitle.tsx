import { theme, Typography } from 'antd'

import { css } from '@emotion/css'

export function GroupTitle(props: React.PropsWithChildren<{ className?: string }>) {
  const { token } = theme.useToken()
  return (
    <div className={`${props.className || ''} text-base font-medium`}>
      <div
        className={[
          'inline-block',
          'h-3',
          'w-[2px]',
          'mr-[5px]',
          css`
            background-color: ${token.colorPrimary};
          `,
        ].join(' ')}
      ></div>
      <Typography.Text className="!text-base">{props.children}</Typography.Text>
    </div>
  )
}
