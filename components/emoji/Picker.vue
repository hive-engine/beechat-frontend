<script>
import data from 'emoji-mart-vue-fast/data/twitter.json'
import { EmojiIndex } from 'emoji-mart-vue-fast/src/utils/emoji-data'
import EmojiMartPicker from 'emoji-mart-vue-fast/src/components/Picker'

import { PickerProps } from 'emoji-mart-vue-fast/src/utils/shared-props'

const index = new EmojiIndex(data)

export default {
  functional: true,
  props: {
    ...PickerProps,
    data: {
      type: Object,
      default () {
        return index
      }
    }
  },
  render (h, ctx) {
    const { data, props, children } = ctx

    return h(EmojiMartPicker, { ...data, props }, children)
  }
}
</script>
