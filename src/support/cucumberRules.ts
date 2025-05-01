import {
  setParallelCanAssign,
  parallelCanAssignHelpers,
} from '@cucumber/cucumber';

const { atMostOnePicklePerTag } = parallelCanAssignHelpers;
const myTagRule = atMostOnePicklePerTag(['@sequential']);

// Only one pickle with @sequential can run at a time
setParallelCanAssign(myTagRule);
