import { useEffect, useState } from 'react'

import { CloseCircleFilled, UploadOutlined } from '@ant-design/icons'
import { Button, DatePicker, Input, Select, theme, Tooltip, Upload } from 'antd'
import { nanoid } from 'nanoid'

import { DoubleCheckRemoveBtn } from '@/components/DoubleCheckRemoveBtn'
import { EditableTable, type EditableTableProps } from '@/components/EditableTable'
import { PARAMS_CONFIG } from '@/configs/static'
import { useGlobalContext } from '@/contexts/global'
import { ParamType } from '@/enums'
import { useStyles } from '@/hooks/useStyle'
import type { Parameter } from '@/types'

import { css } from '@emotion/css'

interface ParamsEditableTableProps extends Pick<EditableTableProps, 'autoNewRow'> {
  value?: Parameter[]
  onChange?: (value: ParamsEditableTableProps['value']) => void
  removable?: boolean
  isPathParamsTable?: boolean
}

export function ParamsEditableTable(props: ParamsEditableTableProps) {
  const { token } = theme.useToken()

  const {
    value,
    onChange,
    isPathParamsTable = false,
    autoNewRow = !isPathParamsTable,
    removable = true,
  } = props
  const newRowRecordId = nanoid(6)
  const { messageApi } = useGlobalContext()

  const handleChange = (v: Partial<Record<keyof Parameter, any>>, idx: number) => {
    const target = value?.at(idx)
    if (!(target?.id || v.id)) {
      messageApi.error('请先输入参数名')
      return
    }
    if (target?.id && target.id !== newRowRecordId) {
      onChange?.(
        value?.map((it, i) => {
          if (i === idx) {
            return { ...it, ...v }
          }

          return it
        })
      )
    } else {
      onChange?.([
        ...(value || []),
        {
          id: '',
          ...target,
          ...v,
          type: ParamType.String,
        },
      ])
    }
  }

  const [required, setRequired] = useState(false)

  useEffect(() => {
    let flag = true
    value?.forEach((item) => {
      flag = flag && !!item.required
    })
    setRequired(flag)
  }, [value])
  const Must = (
    props: Partial<Record<keyof Parameter, any>> & { idx: number; isTop?: boolean }
  ) => {
    return (
      <div
        className={[
          'flex',
          'size-5',
          'items-center',
          'justify-center',
          'rounded-md',
          'cursor-pointer',
          props.isTop ? 'absolute right-[8px]' : '',
          css`
            opacity: ${props.isTop ? (required ? 1 : 0) : 1};
            &:hover {
              opacity: 1;
            }
          `,
        ].join(' ')}
        style={{ background: 'rgba(86,87,88,0.04)' }}
        onClick={() => {
          if (props.isTop) {
            if (value) {
              onChange?.(
                value.map((it) => {
                  return { ...it, required: !required }
                })
              )
              setRequired(!required)
            }
          } else {
            handleChange({ required: !props.required }, props.idx)
          }
        }}
      >
        <span
          style={{
            color: props.isTop && required ? 'red' : props.required ? 'red' : '#333',
            fontSize: '20px',
            marginTop: '5px',
          }}
        >
          *
        </span>
      </div>
    )
  }

  const { styles } = useStyles(({ token }) => {
    return {
      select: css({
        '.ant-select-arrow': {
          pointerEvents: 'auto',
        },
        '.ant-select-selector': {
          paddingLeft: '0px !important',
        },
      }),
    }
  })

  const columns: EditableTableProps<Parameter>['columns'] = [
    {
      title: '参数名',
      dataIndex: 'name',
      width: '25%',
      render: (text, record, idx) => {
        const isNewRow = !record.id || record.id === newRowRecordId

        return (
          <div>
            <Tooltip
              open={isPathParamsTable ? undefined : false}
              title="自动提取接口路径里的 {param} 形式参数，请在接口路径中修改。"
            >
              <div className="flex items-center">
                <Input
                  placeholder="添加参数"
                  readOnly={isPathParamsTable}
                  value={typeof text === 'string' ? text : ''}
                  variant="borderless"
                  onChange={(ev) => {
                    handleChange({ id: record.id, name: ev.target.value }, idx)
                  }}
                />
                {!text && !isNewRow && (
                  <Tooltip title="参数名不能为空">
                    <span className="pr-1">
                      <CloseCircleFilled style={{ color: token.colorErrorText }} />
                    </span>
                  </Tooltip>
                )}
              </div>
            </Tooltip>
          </div>
        )
      },
    },
    {
      title: (row, i) => {
        return (
          <>
            <div className="relative flex items-center">
              <span>类型</span>
              <Must idx={0} isTop={true}></Must>
            </div>
          </>
        )
      },
      //'类型',
      dataIndex: 'type',
      width: 120,
      render: (text, record, idx) => {
        const isNewRow = !record.id || record.id === newRowRecordId

        return (
          <div className={isNewRow ? 'opacity-0 hover:opacity-100' : ''}>
            <Select
              className={[
                'w-full',
                '[&.ant-select_.ant-select-selector]:text-inherit]',
                styles.select,
              ].join(' ')}
              options={[
                { label: 'String', value: ParamType.String },
                { label: 'Int32', value: ParamType.Int32 },
                { label: 'Float', value: ParamType.Float },
                { label: 'Double', value: ParamType.Double },
                { label: 'Boolean', value: ParamType.Boolean },
                { label: 'DateTime', value: ParamType.DateTime },
                { label: 'Byte[]', value: ParamType.Byte },
                { label: 'Array', value: ParamType.Array, hidden: isPathParamsTable },
              ].filter((it) => !it.hidden)}
              popupClassName="min-w-[90px]"
              style={{
                color:
                  typeof text === 'string'
                    ? `var(${PARAMS_CONFIG[text as ParamType].varColor})`
                    : '',
              }}
              suffixIcon={<Must {...record} idx={idx} />}
              value={typeof text === 'string' ? text : ''}
              variant="borderless"
              onChange={(val) => {
                handleChange({ type: val }, idx)
              }}
            />
          </div>
        )
      },
    },
    {
      title: '示例值',
      dataIndex: 'example',
      width: '25%',
      render: (text, _, idx) => {
        if (_.type === ParamType.DateTime) {
          return (
            <DatePicker
              showTime
              className="size-full !rounded-none"
              onChange={(value, dateString) => {
                handleChange({ example: dateString }, idx)
              }}
            />
          )
        } else if (_.type === ParamType.Byte) {
          return (
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              onChange={(info) => {
                const inputFile: any = info.file
                if (inputFile) {
                  console.log('inputFile', inputFile)
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    handleChange({ example: e.target?.result }, idx)
                  }
                  reader.readAsArrayBuffer(inputFile as Blob)
                } else {
                  messageApi.error('文件选择失败')
                  return
                }
              }}
            >
              <Button icon={<UploadOutlined />}>点击导入</Button>
            </Upload>
          )
        }
        return (
          <Input
            value={typeof text === 'string' ? text : undefined}
            variant="borderless"
            onChange={(ev) => {
              handleChange({ example: ev.target.value }, idx)
            }}
          />
        )
      },
    },
    {
      title: '说明',
      dataIndex: 'description',
      width: '40%',
      render: (text, _, idx) => {
        return (
          <div className="py-0">
            <Input.TextArea
              autoSize
              style={{
                height: '32px',
                maxHeight: '100px',
                overflowY: 'hidden',
                resize: 'none',
              }}
              value={typeof text === 'string' ? text : undefined}
              variant="borderless"
              onChange={(ev) => {
                handleChange({ description: ev.target.value }, idx)
              }}
            />
          </div>
        )
      },
    },
    {
      width: 90,
      render: (_, record, idx) => {
        const isNewRow = !record.id || record.id === newRowRecordId

        if (!isNewRow && removable) {
          return (
            <div className="flex justify-center p-1 text-xs">
              <DoubleCheckRemoveBtn
                onRemove={() => {
                  onChange?.(value?.filter((_, i) => i !== idx))
                }}
              />
            </div>
          )
        }
      },
    },
  ]

  return (
    <EditableTable<Parameter>
      autoNewRow={autoNewRow}
      columns={columns}
      dataSource={value}
      newRowRecord={{
        id: newRowRecordId,
        type: ParamType.String,
      }}
    />
  )
}
