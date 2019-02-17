const {findQuery} = require('../index');

const TEST_DATA = {value: 1};
const TEST_KEY = {x: 1};

exports.TEST_DATA = TEST_DATA;

exports.TEST_KEY = TEST_KEY;

exports.prepareQuerySet = ({initialize, fetch, receive}) => {
    const empty = initialize();
    const fetched = fetch(empty, TEST_KEY);
    const received = receive(fetched, TEST_KEY, TEST_DATA);
    return fetch(received, TEST_KEY);
};

exports.prepareErroredQuerySet = ({initialize, fetch, error}) => {
    const empty = initialize();
    const fetched = fetch(empty, TEST_KEY);
    const errored = error(fetched, TEST_KEY, TEST_DATA);
    return fetch(errored, TEST_KEY);
};

exports.passCommonTests = ({initialize, fetch, receive, error, accept}) => {
    test('will initialize an empty query set', () => {
        expect(initialize()).toEqual({});
    });

    test('will create a new query on fetch when key is not previously given', () => {
        const empty = initialize();
        const fetched = fetch(empty, TEST_KEY);
        const query = findQuery(fetched, TEST_KEY);
        expect(query.key).toEqual(TEST_KEY);
        expect(query.pendingMutex).toEqual(1);
        expect(query.response).toBeNull();
        expect(query.nextResponse).toBeNull();
    });

    test('will increment pendingMutext on fetch when key is previously given', () => {
        const empty = initialize();
        const fetched = fetch(empty, TEST_KEY);
        const fetchedAgain = fetch(fetched, TEST_KEY);
        const query = findQuery(fetchedAgain, TEST_KEY);
        expect(query.pendingMutex).toEqual(2);
    });

    test('will decrement pendingMutex on receive', () => {
        const empty = initialize();
        const fetched = fetch(empty, TEST_KEY);
        const received = receive(fetched, TEST_KEY, TEST_DATA);
        const query = findQuery(received, TEST_KEY);
        expect(query.pendingMutex).toBe(0);
    });

    test('will decrement pendingMutex on error', () => {
        const empty = initialize();
        const fetched = fetch(empty, TEST_KEY);
        const errored = error(fetched, TEST_KEY, TEST_DATA);
        const query = findQuery(errored, TEST_KEY);
        expect(query.pendingMutex).toBe(0);
    });

    test('will accept first success response in any case', () => {
        const empty = initialize();
        const fetched = fetch(empty, TEST_KEY);
        const received = receive(fetched, TEST_KEY, TEST_DATA);
        const query = findQuery(received, TEST_KEY);
        const {response, nextResponse} = query;
        expect(response).toBeDefined();
        expect(response.arrivedAt).toBeLessThanOrEqual(Date.now());
        expect(response.data).toBe(TEST_DATA);
        expect(response.error).toBeUndefined();
        expect(nextResponse).toBeNull();
    });

    test('will accept first error response in any case', () => {
        const empty = initialize();
        const fetched = fetch(empty, TEST_KEY);
        const errored = error(fetched, TEST_KEY, TEST_DATA);
        const query = findQuery(errored, TEST_KEY);
        const {response, nextResponse} = query;
        expect(response).toBeDefined();
        expect(response.arrivedAt).toBeLessThanOrEqual(Date.now());
        expect(response.error).toBe(TEST_DATA);
        expect(response.data).toBeUndefined();
        expect(nextResponse).toBeNull();
    });

    test('will throw when receive with non-exist key', () => {
        const empty = initialize();
        expect(() => receive(empty, TEST_KEY, {})).toThrow();
    });

    test('will throw when error with non-exist key', () => {
        const empty = initialize();
        expect(() => error(empty, TEST_KEY, {})).toThrow();
    });

    test('will throw when accept with non-exist key', () => {
        const empty = initialize();
        expect(() => accept(empty, TEST_KEY, {})).toThrow();
    });

    test('will throw when accept without nextResponse', () => {
        const empty = initialize();
        const fetched = fetch(empty, TEST_KEY);
        expect(() => accept(fetched, TEST_KEY)).toThrow();
    });
};
