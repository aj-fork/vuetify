// Styles
import '../../stylus/components/_tabs.styl'

// Component level mixins
import TabsComputed from './mixins/tabs-computed'
import TabsGenerators from './mixins/tabs-generators'
import TabsProps from './mixins/tabs-props'
import TabsTouch from './mixins/tabs-touch'
import TabsWatchers from './mixins/tabs-watchers'

// Extensions
import VItemGroup from '../VItemGroup'

// Mixins
import Colorable from '../../mixins/colorable'
import SSRBootable from '../../mixins/ssr-bootable'
import Themeable from '../../mixins/themeable'

// Directives
import Resize from '../../directives/resize'
import Touch from '../../directives/touch'

/* @vue/component */
export default {
  name: 'v-tabs',

  directives: {
    Resize,
    Touch
  },

  extends: VItemGroup,

  mixins: [
    Colorable,
    SSRBootable,
    TabsComputed,
    TabsProps,
    TabsGenerators,
    TabsTouch,
    TabsWatchers,
    Themeable
  ],

  provide () {
    return {
      tabs: this,
      tabProxy: this.tabProxy,
      registerItems: this.registerItems,
      unregisterItems: this.unregisterItems
    }
  },

  data () {
    return {
      bar: [],
      content: [],
      isBooted: false,
      isOverflowing: false,
      nextIconVisible: false,
      prevIconVisible: false,
      resizeTimeout: null,
      reverse: false,
      scrollOffset: 0,
      sliderWidth: null,
      sliderLeft: null,
      startX: 0,
      tabsContainer: null,
      tabs: [],
      tabItems: null,
      transitionTime: 300,
      widths: {
        bar: 0,
        container: 0,
        wrapper: 0
      }
    }
  },

  computed: {
    isDark () {
      // Always inherit from parent
      return this.theme.isDark
    },
    selfIsDark () {
      return Themeable.options.computed.isDark.call(this)
    },
    themeClasses () {
      return {
        'theme--dark': this.selfIsDark,
        'theme--light': !this.selfIsDark
      }
    }
  },

  watch: {
    tabs: 'onResize'
  },

  methods: {
    checkIcons () {
      this.prevIconVisible = this.checkPrevIcon()
      this.nextIconVisible = this.checkNextIcon()
    },
    checkPrevIcon () {
      return this.scrollOffset > 0
    },
    checkNextIcon () {
      // Check one scroll ahead to know the width of right-most item
      return this.widths.container > this.scrollOffset + this.widths.wrapper
    },
    callSlider () {
      if (this.hideSlider) return false

      this.$nextTick(() => {
        if (!this.activeTab || !this.activeTab.$el) return

        this.sliderWidth = this.activeTab.$el.scrollWidth
        this.sliderLeft = this.activeTab.$el.offsetLeft
      })
    },
    init () {
      this.checkIcons()
      this.findActiveLink()
      this.updateItemsState()
    },
    /**
     * When v-navigation-drawer changes the
     * width of the container, call resize
     * after the transition is complete
     */
    onResize () {
      if (this._isDestroyed) return

      this.setWidths()

      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => {
        this.callSlider()
        this.scrollIntoView()
        this.checkIcons()
      }, this.transitionTime)
    },
    overflowCheck (e, fn) {
      this.isOverflowing && fn(e)
    },
    scrollTo (direction) {
      this.scrollOffset = this.newOffset(direction)
    },
    setOverflow () {
      this.isOverflowing = this.widths.bar < this.widths.container
    },
    setWidths () {
      const bar = this.$refs.bar ? this.$refs.bar.clientWidth : 0
      const container = this.$refs.container ? this.$refs.container.clientWidth : 0
      const wrapper = this.$refs.wrapper ? this.$refs.wrapper.clientWidth : 0

      this.widths = { bar, container, wrapper }

      this.setOverflow()
    },
    findActiveLink () {
      const index = this.items.findIndex(item => {
        const link = item.$refs.link
        const target = link._isVue ? link.$el : link

        return (
          item.activeClass &&
          item.to &&
          target.classList.contains(item.activeClass)
        )
      })

      if (index > -1) {
        this.internalValue = this.getValue(this.items[index], index)
      }
    },
    parseNodes () {
      const item = []
      const items = []
      const slider = []
      const tab = []
      const length = (this.$slots.default || []).length

      for (let i = 0; i < length; i++) {
        const vnode = this.$slots.default[i]

        if (vnode.componentOptions) {
          switch (vnode.componentOptions.Ctor.options.name) {
            case 'v-tabs-slider': slider.push(vnode)
              break
            case 'v-tabs-items': items.push(vnode)
              break
            case 'v-tab-item': item.push(vnode)
              break
            // case 'v-tab' - intentionally omitted
            default: tab.push(vnode)
          }
        } else {
          tab.push(vnode)
        }
      }

      return { tab, slider, items, item }
    },
    scrollIntoView () {
      if (!this.activeTab) return
      if (!this.isOverflowing) return (this.scrollOffset = 0)

      const totalWidth = this.widths.wrapper + this.scrollOffset
      const { clientWidth, offsetLeft } = this.activeTab.$el
      const itemOffset = clientWidth + offsetLeft
      let additionalOffset = clientWidth * 0.3
      if (this.activeIndex === this.items.length - 1) {
        additionalOffset = 0 // don't add an offset if selecting the last tab
      }

      /* istanbul ignore else */
      if (offsetLeft < this.scrollOffset) {
        this.scrollOffset = Math.max(offsetLeft - additionalOffset, 0)
      } else if (totalWidth < itemOffset) {
        this.scrollOffset -= totalWidth - itemOffset - additionalOffset
      }
    },
    tabProxy (val) {
      this.inputValue = val
    },
    registerItems (fn) {
      this.tabItems = fn
    },
    unregisterItems () {
      this.tabItems = null
    }
  },

  render (h) {
    const { tab, slider, items, item } = this.parseNodes()

    return h('div', {
      staticClass: 'v-tabs',
      directives: [{
        name: 'resize',
        arg: 400,
        modifiers: { quiet: true },
        value: this.onResize
      }]
    }, [
      this.genBar([this.hideSlider ? null : this.genSlider(slider), tab]),
      this.genItems(items, item)
    ])
  }
}
