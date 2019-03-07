# query-shape

Standard utilities to manage query requests and responses.

## Background

In development, we frequently encounter scenarios that requires management of data fetched from remote, most of the time we simply do something like:

```javascript
const state = {data: null};

const fetchData = async params => {
    const data = await get('/some-url', params);
    state.data = data;
};
```

When `fetchData` is called, we await a response and override the previous data. This is simple but problematic in most cases, the major issue is the introduction race conditions:

1. We start a fetch with param `{name: 'foo'}`.
2. We than start another fetch immediately with param `{name: 'bar'}`.
3. The second fetch arrives before the fetch fetch.
4. So that we have a UI indicating `{name: 'foo'}` with the result of `{name: 'bar'}`.

Race conditions are not hard to solve, we just **forgot** to solve it. One of best solution is to pair params and responses so that our code moves to:

```javascript
const state = {};

const fetchData = async params => {
    const data = await get('/some-url', params);
    state[stringify(params)] = {data};
};
```

In this case, we just retrieve the response by `state[stringify(params)]` and no race conditions can happen.

`query-shape` is a simple utility to help you manage structures like above by specifying a "strategy" you want.

## Install

```shell
npm install query-shape
```

## Data structure

`query-shape` defines several data structures, which is important for understanding how it works:

### Query

A query is a simple object telling the key, response and pending state of a fetch:

```typescript
interface Query<TKey, TData, TError> {
    readonly key: TKey; // Key of a query, usually the params of fetch
    readonly pendingMutex: number; // Count of sent but not received fetches
    readonly response: Response<TData, TError> | null; // The last valid response of fetch
    readonly nextResponse: Response<TData, TError> | null; // The last unaccepted response
}
```

### Query set

A query set is a group of queries keyed by query's key so that we can find a query by key from it:

```typescript
interface QuerySet<TKey, TData, TError> {
    [key: string]: Query<TKey, TData, TError> | undefined;
}
```

### Response

Inside each query we have response, a response tells when it is received, the state (either resolved or rejected) and result of it:

```typescript
interface Response<TData, TError> {
    readonly arrivedAt: number;
    readonly data?: TData;
    readonly error?: TError;
}
```

## Stage of a query

A query live along 4 stages:

1. The **initial** state, with no response and pending fetches, everything except `key` is `undefined` in this stage.
2. The **fetch** state, when a fetch is sent, `pendingMutex` is incremented, we can simply detect its pending state by `pendingMutex > 0`.
3. The **receive** state, when a response arrives, `pendingMutex` is decremented, `nextResponse` is assigned to the last arrived response, in this stage `response` is **not** modified.
4. The **accept** state, when use decides to accept `nextResponse` as the last response, `response` is replaced by `nextResponse` and `nextResponse` is assigned to `null` again. In most cases accept is automatically done by strategy so we straightly get `response` updated. In rare cases we can wait our end users to confirm `nextResponse` and ask query to accept it.

## Basic usage

Simple import a strategy option and the `createStrategy` function to create a strategy, in most cases the `acceptLatest` is enough:

```javascript
import {createStrategy, acceptLatest} from 'query-shape';

const strategy = createStrategy(acceptLatest);
```

By doing this we not get a `strategy` object using a "always accept the latest response" strategy, we have several functions in the object:

- `initialize()`: returns an empty query set with no query attached.
- `fetch(key)`: to make a query moving to "fetch" stage.
- `receive(key, data)`: to make a query moving to "receive" stage with a resolved data.
- `error(key, error)`: to make a query moving to "receive" stage with a rejected error.
- `accept(key)`: to make a query accept its `nextResponse`.

We can implement a fetch function along with its query state:

```javascript
const state = {querySet: strategy.initialize()};

const fetchData = async params => {
    state.querySet = strategy.fetch(params);
    try {
        const data = await fetch('/some-url', params);
        state.querySet = strategy.receive(params, data);
    }
    catch (ex) {
        state.querySet = strategy.error(params, ex);
    }
};
```

We can also get a query by its key using `findQuery` function:

```javascript
import {findQuery} from 'query-shape';

const query = findQuery(state.querySet, params);
if (query.pendingMutex > 0) {
    renderLoading();
    return;
}
if (query.response.data) {
    renderResult(query.response.data);
}
else if (query.response.error) {
    renderError(query.response.error);
}
```

## Strategy

`query-shape` is published with some native strategies:

- `acceptLatest`: always use the last response no matter its resolved or rejected, no `nextResponse` is used.
- `keepEarliest`: persist and use the first arrived response, no further response can override the first one.
- `keepEarliestSuccess`: persist the first success response, a previous rejected response will be overridden, otherwise the new response will be discarded.
- `waitAccept`: store new response in `nextResponse`, users are asked to call `accept()` to accept it.
