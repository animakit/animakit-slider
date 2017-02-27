# AnimakitSlider

React component for the blocks sliding.
Supports both horizontal and vertical modes and the ability to loop and skip slides during animation.

## Usage

```javascript
<AnimakitSlider slide={this.state.index}>
  <Slide />
  <Slide />
  <Slide />
</AnimakitSlider>
```

## [Demo](https://animakit.github.io/#/slider)

## Installation

```
npm install animakit-slider
```

## Properties

| Property | Required | Type | Default Value  | Available Values  | Description |
| ----- | ----- | ----- | ----- | ----- | ----- |
| slide | true | string | Key of the first child | Key of the component child | Current visible slide, that contains a child with the corresponding key  |
| vertical | false | bool | `false` | `true`, `false` | Direction of animation |
| loop | false | bool | `false` | `true`, `false` | If true, the component will choose the shortest way between the slides. (For example, it will animate directly from the last slide to first) |
| skip | false | bool | `false` | `true`, `false` | If true, the component will animate directly to the selected slide and will not show the slides located between |
| flexible | false | bool | `false` | `true`, `false` | If true, the component size automatically to fit the current slide. By default, the component selects the size of the largest slide. |
| duration | false | number | `500` | Any integer number | Duration of animation |
| easing | false | string | `cubic-bezier (.165,.84,.44,1)` | Any [easing function](http://easings.net/) | Easing function of animation |


## Origin

AnimakitSlider is the part of Animakit.
See https://animakit.github.io for more details.

<a href="https://evilmartians.com/?utm_source=animakit">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>
