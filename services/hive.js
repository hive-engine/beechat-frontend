import { Client } from '@hiveio/dhive'
import { NODES } from '@/config'

const client = new Client(NODES)

export * from '@hiveio/dhive'

export const getClient = () => client

export default {
  getClient
}
