import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isEqual, transitionEventName } from './utils';

import styles from './styles';

export default class AnimakitSlider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      animation: false,

      prevSlide: -1,
      currentSlide: 0,
      slidesCount: 0,

      width: null,
      height: null,
    };

    this.setRootNode = this.setRootNode.bind(this);
  }

  componentWillMount() {
    this.rootNode = [];
    this.slidesNodes = [];
    this.slidesDimensions = [];

    this.contentMounted = false;

    this.transitionEventName = transitionEventName();

    this.listeners = this.getListeners();

    this.animationReset = false;
    this.animationResetTO = null;
    this.resizeCheckerRAF = null;
  }

  componentDidMount() {
    this.repaint(this.props);

    this.toggleAnimationListener(true);
  }

  componentWillReceiveProps(nextProps) {
    this.repaint(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const stateChanged = !isEqual(nextState, this.state);

    const childrenChanged = !isEqual(nextProps.children, this.props.children);

    return stateChanged || childrenChanged;
  }

  componentWillUpdate() {
    this.toggleResizeChecker(false);
  }

  componentDidUpdate() {
    this.toggleResizeChecker(true);
  }

  componentWillUnmount() {
    this.toggleResizeChecker(false);
    this.toggleAnimationReset(false);
    this.toggleAnimationListener(false);
  }

  getListeners() {
    return {
      onCheckResize: this.onCheckResize.bind(this),
      onTransitionEnd: this.onTransitionEnd.bind(this),
    };
  }

  toggleResizeChecker(start) {
    if (typeof requestAnimationFrame === 'undefined') return;

    if (start) {
      this.resizeCheckerRAF = requestAnimationFrame(this.listeners.onCheckResize);
    } else if (this.resizeCheckerRAF) {
      cancelAnimationFrame(this.resizeCheckerRAF);
    }
  }

  toggleAnimationReset(add) {
    if (this.animationResetTO) clearTimeout(this.animationResetTO);

    if (add) {
      this.animationResetTO = setTimeout(() => {
        this.animationReset = true;
      }, this.props.duration);
    } else {
      this.animationReset = false;
    }
  }

  toggleAnimationListener(add) {
    const method = add ? 'addEventListener' : 'removeEventListener';
    this.rootNode[method](this.transitionEventName, this.listeners.onTransitionEnd, false);
  }

  onTransitionEnd() {
    if (!this.animationReset) return;

    this.setState({
      animation: false,
    });
  }

  onCheckResize() {
    this.toggleResizeChecker(false);

    this.softRepaint();

    this.toggleResizeChecker(true);
  }

  getChildrenCount(children) {
    const length = Array.isArray(children) ? children.length : 1;

    if (length > 1) return length;

    return children ? 1 : 0;
  }

  getOffset() {
    const { currentSlide, prevSlide, slidesCount, animation } = this.state;

    // if (prevSlide === -1) return 0;

    const { loop, skip } = this.props;

    const useLoop = (loop || skip) && slidesCount > 2;
    if (!useLoop) return 0;

    return Math.ceil(slidesCount / 2) - (animation ? prevSlide : currentSlide) - 1;
  }

  getSlideNum(slideKey) {
    let slideNum = slideKey;

    React.Children.forEach(this.props.children, (child, num) => {
      if (child.key === slideKey) slideNum = num;
    });

    return slideNum;
  }

  getOrder() {
    const order = Array(this.state.slidesCount).fill(0).map((_, i) => i);

    // if (this.state.prevSlide === -1) return order;

    const { loop, skip } = this.props;

    const useLoop = (loop || skip) && this.state.slidesCount > 2;

    if (useLoop) {
      const offset = this.getOffset();

      if (offset) {
        if (offset > 0) {
          for (let i = 0; i < offset; i++) {
            const lastChild = order.pop();
            order.unshift(lastChild);
          }
        }
        if (offset < 0) {
          for (let i = 0; i > offset; i--) {
            const firstChild = order.shift();
            order.push(firstChild);
          }
        }
      }
    }

    return order;
  }

  getDirection() {
    const { currentSlide, prevSlide, slidesCount } = this.state;

    if (prevSlide === -1) return true;

    const { loop, skip } = this.props;

    if (!loop && !skip) {
      return prevSlide < currentSlide;
    }

    if (skip) {
      if (prevSlide === slidesCount - 1 && currentSlide === 0) return true;
      if (prevSlide === 0 && currentSlide === slidesCount - 1) return false;
    }

    const order = this.getOrder();
    const prevIndex = order.indexOf(prevSlide);
    const currentIndex = order.indexOf(currentSlide);

    return prevIndex < currentIndex;
  }

  getSlideVisibility(num) {
    if (!this.props.skip) return true;

    if (this.state.slidesCount <= 2) return true;

    const { currentSlide, prevSlide, animation } = this.state;

    if ((num === currentSlide) || (animation && num === prevSlide)) {
      return true;
    }

    return false;
  }

  getChildVisibility(num) {
    const { currentSlide, prevSlide, animation } = this.state;

    if (!animation) {
      return num === currentSlide;
    }

    const { loop, skip } = this.props;

    if (skip) {
      return num === currentSlide || num === prevSlide;
    }

    if (loop) {
      const order = this.getOrder();
      const prevIndex = order.indexOf(prevSlide);
      const currentIndex = order.indexOf(currentSlide);
      const numIndex = order.indexOf(num);

      if (prevIndex < currentIndex) {
        return numIndex >= prevIndex && numIndex <= currentIndex;
      }
      return numIndex >= currentIndex && numIndex <= prevIndex;
    }

    return true;
  }

  getRootStyles() {
    if (!this.props.children) return {};

    const position = 'relative';
    const overflow = 'hidden';

    let { width, height } = this.state;

    if (!this.props.flexible) {
      return { position, width, height, overflow };
    }

    width = 0;
    height = 0;

    const { animation, prevSlide, currentSlide } = this.state;

    const num = animation ? prevSlide : currentSlide;

    if (this.slidesDimensions[num]) {
      width = this.slidesDimensions[num].width;
      height = this.slidesDimensions[num].height;
    }

    const { duration, easing } = this.props;

    if (!this.contentMounted) {
      return { position, width, height, overflow };
    }

    const transition = `width ${duration}ms ${easing}, height ${duration}ms ${easing}`;

    return { position, width, height, transition, overflow };
  }

  getContainerStyles() {
    if (!this.props.children) return {};

    const { vertical, loop, skip } = this.props;
    const { currentSlide, slidesCount, animation } = this.state;

    const axis = vertical ? 'Y' : 'X';

    let count = slidesCount;
    let index = currentSlide;

    if (slidesCount > 2) {
      if (skip) {
        count = 3;
        index = 1;

        if (animation) {
          const direction = this.getDirection();
          index = direction ? 2 : 0;
        }
      } else if (loop) {
        const offset = this.getOffset();
        index = currentSlide + offset;

        if (index < 0) index += slidesCount;
        if (index >= slidesCount) index -= slidesCount;
      }
    }

    const position = 'absolute';
    const transform = `translate${axis}(${index * (-100 / count)}%)`;

    const size = count * 100;
    const width = vertical ? '100%' : `${size}%`;
    const height = vertical ? `${size}%` : '100%';

    if (!animation) {
      return { position, transform, width, height };
    }

    const { duration, easing } = this.props;
    const transition = `transform ${duration}ms ${easing}`;

    return { position, transition, transform, width, height };
  }

  getSlideStyles(num) {
    const { vertical, skip } = this.props;
    const { prevSlide, slidesCount, animation } = this.state;

    const position = 'relative';

    const count = (skip && slidesCount > 2) ? 3 : slidesCount;

    const size = 100 / count;
    const width = vertical ? '100%' : `${size}%`;
    const height = vertical ? `${size}%` : '100%';

    const direction = this.getDirection();

    const appendMargin = skip && slidesCount > 2 &&
                         (!animation || (direction && num === prevSlide));

    if (vertical) {
      if (appendMargin) {
        const ratio = (this.state.height / this.state.width) * 100;
        const marginTop = `${ratio}%`;
        return { position, width, height, marginTop };
      }

      return { position, width, height };
    }

    const float = 'left';

    if (appendMargin) {
      const marginLeft = `${size}%`;
      return { position, float, width, height, marginLeft };
    }

    return { position, float, width, height };
  }

  calcDimensions() {
    let maxWidth = 0;
    let maxHeight = 0;

    React.Children.map(this.props.children, (child, num) => {
      let width = 0;
      let height = 0;

      if (this.slidesDimensions[num]) {
        width = this.slidesDimensions[num].width;
        height = this.slidesDimensions[num].height;
      }

      if (this.getChildVisibility(num)) {
        const node = this.slidesNodes[num];

        if (node) {
          const newWidth = node.offsetWidth;
          const newHeight = node.offsetHeight;

          width = (Math.abs(newWidth - width) <= 1) ? width : newWidth;
          height = (Math.abs(newHeight - height) <= 1) ? height : newHeight;
        }

        this.slidesDimensions[num] = { width, height };
      }

      if (width > maxWidth) maxWidth = width;
      if (height > maxHeight) maxHeight = height;
    });

    return [maxWidth, maxHeight];
  }

  resetSlidesCountState(stateChunk) {
    const { slidesCount } = stateChunk;

    if (slidesCount === this.state.slidesCount) return {};

    return stateChunk;
  }

  resetCurrentSlideState(stateChunk) {
    const { currentSlide } = stateChunk;
    const prevSlide = this.state.currentSlide;

    if (currentSlide === prevSlide) return {};

    const animation = true;

    return { currentSlide, prevSlide, animation };
  }

  resetDimensionsState(stateChunk) {
    const { width, height } = stateChunk;

    if (width === this.state.width &&
        height === this.state.height) {
      return {};
    }

    return stateChunk;
  }

  softRepaint() {
    const [width, height] = this.calcDimensions();

    const state = this.resetDimensionsState({ width, height });

    if (Object.keys(state).length) this.setState(state);
  }

  repaint(props) {
    const slidesCount = this.getChildrenCount(props.children);

    const [width, height] = this.calcDimensions();
    const nextSlide = this.getSlideNum(props.slide);
    const currentSlide = nextSlide < slidesCount ? nextSlide : slidesCount - 1;

    const state = Object.assign(
      {},
      this.resetDimensionsState({ width, height }),
      this.resetSlidesCountState({ slidesCount }),
      this.resetCurrentSlideState({ currentSlide, slidesCount }),
    );

    if (this.state.width !== null) {
      setTimeout(() => {
        this.contentMounted = true;
      }, 1);
    }

    this.applyState(state);
  }

  applyState(state) {
    if (!Object.keys(state).length) return;

    if (state.animation) {
      this.toggleAnimationReset(false);
    }

    this.setState(state);

    if (state.animation) {
      this.toggleAnimationReset(true);
    }
  }

  renderChild(num, child) {
    const slideVisible = this.getSlideVisibility(num);

    return (
      <div
        key={ num }
        style={ slideVisible ? this.getSlideStyles(num) : null }
      >
        <div
          style={ slideVisible ? styles.slideWrapper : null }
          ref={ (c) => { this.slidesNodes[num] = c; } }
        >
          { this.getChildVisibility(num) ? child : null }
        </div>
      </div>
    );
  }

  renderChildren() {
    const order = this.getOrder();

    return order.map(num => {
      const child = this.props.children[num];

      return this.renderChild(num, child);
    });
  }

  setRootNode(c) {
    this.rootNode = c;
  }

  render() {
    return (
      <div
        style={ this.getRootStyles() }
        ref={ this.setRootNode }
      >
        <div style={ this.getContainerStyles() }>
        { this.renderChildren() }
        </div>
      </div>
    );
  }
}

AnimakitSlider.propTypes = {
  children: PropTypes.any,
  slide: PropTypes.any,
  vertical: PropTypes.bool,
  loop: PropTypes.bool,
  skip: PropTypes.bool,
  flexible: PropTypes.bool,
  duration: PropTypes.number,
  easing: PropTypes.string,
};

AnimakitSlider.defaultProps = {
  side: 0,
  vertical: false,
  loop: false,
  skip: false,
  flexible: false,
  duration: 500,
  easing: 'cubic-bezier(.165,.84,.44,1)',
};
