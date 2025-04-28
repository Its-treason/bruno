/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
export type DropIndicatorPositions = 'insert' | 'above' | 'below';

export function getDropIndicator(
  wrapper: HTMLDivElement,
  evt: MouseEvent,
  type: 'collection' | 'request' | 'folder'
): DropIndicatorPositions {
  // Collection only support inserting
  if (type === 'collection') {
    return 'insert';
  }

  const curserPosInWrapper = Math.round(wrapper.getBoundingClientRect().top + wrapper.offsetHeight - evt.clientY);
  const posAsPercent = Math.round((curserPosInWrapper / wrapper.offsetHeight) * 100);

  if (type === 'request') {
    return posAsPercent > 50 ? 'above' : 'below';
  }

  if (posAsPercent > 75) {
    return 'above';
  }
  return posAsPercent > 25 ? 'insert' : 'below';
}
