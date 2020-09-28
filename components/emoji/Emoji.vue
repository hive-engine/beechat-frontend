<script>
import data from 'emoji-mart-vue-fast/data/twitter.json'
import { EmojiIndex } from 'emoji-mart-vue-fast/src/utils/emoji-data'
import EmojiMartEmoji from 'emoji-mart-vue-fast/src/components/Emoji'
import { EmojiProps } from 'emoji-mart-vue-fast/src/utils/shared-props'

export default {
  functional: true,
  props: {
    ...EmojiProps,
    data: {
      type: Object,
      default () {
        const index = new EmojiIndex(data)
        return index
      }
    }
  },
  render (h, ctx) {
    const { data, props, children } = ctx

    return h(EmojiMartEmoji, { ...data, props }, children)
  }
}
</script>
