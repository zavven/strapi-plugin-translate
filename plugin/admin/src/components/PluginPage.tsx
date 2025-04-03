import { memo } from 'react'
import { Flex } from '@strapi/design-system'
import { CollectionTable } from './Collection'
import UsageOverview from './Usage'

const PluginPage = () => {
  return (
    <Flex gap={4} direction="column" alignItems="stretch">
      <CollectionTable />
      <UsageOverview />
    </Flex>
  )
}

export default memo(PluginPage)
