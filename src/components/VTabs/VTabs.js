// Styles
import '../../stylus/components/_tabs.styl'

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
    Themeable
  ],

  // provide () {
  //   return {
  //     tabs: this,
  //     tabProxy: this.tabProxy,
  //     registerItems: this.registerItems,
  //     unregisterItems: this.unregisterItems
  //   }
  // },

  props: {
    alignWithTitle: Boolean,
    centered: Boolean,
    fixedTabs: Boolean,
    grow: Boolean,
    height: {
      type: [Number, String],
      default: undefined,
      validator: v => !isNaN(parseInt(v))
    },
    hideSlider: Boolean,
    horizontal: {
      type: Boolean,
      default: true
    },
    iconsAndText: Boolean,
    mandatory: {
      type: Boolean,
      default: true
    },
    mobileBreakPoint: {
      type: [Number, String],
      default: 1264,
      validator: v => !isNaN(parseInt(v))
    },
    nextIcon: {
      type: String,
      default: '$vuetify.icons.next'
    },
    prevIcon: {
      type: String,
      default: '$vuetify.icons.prev'
    },
    right: Boolean,
    showArrows: Boolean,
    sliderColor: {
      type: String,
      default: 'accent'
    },
    value: [Number, String]
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
    activeIndex () {
      if (this.selectedItems.length === 0) return -1

      return this.items.findIndex((item, index) => {
        return this.getValue(item, index) === this.internalValue
      })
    },
    activeTab () {
      if (!this.selectedItems.length) return undefined

      return this.selectedItems[0]
    },
    containerStyles () {
      return this.height ? {
        height: `${parseInt(this.height, 10)}px`
      } : null
    },
    hasArrows () {
      return (this.showArrows || !this.isMobile) && this.isOverflowing
    },
    isDark () {
      // Always inherit from parent
      return this.theme.isDark
    },
    isMobile () {
      return this.$vuetify.breakpoint.width < this.mobileBreakPoint
    },
    selfIsDark () {
      return Themeable.options.computed.isDark.call(this)
    },
    sliderStyles () {
      return {
        left: `${this.sliderLeft}px`,
        transition: this.sliderLeft != null ? null : 'none',
        width: `${this.sliderWidth}px`
      }
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
    // Generators
    // genBar (items) {
    //   return this.$createElement('div', this.setBackgroundColor(this.color, {
    //     staticClass: 'v-tabs__bar',
    //     'class': this.themeClasses,
    //     ref: 'bar'
    //   }), [
    //     this.genTransition('prev'),
    //     this.genWrapper(
    //       this.genContainer(items)
    //     ),
    //     this.genTransition('next')
    //   ])
    // },
    // genContainer (items) {
    //   return this.$createElement('div', {
    //     staticClass: 'v-tabs__container',
    //     class: {
    //       'v-tabs__container--align-with-title': this.alignWithTitle,
    //       'v-tabs__container--centered': this.centered,
    //       'v-tabs__container--fixed-tabs': this.fixedTabs,
    //       'v-tabs__container--grow': this.grow,
    //       'v-tabs__container--icons-and-text': this.iconsAndText,
    //       'v-tabs__container--overflow': this.isOverflowing,
    //       'v-tabs__container--right': this.right
    //     },
    //     style: this.containerStyles,
    //     ref: 'container'
    //   }, items)
    // },
    // genIcon (direction) {
    //   if (!this.hasArrows ||
    //     !this[`${direction}IconVisible`]
    //   ) return null

    //   return this.$createElement(VIcon, {
    //     staticClass: `v-tabs__icon v-tabs__icon--${direction}`,
    //     props: {
    //       disabled: !this[`${direction}IconVisible`]
    //     },
    //     on: {
    //       click: () => this.scrollTo(direction)
    //     }
    //   }, this[`${direction}Icon`])
    // },
    // genItems (items, item) {
    //   if (items.length > 0) return items
    //   if (!item.length) return null

    //   return this.$createElement(VTabsItems, item)
    // },
    // genTransition (direction) {
    //   return this.$createElement('transition', {
    //     props: { name: 'fade-transition' }
    //   }, [this.genIcon(direction)])
    // },
    // genWrapper (items) {
    //   return this.$createElement('div', {
    //     staticClass: 'v-tabs__wrapper',
    //     class: {
    //       'v-tabs__wrapper--show-arrows': this.hasArrows
    //     },
    //     ref: 'wrapper',
    //     directives: [{
    //       name: 'touch',
    //       value: {
    //         start: e => this.overflowCheck(e, this.onTouchStart),
    //         move: e => this.overflowCheck(e, this.onTouchMove),
    //         end: e => this.overflowCheck(e, this.onTouchEnd)
    //       }
    //     }]
    //   }, [items])
    // },
    // genSlider (items) {
    //   if (this.hideSlider) return null

    //   if (!items.length) {
    //     items = [this.$createElement(VTabsSlider, {
    //       props: { color: this.sliderColor }
    //     })]
    //   }

    //   return this.$createElement('div', {
    //     staticClass: 'v-tabs__slider-wrapper',
    //     style: this.sliderStyles
    //   }, items)
    // },

    // checkIcons () {
    //   this.prevIconVisible = this.checkPrevIcon()
    //   this.nextIconVisible = this.checkNextIcon()
    // },
    // checkPrevIcon () {
    //   return this.scrollOffset > 0
    // },
    // checkNextIcon () {
    //   // Check one scroll ahead to know the width of right-most item
    //   return this.widths.container > this.scrollOffset + this.widths.wrapper
    // },
    callSlider () {
      if (this.hideSlider) return false

      this.$nextTick(() => {
        if (!this.activeTab || !this.activeTab.$el) return

        this.sliderWidth = this.activeTab.$el.scrollWidth
        this.sliderLeft = this.activeTab.$el.offsetLeft
      })
    },
    init () {
      // this.checkIcons()
      this.updateItemsState()
    },
    /**
     * When v-navigation-drawer changes the
     * width of the container, call resize
     * after the transition is complete
     */
    onResize () {
      // if (this._isDestroyed) return

      // this.setWidths()

      // clearTimeout(this.resizeTimeout)
      // this.resizeTimeout = setTimeout(() => {
      //   this.callSlider()
      //   this.scrollIntoView()
      //   this.checkIcons()
      // }, this.transitionTime)
    },
    // overflowCheck (e, fn) {
    //   this.isOverflowing && fn(e)
    // },
    // scrollTo (direction) {
    //   this.scrollOffset = this.newOffset(direction)
    // },
    // setOverflow () {
    //   this.isOverflowing = this.widths.bar < this.widths.container
    // },
    // setWidths () {
    //   const bar = this.$refs.bar ? this.$refs.bar.clientWidth : 0
    //   const container = this.$refs.container ? this.$refs.container.clientWidth : 0
    //   const wrapper = this.$refs.wrapper ? this.$refs.wrapper.clientWidth : 0

    //   this.widths = { bar, container, wrapper }

    //   this.setOverflow()
    // },
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
    }
    // tabProxy (val) {
    //   this.inputValue = val
    // },
    // registerItems (fn) {
    //   this.tabItems = fn
    // },
    // unregisterItems () {
    //   this.tabItems = null
    // }
  }

  //   render (h) {
  //     const { tab, slider, items, item } = this.parseNodes()

//     return h('div', {
//       staticClass: 'v-tabs',
//       directives: [{
//         name: 'resize',
//         arg: 400,
//         modifiers: { quiet: true },
//         value: this.onResize
//       }]
//     }, [
//       this.genBar([this.genSlider(slider), tab]),
//       this.genItems(items, item)
//     ])
//   }
}
