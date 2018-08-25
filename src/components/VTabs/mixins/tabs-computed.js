/**
 * Tabs computed
 *
 * @mixin
 */
/* @vue/component */
export default {
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
    isMobile () {
      return this.$vuetify.breakpoint.width < this.mobileBreakPoint
    },
    sliderStyles () {
      return {
        left: `${this.sliderLeft}px`,
        transition: this.sliderLeft != null ? null : 'none',
        width: `${this.sliderWidth}px`
      }
    }
  }
}
