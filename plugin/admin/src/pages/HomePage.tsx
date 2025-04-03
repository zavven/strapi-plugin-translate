import { Layouts } from '@strapi/admin/strapi-admin'

import PluginHeader from '../components/PluginHeader'
import PluginPage from '../components/PluginPage'

const HomePage = () => {
  return (
    <Layouts.Root>
      <PluginHeader />
      <Layouts.Content>
        <PluginPage />
      </Layouts.Content>
    </Layouts.Root>
  )
}

export { HomePage }
