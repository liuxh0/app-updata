# Updata

[![Build Status](https://travis-ci.com/liuxh0/updatajs.svg?branch=develop)](https://travis-ci.com/liuxh0/updatajs)
[![codecov](https://codecov.io/gh/liuxh0/updatajs/branch/develop/graph/badge.svg)](https://codecov.io/gh/liuxh0/updatajs)

**Updata** is a JavaScript library that makes it easier to migrate local data from old versions. With the help of Updata, you don't have to care about how your app's local storage looked like a year ago; nor do you need to write thousands of `if`s to deal with data created by different versions. All you need to do is to tell Updata what has been changed compared to the previous version. Then Updata does all its best to migrate local data from any previous versions to the latest version. No more chaos, focus more on your work. 👨‍💻

### *Disclaimer*

This project is currently under active development and at a very early stage. API may change at any time before release v1.0.0.

<!-- TODO -->
<!-- # Why do I need this? -->

## Quick Start

To benefit from Updata, there are two steps: *configure* and *update*.

```typescript
import { Updata } from 'updata';

// Step 1: Configure
const updata = Updata
  .startWith('1.0')
  .next('1.1', () => {
    // Do anything to update from 1.0 to 1.1
  })
  .next('1.2', () => {
    // Do anything to update from 1.1 to 1.2
  })
  .shortcutFrom('1.0', () => {
    // Maybe it is a good idea to update directly from 1.0 to 1.2

    // For example some data are missing in version 1.1
    // but in version 1.2 you want them back
  })
  .next('1.3', async () => { /* Let's go on */ })
  .done();

// Step 2: Update
const updatePlan = updata.getUpdatePlan('1.0', '1.3');

const updatePath = updatePlan.getUpdatePath();
// In this case: ['1.0', '1.2', '1.3']
// Notice that version 1.1 is skipped due to shortcut

await updatePlan.execute();
// Now it is up-to-date ✌️
```
