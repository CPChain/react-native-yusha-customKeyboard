/* eslint-disable no-undef */
import {by, expect, element, device} from 'detox';

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: {
        DTXEnableVerboseSyncSystem: 'YES',
        DTXEnableVerboseSyncResources: 'YES',
      },
    });

    await device.reloadReactNative();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  // it('should have welcome screen', async () => {
  //   await expect(element(by.id('welcome'))).toBeVisible();
  // });

  it('should have safe keyboard input ', async () => {
    await element(by.id('safeKeyBoardInput')).tap();
    await expect(element(by.id('safeABCKeyBoardMain'))).toBeVisible();
    setTimeout(async () => {
      await element(by.id('safeKeyBoard_s')).tap();
    }, 1000);
  });
});
