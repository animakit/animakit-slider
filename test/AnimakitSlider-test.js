import React              from 'react';
import test               from 'ava';
import { shallow, mount } from 'enzyme';
import AnimakitSlider     from '../lib/AnimakitSlider.js';

test('shallow', t => {
  const wrapper = shallow(<AnimakitSlider />);
  t.is(wrapper.type(), 'div');
});

test('mount', t => {
  const wrapper = mount(<AnimakitSlider />);
  t.is(wrapper.children().length, 1);
});

test('has container', t => {
  const wrapper = shallow(<AnimakitSlider />);
  t.is(wrapper.children().length, 1);
});

test('has children', t => {
  const wrapper = mount(
    <AnimakitSlider><div>1</div><div>2</div><div>3</div></AnimakitSlider>
  );
  const container = wrapper.childAt(0);
  t.is(container.children().length, 3);
});
