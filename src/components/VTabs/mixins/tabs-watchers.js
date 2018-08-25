/**
 * Tabs watchers
 *
 * @mixin
 */
/* @vue/component */
export default {
  watch: {
    activeTab: 'callSlider',
    alignWithTitle: 'callSlider',
    centered: 'callSlider',
    fixedTabs: 'callSlider',
    hasArrows (val) {
      if (!val) this.scrollOffset = 0
    },
    isBooted: 'findActiveLink',
    lazyValue: 'updateTabs',
    right: 'callSlider',
    value (val) {
      this.lazyValue = val
    },
    '$vuetify.application.left': 'onResize',
    '$vuetify.application.right': 'onResize',
    scrollOffset (val) {
      this.$refs.container.style.transform = `translateX(${-val}px)`
      if (this.hasArrows) {
        this.prevIconVisible = this.checkPrevIcon()
        this.nextIconVisible = this.checkNextIcon()
      }
    }
  }
}
