// Mixins
import { inject as RegistrableInject } from './registrable'

// Utilities
import mixins from '../util/mixins'
import { consoleWarn } from '../util/console'

export default mixins(
  RegistrableInject('group')
).extend({
  name: 'groupable',

  props: {
    activeClass: String
  },

  data: () => ({
    isActive: false
  }),

  created () {
    if (!('value' in this)) {
      consoleWarn('Implementing component is missing a value property', this)
    }

    this.group && this.group.register(this)
  },

  beforeDestroy () {
    this.group && this.group.unregister(this)
  },

  methods: {
    toggle (isActive: boolean) {
      this.isActive = isActive
    }
  }
})
