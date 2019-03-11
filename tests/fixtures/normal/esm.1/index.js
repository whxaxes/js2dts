import { createSelector } from 'reselect';

export const sliceSelector = state => state['sliceName'];
export const valueSliceSelector = createSelector(sliceSelector, (slice) => {
  return slice.value;
});