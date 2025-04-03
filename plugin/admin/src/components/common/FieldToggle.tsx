import { Field, Toggle } from '@strapi/design-system'
import React from 'react'
import { useIntl } from 'react-intl'
import { getTranslation } from '../../utils'

export const FieldToggle: React.FC<{
  checked: boolean
  onChange: (publish: boolean) => void
  label?: string
  hint?: string
}> = ({ checked, onChange, label, hint }) => {
  const { formatMessage } = useIntl()
  return (
    <Field.Root name="auto-publish" hint={hint} width={'100%'}>
      <Field.Label>
        {label ||
          formatMessage({
            id: getTranslation('common.field.toggle.label'),
            defaultMessage: 'Toggle',
          })}
      </Field.Label>
      <Toggle
        onLabel="True"
        offLabel="False"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Field.Hint />
    </Field.Root>
  )
}
