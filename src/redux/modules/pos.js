const POS_LOAD = 'redux-example/POS_LOAD';
const POS_LOAD_SUCCESS = 'redux-example/POS_LOAD_SUCCESS';
const POS_LOAD_FAIL = 'redux-example/POS_LOAD_FAIL';
const initialState = {
  posData: {},
  loading: false,
  loaded: false
};
export default function info(state = initialState, action = {}) {
  switch (action.type) {
    case POS_LOAD:
      return {
        ...state,
        loading: true
      };
    case POS_LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        posData: action.result
      };
    case POS_LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    default:
      return state;
  }
}
export function load() {
  return {
    types: [
      POS_LOAD, POS_LOAD_SUCCESS, POS_LOAD_FAIL
    ],
    promise: (client) => client.get('/pos')
  };
}
