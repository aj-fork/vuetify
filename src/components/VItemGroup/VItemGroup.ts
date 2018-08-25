import Proxyable from '../../mixins/proxyable'
import { provide as RegistrableProvide } from '../../mixins/registrable'

// Utilities
import mixins from '../../util/mixins'
import { consoleWarn } from '../../util/console'

// Types
import Vue, { VNode } from 'vue/types'

interface Toggleable extends Vue {
  toggle: Function
  value: undefined | null | number | string
}

/* @vue/component */
export default mixins(
  Proxyable('inputValue'),
  RegistrableProvide('group')
).extend({
  name: 'v-item-group',

  props: {
    mandatory: Boolean,
    max: {
      type: [Number, String],
      default: null
    },
    multiple: Boolean
  },

  data () {
    return {
      items: [] as Toggleable[],
      // As long as a value is defined, show it
      // Otherwise, check if multiple
      // to determine which default to provide
      internalLazyValue: this.value !== undefined
        ? this.value
        : this.multiple ? [] : undefined
    }
  },

  computed: {
    selectedItems (): Toggleable[] {
      return this.items.filter((item, index) => {
        const value = this.getValue(item, index)

        return this.multiple
          ? (this.internalValue || []).includes(value)
          : this.internalValue === value
      })
    },
    toggleMethod (): Function {
      if (!this.multiple) {
        return (v: any) => this.internalValue === v
      }

      if (Array.isArray(this.internalValue)) {
        return (v: any) => (this.internalValue || []).includes(v)
      }

      return () => false
    }
  },

  watch: {
    internalValue: 'updateItemsState'
  },

  created () {
    if (this.multiple && !Array.isArray(this.inputValue)) {
      consoleWarn('Model must be bound to an array if the multiple property is true.', this)
    }
  },

  mounted () {
    this.updateItemsState()
  },

  methods: {
    getValue (item: Toggleable, i: number | undefined): any {
      return item.value != null ? item.value : i
    },
    onClick (index: number) {
      const value = this.getValue(this.items[index], index)

      this.multiple
        ? this.updateMultiple(value)
        : this.updateSingle(value)
    },
    register (item: Toggleable) {
      const index = this.items.push(item) - 1

      item.$on('click', () => this.onClick(index))
    },
    updateItemsState () {
      if (this.mandatory &&
        !this.selectedItems.length &&
        this.items.length > 0
      ) {
        this.internalValue = this.getValue(this.items[0], 0)
        return
      }

      this.items.forEach((item, i) => {
        if (typeof item.toggle !== 'function') {
          consoleWarn('Registered item is missing a toggle function', item)
        }

        const value = this.getValue(item, i)

        item.toggle(this.toggleMethod(value))
      })
    },
    updateMultiple (value: any) {
      const internalValue = (this.internalValue || []).slice() as string[]
      const index = internalValue.findIndex(val => val === value)

      if (
        this.mandatory &&
        // Item already exists
        index > -1 &&
        // value would be reduced below min
        internalValue.length - 1 < 1
      ) return

      if (
        // Max is set
        this.max != null &&
        // Item doesn't exist
        index < 0 &&
        // value woudl be increased above max
        internalValue.length + 1 > this.max
      ) return

      index > -1
        ? internalValue.splice(index, 1)
        : internalValue.push(value)

      this.internalValue = internalValue
    },
    updateSingle (value: any) {
      if (this.mandatory &&
        value === this.internalValue
      ) return

      this.internalValue = value
    },
    unregister (item: Toggleable) {
      this.items = this.items.filter(i => i._uid !== item._uid)
    }
  },

  render (h): VNode {
    return h('div', {
      staticClass: 'v-group-toggle'
    }, this.$slots.default)
  }
})
