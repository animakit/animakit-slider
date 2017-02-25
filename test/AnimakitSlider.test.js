/* eslint-env jest */

import { shallow }    from 'enzyme';

import React          from 'react';
import AnimakitSlider from '../lib/AnimakitSlider.js';

describe('<AnimakitSlider />', () => {
  it('should render', () => {
    const component = shallow(<AnimakitSlider />);

    expect(component).toMatchSnapshot();
  });
});
