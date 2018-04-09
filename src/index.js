/* eslint-disable prefer-promise-reject-errors */
import fetch from 'isomorphic-fetch';

export const FETCH = '@@FETCH';
export const REQUEST = 'REQUEST';
export const REQUEST_SUCCEEDED = 'REQUEST_SUCCEEDED';
export const REQUEST_FAILED = 'REQUEST_FAILED';

let fetchAction;

export const setAction = (a) => {
  fetchAction = a;
};

export const setUp = ({ dispatch }) => {
  setAction((params, resolve, reject) => {
    dispatch({
      type: REQUEST,
      payload: params,
      meta: { resolve, reject },
    });
  });
}

export const fetchModal = ({
  hook = (params, saga) => params,
}) => ({
  namespace: FETCH,
  state: {},
  subscriptions: { setUp },
  effects: {
    *[REQUEST]({ payload: params, meta: { resolve, reject } }, saga) {
      const newParams = hook(params, saga);

      try {
        const data = yield call(fetch, ...newParams)
        resolve(data);
        yield put({ type: REQUEST_SUCCEEDED, payload: data, meta: newParams });
      } catch (e) {
        reject(e);
        yield put({ type: REQUEST_FAILED, payload: e, meta: newParams });
      }
    },
  },
});

export default function sagaFetch(...params) {
  if (typeof fetchAction === 'function') {
    return new Promise((resolve, reject) => {
      fetchAction(params, resolve, reject);
    });
  } else {
    // eslint-disable-next-line
    console && console.warn && console.warn('not setup fetchModal for redux-saga-fetch');
    return fetch(...params);
  }
}
