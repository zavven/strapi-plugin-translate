import {
  Field,
  SingleSelect,
  SingleSelectOption,
  MultiSelect,
  MultiSelectOption,
} from '@strapi/design-system'
import React from 'react'
import { useIntl } from 'react-intl'
import { getTranslation } from '../../utils'

type ValueType<T extends boolean> = T extends true ? string[] : string | null

type OnChangeType<T extends boolean> = (value: ValueType<T>) => void

type Props<T extends boolean> = {
  value: ValueType<T>
  options: { value: string; label: string }[]
  onChange: OnChangeType<T>
  multiple: T
  label?: string
  placeholder?: string
}

export const FieldSelection = <T extends boolean>({
  value,
  onChange,
  options,
  multiple,
  label,
  placeholder,
}: Props<T>) => {
  const { formatMessage } = useIntl()
  return (
    <Field.Root width="100%">
      <Field.Label>
        {label ||
          formatMessage({
            id: getTranslation('common.field.select.label'),
            defaultMessage: 'Select',
          })}
      </Field.Label>
      {multiple ? (
        <MultiSelect
          value={value as string[]}
          onChange={onChange as OnChangeType<true>}
          placeholder={placeholder}
        >
          {options.map((item) => (
            <MultiSelectOption key={item.value} value={item.value}>
              {item.label}
            </MultiSelectOption>
          ))}
        </MultiSelect>
      ) : (
        <SingleSelect
          value={value as string}
          // @ts-expect-error – the DS will handle numbers, but we're not allowing the API.
          onChange={onChange as OnChangeType<false>}
          placeholder={placeholder}
        >
          {options.map((item) => (
            <SingleSelectOption key={item.value} value={item.value}>
              {item.label}
            </SingleSelectOption>
          ))}
        </SingleSelect>
      )}
    </Field.Root>
  )
}
