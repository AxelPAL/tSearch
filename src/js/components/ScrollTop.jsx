import React from "react";

class ScrollTop extends React.Component {
  constructor() {
    super();

    this.state = {
      visible: false
    };

    this.onClick = this.onClick.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }
  componentWillMount() {
    window.addEventListener('scroll', this.onScroll);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }
  onScroll() {
    if (window.scrollY > 100) {
      if (!this.state.visible) {
        this.setState({
          visible: true
        });
      }
    } else
    if (this.state.visible) {
      this.setState({
        visible: false
      });
    }
  }
  onClick(e) {
    e.preventDefault();
    window.scrollTo(0, 0);
  }
  render() {
    if (!this.state.visible) {
      return null;
    } else {
      return (
        <a key="scroll-top" className="scroll_top" href="#scrollTop" onClick={this.onClick}
           title={chrome.i18n.getMessage('scrollTop')}/>
      );
    }
  }
}

export default ScrollTop;