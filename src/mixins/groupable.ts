// Mixins
import { inject as RegistrableInject } from './registrable'

// Utilities
import mixins from '../util/mixins'
import { consoleWarn } from '../util/console'

export default mixins(
  RegistrableInject('group', 'v-tab', 'v-group-item')
).extend({
  name: 'groupable',

  props: {
    activeClass: String
  },

  data: () => ({
    isActive: false
  }),

  created () {
    if (typeof (this as any).value === 'undefined') {
      consoleWarn('Implementing component is missing a value property', this)
    }
    this.group.register(this)
  },

  beforeDestroy () {
    this.group.unregister(this)
  },

  methods: {
    toggle (isActive: boolean) {
      this.isActive = isActive
    }
  }
})
