import update from 'react-addons-update';

const COUNT = 'redux-example/COUNT';
const INIT = 'redux-example/INIT';

const initialState = {

};
export default function info(state = initialState, action = {}) {
  switch (action.type) {
    case INIT:
      return update(state, {[action.name]: {$set: action.filters}});
    case COUNT:
      return update(state, {[action.name]: {count: {$apply: count2=>count2 + 1}}});

    default:
      return state;
  }
}
export function init(name, filters) {
  return {
    type: INIT,
    name,
    filters

  };
}

export function count(name) {
  return {
    type: COUNT,
    name


  };
}

