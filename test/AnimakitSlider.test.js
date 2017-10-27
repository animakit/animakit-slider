/* eslint-env jest */

import { render }    from 'enzyme';

import React          from 'react';
import AnimakitSlider from '../lib/AnimakitSlider.js';

describe('<AnimakitSlider />', () => {
  it('should render', () => {
    const component = render(<AnimakitSlider />);

    expect(component).toMatchSnapshot();
  });
});
