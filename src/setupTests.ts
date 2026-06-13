// opt all tests into React 18's act() environment
const globalWithAct = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
globalWithAct.IS_REACT_ACT_ENVIRONMENT = true

export {}
